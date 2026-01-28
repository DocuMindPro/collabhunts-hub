import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, DollarSign, Calendar, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { safeNativeAsync } from "@/lib/supabase-native";

const OverviewTab = () => {
  const [stats, setStats] = useState({
    profileViews: 0,
    totalEarnings: 0,
    pendingBookings: 0,
    unreadMessages: 0,
    profileStatus: "pending" as string,
  });
  const [loading, setLoading] = useState(true);
  const [creatorProfileId, setCreatorProfileId] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    const defaultStats = {
      profileViews: 0,
      totalEarnings: 0,
      pendingBookings: 0,
      unreadMessages: 0,
      profileStatus: "pending" as string,
    };

    const result = await safeNativeAsync(
      async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return defaultStats;

        const { data: profile } = await supabase
          .from("creator_profiles")
          .select("id, status")
          .eq("user_id", user.id)
          .single();

        if (!profile) return defaultStats;
        setCreatorProfileId(profile.id);

        // Get conversations first
        const { data: conversationsData } = await supabase
          .from("conversations")
          .select("id")
          .eq("creator_profile_id", profile.id);

        const conversationIds = conversationsData?.map(c => c.id) || [];

        const [viewsData, bookingsData, messagesData] = await Promise.all([
          supabase
            .from("profile_views")
            .select("*", { count: "exact", head: true })
            .eq("creator_profile_id", profile.id),
          supabase
            .from("bookings")
            .select("status, total_price_cents")
            .eq("creator_profile_id", profile.id),
          conversationIds.length > 0
            ? supabase
                .from("messages")
                .select("id, is_read")
                .eq("is_read", false)
                .in("conversation_id", conversationIds)
            : { data: [] },
        ]);

        const completedBookings = bookingsData.data?.filter(b => b.status === "completed") || [];
        const totalEarnings = completedBookings.reduce((sum, b) => sum + b.total_price_cents, 0);
        const pendingBookings = bookingsData.data?.filter(b => b.status === "pending").length || 0;

        return {
          profileViews: viewsData.count || 0,
          totalEarnings: totalEarnings / 100,
          pendingBookings,
          unreadMessages: messagesData.data?.length || 0,
          profileStatus: profile.status,
        };
      },
      defaultStats, // fallback on timeout
      8000 // 8 second timeout for dashboard stats
    );

    setStats(result);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "rejected": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Status</CardTitle>
          <CardDescription>Your current profile approval status</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge className={`${getStatusColor(stats.profileStatus)} text-white capitalize`}>
            {stats.profileStatus}
          </Badge>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.profileViews}</div>
            <p className="text-xs text-muted-foreground">Total views on your profile</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From completed bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingBookings}</div>
            <p className="text-xs text-muted-foreground">Awaiting your response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadMessages}</div>
            <p className="text-xs text-muted-foreground">New messages from brands</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OverviewTab;
