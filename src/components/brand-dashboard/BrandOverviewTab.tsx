import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Calendar, CheckCircle, Clock, Zap, Lock, MessageCircle, Users, Filter, BadgeCheck, FolderOpen, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SUBSCRIPTION_PLANS, PlanType } from "@/lib/stripe-mock";
import UpgradeBanner from "@/components/UpgradeBanner";

const BrandOverviewTab = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSpent: 0,
    activeBookings: 0,
    completedBookings: 0,
    pendingBookings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [planType, setPlanType] = useState<PlanType>("none");

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("brand_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) return;

      // Fetch subscription
      const { data: subscription } = await supabase
        .from("brand_subscriptions")
        .select("plan_type")
        .eq("brand_profile_id", profile.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setPlanType((subscription?.plan_type || "none") as PlanType);

      const { data: bookingsData } = await supabase
        .from("bookings")
        .select("status, total_price_cents")
        .eq("brand_profile_id", profile.id);

      const completedBookings = bookingsData?.filter(b => b.status === "completed") || [];
      const totalSpent = completedBookings.reduce((sum, b) => sum + b.total_price_cents, 0);
      const activeBookings = bookingsData?.filter(b => b.status === "accepted").length || 0;
      const pendingBookings = bookingsData?.filter(b => b.status === "pending").length || 0;

      setStats({
        totalSpent: totalSpent / 100,
        activeBookings,
        completedBookings: completedBookings.length,
        pendingBookings,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const plan = SUBSCRIPTION_PLANS[planType];

  const lockedFeatures = [
    { 
      key: "chat", 
      label: "Chat with Creators", 
      icon: MessageCircle, 
      locked: !plan.canContactCreators,
      unlockedAt: "Basic"
    },
    { 
      key: "campaigns", 
      label: "Post Campaigns", 
      icon: Users, 
      locked: plan.campaignLimit === 0,
      unlockedAt: "Pro"
    },
    { 
      key: "crm", 
      label: "Save Creators (CRM)", 
      icon: FolderOpen, 
      locked: !plan.hasCRM,
      unlockedAt: "Pro"
    },
    { 
      key: "filters", 
      label: "Advanced Filters", 
      icon: Filter, 
      locked: !plan.hasAdvancedFilters,
      unlockedAt: "Pro"
    },
    { 
      key: "badge", 
      label: "Verified Badge", 
      icon: BadgeCheck, 
      locked: !plan.canRequestVerifiedBadge,
      unlockedAt: "Pro"
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upgrade Banner for free/basic users */}
      {(planType === "none" || planType === "basic") && (
        <UpgradeBanner currentPlan={planType} />
      )}

      {/* Current Plan Card */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Current Plan</CardTitle>
                <CardDescription>
                  {plan.name} - {plan.price === 0 ? "Free" : `$${plan.price}/mo`}
                </CardDescription>
              </div>
            </div>
            {planType !== "premium" && (
              <Button 
                onClick={() => navigate('/brand-dashboard?tab=subscription')}
                className="gap-2"
              >
                <Zap className="h-4 w-4" />
                Upgrade
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Marketplace fee: <span className="font-semibold text-foreground">{plan.marketplaceFee}%</span> on bookings
          </div>
        </CardContent>
      </Card>

      {/* Features Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {lockedFeatures.map((feature) => (
          <Card 
            key={feature.key}
            className={`relative overflow-hidden transition-all ${
              feature.locked 
                ? "border-dashed border-muted-foreground/30 bg-muted/30 hover:border-primary/50 cursor-pointer" 
                : "border-green-500/30 bg-green-50/50 dark:bg-green-950/20"
            }`}
            onClick={() => feature.locked && navigate('/brand-dashboard?tab=subscription')}
          >
            <CardContent className="p-4 text-center">
              <div className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                feature.locked ? "bg-muted" : "bg-green-100 dark:bg-green-900/30"
              }`}>
                {feature.locked ? (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <feature.icon className="h-4 w-4 text-green-600" />
                )}
              </div>
              <p className={`text-xs font-medium ${feature.locked ? "text-muted-foreground" : ""}`}>
                {feature.label}
              </p>
              {feature.locked && (
                <p className="text-[10px] text-primary mt-1">{feature.unlockedAt}+</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Header */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
          <CardDescription>Overview of your collaboration campaigns</CardDescription>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">On completed campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeBookings}</div>
            <p className="text-xs text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedBookings}</div>
            <p className="text-xs text-muted-foreground">Successful collaborations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingBookings}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BrandOverviewTab;
