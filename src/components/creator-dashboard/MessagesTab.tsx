import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Send, MessageSquare, ArrowLeft, Circle, FileText } from "lucide-react";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { useKeyboardHeight } from "@/hooks/useKeyboardHeight";
import MessageReadReceipt from "@/components/chat/MessageReadReceipt";
import PackageInquiryMessage, { isPackageInquiry } from "@/components/chat/PackageInquiryMessage";
import OfferMessage, { isOfferMessage } from "@/components/chat/OfferMessage";
import SendOfferDialog from "@/components/chat/SendOfferDialog";
import { safeNativeAsync, isNativePlatform } from "@/lib/supabase-native";

interface Conversation {
  id: string;
  last_message_at: string;
  brand_profile_id: string;
  brand_profiles: {
    company_name: string;
    logo_url: string | null;
    user_id: string;
  };
  last_message?: string;
  unread_count?: number;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  message_type?: string;
  offer_id?: string;
}

interface OnlineStatus {
  [userId: string]: Date | null;
}

const MessagesTab = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [creatorProfileId, setCreatorProfileId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [onlineStatus, setOnlineStatus] = useState<OnlineStatus>({});
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const isNative = Capacitor.isNativePlatform();
  const { keyboardHeight } = useKeyboardHeight();

  const handlePackageReply = (type: "quote" | "accept") => {
    if (type === "quote") {
      setNewMessage("Thank you for your interest! For this package, I can offer you a great deal. Let me know if you'd like to proceed or have any questions.");
    } else {
      setNewMessage("I'd be happy to work with you on this! Let's discuss the details and get started.");
    }
  };

  // Auto-select conversation from URL param
  useEffect(() => {
    const conversationParam = searchParams.get('conversation');
    if (conversationParam && conversations.length > 0) {
      const exists = conversations.find(c => c.id === conversationParam);
      if (exists) {
        setSelectedConversation(conversationParam);
        setSearchParams({ tab: 'messages' });
      }
    }
  }, [searchParams, conversations]);

  useEffect(() => {
    fetchConversations();
    
    // Skip realtime subscriptions on native platforms - they can cause hangs
    if (isNativePlatform()) {
      console.log('[MessagesTab] Skipping realtime on native platform');
      return;
    }
    
    const channel = supabase
      .channel("creator-messages-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          if (payload.new.conversation_id === selectedConversation) {
            setMessages((prev) => {
              const exists = prev.some(m => m.id === payload.new.id);
              if (exists) return prev;
              return [...prev, payload.new as Message];
            });
            
          }
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);


  const fetchConversations = async () => {
    const result = await safeNativeAsync(
      async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { conversations: [], userId: null, creatorId: null };
        
        const { data: profile } = await supabase
          .from("creator_profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (!profile) return { conversations: [], userId: user.id, creatorId: null };

        const { data, error } = await supabase
          .from("conversations")
          .select(`
            *,
            brand_profiles!inner(company_name, logo_url, user_id)
          `)
          .eq("creator_profile_id", profile.id)
          .order("last_message_at", { ascending: false });

        if (error) throw error;

        const conversationsWithDetails = await Promise.all(
          (data || []).map(async (conv) => {
            const { data: lastMsg } = await supabase
              .from("messages")
              .select("content")
              .eq("conversation_id", conv.id)
              .order("created_at", { ascending: false })
              .limit(1)
              .single();

            const { count } = await supabase
              .from("messages")
              .select("*", { count: "exact", head: true })
              .eq("conversation_id", conv.id)
              .eq("is_read", false)
              .neq("sender_id", user.id);

            return {
              ...conv,
              last_message: lastMsg?.content || "",
              unread_count: count || 0
            };
          })
        );

        return { conversations: conversationsWithDetails, userId: user.id, creatorId: profile.id };
      },
      { conversations: [], userId: null, creatorId: null },
      8000 // 8 second timeout
    );

    if (result.userId) {
      setUserId(result.userId);
    }
    if (result.creatorId) {
      setCreatorProfileId(result.creatorId);
    }
    setConversations(result.conversations);
    setLoading(false);
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", userId);

      await supabase
        .from("profiles")
        .update({ last_seen: new Date().toISOString() })
        .eq("id", userId);

    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !userId) return;

    const messageContent = newMessage.trim();
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      sender_id: userId,
      content: messageContent,
      created_at: new Date().toISOString(),
      is_read: false,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");

    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: selectedConversation,
        sender_id: userId,
        content: messageContent,
      });

      if (error) throw error;
      setMessages((prev) => prev.filter(m => m.id !== tempMessage.id));
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => prev.filter(m => m.id !== tempMessage.id));
      toast.error("Failed to send message");
    }
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
    setMessages([]);
  };

  const selectedConvo = conversations.find(c => c.id === selectedConversation);

  const isOnline = (lastSeen: Date | null) => {
    if (!lastSeen) return false;
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    return lastSeen > twoMinutesAgo;
  };

  const getOnlineStatusText = (lastSeen: Date | null) => {
    if (!lastSeen) return "Offline";
    if (isOnline(lastSeen)) return "Online";
    return `Last seen ${formatDistanceToNow(lastSeen, { addSuffix: true })}`;
  };

  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return format(date, "HH:mm");
    if (isYesterday(date)) return `Yesterday ${format(date, "HH:mm")}`;
    return format(date, "MMM d, HH:mm");
  };

  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = "";
    
    msgs.forEach((msg) => {
      const msgDate = format(new Date(msg.created_at), "yyyy-MM-dd");
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msgDate, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });
    
    return groups;
  };

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM d, yyyy");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const ConversationList = () => (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Messages
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 px-4">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">No conversations yet</p>
            <p className="text-sm text-muted-foreground text-center mt-1">
              Brands will message you when interested
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {conversations.map((conv) => {
              const brandUserId = conv.brand_profiles.user_id;
              const lastSeen = onlineStatus[brandUserId];
              const online = isOnline(lastSeen);
              
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={`w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-start gap-3 ${
                    selectedConversation === conv.id ? "bg-muted" : ""
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={conv.brand_profiles.logo_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {conv.brand_profiles.company_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {online && (
                      <Circle className="absolute bottom-0 right-0 h-3 w-3 fill-green-500 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold truncate">{conv.brand_profiles.company_name}</p>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatMessageTime(conv.last_message_at)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.last_message || "No messages yet"}
                      </p>
                      {conv.unread_count && conv.unread_count > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const ChatView = () => {
    if (!selectedConvo) return null;
    
    const brandUserId = selectedConvo.brand_profiles.user_id;
    const lastSeen = onlineStatus[brandUserId];
    const online = isOnline(lastSeen);
    const messageGroups = groupMessagesByDate(messages);

    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b flex items-center gap-3 bg-card">
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBackToList}
              className="h-8 w-8 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedConvo.brand_profiles.logo_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {selectedConvo.brand_profiles.company_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {online && (
              <Circle className="absolute bottom-0 right-0 h-2.5 w-2.5 fill-green-500 text-green-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{selectedConvo.brand_profiles.company_name}</p>
            <p className={`text-xs ${online ? "text-green-600" : "text-muted-foreground"}`}>
              {getOnlineStatusText(lastSeen)}
            </p>
          </div>
        </div>

        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto flex flex-col-reverse bg-muted/30"
        >
          <div className="p-4 space-y-4">
          {messageGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              <div className="flex justify-center mb-4">
                <span className="text-xs text-muted-foreground bg-background px-3 py-1 rounded-full shadow-sm">
                  {formatDateHeader(group.date)}
                </span>
              </div>
              <div className="space-y-2">
                {group.messages.map((msg, msgIndex) => {
                  const isOwn = msg.sender_id === userId;
                  const showAvatar = !isOwn && (msgIndex === 0 || group.messages[msgIndex - 1]?.sender_id !== msg.sender_id);
                  const isPackageInquiryMsg = isPackageInquiry(msg.content);
                  const isOffer = isOfferMessage(msg.content);
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      {!isOwn && (
                        <div className="w-8 flex-shrink-0">
                          {showAvatar && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={selectedConvo.brand_profiles.logo_url || undefined} />
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {selectedConvo.brand_profiles.company_name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      )}
                      {isOffer ? (
                        <OfferMessage 
                          content={msg.content} 
                          isOwn={isOwn} 
                          conversationId={selectedConversation || ""}
                          onOfferAccepted={fetchMessages.bind(null, selectedConversation || "")}
                        />
                      ) : (
                        <div className={`max-w-[70%] ${!isPackageInquiryMsg ? 'px-4 py-2 rounded-2xl' : ''} ${
                          isOwn
                            ? isPackageInquiryMsg ? '' : "bg-primary text-primary-foreground rounded-br-md"
                            : isPackageInquiryMsg ? '' : "bg-card border rounded-bl-md shadow-sm"
                        }`}>
                          {isPackageInquiryMsg ? (
                            <PackageInquiryMessage 
                              content={msg.content} 
                              isOwn={isOwn} 
                              onReply={handlePackageReply}
                              showReplyActions={!isOwn}
                            />
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
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {/* Typing indicator temporarily disabled */}
          <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="p-4 border-t bg-card">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowOfferDialog(true)}
              title="Send Offer"
              className="shrink-0"
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1"
            />
            <Button onClick={sendMessage} size="icon" disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Send Offer Dialog */}
        {creatorProfileId && (
          <SendOfferDialog
            open={showOfferDialog}
            onOpenChange={setShowOfferDialog}
            conversationId={selectedConversation || ""}
            creatorProfileId={creatorProfileId}
            brandProfileId={selectedConvo.brand_profile_id}
            onOfferSent={() => fetchMessages(selectedConversation || "")}
          />
        )}
      </div>
    );
  };

  // Full-screen chat for native mobile platforms
  if (isNative) {
    return (
      <div 
        className="fixed inset-0 bg-background flex flex-col"
        style={{ paddingBottom: keyboardHeight > 0 ? keyboardHeight : 80 }}
      >
        {selectedConversation ? <ChatView /> : <ConversationList />}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Card className="h-[calc(100vh-180px)] overflow-hidden">
        {selectedConversation ? <ChatView /> : <ConversationList />}
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-4 h-[600px]">
      <Card className="md:col-span-1 overflow-hidden">
        <ConversationList />
      </Card>
      <Card className="md:col-span-2 overflow-hidden">
        {selectedConversation ? (
          <ChatView />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default MessagesTab;