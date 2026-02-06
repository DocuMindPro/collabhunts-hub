import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Send, MessageSquare, ArrowLeft, Circle } from "lucide-react";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import TypingIndicator from "@/components/chat/TypingIndicator";
import MessageReadReceipt from "@/components/chat/MessageReadReceipt";
import InquiryFormCard, { type InquiryFormData } from "@/components/chat/InquiryFormCard";
import PackageInquiryMessage, { isPackageInquiry } from "@/components/chat/PackageInquiryMessage";
import OfferMessage, { isOfferMessage } from "@/components/chat/OfferMessage";
import CounterOfferDialog from "@/components/chat/CounterOfferDialog";
import { type NegotiationData } from "@/components/chat/NegotiationMessage";
import { getMessagePreview } from "@/lib/message-preview";

interface Conversation {
  id: string;
  last_message_at: string;
  creator_profile_id: string;
  creator_profiles: {
    display_name: string;
    profile_image_url: string | null;
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

interface PendingPackage {
  service_type: string;
  price_cents: number;
  delivery_days: number;
}

const BrandMessagesTab = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [onlineStatus, setOnlineStatus] = useState<OnlineStatus>({});
  const [pendingPackage, setPendingPackage] = useState<PendingPackage | null>(null);
  const [showCounterDialog, setShowCounterDialog] = useState(false);
  const [activeNegotiation, setActiveNegotiation] = useState<NegotiationData | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  // Typing indicator temporarily disabled to fix input focus issues
  // const { isOtherUserTyping, setTyping } = useTypingIndicator(selectedConversation, userId);

  // Auto-select conversation from URL param and handle package context
  useEffect(() => {
    const conversationParam = searchParams.get('conversation');
    const packageParam = searchParams.get('package');
    
    if (conversationParam && conversations.length > 0) {
      const exists = conversations.find(c => c.id === conversationParam);
      if (exists) {
        setSelectedConversation(conversationParam);
        
        // Handle package context - store as pending package for the card
        if (packageParam) {
          try {
            const packageData = JSON.parse(decodeURIComponent(packageParam));
            setPendingPackage({
              service_type: packageData.service_type,
              price_cents: packageData.price_cents,
              delivery_days: packageData.delivery_days
            });
          } catch (e) {
            console.error("Error parsing package data:", e);
          }
        }
        
        // Clear the URL params
        setSearchParams({ tab: 'messages' });
      }
    }
  }, [searchParams, conversations]);

  const handleSendPackageInquiry = async (formData: InquiryFormData) => {
    if (!pendingPackage || !selectedConversation || !userId) return;

    // Create structured inquiry data
    const inquiryData: NegotiationData = {
      type: "inquiry",
      message_id: "", // Will be set after insert
      package_type: formData.package_type,
      proposed_budget_cents: formData.proposed_budget_cents,
      preferred_date: formData.preferred_date,
      preferred_time: formData.preferred_time,
      duration_hours: formData.duration_hours,
      notes: formData.notes,
      status: "pending",
    };

    const messageContent = JSON.stringify(inquiryData);

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      sender_id: userId,
      content: messageContent,
      created_at: new Date().toISOString(),
      is_read: false,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setPendingPackage(null);

    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: selectedConversation,
        sender_id: userId,
        content: messageContent,
        message_type: "negotiation",
        negotiation_status: "pending",
      });

