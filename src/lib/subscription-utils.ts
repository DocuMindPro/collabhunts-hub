import { supabase } from "@/integrations/supabase/client";
import { PlanType, SUBSCRIPTION_PLANS } from "./stripe-mock";

export interface BrandSubscription {
  id: string;
  plan_type: PlanType;
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export const getBrandSubscription = async (userId: string): Promise<BrandSubscription | null> => {
  try {
    // Get brand profile
    const { data: brandProfile } = await supabase
      .from('brand_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!brandProfile) return null;

    // Get subscription
    const { data: sub } = await supabase
      .from('brand_subscriptions')
      .select('*')
      .eq('brand_profile_id', brandProfile.id)
      .eq('status', 'active')
      .maybeSingle();

    return sub as BrandSubscription | null;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
};

export const getCurrentPlanType = async (userId: string): Promise<PlanType> => {
  const subscription = await getBrandSubscription(userId);
  return (subscription?.plan_type as PlanType) || 'basic';
};

export const canUserContactCreators = async (userId: string): Promise<boolean> => {
  const planType = await getCurrentPlanType(userId);
  return SUBSCRIPTION_PLANS[planType].canContactCreators;
};

export const canUserPostCampaigns = async (userId: string): Promise<{ allowed: boolean; limit: number; used: number }> => {
  const planType = await getCurrentPlanType(userId);
  const limit = SUBSCRIPTION_PLANS[planType].campaignLimit;
  
  if (limit === 0) {
    return { allowed: false, limit: 0, used: 0 };
  }

  // Get brand profile
  const { data: brandProfile } = await supabase
    .from('brand_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (!brandProfile) {
    return { allowed: false, limit: 0, used: 0 };
  }

  // Count campaigns created this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from('campaigns')
    .select('*', { count: 'exact', head: true })
    .eq('brand_profile_id', brandProfile.id)
    .gte('created_at', startOfMonth.toISOString());

  const used = count || 0;
  
  if (limit === Infinity) {
    return { allowed: true, limit: Infinity, used };
  }

  return { allowed: used < limit, limit, used };
};

export const userHasAdvancedFilters = async (userId: string): Promise<boolean> => {
  const planType = await getCurrentPlanType(userId);
  return SUBSCRIPTION_PLANS[planType].hasAdvancedFilters;
};
