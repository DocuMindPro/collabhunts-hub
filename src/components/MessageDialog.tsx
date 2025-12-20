import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { format } from "date-fns";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import TypingIndicator from "@/components/chat/TypingIndicator";
import MessageReadReceipt from "@/components/chat/MessageReadReceipt";
import PackageInquiryMessage, { isPackageInquiry } from "@/components/chat/PackageInquiryMessage";

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
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isOtherUserTyping, setTyping } = useTypingIndicator(conversationId, userId);

  // Simple typing handler - no async operations during keystrokes
  const handleTypingChange = (value: string) => {
    setNewMessage(value);
  };

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    
    if (isOpen && conversationId) {
      fetchMessages();
      getUserId();
      
      channel = supabase
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
            // Only add if not already in messages (avoid duplicates from optimistic update)
            setMessages((prev) => {
              const exists = prev.some(m => m.id === payload.new.id);
              if (exists) return prev;
              return [...prev, payload.new as Message];
            });
          }
        )
        .subscribe();
    }
    
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [isOpen, conversationId]);

  const getUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserId(user.id);
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


  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !userId) return;

    const messageContent = newMessage.trim();
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      sender_id: userId,
      content: messageContent,
      created_at: new Date().toISOString(),
      is_read: false,
    };

    // Optimistic update - show immediately
    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");
    setTyping(false);

    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: userId,
        content: messageContent,
      });

      if (error) throw error;
      
      // Remove temp message after successful insert - real-time will add the actual message
      setMessages((prev) => prev.filter(m => m.id !== tempMessage.id));
    } catch (error) {
      console.error("Error sending message:", error);
      // Rollback on error
      setMessages((prev) => prev.filter(m => m.id !== tempMessage.id));
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
          <DialogDescription>
            Send a message to {recipientName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto flex flex-col-reverse pr-4 mb-4"
              >
                <div className="space-y-4 py-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isOwn = msg.sender_id === userId;
                      const isPackageInquiryMsg = isPackageInquiry(msg.content);
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] ${!isPackageInquiryMsg ? 'px-4 py-2 rounded-2xl' : ''} ${
                              isOwn
                                ? isPackageInquiryMsg ? '' : "bg-primary text-primary-foreground rounded-br-md"
                                : isPackageInquiryMsg ? '' : "bg-muted rounded-bl-md"
                            }`}
                          >
                            {isPackageInquiryMsg ? (
                              <PackageInquiryMessage content={msg.content} isOwn={isOwn} />
                            ) : (
                              <p className="break-words text-sm">{msg.content}</p>
                            )}
                            <p className={`text-[10px] mt-1 flex items-center gap-1 ${
                              isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                            } ${isPackageInquiryMsg ? 'px-3 pb-1' : ''}`}>
                              {format(new Date(msg.created_at), "HH:mm")}
                              <MessageReadReceipt isOwn={isOwn} isRead={msg.is_read} />
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  {isOtherUserTyping && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Input
                  value={newMessage}
                  onChange={(e) => handleTypingChange(e.target.value)}
                  onFocus={() => setTyping(true)}
                  onBlur={() => setTyping(false)}
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
