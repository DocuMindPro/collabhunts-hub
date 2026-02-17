import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, DollarSign, Calendar, MessageSquare, ArrowRight, Building2, Target, Pencil, Package, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { safeNativeAsync, isNativePlatform } from "@/lib/supabase-native";
import { EVENT_PACKAGES, PackageType } from "@/config/packages";
import { checkFollowerEligibility } from "@/config/follower-ranges";
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

const OverviewTab = ({ onNavigateToTab }: { onNavigateToTab?: (tab: string) => void }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    profileViews: 0,
    totalEarnings: 0,
    pendingBookings: 0,
    unreadMessages: 0,
    profileStatus: "pending" as string,
  });
  const [loading, setLoading] = useState(true);
  const [matchedOpportunities, setMatchedOpportunities] = useState<OpportunityPreview[]>([]);
  const [isFallback, setIsFallback] = useState(false);

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
          .maybeSingle();

        if (!profile) return defaultStats;

        const { data: conversationsData } = await supabase
          .from("conversations")
          .select("id")
          .eq("creator_profile_id", profile.id);

        const conversationIds = conversationsData?.map(c => c.id) || [];

        const [viewsData, bookingsData, messagesData, socialData, oppsData] = await Promise.all([
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
            .from("creator_social_accounts")
            .select("follower_count")
            .eq("creator_profile_id", profile.id),
          supabase
            .from("brand_opportunities")
            .select("id, title, package_type, event_date, is_paid, budget_cents, required_categories, location_city, follower_ranges, min_followers, brand_profiles(company_name, venue_name, logo_url)")
            .eq("status", "open")
            .gte("event_date", new Date().toISOString().split('T')[0])
            .order("created_at", { ascending: false })
            .limit(30),
        ]);

        // Calculate max follower count
        const maxFollowers = socialData.data?.reduce((max, acc) => {
          const count = Number(acc.follower_count) || 0;
          return count > max ? count : max;
        }, 0) || 0;

        // Score opportunities
        const allOpps = oppsData.data || [];
        const scored = allOpps.map((opp: any) => {
          let score = 0;
          if (maxFollowers > 0 && checkFollowerEligibility(maxFollowers, opp.follower_ranges)) score += 3;
          if (opp.required_categories?.some((cat: string) => profile.categories?.includes(cat))) score += 2;
          if (opp.location_city && opp.location_city === profile.location_city) score += 1;
          return { ...opp, score };
        });

        const matched = scored.filter((o: any) => o.score > 0).sort((a: any, b: any) => b.score - a.score).slice(0, 5);

        if (matched.length > 0) {
          setMatchedOpportunities(matched as unknown as OpportunityPreview[]);
          setIsFallback(false);
        } else {
          setMatchedOpportunities((allOpps.slice(0, 3)) as unknown as OpportunityPreview[]);
          setIsFallback(true);
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
      <div className="space-y-3 md:space-y-6">
        <Skeleton className="h-6 w-24" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 md:h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-40 rounded-xl" />
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
    <div className={`space-y-3 md:space-y-6 ${isNative ? 'pb-24' : ''} animate-fade-in`}>
      {/* Inline Profile Status */}
      <div className="flex items-center gap-2">
        <span className="text-xs md:text-sm text-muted-foreground">Status:</span>
        <Badge className={`${getStatusColor(stats.profileStatus)} text-white capitalize text-[10px] md:text-xs px-2 py-0.5`}>
          {stats.profileStatus}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        {[
          { title: "Profile Views", value: stats.profileViews, icon: Eye, desc: "Total views on your profile" },
          { title: "Earnings", value: `$${stats.totalEarnings.toFixed(2)}`, icon: DollarSign, desc: "From completed bookings" },
          { title: "Pending", value: stats.pendingBookings, icon: Calendar, desc: "Awaiting your response" },
          { title: "Messages", value: stats.unreadMessages, icon: MessageSquare, desc: "New messages from brands" },
        ].map((stat, idx) => (
          <Card key={stat.title} className="animate-fade-in" style={{ animationDelay: `${idx * 75}ms` }}>
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

      {/* Quick Actions - Native only */}
      {isNative && (
        <div className="flex gap-2 animate-fade-in" style={{ animationDelay: "300ms" }}>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 text-xs"
            onClick={() => onNavigateToTab?.("profile")}
          >
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Edit Profile
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 text-xs"
            onClick={() => onNavigateToTab?.("services")}
          >
            <Package className="h-3.5 w-3.5 mr-1.5" />
            Add Package
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 text-xs"
            onClick={() => navigate("/opportunities")}
          >
            <Briefcase className="h-3.5 w-3.5 mr-1.5" />
            Browse Opps
          </Button>
        </div>
      )}

      {/* Opportunities For You */}
      {matchedOpportunities.length > 0 ? (
        <Card>
          <CardHeader className="pb-2 pt-3 px-3 md:pb-3 md:pt-6 md:px-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm md:text-base flex items-center gap-2">
                  <Target className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                  Opportunities For You
                </CardTitle>
                <CardDescription className="text-[10px] md:text-sm mt-0.5">
                  {isFallback ? "Browse all to find your match" : "Based on your profile and stats"}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="h-7 text-xs md:h-9 md:text-sm">
                <Link to="/opportunities" className="gap-1 text-primary">
                  View All <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 px-3 pb-3 md:space-y-3 md:px-6 md:pb-6">
            {matchedOpportunities.map((opp) => (
              <OpportunityRow key={opp.id} opp={opp} highlight={!isFallback} />
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 px-4 text-center gap-3">
            <Briefcase className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="font-medium text-sm">No matching opportunities yet</p>
              <p className="text-xs text-muted-foreground mt-1">Complete your profile and add social stats to get matched</p>
            </div>
            <Button size="sm" asChild className="mt-1">
              <Link to="/opportunities">Browse All Opportunities</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OverviewTab;
