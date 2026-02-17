import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { safeNativeAsync } from "@/lib/supabase-native";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import CreateOpportunityDialog from "@/components/brand-dashboard/CreateOpportunityDialog";
import {
  MessageSquare,
  Calendar,
  Search,
  Megaphone,
  Star,
  Bell,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

interface BrandHomeStats {
  unreadMessages: number;
  pendingBookings: number;
  activeOpportunities: number;
  completedBookings: number;
}

interface FeaturedCreator {
  id: string;
  display_name: string;
  profile_image_url: string | null;
  categories: string[] | null;
  average_rating: number | null;
}

interface RecentNotification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

interface NativeBrandHomeProps {
  brandName?: string;
  brandProfileId?: string;
  onTabChange: (tab: string) => void;
}

const NativeBrandHome = ({ brandName, brandProfileId, onTabChange }: NativeBrandHomeProps) => {
  const navigate = useNavigate();
  const [showCreateOpportunity, setShowCreateOpportunity] = useState(false);
  const [stats, setStats] = useState<BrandHomeStats>({
    unreadMessages: 0,
    pendingBookings: 0,
    activeOpportunities: 0,
    completedBookings: 0,
  });
  const [featuredCreators, setFeaturedCreators] = useState<FeaturedCreator[]>([]);
  const [notifications, setNotifications] = useState<RecentNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    await safeNativeAsync(
      async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("brand_profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (!profile) return;

        // Fetch all data in parallel
        const [messagesRes, pendingRes, completedRes, opportunitiesRes, creatorsRes, notifsRes] = await Promise.all([
          // Unread messages
          (async () => {
            const { data: conversations } = await supabase
              .from("conversations")
              .select("id")
              .eq("brand_profile_id", profile.id);
            if (conversations && conversations.length > 0) {
              const ids = conversations.map(c => c.id);
              const { count } = await supabase
                .from("messages")
                .select("*", { count: "exact", head: true })
                .in("conversation_id", ids)
                .eq("is_read", false)
                .neq("sender_id", user.id);
              return count || 0;
            }
            return 0;
          })(),
          // Pending bookings
          supabase
            .from("bookings")
            .select("*", { count: "exact", head: true })
            .eq("brand_profile_id", profile.id)
            .eq("status", "pending"),
          // Completed bookings
          supabase
            .from("bookings")
            .select("*", { count: "exact", head: true })
            .eq("brand_profile_id", profile.id)
            .eq("status", "completed"),
          // Active opportunities
          supabase
            .from("brand_opportunities")
            .select("*", { count: "exact", head: true })
            .eq("brand_profile_id", profile.id)
            .eq("status", "active"),
          // Featured creators
          supabase
            .from("creator_profiles")
            .select("id, display_name, profile_image_url, categories, average_rating")
            .eq("status", "approved")
            .eq("is_featured", true)
            .order("average_rating", { ascending: false, nullsFirst: false })
            .limit(10),
          // Recent notifications
          supabase
            .from("notifications")
            .select("id, title, message, created_at, read")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

        setStats({
          unreadMessages: messagesRes as number,
          pendingBookings: pendingRes.count || 0,
          completedBookings: completedRes.count || 0,
          activeOpportunities: opportunitiesRes.count || 0,
        });
        setFeaturedCreators(creatorsRes.data || []);
        setNotifications(notifsRes.data || []);
      },
      undefined,
      8000
    );
    setLoading(false);
  };

  const quickActions = [
    { icon: Search, label: "Find Creators", action: () => onTabChange("search") },
    { icon: Megaphone, label: "Post Opportunity", action: () => setShowCreateOpportunity(true) },
    { icon: Calendar, label: "View Bookings", action: () => onTabChange("bookings") },
    { icon: MessageSquare, label: "Messages", action: () => onTabChange("messages") },
  ];

  const statCards = [
    { label: "Unread Messages", value: stats.unreadMessages, icon: MessageSquare, color: "text-blue-500" },
    { label: "Pending Bookings", value: stats.pendingBookings, icon: Calendar, color: "text-amber-500" },
    { label: "Active Opps", value: stats.activeOpportunities, icon: TrendingUp, color: "text-green-500" },
    { label: "Completed", value: stats.completedBookings, icon: Star, color: "text-primary" },
  ];

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-xl font-bold text-foreground">
          Welcome back{brandName ? `, ${brandName}` : ""}! 👋
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Here's what's happening with your brand
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-xl p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={action.action}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors active:scale-95"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-[10px] font-medium text-foreground text-center leading-tight">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Alerts */}
      {notifications.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Recent Alerts</h3>
            <button
              onClick={() => onTabChange("notifications")}
              className="text-xs text-primary font-medium"
            >
              View all
            </button>
          </div>
          <div className="space-y-2">
            {notifications.slice(0, 3).map((notif) => (
              <div
                key={notif.id}
                className={`flex items-start gap-3 p-3 rounded-xl border ${
                  notif.read ? "border-border bg-card" : "border-primary/20 bg-primary/5"
                }`}
              >
                <Bell className={`h-4 w-4 mt-0.5 shrink-0 ${notif.read ? "text-muted-foreground" : "text-primary"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{notif.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{notif.message}</p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(notif.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Featured Creators Carousel */}
      {featuredCreators.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Featured Creators</h3>
            <button
              onClick={() => onTabChange("search")}
              className="text-xs text-primary font-medium flex items-center gap-0.5"
            >
              See all <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <ScrollArea className="w-full">
            <div className="flex gap-3 pb-2">
              {featuredCreators.map((creator) => (
                <button
                  key={creator.id}
                  onClick={() => navigate(`/creator/${creator.id}`)}
                  className="shrink-0 w-32 flex flex-col items-center text-center p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors active:scale-95"
                >
                  <Avatar className="h-14 w-14 mb-2">
                    <AvatarImage src={creator.profile_image_url || undefined} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {creator.display_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-xs font-semibold text-foreground truncate w-full">
                    {creator.display_name}
                  </p>
                  {creator.categories && creator.categories[0] && (
                    <span className="text-[10px] text-muted-foreground mt-0.5 truncate w-full">
                      {creator.categories[0]}
                    </span>
                  )}
                  {creator.average_rating && creator.average_rating > 0 && (
                    <div className="flex items-center gap-0.5 mt-1">
                      <Star className="h-3 w-3 fill-primary text-primary" />
                      <span className="text-[10px] font-medium text-foreground">
                        {creator.average_rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}

      {/* Post Opportunity Dialog */}
      {brandProfileId && (
        <CreateOpportunityDialog
          brandProfileId={brandProfileId}
          open={showCreateOpportunity}
          onOpenChange={setShowCreateOpportunity}
          onSuccess={() => setShowCreateOpportunity(false)}
        />
      )}
    </div>
  );
};

export default NativeBrandHome;
