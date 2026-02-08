import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, MessageSquare, Calendar, ArrowRight } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import MessagingQuotaCard from "./MessagingQuotaCard";

interface RecentActivity {
  id: string;
  type: "booking" | "message";
  description: string;
  timeAgo: string;
  link: string;
}

const BrandOverviewTab = () => {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const [stats, setStats] = useState({
    totalSpent: 0,
    activeEvents: 0,
    completedEvents: 0,
    pendingRequests: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("brand_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) return;

      // Fetch bookings for stats
      const { data: bookingsData } = await supabase
        .from("bookings")
        .select("id, status, total_price_cents, created_at, creator_profile_id")
        .eq("brand_profile_id", profile.id)
        .order("created_at", { ascending: false });

      const completedBookings = bookingsData?.filter(b => b.status === "completed") || [];
      const totalSpent = completedBookings.reduce((sum, b) => sum + b.total_price_cents, 0);
      const activeEvents = bookingsData?.filter(b => b.status === "accepted").length || 0;
      const pendingRequests = bookingsData?.filter(b => b.status === "pending").length || 0;

      setStats({
        totalSpent: totalSpent / 100,
        activeEvents,
        completedEvents: completedBookings.length,
        pendingRequests,
      });

      // Build recent activity from bookings
      const activities: RecentActivity[] = [];
      
      if (bookingsData && bookingsData.length > 0) {
        // Get creator names for bookings
        const creatorIds = [...new Set(bookingsData.map(b => b.creator_profile_id))];
        const { data: creators } = await supabase
          .from("creator_profiles")
          .select("id, display_name")
          .in("id", creatorIds);
        
        const creatorMap = new Map(creators?.map(c => [c.id, c.display_name]) || []);

        bookingsData.slice(0, 5).forEach(booking => {
          const creatorName = creatorMap.get(booking.creator_profile_id) || "Creator";
          let description = "";
          
          switch (booking.status) {
            case "completed":
              description = `Booking completed with ${creatorName}`;
              break;
            case "accepted":
              description = `Booking confirmed with ${creatorName}`;
              break;
            case "pending":
              description = `Booking request sent to ${creatorName}`;
              break;
            case "cancelled":
              description = `Booking cancelled with ${creatorName}`;
              break;
            default:
              description = `Booking with ${creatorName}`;
          }

          activities.push({
            id: booking.id,
            type: "booking",
            description,
            timeAgo: formatDistanceToNow(new Date(booking.created_at), { addSuffix: true }),
            link: "/brand-dashboard?tab=bookings",
          });
        });
      }

      setRecentActivity(activities.slice(0, 3));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabNavigation = (tab: string) => {
    setSearchParams({ tab });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Row - Unified Card */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold">${stats.totalSpent.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Spent</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold">{stats.activeEvents}</p>
              <p className="text-xs text-muted-foreground mt-1">Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold">{stats.completedEvents}</p>
              <p className="text-xs text-muted-foreground mt-1">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold">{stats.pendingRequests}</p>
              <p className="text-xs text-muted-foreground mt-1">Pending</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messaging Quota */}
      <MessagingQuotaCard />

      {/* Recent Activity */}
      <Card>
        <CardHeader className="py-3 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-7 px-2"
              onClick={() => handleTabNavigation('bookings')}
            >
              View All
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-center gap-3 text-sm cursor-pointer hover:bg-muted/50 -mx-2 px-2 py-1.5 rounded-md transition-colors"
                  onClick={() => handleTabNavigation('bookings')}
                >
                  <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                  <span className="flex-1 truncate">{activity.description}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{activity.timeAgo}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Calendar className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No recent activity</p>
              <Button 
                variant="link" 
                size="sm" 
                className="mt-1 h-auto p-0 text-xs"
                onClick={() => navigate('/influencers')}
              >
                Find creators to get started
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/influencers')} 
              className="h-auto py-3 flex-col gap-1.5 text-xs"
            >
              <Users className="h-4 w-4" />
              <span>Find Creators</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleTabNavigation('opportunities')} 
              className="h-auto py-3 flex-col gap-1.5 text-xs"
            >
              <Briefcase className="h-4 w-4" />
              <span>Opportunities</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleTabNavigation('messages')} 
              className="h-auto py-3 flex-col gap-1.5 text-xs"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Messages</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrandOverviewTab;
