import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, DollarSign, Calendar, MessageSquare, Sparkles, ArrowRight, TrendingUp, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { safeNativeAsync, isNativePlatform } from "@/lib/supabase-native";
import { EVENT_PACKAGES, PackageType } from "@/config/packages";
import { format } from "date-fns";

interface OpportunityPreview {
  id: string;
  title: string;
  package_type: string | null;
  event_date: string;
  is_paid: boolean;
  budget_cents: number | null;
  brand_profiles: {
    company_name: string;
    venue_name: string | null;
    logo_url: string | null;
  } | null;
}

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
  const [latestOpportunities, setLatestOpportunities] = useState<OpportunityPreview[]>([]);
  const [recommendedOpportunities, setRecommendedOpportunities] = useState<OpportunityPreview[]>([]);
  const [weeklyStats, setWeeklyStats] = useState({ newOppsCount: 0, matchingOppsCount: 0, weeklyViews: 0 });

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
          .select("id, status, categories, location_city")
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

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoISO = sevenDaysAgo.toISOString();

        const [viewsData, bookingsData, messagesData, latestOppsData, weeklyOppsData, weeklyViewsData] = await Promise.all([
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
          // Latest 3 open opportunities
          supabase
            .from("brand_opportunities")
            .select("id, title, package_type, event_date, is_paid, budget_cents, brand_profiles(company_name, venue_name, logo_url)")
            .eq("status", "open")
            .gte("event_date", new Date().toISOString().split('T')[0])
            .order("created_at", { ascending: false })
            .limit(3),
          // Count of new opps this week
          supabase
            .from("brand_opportunities")
            .select("id, required_categories", { count: "exact" })
            .eq("status", "open")
            .gte("created_at", sevenDaysAgoISO),
          // Weekly profile views
          supabase
            .from("profile_views")
            .select("*", { count: "exact", head: true })
            .eq("creator_profile_id", profile.id)
            .gte("viewed_at", sevenDaysAgoISO),
        ]);

        setLatestOpportunities((latestOppsData.data as unknown as OpportunityPreview[]) || []);

        // Weekly stats
        const weeklyOpps = weeklyOppsData.data || [];
        const matchingCount = profile.categories?.length
          ? weeklyOpps.filter((opp: any) =>
              opp.required_categories?.some((cat: string) => profile.categories?.includes(cat))
            ).length
          : 0;

        setWeeklyStats({
          newOppsCount: weeklyOppsData.count || 0,
          matchingOppsCount: matchingCount,
          weeklyViews: weeklyViewsData.count || 0,
        });

        // Recommended opportunities (match by category or city)
        if (profile.categories?.length || profile.location_city) {
          const { data: allOpenOpps } = await supabase
            .from("brand_opportunities")
            .select("id, title, package_type, event_date, is_paid, budget_cents, required_categories, location_city, brand_profiles(company_name, venue_name, logo_url)")
            .eq("status", "open")
            .gte("event_date", new Date().toISOString().split('T')[0])
            .order("created_at", { ascending: false })
            .limit(20);

          if (allOpenOpps) {
            const scored = allOpenOpps.map((opp: any) => {
              let score = 0;
              if (opp.required_categories?.some((cat: string) => profile.categories?.includes(cat))) score += 2;
              if (opp.location_city && opp.location_city === profile.location_city) score += 1;
              return { ...opp, score };
            }).filter((opp: any) => opp.score > 0)
              .sort((a: any, b: any) => b.score - a.score)
              .slice(0, 3);

            setRecommendedOpportunities(scored as unknown as OpportunityPreview[]);
          }
        }

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
      defaultStats,
      8000
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

  const isNative = isNativePlatform();

  return (
    <div className={`space-y-4 ${isNative ? 'pb-24' : 'space-y-6'}`}>
      <Card>
        <CardHeader className={isNative ? 'pb-2' : ''}>
          <CardTitle className={isNative ? 'text-base' : ''}>Profile Status</CardTitle>
          {!isNative && <CardDescription>Your current profile approval status</CardDescription>}
        </CardHeader>
        <CardContent>
          <Badge className={`${getStatusColor(stats.profileStatus)} text-white capitalize`}>
            {stats.profileStatus}
          </Badge>
        </CardContent>
      </Card>

      <div className={`grid gap-3 ${isNative ? 'grid-cols-2' : 'gap-6 md:grid-cols-2 lg:grid-cols-4'}`}>
        <Card>
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isNative ? 'pb-1 pt-3 px-3' : 'pb-2'}`}>
            <CardTitle className={`font-medium ${isNative ? 'text-xs' : 'text-sm'}`}>Profile Views</CardTitle>
            <Eye className={`text-muted-foreground ${isNative ? 'h-3 w-3' : 'h-4 w-4'}`} />
          </CardHeader>
          <CardContent className={isNative ? 'px-3 pb-3' : ''}>
            <div className={`font-bold ${isNative ? 'text-xl' : 'text-2xl'}`}>{stats.profileViews}</div>
            {!isNative && <p className="text-xs text-muted-foreground">Total views on your profile</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isNative ? 'pb-1 pt-3 px-3' : 'pb-2'}`}>
            <CardTitle className={`font-medium ${isNative ? 'text-xs' : 'text-sm'}`}>Earnings</CardTitle>
            <DollarSign className={`text-muted-foreground ${isNative ? 'h-3 w-3' : 'h-4 w-4'}`} />
          </CardHeader>
          <CardContent className={isNative ? 'px-3 pb-3' : ''}>
            <div className={`font-bold ${isNative ? 'text-xl' : 'text-2xl'}`}>${stats.totalEarnings.toFixed(2)}</div>
            {!isNative && <p className="text-xs text-muted-foreground">From completed bookings</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isNative ? 'pb-1 pt-3 px-3' : 'pb-2'}`}>
            <CardTitle className={`font-medium ${isNative ? 'text-xs' : 'text-sm'}`}>Pending</CardTitle>
            <Calendar className={`text-muted-foreground ${isNative ? 'h-3 w-3' : 'h-4 w-4'}`} />
          </CardHeader>
          <CardContent className={isNative ? 'px-3 pb-3' : ''}>
            <div className={`font-bold ${isNative ? 'text-xl' : 'text-2xl'}`}>{stats.pendingBookings}</div>
            {!isNative && <p className="text-xs text-muted-foreground">Awaiting your response</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isNative ? 'pb-1 pt-3 px-3' : 'pb-2'}`}>
            <CardTitle className={`font-medium ${isNative ? 'text-xs' : 'text-sm'}`}>Messages</CardTitle>
            <MessageSquare className={`text-muted-foreground ${isNative ? 'h-3 w-3' : 'h-4 w-4'}`} />
          </CardHeader>
          <CardContent className={isNative ? 'px-3 pb-3' : ''}>
            <div className={`font-bold ${isNative ? 'text-xl' : 'text-2xl'}`}>{stats.unreadMessages}</div>
            {!isNative && <p className="text-xs text-muted-foreground">New messages from brands</p>}
          </CardContent>
        </Card>
      </div>

      {/* This Week Summary */}
      {!isNative && (weeklyStats.newOppsCount > 0 || weeklyStats.weeklyViews > 0) && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6 text-sm">
              {weeklyStats.newOppsCount > 0 && (
                <div>
                  <span className="text-2xl font-bold text-primary">{weeklyStats.newOppsCount}</span>
                  <p className="text-muted-foreground">new opportunities posted</p>
                </div>
              )}
              {weeklyStats.matchingOppsCount > 0 && (
                <div>
                  <span className="text-2xl font-bold text-primary">{weeklyStats.matchingOppsCount}</span>
                  <p className="text-muted-foreground">matching your categories</p>
                </div>
              )}
              {weeklyStats.weeklyViews > 0 && (
                <div>
                  <span className="text-2xl font-bold text-primary">{weeklyStats.weeklyViews}</span>
                  <p className="text-muted-foreground">profile views this week</p>
                </div>
              )}
            </div>
            {weeklyStats.matchingOppsCount > 0 && (
              <p className="text-sm text-primary font-medium mt-3">
                🔥 {weeklyStats.matchingOppsCount} brand{weeklyStats.matchingOppsCount > 1 ? 's are' : ' is'} looking for creators like you!
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Latest Opportunities */}
      {latestOpportunities.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className={`flex items-center gap-2 ${isNative ? 'text-base' : ''}`}>
                <Sparkles className="h-4 w-4 text-primary" />
                New Opportunities
                {weeklyStats.newOppsCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {weeklyStats.newOppsCount} this week
                  </Badge>
                )}
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/opportunities" className="gap-1 text-primary">
                  View All <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestOpportunities.map((opp) => {
              const packageInfo = opp.package_type ? EVENT_PACKAGES[opp.package_type as PackageType] : null;
              return (
                <Link
                  key={opp.id}
                  to="/opportunities"
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{opp.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {opp.brand_profiles?.venue_name || opp.brand_profiles?.company_name}
                      </span>
                      {packageInfo && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {packageInfo.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-3 shrink-0">
                    {opp.is_paid && opp.budget_cents ? (
                      <span className="text-sm font-semibold text-green-600">${(opp.budget_cents / 100).toFixed(0)}</span>
                    ) : opp.is_paid ? (
                      <span className="text-xs text-green-600">Paid</span>
                    ) : (
                      <span className="text-xs text-amber-600">Free Invite</span>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {format(new Date(opp.event_date), "MMM d")}
                    </p>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Recommended For You */}
      {!isNative && recommendedOpportunities.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              🎯 Recommended For You
            </CardTitle>
            <CardDescription>Opportunities matching your categories & location</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendedOpportunities.map((opp) => {
              const packageInfo = opp.package_type ? EVENT_PACKAGES[opp.package_type as PackageType] : null;
              return (
                <Link
                  key={opp.id}
                  to="/opportunities"
                  className="flex items-center justify-between p-3 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{opp.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {opp.brand_profiles?.venue_name || opp.brand_profiles?.company_name}
                      </span>
                      {packageInfo && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {packageInfo.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-3 shrink-0">
                    {opp.is_paid && opp.budget_cents ? (
                      <span className="text-sm font-semibold text-green-600">${(opp.budget_cents / 100).toFixed(0)}</span>
                    ) : opp.is_paid ? (
                      <span className="text-xs text-green-600">Paid</span>
                    ) : (
                      <span className="text-xs text-amber-600">Free Invite</span>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {format(new Date(opp.event_date), "MMM d")}
                    </p>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OverviewTab;
