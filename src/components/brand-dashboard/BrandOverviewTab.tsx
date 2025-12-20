import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Calendar, CheckCircle, Clock, Zap, Lock, MessageCircle, Users, Filter, BadgeCheck, FolderOpen, Sparkles, HardDrive, Mail, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SUBSCRIPTION_PLANS, PlanType } from "@/lib/stripe-mock";
import UpgradeBanner from "@/components/UpgradeBanner";
import UpgradePrompt from "@/components/UpgradePrompt";

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
  const [storageUsage, setStorageUsage] = useState({ used: 0, limit: 0 });
  const [campaignUsage, setCampaignUsage] = useState({ used: 0, limit: 0 });
  const [massMessageUsage, setMassMessageUsage] = useState({ dailyUsed: 0, dailyLimit: 0 });

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

      const currentPlan = (subscription?.plan_type || "none") as PlanType;
      setPlanType(currentPlan);

      // Fetch storage usage for Pro/Premium users
      if (currentPlan === "pro" || currentPlan === "premium") {
        const { data: storageData } = await supabase
          .from("brand_storage_usage")
          .select("storage_used_bytes, storage_limit_bytes")
          .eq("brand_profile_id", profile.id)
          .maybeSingle();

        if (storageData) {
          setStorageUsage({
            used: storageData.storage_used_bytes,
            limit: storageData.storage_limit_bytes
          });
        }

        // Fetch campaign usage this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count: campaignCount } = await supabase
          .from("campaigns")
          .select("*", { count: "exact", head: true })
          .eq("brand_profile_id", profile.id)
          .gte("created_at", startOfMonth.toISOString());

        setCampaignUsage({
          used: campaignCount || 0,
          limit: SUBSCRIPTION_PLANS[currentPlan].campaignLimit
        });

        // Fetch mass message usage today
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const { data: messageData } = await supabase
          .from("mass_messages_log")
          .select("message_count")
          .eq("brand_profile_id", profile.id)
          .gte("sent_at", todayStart.toISOString());

        const dailyUsed = messageData?.reduce((sum, log) => sum + log.message_count, 0) || 0;
        setMassMessageUsage({
          dailyUsed,
          dailyLimit: SUBSCRIPTION_PLANS[currentPlan].massMessageLimit
        });
      }

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

  // Calculate if Pro users should see Premium upsells
  const storagePercentUsed = storageUsage.limit > 0 ? (storageUsage.used / storageUsage.limit) * 100 : 0;
  const showStorageUpsell = planType === "pro" && storagePercentUsed >= 80;
  const showCampaignUpsell = planType === "pro" && campaignUsage.limit !== Infinity && campaignUsage.used >= campaignUsage.limit;
  const showMassMessageUpsell = planType === "pro" && massMessageUsage.dailyUsed >= massMessageUsage.dailyLimit * 0.9;

  return (
    <div className="space-y-6">
      {/* Upgrade Banner for free/basic users */}
      {(planType === "none" || planType === "basic") && (
        <UpgradeBanner currentPlan={planType} />
      )}

      {/* Pro → Premium upsell banners */}
      {planType === "pro" && (
        <>
          {showStorageUpsell && (
            <UpgradePrompt feature="more_storage" inline targetTier="premium" />
          )}
          {showCampaignUpsell && (
            <UpgradePrompt feature="unlimited_campaigns" inline targetTier="premium" />
          )}
          {showMassMessageUpsell && (
            <UpgradePrompt feature="mass_message" inline targetTier="premium" />
          )}
        </>
      )}

      {/* Pro → Premium benefits card */}
      {planType === "pro" && !showStorageUpsell && !showCampaignUpsell && !showMassMessageUpsell && (
        <Card className="border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-yellow-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-amber-500/20">
                  <Crown className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium">Unlock Premium Benefits</p>
                  <p className="text-sm text-muted-foreground">
                    50GB storage, unlimited campaigns, 100/day mass messages, 5% fees
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/brand-dashboard?tab=subscription')}
                variant="outline"
                className="gap-2 border-amber-500/50 text-amber-700 hover:bg-amber-500/10"
              >
                <Zap className="h-4 w-4" />
                View Premium
              </Button>
            </div>
          </CardContent>
        </Card>
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
                  {plan.name} - {plan.price === 0 ? "Free" : `$${plan.price / 100}/mo`}
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
