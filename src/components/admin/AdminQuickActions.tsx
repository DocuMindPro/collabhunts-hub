import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  Users, 
  Scale, 
  BadgeCheck, 
  DollarSign,
  ArrowRight,
  Clock,
  RefreshCw,
  Rocket
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface QuickActionStats {
  pendingCreators: number;
  openDisputes: number;
  verificationRequests: number;
  pendingPayouts: number;
  staleItems: number;
  boostRequests: number;
  statsInactive: number;
}

interface Props {
  onNavigate: (tab: string) => void;
}

export default function AdminQuickActions({ onNavigate }: Props) {
  const [stats, setStats] = useState<QuickActionStats>({
    pendingCreators: 0,
    openDisputes: 0,
    verificationRequests: 0,
    pendingPayouts: 0,
    staleItems: 0,
    boostRequests: 0,
    statsInactive: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchStats = async () => {
    setLoading(true);
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      // Fetch all counts in parallel
      const [
        { count: pendingCreators },
        { count: openDisputes },
        { count: verificationRequests },
        { count: franchisePayouts },
        { count: affiliatePayouts },
        { count: staleCreators },
        { count: boostRequests },
        { count: statsInactive },
      ] = await Promise.all([
        supabase.from("creator_profiles").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("booking_disputes").select("*", { count: "exact", head: true }).in("status", ["open", "awaiting_response"]),
        supabase.from("brand_profiles").select("*", { count: "exact", head: true }).eq("verification_status", "pending"),
        supabase.from("franchise_payout_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("affiliate_payout_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("creator_profiles").select("*", { count: "exact", head: true }).eq("status", "pending").lt("created_at", twentyFourHoursAgo),
        supabase.from("boost_interest_requests").select("*", { count: "exact", head: true }).eq("seen_by_admin", false),
        supabase.from("creator_profiles").select("*", { count: "exact", head: true }).eq("stats_update_required", true),
      ]);

      setStats({
        pendingCreators: pendingCreators || 0,
        openDisputes: openDisputes || 0,
        verificationRequests: verificationRequests || 0,
        pendingPayouts: (franchisePayouts || 0) + (affiliatePayouts || 0),
        staleItems: staleCreators || 0,
        boostRequests: boostRequests || 0,
        statsInactive: statsInactive || 0,
      });
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Error fetching quick action stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh every 2 minutes
    const interval = setInterval(fetchStats, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const totalRequiresAttention = 
    stats.pendingCreators + 
    stats.openDisputes + 
    stats.verificationRequests + 
    stats.pendingPayouts +
    stats.boostRequests +
    stats.statsInactive;

  const actions = [
    {
      label: "Pending Creators",
      count: stats.pendingCreators,
      icon: Users,
      tab: "approvals",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Open Disputes",
      count: stats.openDisputes,
      icon: Scale,
      tab: "disputes",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      label: "Verification Requests",
      count: stats.verificationRequests,
      icon: BadgeCheck,
      tab: "verifications",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Payout Requests",
      count: stats.pendingPayouts,
      icon: DollarSign,
      tab: "revenue",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Boost Requests",
      count: stats.boostRequests,
      icon: Rocket,
      tab: "features",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Stats Inactive",
      count: stats.statsInactive,
      icon: AlertCircle,
      tab: "approvals",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  if (loading) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (totalRequiresAttention === 0) {
    return (
      <Card className="mb-6 border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <BadgeCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">All caught up!</p>
                <p className="text-sm text-green-600 dark:text-green-400">No pending items require your attention</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={fetchStats} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <CardTitle className="text-lg text-amber-800 dark:text-amber-200">
              Requires Attention
            </CardTitle>
            <Badge variant="destructive" className="ml-2">
              {totalRequiresAttention}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            {stats.staleItems > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {stats.staleItems} waiting 24h+
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={fetchStats} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {actions.map((action) => (
            <button
              key={action.tab}
              onClick={() => onNavigate(action.tab)}
              disabled={action.count === 0}
              className={`
                relative p-4 rounded-lg border transition-all text-left
                ${action.count > 0 
                  ? 'hover:border-primary hover:shadow-sm cursor-pointer bg-background' 
                  : 'opacity-50 cursor-not-allowed bg-muted/30'
                }
              `}
            >
              <div className="flex items-start justify-between mb-2">
                <div className={`p-2 rounded-lg ${action.bgColor}`}>
                  <action.icon className={`h-4 w-4 ${action.color}`} />
                </div>
                {action.count > 0 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="text-2xl font-bold">{action.count}</div>
              <div className="text-xs text-muted-foreground truncate">{action.label}</div>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-right">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </p>
      </CardContent>
    </Card>
  );
}
