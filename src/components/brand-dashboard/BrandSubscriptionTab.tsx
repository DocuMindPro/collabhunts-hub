import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, Crown, Zap, Shield, Lock, X, ExternalLink } from "lucide-react";
import { SUBSCRIPTION_PLANS, PlanType, formatPrice, cancelSubscription } from "@/lib/stripe-mock";
import { checkAndHandleExpiredSubscriptions } from "@/lib/subscription-utils";
import BrandVerificationSection from "./BrandVerificationSection";
import MockPaymentDialog from "@/components/MockPaymentDialog";
import { Link } from "react-router-dom";

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
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPlanType, setSelectedPlanType] = useState<PlanType | null>(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: brandProfile } = await supabase
        .from('brand_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!brandProfile) return;
      setBrandProfileId(brandProfile.id);

      await checkAndHandleExpiredSubscriptions(brandProfile.id);

      const { data: subs } = await supabase
        .from('brand_subscriptions')
        .select('*')
        .eq('brand_profile_id', brandProfile.id)
        .eq('status', 'active')
        .order('plan_type', { ascending: false });

      const sub = subs && subs.length > 0 ? subs[0] : null;
      setSubscription(sub as Subscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (planType: PlanType) => {
    setSelectedPlanType(planType);
    setShowPaymentDialog(true);
  };

  const handlePaymentSuccess = async (paymentId: string) => {
    if (!brandProfileId || !selectedPlanType) return;

    setActionLoading(true);
    try {
      const { error: cancelError } = await supabase
        .from('brand_subscriptions')
        .update({ status: 'canceled' })
        .eq('brand_profile_id', brandProfileId)
        .eq('status', 'active');
      
      if (cancelError) {
        console.error('Error canceling existing subscriptions:', cancelError);
      }

      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      const { error } = await supabase
        .from('brand_subscriptions')
        .insert({
          brand_profile_id: brandProfileId,
          plan_type: selectedPlanType,
          status: 'active',
          stripe_subscription_id: `sub_mock_${Date.now()}`,
          stripe_customer_id: `cus_mock_${Date.now()}`,
          current_period_end: periodEnd.toISOString(),
        });

      if (error) throw error;

      toast.success(`Successfully subscribed to ${SUBSCRIPTION_PLANS[selectedPlanType].name}!`);
      setShowPaymentDialog(false);
      setSelectedPlanType(null);
      fetchSubscription();
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
      case 'premium': return <Crown className="h-4 w-4" />;
      case 'pro': return <Zap className="h-4 w-4" />;
      case 'basic': return <Shield className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Compact feature list per plan
  const getCompactFeatures = (plan: PlanType) => {
    switch (plan) {
      case 'basic':
        return [
          { text: "Chat with creators", included: true },
          { text: "10 GB content storage", included: true },
          { text: "15% marketplace fee", included: true },
          { text: "Campaigns", included: false },
          { text: "CRM & filters", included: false },
        ];
      case 'pro':
        return [
          { text: "Everything in Basic", included: true },
          { text: "1 campaign/month", included: true },
          { text: "CRM + advanced filters", included: true },
          { text: "Verified badge eligible", included: true },
          { text: "50 mass messages/day", included: true },
        ];
      case 'premium':
        return [
          { text: "Everything in Pro", included: true },
          { text: "Unlimited campaigns", included: true },
          { text: "50 GB content storage", included: true },
          { text: "100 mass messages/day", included: true },
          { text: "Priority support", included: true },
        ];
      default:
        return [];
    }
  };

  const paidPlans: PlanType[] = ['basic', 'pro', 'premium'];

  if (loading) {
    return <div className="text-center py-8 text-sm text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-4 max-w-5xl">
      {/* Verification Section - compact collapsible */}
      {(currentPlan === 'pro' || currentPlan === 'premium') && (
        <BrandVerificationSection planType={currentPlan} />
      )}

      {/* Current Subscription Banner - single row */}
      {subscription && (
        <div className={`flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border ${
          subscription.cancel_at_period_end 
            ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900' 
            : 'bg-muted/30'
        }`}>
          <div className="flex items-center gap-2">
            {getPlanIcon(currentPlan)}
            <span className="font-medium text-sm">
              {SUBSCRIPTION_PLANS[currentPlan].name}
            </span>
            <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'} className="text-xs">
              {subscription.status}
            </Badge>
            {subscription.cancel_at_period_end && (
              <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                Canceling
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground text-xs">
              {subscription.cancel_at_period_end ? 'Ends' : 'Renews'}{' '}
              {new Date(subscription.current_period_end).toLocaleDateString()}
            </span>
            {!subscription.cancel_at_period_end && currentPlan !== 'none' && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleCancel}
                disabled={actionLoading}
                className="h-7 text-xs text-muted-foreground hover:text-destructive"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}

      {/* No subscription state */}
      {!subscription && (
        <div className="flex items-center justify-between gap-4 p-3 bg-muted/30 border border-dashed rounded-lg">
          <span className="text-sm text-muted-foreground">No active subscription</span>
          <span className="text-xs text-muted-foreground">Choose a plan below</span>
        </div>
      )}

      {/* Compact Plan Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {paidPlans.map((planKey) => {
          const plan = SUBSCRIPTION_PLANS[planKey];
          const isCurrent = currentPlan === planKey;
          const isUpgrade = (
            currentPlan === 'none' || 
            (currentPlan === 'basic' && (planKey === 'pro' || planKey === 'premium')) ||
            (currentPlan === 'pro' && planKey === 'premium')
          );
          const features = getCompactFeatures(planKey);

          return (
            <Card 
              key={planKey}
              className={`relative ${isCurrent ? 'border-primary ring-1 ring-primary/20' : ''}`}
            >
              {planKey === 'pro' && !isCurrent && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground text-xs px-2">
                    Popular
                  </Badge>
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <Badge variant="outline" className="bg-background text-xs px-2">
                    Current
                  </Badge>
                </div>
              )}
              
              <CardContent className="p-4 pt-5">
                {/* Header */}
                <div className="flex items-center gap-2 mb-1">
                  {getPlanIcon(planKey)}
                  <span className="font-semibold">{plan.name}</span>
                </div>
                
                {/* Price */}
                <div className="mb-3">
                  <span className="text-2xl font-bold">{formatPrice(plan.price)}</span>
                  <span className="text-muted-foreground text-sm">/mo</span>
                </div>

                {/* Compact Features */}
                <div className="space-y-1.5 mb-4">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      {feature.included ? (
                        <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                      )}
                      <span className={feature.included ? '' : 'text-muted-foreground/60'}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                {isUpgrade && (
                  <Button 
                    className="w-full h-8 text-sm" 
                    onClick={() => handleUpgrade(planKey)}
                    disabled={actionLoading}
                  >
                    {currentPlan === 'none' ? 'Get Started' : 'Upgrade'}
                  </Button>
                )}
                
                {isCurrent && (
                  <Button className="w-full h-8 text-sm" disabled variant="outline">
                    Current Plan
                  </Button>
                )}

                {!isCurrent && !isUpgrade && (
                  <Button className="w-full h-8 text-sm" disabled variant="ghost">
                    —
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Link to full pricing page */}
      <div className="text-center pt-2">
        <Link 
          to="/pricing" 
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Compare all features
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Payment Dialog */}
      {selectedPlanType && (
        <MockPaymentDialog
          isOpen={showPaymentDialog}
          onClose={() => {
            setShowPaymentDialog(false);
            setSelectedPlanType(null);
          }}
          onSuccess={handlePaymentSuccess}
          orderSummary={{
            type: 'subscription',
            planName: SUBSCRIPTION_PLANS[selectedPlanType].name,
            priceCents: SUBSCRIPTION_PLANS[selectedPlanType].price,
          }}
        />
      )}
    </div>
  );
};

export default BrandSubscriptionTab;