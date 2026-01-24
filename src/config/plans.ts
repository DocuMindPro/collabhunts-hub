// Centralized subscription plan configuration
// Single source of truth for all plan-related data

export type PlanType = 'none' | 'basic' | 'pro' | 'premium';

export interface PlanFeatures {
  canContactCreators: boolean;
  canBookCreators: boolean;
  canMessageAfterDelivery: boolean;
  hasAdvancedFilters: boolean;
  hasCRM: boolean;
  hasContentLibrary: boolean;
  canRequestVerifiedBadge: boolean;
  canViewCreatorPricing: boolean;
}

export interface PlanLimits {
  campaignLimit: number;
  storageLimit: number; // in bytes
  massMessageLimit: number;
}

export interface Plan {
  name: string;
  price: number; // in cents
  priceId: string;
  features: PlanFeatures;
  limits: PlanLimits;
  featureList: string[];
  lockedFeatures: string[];
}

export const PLANS: Record<PlanType, Plan> = {
  none: {
    name: 'No Package',
    price: 0,
    priceId: 'price_none_free',
    features: {
      canContactCreators: false,
      canBookCreators: false,
      canMessageAfterDelivery: false,
      hasAdvancedFilters: false,
      hasCRM: false,
      hasContentLibrary: false,
      canRequestVerifiedBadge: false,
      canViewCreatorPricing: false,
    },
    limits: {
      campaignLimit: 0,
      storageLimit: 0,
      massMessageLimit: 0,
    },
    featureList: [
      'Search influencers on the marketplace',
    ],
    lockedFeatures: [
      'Chat & negotiate with creators',
      'View all creator package pricing',
      'Post campaigns',
      'Advanced filters for age, language, and more',
      'Save creators & add notes (CRM)',
      'Mass message creators',
      'Content Library',
      'Verified Business Badge',
    ],
  },
  basic: {
    name: 'Basic',
    price: 3900,
    priceId: 'price_basic_monthly',
    features: {
      canContactCreators: true,
      canBookCreators: true,
      canMessageAfterDelivery: true,
      hasAdvancedFilters: false,
      hasCRM: false,
      hasContentLibrary: true,
      canRequestVerifiedBadge: false,
      canViewCreatorPricing: true,
    },
    limits: {
      campaignLimit: 0,
      storageLimit: 10 * 1024 * 1024 * 1024, // 10 GB
      massMessageLimit: 0,
    },
    featureList: [
      'Search influencers on the marketplace',
      'Chat & negotiate with creators',
      'View all creator package pricing',
      'Content Library with 10 GB storage',
    ],
    lockedFeatures: [
      'Post campaigns',
      'Advanced filters for age, language, and more',
      'Save creators & add notes (CRM)',
      'Mass message creators',
      'Verified Business Badge',
    ],
  },
  pro: {
    name: 'Pro',
    price: 9900,
    priceId: 'price_pro_monthly',
    features: {
      canContactCreators: true,
      canBookCreators: true,
      canMessageAfterDelivery: true,
      hasAdvancedFilters: true,
      hasCRM: true,
      hasContentLibrary: true,
      canRequestVerifiedBadge: true,
      canViewCreatorPricing: true,
    },
    limits: {
      campaignLimit: 1,
      storageLimit: 10 * 1024 * 1024 * 1024, // 10 GB
      massMessageLimit: 50,
    },
    featureList: [
      'Everything in Basic',
      'Post 1 campaign per month',
      'Advanced filters for age, ethnicity, language and more',
      'Save creators & add private notes (CRM)',
      'Mass message up to 50 creators/day',
      'Verified Business Badge (upon approval)',
    ],
    lockedFeatures: [
      'Unlimited campaigns',
      '50 GB storage',
      '100 mass messages/day',
    ],
  },
  premium: {
    name: 'Premium',
    price: 29900,
    priceId: 'price_premium_monthly',
    features: {
      canContactCreators: true,
      canBookCreators: true,
      canMessageAfterDelivery: true,
      hasAdvancedFilters: true,
      hasCRM: true,
      hasContentLibrary: true,
      canRequestVerifiedBadge: true,
      canViewCreatorPricing: true,
    },
    limits: {
      campaignLimit: Infinity,
      storageLimit: 50 * 1024 * 1024 * 1024, // 50 GB
      massMessageLimit: 100,
    },
    featureList: [
      'Everything in Pro',
      'Post unlimited campaigns',
      'Content Library with 50 GB storage',
      'Mass message up to 100 creators/day',
      'Priority customer support (Coming Soon)',
      'Dedicated account manager (Coming Soon)',
    ],
    lockedFeatures: [],
  },
};

// Storage add-on configuration
export const STORAGE_ADDON = {
  amountBytes: 100 * 1024 * 1024 * 1024, // 100 GB
  priceCents: 1000, // $10
  name: '100 GB Storage Add-on',
} as const;

// Helper functions
export const getPlan = (planType: PlanType): Plan => PLANS[planType];

export const canContactCreators = (planType: PlanType): boolean => 
  PLANS[planType].features.canContactCreators;

export const getCampaignLimit = (planType: PlanType): number => 
  PLANS[planType].limits.campaignLimit;

export const hasAdvancedFilters = (planType: PlanType): boolean => 
  PLANS[planType].features.hasAdvancedFilters;

export const hasCRM = (planType: PlanType): boolean => 
  PLANS[planType].features.hasCRM;

export const hasContentLibrary = (planType: PlanType): boolean => 
  PLANS[planType].features.hasContentLibrary;

export const getStorageLimit = (planType: PlanType): number => 
  PLANS[planType].limits.storageLimit;

export const canRequestVerifiedBadge = (planType: PlanType): boolean => 
  PLANS[planType].features.canRequestVerifiedBadge;

export const canViewCreatorPricing = (planType: PlanType): boolean => 
  PLANS[planType].features.canViewCreatorPricing;

export const getMassMessageLimit = (planType: PlanType): number => 
  PLANS[planType].limits.massMessageLimit;

export const formatPrice = (cents: number): string => 
  `$${(cents / 100).toFixed(2)}`;

export const formatPriceShort = (cents: number): string => 
  `$${Math.round(cents / 100)}`;

// Plan tier ordering for comparison
export const PLAN_TIER_ORDER: Record<PlanType, number> = {
  none: 0,
  basic: 1,
  pro: 2,
  premium: 3,
};

export const isPlanHigherThan = (planA: PlanType, planB: PlanType): boolean => 
  PLAN_TIER_ORDER[planA] > PLAN_TIER_ORDER[planB];

export const isPlanAtLeast = (currentPlan: PlanType, requiredPlan: PlanType): boolean => 
  PLAN_TIER_ORDER[currentPlan] >= PLAN_TIER_ORDER[requiredPlan];
