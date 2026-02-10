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
          supabase
            .from("brand_opportunities")
            .select("id, title, package_type, event_date, is_paid, budget_cents, brand_profiles(company_name, venue_name, logo_url)")
            .eq("status", "open")
            .gte("event_date", new Date().toISOString().split('T')[0])
            .order("created_at", { ascending: false })
            .limit(3),
          supabase
            .from("brand_opportunities")
            .select("id, required_categories", { count: "exact" })
            .eq("status", "open")
            .gte("created_at", sevenDaysAgoISO),
          supabase
            .from("profile_views")
            .select("*", { count: "exact", head: true })
            .eq("creator_profile_id", profile.id)
            .gte("viewed_at", sevenDaysAgoISO),
        ]);

        setLatestOpportunities((latestOppsData.data as unknown as OpportunityPreview[]) || []);

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

  const OpportunityRow = ({ opp, highlight = false }: { opp: OpportunityPreview; highlight?: boolean }) => {
    const packageInfo = opp.package_type ? EVENT_PACKAGES[opp.package_type as PackageType] : null;
    return (
      <Link
        key={opp.id}
        to="/opportunities"
        className={`flex items-center justify-between p-2 md:p-3 rounded-lg border transition-colors ${
          highlight
            ? "border-primary/20 bg-primary/5 hover:bg-primary/10"
            : "border-border hover:bg-muted/50"
        }`}
      >
        <div className="flex-1 min-w-0">
          <p className="font-medium text-xs md:text-sm truncate">{opp.title}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] md:text-xs text-muted-foreground flex items-center gap-1">
              <Building2 className="h-2.5 w-2.5 md:h-3 md:w-3" />
              {opp.brand_profiles?.venue_name || opp.brand_profiles?.company_name}
            </span>
            {packageInfo && (
              <Badge variant="outline" className="text-[9px] md:text-[10px] px-1 py-0 leading-tight">
                {packageInfo.name}
              </Badge>
            )}
          </div>
        </div>
        <div className="text-right ml-2 shrink-0">
          {opp.is_paid && opp.budget_cents ? (
            <span className="text-xs md:text-sm font-semibold text-green-600">${(opp.budget_cents / 100).toFixed(0)}</span>
          ) : opp.is_paid ? (
            <span className="text-[10px] md:text-xs text-green-600">Paid</span>
          ) : (
            <span className="text-[10px] md:text-xs text-amber-600">Free Invite</span>
          )}
          <p className="text-[9px] md:text-[10px] text-muted-foreground">
            {format(new Date(opp.event_date), "MMM d")}
          </p>
        </div>
      </Link>
    );
  };

  return (
    <div className={`space-y-3 md:space-y-6 ${isNative ? 'pb-24' : ''}`}>
      {/* Inline Profile Status */}
      <div className="flex items-center gap-2">
        <span className="text-xs md:text-sm text-muted-foreground">Status:</span>
        <Badge className={`${getStatusColor(stats.profileStatus)} text-white capitalize text-[10px] md:text-xs px-2 py-0.5`}>
          {stats.profileStatus}
        </Badge>
      </div>

      {/* Stats Grid - 2 cols mobile, 4 cols desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        {[
          { title: "Profile Views", value: stats.profileViews, icon: Eye, desc: "Total views on your profile" },
          { title: "Earnings", value: `$${stats.totalEarnings.toFixed(2)}`, icon: DollarSign, desc: "From completed bookings" },
          { title: "Pending", value: stats.pendingBookings, icon: Calendar, desc: "Awaiting your response" },
          { title: "Messages", value: stats.unreadMessages, icon: MessageSquare, desc: "New messages from brands" },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3 md:pb-2 md:pt-6 md:px-6">
              <CardTitle className="text-[11px] md:text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-3 pb-3 md:px-6 md:pb-6">
              <div className="text-lg md:text-2xl font-bold">{stat.value}</div>
              <p className="hidden md:block text-xs text-muted-foreground">{stat.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* This Week Summary - always visible, compact on mobile */}
      {(weeklyStats.newOppsCount > 0 || weeklyStats.weeklyViews > 0) && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2 pt-3 px-3 md:pb-3 md:pt-6 md:px-6">
            <CardTitle className="text-sm md:text-base flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 md:px-6 md:pb-6">
            <div className="flex flex-wrap gap-4 md:gap-6 text-sm">
              {weeklyStats.newOppsCount > 0 && (
                <div>
                  <span className="text-lg md:text-2xl font-bold text-primary">{weeklyStats.newOppsCount}</span>
                  <p className="text-[10px] md:text-sm text-muted-foreground">new opportunities</p>
                </div>
              )}
              {weeklyStats.matchingOppsCount > 0 && (
                <div>
                  <span className="text-lg md:text-2xl font-bold text-primary">{weeklyStats.matchingOppsCount}</span>
                  <p className="text-[10px] md:text-sm text-muted-foreground">matching yours</p>
                </div>
              )}
              {weeklyStats.weeklyViews > 0 && (
                <div>
                  <span className="text-lg md:text-2xl font-bold text-primary">{weeklyStats.weeklyViews}</span>
                  <p className="text-[10px] md:text-sm text-muted-foreground">profile views</p>
                </div>
              )}
            </div>
            {weeklyStats.matchingOppsCount > 0 && (
              <p className="text-xs md:text-sm text-primary font-medium mt-2">
                🔥 {weeklyStats.matchingOppsCount} brand{weeklyStats.matchingOppsCount > 1 ? 's are' : ' is'} looking for creators like you!
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Latest Opportunities */}
      {latestOpportunities.length > 0 && (
        <Card>
          <CardHeader className="pb-2 pt-3 px-3 md:pb-3 md:pt-6 md:px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm md:text-base flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                New Opportunities
                {weeklyStats.newOppsCount > 0 && (
                  <Badge variant="secondary" className="text-[9px] md:text-xs">
                    {weeklyStats.newOppsCount} this week
                  </Badge>
                )}
              </CardTitle>
              <Button variant="ghost" size="sm" asChild className="h-7 text-xs md:h-9 md:text-sm">
                <Link to="/opportunities" className="gap-1 text-primary">
                  View All <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 px-3 pb-3 md:space-y-3 md:px-6 md:pb-6">
            {latestOpportunities.map((opp) => (
              <OpportunityRow key={opp.id} opp={opp} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommended For You - now visible on all screens */}
      {recommendedOpportunities.length > 0 && (
        <Card>
          <CardHeader className="pb-2 pt-3 px-3 md:pb-3 md:pt-6 md:px-6">
            <CardTitle className="text-sm md:text-base flex items-center gap-2">
              🎯 Recommended For You
            </CardTitle>
            <CardDescription className="text-[10px] md:text-sm">Matching your categories & location</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 px-3 pb-3 md:space-y-3 md:px-6 md:pb-6">
            {recommendedOpportunities.map((opp) => (
              <OpportunityRow key={opp.id} opp={opp} highlight />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OverviewTab;
