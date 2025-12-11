import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, Crown, Zap, Shield, Lock, MessageCircle, Filter, Megaphone, Database, BadgeCheck } from "lucide-react";
import { SUBSCRIPTION_PLANS, PlanType, formatPrice, createCheckoutSession, cancelSubscription } from "@/lib/stripe-mock";
import { checkAndHandleExpiredSubscriptions } from "@/lib/subscription-utils";
import BrandVerificationSection from "./BrandVerificationSection";

interface Subscription {
  id: string;
  plan_type: PlanType;
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

const BrandSubscriptionTab = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [brandProfileId, setBrandProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get brand profile
      const { data: brandProfile } = await supabase
        .from('brand_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!brandProfile) return;
      setBrandProfileId(brandProfile.id);

      // Check for expired subscriptions and handle them
      await checkAndHandleExpiredSubscriptions(brandProfile.id);

      // Get active subscription (prefer non-none if exists)
      const { data: subs } = await supabase
        .from('brand_subscriptions')
        .select('*')
        .eq('brand_profile_id', brandProfile.id)
        .eq('status', 'active')
        .order('plan_type', { ascending: false }); // premium > pro > basic > none

      // Return highest tier active subscription
      const sub = subs && subs.length > 0 ? subs[0] : null;
      setSubscription(sub as Subscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planType: PlanType) => {
    if (!brandProfileId) return;
    
    setActionLoading(true);
    try {
      const result = await createCheckoutSession(planType, brandProfileId);
      
      if (result.success) {
        // First, cancel any existing active subscriptions
        const { error: cancelError } = await supabase
          .from('brand_subscriptions')
          .update({ status: 'canceled' })
          .eq('brand_profile_id', brandProfileId)
          .eq('status', 'active');
        
        if (cancelError) {
          console.error('Error canceling existing subscriptions:', cancelError);
        }

        // Create new subscription with 1 month period
        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        const { error } = await supabase
          .from('brand_subscriptions')
          .insert({
            brand_profile_id: brandProfileId,
            plan_type: planType,
            status: 'active',
            stripe_subscription_id: `sub_mock_${Date.now()}`,
            stripe_customer_id: `cus_mock_${Date.now()}`,
            current_period_end: periodEnd.toISOString(),
          });

        if (error) throw error;

        toast.success(`Successfully subscribed to ${SUBSCRIPTION_PLANS[planType].name} plan! Valid for 1 month.`);
        fetchSubscription();
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      toast.error('Failed to upgrade subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!subscription) return;
    
    setActionLoading(true);
    try {
      const result = await cancelSubscription(subscription.id);
      
      if (result.success) {
        const { error } = await supabase
          .from('brand_subscriptions')
          .update({ cancel_at_period_end: true })
          .eq('id', subscription.id);

        if (error) throw error;

        toast.success('Subscription will be canceled at period end');
        fetchSubscription();
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const currentPlan = subscription?.plan_type || 'none';

  const getPlanIcon = (plan: PlanType) => {
    switch (plan) {
      case 'premium': return <Crown className="h-5 w-5" />;
      case 'pro': return <Zap className="h-5 w-5" />;
      case 'basic': return <Shield className="h-5 w-5" />;
      default: return <Shield className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getPlanHighlights = (plan: PlanType) => {
    switch (plan) {
      case 'none':
        return [
          { icon: <Lock className="h-4 w-4" />, text: "Cannot chat with creators", locked: true },
          { icon: <Lock className="h-4 w-4" />, text: "Cannot post campaigns", locked: true },
          { icon: <Lock className="h-4 w-4" />, text: "20% marketplace fee", locked: true },
        ];
      case 'basic':
        return [
          { icon: <MessageCircle className="h-4 w-4" />, text: "Chat with creators", locked: false },
          { icon: <Database className="h-4 w-4" />, text: "10 GB Content Library", locked: false },
          { icon: <Lock className="h-4 w-4" />, text: "No campaigns", locked: true },
        ];
      case 'pro':
        return [
          { icon: <MessageCircle className="h-4 w-4" />, text: "Chat with creators", locked: false },
          { icon: <Megaphone className="h-4 w-4" />, text: "1 campaign/month", locked: false },
          { icon: <Filter className="h-4 w-4" />, text: "Advanced filters + CRM", locked: false },
        ];
      case 'premium':
        return [
          { icon: <MessageCircle className="h-4 w-4" />, text: "Chat with creators", locked: false },
          { icon: <Megaphone className="h-4 w-4" />, text: "Unlimited campaigns", locked: false },
          { icon: <Database className="h-4 w-4" />, text: "50 GB Content Library", locked: false },
        ];
    }
  };

  // Only show paid plans for upgrade (excluding 'none')
  const paidPlans: PlanType[] = ['basic', 'pro', 'premium'];

  if (loading) {
    return <div className="text-center py-8">Loading subscription details...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Verification Section - only show for pro/premium */}
      {(currentPlan === 'pro' || currentPlan === 'premium') && (
        <BrandVerificationSection planType={currentPlan} />
      )}

      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
            <CardDescription>
              You are currently on the {SUBSCRIPTION_PLANS[currentPlan].name} {currentPlan === 'none' ? '(Free)' : 'plan'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                  {subscription.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Marketplace Fee</p>
                <p className="text-2xl font-bold">
                  {(SUBSCRIPTION_PLANS[currentPlan].marketplaceFee * 100).toFixed(0)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Renewal Date</p>
                <p className="font-medium">
                  {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {subscription.cancel_at_period_end && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">
                  Your subscription will be canceled on {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              </div>
            )}

            {!subscription.cancel_at_period_end && currentPlan !== 'none' && (
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={actionLoading}
              >
                Cancel Subscription
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* No subscription state */}
      {!subscription && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>No Active Subscription</CardTitle>
            <CardDescription>
              You're currently browsing with a 20% marketplace fee. Subscribe to unlock more features!
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {paidPlans.map((planKey) => {
          const plan = SUBSCRIPTION_PLANS[planKey];
          const isCurrent = currentPlan === planKey;
          const isUpgrade = (
            currentPlan === 'none' || 
            (currentPlan === 'basic' && (planKey === 'pro' || planKey === 'premium')) ||
            (currentPlan === 'pro' && planKey === 'premium')
          );
          const highlights = getPlanHighlights(planKey);

          return (
            <Card 
              key={planKey}
              className={isCurrent ? 'border-primary' : ''}
            >
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  {getPlanIcon(planKey)}
                  <CardTitle>{plan.name}</CardTitle>
                  {isCurrent && <Badge>Current</Badge>}
                  {planKey === 'pro' && !isCurrent && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary">Popular</Badge>
                  )}
                </div>
                <CardDescription>
                  <span className="text-3xl font-bold">
                    {formatPrice(plan.price)}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <span className="text-2xl font-bold">{(plan.marketplaceFee * 100).toFixed(0)}%</span>
                  <span className="text-sm text-muted-foreground ml-1">marketplace fee</span>
                </div>

                <div className="space-y-2">
                  {highlights.map((highlight, idx) => (
                    <div key={idx} className={`flex items-center gap-2 ${highlight.locked ? 'text-muted-foreground' : ''}`}>
                      {highlight.icon}
                      <span className="text-sm">{highlight.text}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-2 border-t">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                  {plan.lockedFeatures.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-muted-foreground">
                      <Lock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {isUpgrade && (
                  <Button 
                    className="w-full" 
                    onClick={() => handleUpgrade(planKey)}
                    disabled={actionLoading}
                  >
                    {currentPlan === 'none' ? `Get ${plan.name}` : `Upgrade to ${plan.name}`}
                  </Button>
                )}
                
                {isCurrent && (
                  <Button className="w-full" disabled variant="outline">
                    Current Plan
                  </Button>
                )}

                {!isCurrent && !isUpgrade && (
                  <Button className="w-full" disabled variant="ghost">
                    Not Available
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default BrandSubscriptionTab;