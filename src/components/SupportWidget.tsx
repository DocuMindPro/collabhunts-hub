import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircleQuestion, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface SupportMessage {
  id: string;
  content: string;
  is_admin: boolean;
  is_read: boolean;
  created_at: string;
  sender_id: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  status: string;
  created_at: string;
}

const SUPPORT_CATEGORIES = [
  { value: "booking_issue", label: "Booking Issue" },
  { value: "payment_issue", label: "Payment Issue" },
  { value: "account_problem", label: "Account Problem" },
  { value: "technical_bug", label: "Technical Bug" },
  { value: "partnership_question", label: "Partnership Question" },
  { value: "other", label: "Other" },
];

const SupportWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  // Intake form state
  const [showIntake, setShowIntake] = useState(false);
  const [intakeCategory, setIntakeCategory] = useState("");
  const [intakeDescription, setIntakeDescription] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Check auth
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id ?? null);
    });
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    return () => subscription.unsubscribe();
  }, []);

  // Fetch unread count (even when closed)
  useEffect(() => {
    if (!userId) return;
    const fetchUnread = async () => {
      const { count } = await supabase
        .from("support_messages")
        .select("*", { count: "exact", head: true })
        .eq("is_admin", true)
        .eq("is_read", false);
      setUnreadCount(count || 0);
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  // Fetch or create ticket + messages when opened
  const loadTicket = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data: tickets } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", userId)
        .in("status", ["open", "in_progress"])
        .order("created_at", { ascending: false })
        .limit(1);

      const existingTicket = tickets?.[0] || null;
      setTicket(existingTicket as SupportTicket | null);

      if (existingTicket) {
        setShowIntake(false);
        const { data: msgs } = await supabase
          .from("support_messages")
          .select("*")
          .eq("ticket_id", existingTicket.id)
          .order("created_at", { ascending: true });
        setMessages((msgs || []) as SupportMessage[]);

        await supabase
          .from("support_messages")
          .update({ is_read: true })
          .eq("ticket_id", existingTicket.id)
          .eq("is_admin", true)
          .eq("is_read", false);
        setUnreadCount(0);
      } else {
        // No existing ticket, show intake form
        setShowIntake(true);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isOpen) loadTicket();
  }, [isOpen, loadTicket]);

  // Realtime subscription
  useEffect(() => {
    if (!ticket) return;
    const channel = supabase
      .channel(`support-${ticket.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "support_messages",
        filter: `ticket_id=eq.${ticket.id}`,
      }, (payload) => {
        const msg = payload.new as SupportMessage;
        setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
        if (msg.is_admin && isOpen) {
          supabase.from("support_messages").update({ is_read: true }).eq("id", msg.id).then();
        } else if (msg.is_admin) {
          setUnreadCount(prev => prev + 1);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [ticket, isOpen]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Submit intake form → create ticket + first message
  const handleIntakeSubmit = async () => {
    if (!intakeCategory || !intakeDescription.trim() || !userId || sending) return;
    setSending(true);
    try {
      // Get user type from profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", userId)
        .single();

      const categoryLabel = SUPPORT_CATEGORIES.find(c => c.value === intakeCategory)?.label || intakeCategory;
      const subject = `[${categoryLabel}] ${intakeDescription.slice(0, 60)}`;

      const { data: newTicket, error } = await supabase
        .from("support_tickets")
        .insert({
          user_id: userId,
          subject,
          category: intakeCategory,
          user_type: profile?.user_type || null,
        })
        .select()
        .single();
      if (error) throw error;

      // Send first message
      await supabase
        .from("support_messages")
        .insert({
          ticket_id: newTicket.id,
          sender_id: userId,
          content: intakeDescription.trim(),
          is_admin: false,
        });

      setTicket(newTicket as SupportTicket);
      setShowIntake(false);
      setIntakeCategory("");
      setIntakeDescription("");
      // Load messages (the realtime sub will also pick them up)
      const { data: msgs } = await supabase
        .from("support_messages")
        .select("*")
        .eq("ticket_id", newTicket.id)
        .order("created_at", { ascending: true });
      setMessages((msgs || []) as SupportMessage[]);
    } catch (err) {
      console.error("Failed to create support ticket:", err);
    } finally {
      setSending(false);
    }
  };

  // Send follow-up message (no optimistic insert — let realtime handle it)
  const handleSend = async () => {
    if (!newMessage.trim() || !userId || !ticket || sending) return;
    setSending(true);
    try {
      const { error } = await supabase
        .from("support_messages")
        .insert({
          ticket_id: ticket.id,
          sender_id: userId,
          content: newMessage.trim(),
          is_admin: false,
        });
      if (error) throw error;
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send support message:", err);
    } finally {
      setSending(false);
    }
  };

  if (!userId) return null;

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "fixed z-50 right-4 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform",
            isMobile ? "bottom-24" : "bottom-6"
          )}
          aria-label="Open support chat"
        >
          <MessageCircleQuestion className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-[10px] flex items-center justify-center"
            >
              {unreadCount}
            </Badge>
          )}
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div
          className={cn(
            "fixed z-50 bg-background border shadow-2xl flex flex-col",
            isMobile
              ? "inset-0 rounded-none"
              : "bottom-6 right-4 w-96 h-[500px] rounded-2xl"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-primary/5">
            <div>
              <h3 className="font-semibold text-sm">Support</h3>
              <p className="text-xs text-muted-foreground">We usually reply within a few hours</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {loading ? (
            <div className="flex-1 flex justify-center items-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : showIntake ? (
            /* Intake Form */
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                <div className="text-center pb-2">
                  <MessageCircleQuestion className="h-10 w-10 mx-auto text-primary/60 mb-2" />
                  <h4 className="font-semibold text-sm">How can we help?</h4>
                  <p className="text-xs text-muted-foreground">Tell us about your issue so we can assist you faster.</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">Issue Category</Label>
                  <Select value={intakeCategory} onValueChange={setIntakeCategory}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select a category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORT_CATEGORIES.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">Describe your issue</Label>
                  <Textarea
                    placeholder="Please describe your problem in detail..."
                    value={intakeDescription}
                    onChange={(e) => setIntakeDescription(e.target.value)}
                    className="min-h-[100px] text-sm resize-none"
                    rows={4}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleIntakeSubmit}
                  disabled={!intakeCategory || !intakeDescription.trim() || sending}
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                  Submit Request
                </Button>
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <>
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircleQuestion className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">Need help? Send us a message!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex",
                          msg.is_admin ? "justify-start" : "justify-end"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                            msg.is_admin
                              ? "bg-muted text-foreground rounded-bl-sm"
                              : "bg-primary text-primary-foreground rounded-br-sm"
                          )}
                        >
                          {msg.is_admin && (
                            <span className="text-[10px] font-medium text-muted-foreground block mb-0.5">Support Team</span>
                          )}
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          <span className={cn(
                            "text-[10px] mt-1 block",
                            msg.is_admin ? "text-muted-foreground" : "text-primary-foreground/70"
                          )}>
                            {format(new Date(msg.created_at), "h:mm a")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Input */}
              <div className="p-3 border-t">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    className="min-h-[40px] max-h-[100px] resize-none text-sm"
                    rows={1}
                  />
                  <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={!newMessage.trim() || sending}
                    className="shrink-0"
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default SupportWidget;
