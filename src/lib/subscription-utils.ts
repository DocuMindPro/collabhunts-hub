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
    
    // Mark expired subscriptions as canceled (valid status per DB constraint)
    await supabase
      .from('brand_subscriptions')
      .update({ status: 'canceled' })
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
    // Also filter out rows whose period has already ended (defensive against stale data)
    const now = new Date().toISOString();
    const { data: subs } = await supabase
      .from('brand_subscriptions')
      .select('*')
      .eq('brand_profile_id', brandProfile.id)
      .eq('status', 'active')
      .gte('current_period_end', now)
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
  const planType = subscription?.plan_type;
  if (planType === 'basic' || planType === 'pro') return planType;
  return 'free';
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

// Get the messaging limit for a given plan
export const getMessageLimit = (planType: PlanType | string): number => {
  switch (planType) {
    case 'pro': return Infinity;
    case 'basic': return 10;
    default: return 1; // free / none
  }
};

// Get the AI draft agreement limit for a given plan
export const getAiDraftLimit = (planType: PlanType | string): number => {
  switch (planType) {
    case 'pro': return 100;
    case 'basic': return 30;
    default: return 5; // free / none
  }
};

// Check if a brand can use AI to draft an agreement
export const canBrandUseAiDraft = async (
  brandProfileId: string
): Promise<{ canUse: boolean; used: number; limit: number; reason?: string }> => {
  try {
    const { data: brand } = await supabase
      .from('brand_profiles')
      .select('id, user_id, ai_drafts_used_this_month, ai_drafts_reset_at')
      .eq('id', brandProfileId)
      .single();

    if (!brand) return { canUse: false, used: 0, limit: 0, reason: 'Brand profile not found' };

    const planType = await getCurrentPlanType(brand.user_id);
    const limit = getAiDraftLimit(planType);

    // Auto-reset if we're in a new month
    const resetAt = new Date(brand.ai_drafts_reset_at);
    const now = new Date();
    let currentCount = brand.ai_drafts_used_this_month;

    if (now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear()) {
      await supabase
        .from('brand_profiles')
        .update({ ai_drafts_used_this_month: 0, ai_drafts_reset_at: now.toISOString() })
        .eq('id', brandProfileId);
      currentCount = 0;
    }

    if (currentCount >= limit) {
      const planName = planType === 'basic' ? 'Basic' : planType === 'pro' ? 'Pro' : 'Free';
      return {
        canUse: false,
        used: currentCount,
        limit,
        reason: `You've reached your ${planName} plan limit of ${limit} AI-drafted agreements per month. Upgrade your plan for more.`
      };
    }

    return { canUse: true, used: currentCount, limit };
  } catch (error) {
    console.error('Error checking AI draft limit:', error);
    return { canUse: true, used: 0, limit: 999 }; // fail open
  }
};

// Increment the AI draft counter after a successful AI improvement
// Uses atomic server-side increment to avoid race conditions
export const incrementAiDraftCounter = async (brandProfileId: string): Promise<void> => {
  await supabase.rpc('increment_ai_draft_counter', { p_brand_profile_id: brandProfileId });
};

// Check if a brand can message a new creator (enforces monthly limit)
export const canBrandMessageCreator = async (
  brandProfileId: string,
  creatorProfileId: string
): Promise<{ canMessage: boolean; reason?: string }> => {
  try {
    // Check if conversation already exists — always allowed
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('brand_profile_id', brandProfileId)
      .eq('creator_profile_id', creatorProfileId)
      .maybeSingle();

    if (existing) return { canMessage: true };

    // Check if connected through an accepted opportunity application — exempt from limit
    const { data: brandOpps } = await supabase
      .from('brand_opportunities')
      .select('id')
      .eq('brand_profile_id', brandProfileId);

    if (brandOpps && brandOpps.length > 0) {
      const { data: acceptedApp } = await supabase
        .from('opportunity_applications')
        .select('id')
        .eq('creator_profile_id', creatorProfileId)
        .eq('status', 'accepted')
        .in('opportunity_id', brandOpps.map(o => o.id))
        .limit(1)
        .maybeSingle();

      if (acceptedApp) return { canMessage: true };
    }

    // Get brand profile with messaging counters
    const { data: brand } = await supabase
      .from('brand_profiles')
      .select('id, user_id, creators_messaged_this_month, creators_messaged_reset_at')
      .eq('id', brandProfileId)
      .single();

    if (!brand) return { canMessage: false, reason: 'Brand profile not found' };

    // Get current plan
    const planType = await getCurrentPlanType(brand.user_id);
    const limit = getMessageLimit(planType);
    if (limit === Infinity) return { canMessage: true };

    // Auto-reset if we're in a new month
    const resetAt = new Date(brand.creators_messaged_reset_at);
    const now = new Date();
    let currentCount = brand.creators_messaged_this_month;

    if (now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear()) {
      // Reset the counter
      await supabase
        .from('brand_profiles')
        .update({ creators_messaged_this_month: 0, creators_messaged_reset_at: now.toISOString() })
        .eq('id', brandProfileId);
      currentCount = 0;
    }

    if (currentCount >= limit) {
      const planName = planType === 'basic' ? 'Basic' : 'Free';
      return {
        canMessage: false,
        reason: `You've reached your ${planName} plan limit of ${limit} new creator${limit === 1 ? '' : 's'} per month. Upgrade your plan to message more creators.`
      };
    }

    return { canMessage: true };
  } catch (error) {
    console.error('Error checking message limit:', error);
    return { canMessage: true }; // fail open
  }
};

// Increment the messaging counter after a new conversation is created
// Uses atomic server-side increment to avoid race conditions
export const incrementMessagingCounter = async (brandProfileId: string): Promise<void> => {
  await supabase.rpc('increment_messaging_counter', { p_brand_profile_id: brandProfileId });
};