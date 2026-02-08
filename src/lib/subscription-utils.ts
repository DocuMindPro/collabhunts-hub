import { supabase } from "@/integrations/supabase/client";
import { PlanType, SUBSCRIPTION_PLANS } from "./stripe-mock";

export type { PlanType } from "./stripe-mock";

export interface BrandSubscription {
  id: string;
  plan_type: PlanType;
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

// Check and handle expired subscriptions for a brand
export const checkAndHandleExpiredSubscriptions = async (brandProfileId: string): Promise<void> => {
  const now = new Date().toISOString();
  
  // Find expired paid subscriptions (non-none that have passed their end date)
  const { data: expiredSubs } = await supabase
    .from('brand_subscriptions')
    .select('*')
    .eq('brand_profile_id', brandProfileId)
    .eq('status', 'active')
    .neq('plan_type', 'none')
    .lt('current_period_end', now);
  
  if (expiredSubs && expiredSubs.length > 0) {
    console.log(`Found ${expiredSubs.length} expired subscription(s), downgrading to none...`);
    
    // Mark expired subscriptions as expired
    await supabase
      .from('brand_subscriptions')
      .update({ status: 'expired' })
      .in('id', expiredSubs.map(s => s.id));
    
    // Check if there's already a 'none' subscription
    const { data: existingNone } = await supabase
      .from('brand_subscriptions')
      .select('id')
      .eq('brand_profile_id', brandProfileId)
      .eq('plan_type', 'none')
      .eq('status', 'active')
      .maybeSingle();
    
    // Only create new 'none' subscription if none exists
    if (!existingNone) {
      const nonePeriodEnd = new Date();
      nonePeriodEnd.setFullYear(nonePeriodEnd.getFullYear() + 1);
      
      await supabase
        .from('brand_subscriptions')
        .insert({
          brand_profile_id: brandProfileId,
          plan_type: 'none',
          status: 'active',
          current_period_end: nonePeriodEnd.toISOString()
        });
    }
  }
};

// Cancel all active subscriptions for a brand before upgrade
export const cancelExistingSubscriptions = async (brandProfileId: string): Promise<void> => {
  await supabase
    .from('brand_subscriptions')
    .update({ status: 'canceled' })
    .eq('brand_profile_id', brandProfileId)
    .eq('status', 'active');
};

export const getBrandSubscription = async (userId: string): Promise<BrandSubscription | null> => {
  try {
    // Get brand profile
    const { data: brandProfile } = await supabase
      .from('brand_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!brandProfile) return null;

    // Check for expired subscriptions first
    await checkAndHandleExpiredSubscriptions(brandProfile.id);

    // Get active subscription (prefer non-none if multiple exist)
    // Order: premium > pro > basic > none
    const { data: subs } = await supabase
      .from('brand_subscriptions')
      .select('*')
      .eq('brand_profile_id', brandProfile.id)
      .eq('status', 'active')
      .order('plan_type', { ascending: false }); // premium > pro > basic > none

    if (!subs || subs.length === 0) return null;
    
    // Return the highest tier active subscription
    return subs[0] as BrandSubscription;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
};

export const getCurrentPlanType = async (userId: string): Promise<PlanType> => {
  const subscription = await getBrandSubscription(userId);
  return (subscription?.plan_type as PlanType) || 'none';
};

// Legacy helpers - kept for backward compatibility
// The old tiered plan system is replaced; all features are now open
export const canUserContactCreators = async (_userId: string): Promise<boolean> => true;

export const canUserPostCampaigns = async (_userId: string): Promise<{ allowed: boolean; limit: number; used: number }> => {
  return { allowed: true, limit: Infinity, used: 0 };
};

export const userHasAdvancedFilters = async (_userId: string): Promise<boolean> => true;

export const canUserUseCRM = async (_userId: string): Promise<boolean> => true;

export const canUserRequestVerifiedBadge = async (_userId: string): Promise<boolean> => true;

export const getUserSubscriptionTier = async (userId: string): Promise<string> => {
  const planType = await getCurrentPlanType(userId);
  return planType;
};

// Brands can always message creators (no tier restriction)
export const canBrandMessageCreator = async (
  _brandProfileId: string,
  _creatorProfileId: string
): Promise<{ canMessage: boolean; reason?: string }> => {
  return { canMessage: true };
};