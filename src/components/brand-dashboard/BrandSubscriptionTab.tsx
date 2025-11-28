import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, Crown, Zap, Shield } from "lucide-react";
import { SUBSCRIPTION_PLANS, PlanType, formatPrice, createCheckoutSession, cancelSubscription } from "@/lib/stripe-mock";

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

      // Get subscription
      const { data: sub } = await supabase
        .from('brand_subscriptions')
        .select('*')
        .eq('brand_profile_id', brandProfile.id)
        .eq('status', 'active')
        .maybeSingle();

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
        // Mock: Create subscription in database
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

        toast.success(`Successfully subscribed to ${SUBSCRIPTION_PLANS[planType].name} plan!`);
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

  const currentPlan = subscription?.plan_type || 'basic';

  const getPlanIcon = (plan: PlanType) => {
    switch (plan) {
      case 'pro': return <Zap className="h-5 w-5" />;
      case 'premium': return <Crown className="h-5 w-5" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading subscription details...</div>;
  }

  return (
    <div className="space-y-6">
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
            <CardDescription>
              You are currently on the {SUBSCRIPTION_PLANS[currentPlan].name} plan
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

            {!subscription.cancel_at_period_end && currentPlan !== 'basic' && (
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

      <div className="grid md:grid-cols-3 gap-6">
        {(Object.keys(SUBSCRIPTION_PLANS) as PlanType[]).map((planKey) => {
          const plan = SUBSCRIPTION_PLANS[planKey];
          const isCurrent = currentPlan === planKey;
          const isUpgrade = planKey !== 'basic' && (
            currentPlan === 'basic' || 
            (currentPlan === 'pro' && planKey === 'premium')
          );

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
                </div>
                <CardDescription>
                  <span className="text-3xl font-bold">
                    {plan.price === 0 ? 'Free' : formatPrice(plan.price)}
                  </span>
                  {plan.price > 0 && <span className="text-muted-foreground">/month</span>}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
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
                    Upgrade to {plan.name}
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
