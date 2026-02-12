import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Send, Loader2, ArrowLeft, CheckCircle, Clock, MessageSquare } from "lucide-react";
import { sendNotificationEmail } from "@/lib/email-utils";
import { cn } from "@/lib/utils";

interface Ticket {
  id: string;
  user_id: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  resolved_at: string | null;
  user_email?: string;
  user_name?: string;
  last_message?: string;
  unread_count?: number;
}

interface Message {
  id: string;
  ticket_id: string;
  sender_id: string;
  content: string;
  is_admin: boolean;
  is_read: boolean;
  created_at: string;
}

const AdminSupportTab = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [statusFilter, setStatusFilter] = useState("open");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("support_tickets")
        .select("*")
        .order("updated_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data: ticketsData } = await query;
      if (!ticketsData) { setTickets([]); return; }

      // Enrich with user info and last message
      const enriched = await Promise.all(
        ticketsData.map(async (t) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("email, full_name")
            .eq("id", t.user_id)
            .single();

          const { data: lastMsg } = await supabase
            .from("support_messages")
            .select("content")
            .eq("ticket_id", t.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          const { count: unread } = await supabase
            .from("support_messages")
            .select("*", { count: "exact", head: true })
            .eq("ticket_id", t.id)
            .eq("is_admin", false)
            .eq("is_read", false);

          return {
            ...t,
            user_email: profile?.email || "Unknown",
            user_name: profile?.full_name || profile?.email || "Unknown",
            last_message: lastMsg?.content,
            unread_count: unread || 0,
          } as Ticket;
        })
      );

      setTickets(enriched);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const openTicket = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    const { data } = await supabase
      .from("support_messages")
      .select("*")
      .eq("ticket_id", ticket.id)
      .order("created_at", { ascending: true });
    setMessages((data || []) as Message[]);

    // Mark user messages as read
    await supabase
      .from("support_messages")
      .update({ is_read: true })
      .eq("ticket_id", ticket.id)
      .eq("is_admin", false)
      .eq("is_read", false);
  };

  // Realtime for selected ticket
  useEffect(() => {
    if (!selectedTicket) return;
    const channel = supabase
      .channel(`admin-support-${selectedTicket.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "support_messages",
        filter: `ticket_id=eq.${selectedTicket.id}`,
      }, (payload) => {
        const msg = payload.new as Message;
        setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
        if (!msg.is_admin) {
          supabase.from("support_messages").update({ is_read: true }).eq("id", msg.id).then();
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedTicket]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleReply = async () => {
    if (!reply.trim() || !selectedTicket || sending) return;
    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("support_messages")
        .insert({
          ticket_id: selectedTicket.id,
          sender_id: user.id,
          content: reply.trim(),
          is_admin: true,
        });
      if (error) throw error;

      // Update ticket status to in_progress if it was open
      if (selectedTicket.status === "open") {
        await supabase
          .from("support_tickets")
          .update({ status: "in_progress" })
          .eq("id", selectedTicket.id);
        setSelectedTicket({ ...selectedTicket, status: "in_progress" });
      }

      // Send email notification to user
      if (selectedTicket.user_email) {
        sendNotificationEmail(
          "support_reply",
          selectedTicket.user_email,
          { reply: reply.trim(), subject: selectedTicket.subject },
          selectedTicket.user_name
        );
      }

      setReply("");
      toast({ title: "Reply sent" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!selectedTicket) return;
    const update: Record<string, any> = { status };
    if (status === "resolved") update.resolved_at = new Date().toISOString();

    await supabase.from("support_tickets").update(update).eq("id", selectedTicket.id);
    setSelectedTicket({ ...selectedTicket, status, resolved_at: update.resolved_at || selectedTicket.resolved_at });
    fetchTickets();
    toast({ title: `Ticket marked as ${status}` });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open": return <Badge variant="destructive">Open</Badge>;
      case "in_progress": return <Badge className="bg-amber-500 text-white">In Progress</Badge>;
      case "resolved": return <Badge className="bg-green-500 text-white">Resolved</Badge>;
      case "closed": return <Badge variant="secondary">Closed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Ticket detail view
  if (selectedTicket) {
    return (
      <Card>
        <CardHeader className="p-4 border-b">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => { setSelectedTicket(null); fetchTickets(); }}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-base truncate">{selectedTicket.subject}</CardTitle>
                {getStatusBadge(selectedTicket.status)}
              </div>
              <CardDescription className="text-xs">
                {selectedTicket.user_name} • {selectedTicket.user_email}
              </CardDescription>
            </div>
            <Select value={selectedTicket.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex flex-col h-[500px]">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex", msg.is_admin ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                    msg.is_admin
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  )}>
                    {!msg.is_admin && (
                      <span className="text-[10px] font-medium text-muted-foreground block mb-0.5">
                        {selectedTicket.user_name}
                      </span>
                    )}
                    {msg.is_admin && (
                      <span className="text-[10px] font-medium text-primary-foreground/70 block mb-0.5">
                        Admin
                      </span>
                    )}
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    <span className={cn(
                      "text-[10px] mt-1 block",
                      msg.is_admin ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                      {format(new Date(msg.created_at), "MMM d, h:mm a")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="p-3 border-t">
            <div className="flex gap-2">
              <Textarea
                placeholder="Type your reply..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleReply();
                  }
                }}
                className="min-h-[40px] max-h-[100px] resize-none text-sm"
                rows={1}
              />
              <Button size="icon" onClick={handleReply} disabled={!reply.trim() || sending}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Ticket list view
  return (
    <Card>
      <CardHeader className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="text-lg">Support Tickets</CardTitle>
            <CardDescription>Manage user support conversations</CardDescription>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>No support tickets found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tickets.map((t) => (
              <button
                key={t.id}
                onClick={() => openTicket(t)}
                className="w-full text-left p-3 border rounded-lg hover:bg-muted/50 transition-colors flex items-start gap-3"
              >
                <div className="shrink-0 mt-1">
                  {t.status === "open" ? (
                    <Clock className="h-4 w-4 text-destructive" />
                  ) : t.status === "resolved" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <MessageSquare className="h-4 w-4 text-amber-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{t.subject}</span>
                    {(t.unread_count || 0) > 0 && (
                      <Badge variant="destructive" className="h-5 min-w-5 px-1 text-[10px]">
                        {t.unread_count}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{t.user_name} • {t.user_email}</p>
                  {t.last_message && (
                    <p className="text-xs text-muted-foreground/70 truncate mt-0.5">{t.last_message}</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  {getStatusBadge(t.status)}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {format(new Date(t.created_at), "MMM d")}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminSupportTab;
