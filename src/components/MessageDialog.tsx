import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { format } from "date-fns";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface MessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string | null;
  recipientName: string;
}

const MessageDialog = ({ isOpen, onClose, conversationId, recipientName }: MessageDialogProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && conversationId) {
      fetchMessages();
      setupRealtimeSubscription();
      getUserId();
    }
  }, [isOpen, conversationId]);

  const getUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserId(user.id);
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchMessages = async () => {
    if (!conversationId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      
      setTimeout(scrollToBottom, 100);

      // Mark messages as read
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("messages")
          .update({ is_read: true })
          .eq("conversation_id", conversationId)
          .neq("sender_id", user.id);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !userId) return;

    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: userId,
        content: newMessage.trim(),
      });

      if (error) throw error;
      setNewMessage("");
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Message {recipientName}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 pr-4 mb-4" ref={scrollRef}>
                <div className="space-y-4 py-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_id === userId ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            msg.sender_id === userId
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="break-words">{msg.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {format(new Date(msg.created_at), "HH:mm")}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              <div className="flex gap-2 pt-4 border-t">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button onClick={sendMessage} size="icon" disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageDialog;
