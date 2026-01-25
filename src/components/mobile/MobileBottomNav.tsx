import { BarChart3, Calendar, MessageSquare, User, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface TabConfig {
  id: string;
  icon: React.ElementType;
  label: string;
}

const tabs: TabConfig[] = [
  { id: "overview", icon: BarChart3, label: "Overview" },
  { id: "campaigns", icon: Megaphone, label: "Campaigns" },
  { id: "bookings", icon: Calendar, label: "Bookings" },
  { id: "messages", icon: MessageSquare, label: "Messages" },
  { id: "profile", icon: User, label: "Profile" },
];

const MobileBottomNav = ({ activeTab, onTabChange }: MobileBottomNavProps) => {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingBookings, setPendingBookings] = useState(0);

  useEffect(() => {
    fetchBadgeCounts();

    // Subscribe to realtime updates for messages
    const messagesChannel = supabase
      .channel("mobile-nav-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        () => {
          fetchBadgeCounts();
        }
      )
      .subscribe();

    // Subscribe to realtime updates for bookings
    const bookingsChannel = supabase
      .channel("mobile-nav-bookings")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
        },
        () => {
          fetchBadgeCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(bookingsChannel);
    };
  }, []);

  const fetchBadgeCounts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get creator profile
      const { data: profile } = await supabase
        .from("creator_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) return;

      // Get unread messages count
      const { data: conversations } = await supabase
        .from("conversations")
        .select("id")
        .eq("creator_profile_id", profile.id);

      if (conversations && conversations.length > 0) {
        const conversationIds = conversations.map(c => c.id);
        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .in("conversation_id", conversationIds)
          .eq("is_read", false)
          .neq("sender_id", user.id);

        setUnreadMessages(count || 0);
      }

      // Get pending bookings count
      const { count: pendingCount } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("creator_profile_id", profile.id)
        .eq("status", "pending");

      setPendingBookings(pendingCount || 0);
    } catch (error) {
      console.error("Error fetching badge counts:", error);
    }
  };

  const getBadgeCount = (tabId: string): number => {
    switch (tabId) {
      case "messages":
        return unreadMessages;
      case "bookings":
        return pendingBookings;
      default:
        return 0;
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const badgeCount = getBadgeCount(tab.id);

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full relative transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
                {badgeCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full px-1">
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                )}
              </div>
              <span className={cn("text-[10px] mt-1", isActive && "font-medium")}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