      if (error) throw error;
      setMessages((prev) => prev.filter(m => m.id !== tempMessage.id));
    } catch (error) {
      console.error("Error sending package inquiry:", error);
      setMessages((prev) => prev.filter(m => m.id !== tempMessage.id));
      toast.error("Failed to send inquiry");
    }
  };

  const handleDismissPackage = () => {
    setPendingPackage(null);
  };

  // Handle accepting a counter offer from creator
  const handleAcceptOffer = async (data: NegotiationData) => {
    try {
      await supabase
        .from("messages")
        .update({ negotiation_status: "accepted" })
        .eq("id", data.message_id);
      
      // Send acceptance message
      await supabase.from("messages").insert({
        conversation_id: selectedConversation,
        sender_id: userId,
        content: `✅ I accept your offer of $${(data.proposed_budget_cents / 100).toFixed(0)} for the ${data.package_type.replace(/_/g, ' ')} package. Please send an agreement when ready!`,
        message_type: "text",
      });
      
      toast.success("Offer accepted! Wait for the creator to send an agreement.");
      fetchMessages(selectedConversation || "");
    } catch (error) {
      console.error("Error accepting offer:", error);
      toast.error("Failed to accept offer");
    }
  };

  // Handle counter offer
  const handleCounterOffer = (data: NegotiationData) => {
    setActiveNegotiation(data);
    setShowCounterDialog(true);
  };

  // Handle decline
  const handleDeclineOffer = async (data: NegotiationData) => {
    try {
      await supabase
        .from("messages")
        .update({ negotiation_status: "declined" })
        .eq("id", data.message_id);
      
      await supabase.from("messages").insert({
        conversation_id: selectedConversation,
        sender_id: userId,
        content: "I'll have to pass on this offer. Thank you for your time!",
        message_type: "text",
      });
      
      toast.success("Offer declined");
      fetchMessages(selectedConversation || "");
    } catch (error) {
      console.error("Error declining offer:", error);
      toast.error("Failed to decline offer");
    }
  };

  useEffect(() => {
    fetchConversations();
    
    const channel = supabase
      .channel("brand-messages-realtime")
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
          // Refresh conversation list for unread counts
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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: profile } = await supabase
        .from("brand_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase
        .from("conversations")
        .select(`
          *,
          creator_profiles!inner(display_name, profile_image_url, user_id)
        `)
        .eq("brand_profile_id", profile.id)
        .order("last_message_at", { ascending: false });

      if (error) throw error;

      // Fetch last message and unread count for each conversation
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

          // Fetch online status
          const { data: profileData } = await supabase
            .from("profiles")
            .select("last_seen")
            .eq("id", conv.creator_profiles.user_id)
            .single();

          if (profileData?.last_seen) {
            setOnlineStatus(prev => ({
              ...prev,
              [conv.creator_profiles.user_id]: new Date(profileData.last_seen)
            }));
          }

          return {
            ...conv,
            last_message: lastMsg?.content || "",
            unread_count: count || 0
          };
        })
      );

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
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
      
      // Update last_seen for current user
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

  // Conversation List Component
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
              Message creators to start a conversation
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {conversations.map((conv) => {
              const creatorUserId = conv.creator_profiles.user_id;
              const lastSeen = onlineStatus[creatorUserId];
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
                      <AvatarImage src={conv.creator_profiles.profile_image_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {conv.creator_profiles.display_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {online && (
                      <Circle className="absolute bottom-0 right-0 h-3 w-3 fill-green-500 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold truncate">{conv.creator_profiles.display_name}</p>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatMessageTime(conv.last_message_at)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p className="text-sm text-muted-foreground truncate">
                        {getMessagePreview(conv.last_message || "") || "No messages yet"}
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

  // Render Chat View content (not as a nested component to prevent re-mount on state changes)
  const renderChatView = () => {
    if (!selectedConvo) return null;
    
    const creatorUserId = selectedConvo.creator_profiles.user_id;
    const lastSeen = onlineStatus[creatorUserId];
    const online = isOnline(lastSeen);
    const messageGroups = groupMessagesByDate(messages);

    return (
      <>
        {/* Chat Header */}
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
              <AvatarImage src={selectedConvo.creator_profiles.profile_image_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {selectedConvo.creator_profiles.display_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {online && (
              <Circle className="absolute bottom-0 right-0 h-2.5 w-2.5 fill-green-500 text-green-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{selectedConvo.creator_profiles.display_name}</p>
            <p className={`text-xs ${online ? "text-green-600" : "text-muted-foreground"}`}>
              {getOnlineStatusText(lastSeen)}
            </p>
          </div>
        </div>

        {/* Messages */}
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
                              <AvatarImage src={selectedConvo.creator_profiles.profile_image_url || undefined} />
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {selectedConvo.creator_profiles.display_name.charAt(0).toUpperCase()}
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
                          onOfferAccepted={() => fetchMessages(selectedConversation || "")}
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
                              messageId={msg.id}
                              negotiationStatus={(msg as any).negotiation_status}
                              onAccept={handleAcceptOffer}
                              onCounter={handleCounterOffer}
                              onDecline={handleDeclineOffer}
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

        {/* Package Inquiry Form */}
        {pendingPackage && (
          <InquiryFormCard
            packageData={pendingPackage}
            onSend={handleSendPackageInquiry}
            onDismiss={handleDismissPackage}
          />
        )}
      </>
    );
  };

  // Message input - kept separate to avoid re-renders causing focus loss
  const renderMessageInput = () => (
    <div className="p-4 border-t bg-card">
      <div className="flex gap-2">
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
  );

  // Mobile Layout
  if (isMobile) {
    return (
      <Card className="h-[calc(100vh-180px)] overflow-hidden">
        {selectedConversation ? (
          <div className="h-full flex flex-col">
            {renderChatView()}
            {renderMessageInput()}
          </div>
        ) : (
          <ConversationList />
        )}
      </Card>
    );
  }

  // Desktop Layout
  return (
    <div className="grid md:grid-cols-3 gap-4 h-[600px]">
      <Card className="md:col-span-1 overflow-hidden">
        <ConversationList />
      </Card>
      <Card className="md:col-span-2 overflow-hidden">
        {selectedConversation ? (
          <div className="h-full flex flex-col">
            {renderChatView()}
            {renderMessageInput()}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </Card>
      
      {/* Counter Offer Dialog */}
      {activeNegotiation && selectedConversation && (
        <CounterOfferDialog
          open={showCounterDialog}
          onOpenChange={(open) => {
            setShowCounterDialog(open);
            if (!open) setActiveNegotiation(null);
          }}
          conversationId={selectedConversation}
          originalInquiry={activeNegotiation}
          onCounterSent={() => {
            fetchMessages(selectedConversation);
            setActiveNegotiation(null);
          }}
        />
      )}
    </div>
  );
};

export default BrandMessagesTab;