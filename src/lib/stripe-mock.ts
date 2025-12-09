// Mock Stripe integration for development
// This simulates Stripe functionality until real integration is set up

export const SUBSCRIPTION_PLANS = {
  basic: {
    name: 'Basic',
    price: 0,
    priceId: 'price_basic_free',
    marketplaceFee: 0.20, // 20%
    campaignLimit: 0,
    canContactCreators: false,
    hasAdvancedFilters: false,
    hasCRM: false,
    features: [
      'Search influencers on the marketplace',
      '20% marketplace fee on bookings',
    ],
    lockedFeatures: [
      'Chat & negotiate with creators',
      'Post campaigns',
      'Advanced filters for age, language, and more',
      'Save creators & add notes (CRM)',
    ]
  },
  pro: {
    name: 'Pro',
    price: 9900, // $99 in cents
    priceId: 'price_pro_monthly',
    marketplaceFee: 0.15, // 15%
    campaignLimit: 1,
    canContactCreators: true,
    hasAdvancedFilters: true,
    hasCRM: true,
    features: [
      'Everything in Basic',
      'Chat & negotiate with creators before hiring',
      'Post 1 campaign per month',
      'Advanced filters for age, ethnicity, language and more',
      'Save creators & add private notes (CRM)',
      '15% marketplace fee on bookings',
    ],
    lockedFeatures: []
  },
  premium: {
    name: 'Premium',
    price: 29900, // $299 in cents
    priceId: 'price_premium_monthly',
    marketplaceFee: 0.15, // 15%
    campaignLimit: Infinity,
    canContactCreators: true,
    hasAdvancedFilters: true,
    hasCRM: true,
    features: [
      'Everything in Pro',
      'Post unlimited campaigns',
      '15% marketplace fee on bookings',
      'Priority customer support (Coming Soon)',
      'Dedicated account manager (Coming Soon)',
    ],
    lockedFeatures: []
  }
} as const;

export type PlanType = keyof typeof SUBSCRIPTION_PLANS;

export const getMarketplaceFee = (planType: PlanType): number => {
  return SUBSCRIPTION_PLANS[planType].marketplaceFee;
};

export const canContactCreators = (planType: PlanType): boolean => {
  return SUBSCRIPTION_PLANS[planType].canContactCreators;
};

export const getCampaignLimit = (planType: PlanType): number => {
  return SUBSCRIPTION_PLANS[planType].campaignLimit;
};

export const hasAdvancedFilters = (planType: PlanType): boolean => {
  return SUBSCRIPTION_PLANS[planType].hasAdvancedFilters;
};

export const hasCRM = (planType: PlanType): boolean => {
  return SUBSCRIPTION_PLANS[planType].hasCRM;
};

export const calculatePlatformFee = (totalPriceCents: number, planType: PlanType): number => {
  const feePercentage = getMarketplaceFee(planType);
  return Math.round(totalPriceCents * feePercentage);
};

export const formatPrice = (cents: number): string => {
  return `$${(cents / 100).toFixed(2)}`;
};

// Mock Stripe checkout session creation
export const createCheckoutSession = async (
  planType: PlanType,
  brandProfileId: string
): Promise<{ success: boolean; message: string }> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock success response
  return {
    success: true,
    message: `Mock checkout session created for ${planType} plan`
  };
};

// Mock subscription cancellation
export const cancelSubscription = async (
  subscriptionId: string
): Promise<{ success: boolean; message: string }> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    success: true,
    message: 'Subscription will be canceled at period end'
  };
};

// Mock Stripe Connect account creation
export const createConnectAccount = async (
  creatorProfileId: string
): Promise<{ success: boolean; accountId: string; message: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  const mockAccountId = `acct_mock_${creatorProfileId.substring(0, 8)}`;
  
  return {
    success: true,
    accountId: mockAccountId,
    message: 'Mock Stripe Connect account created'
  };
};

// Mock Stripe Connect account link creation (for onboarding)
export const createAccountLink = async (
  accountId: string,
  returnUrl: string,
  refreshUrl: string
): Promise<{ success: boolean; url: string; message: string }> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // In real implementation, this would return a Stripe-hosted onboarding URL
  return {
    success: true,
    url: `https://connect.stripe.com/setup/mock/${accountId}`,
    message: 'Mock onboarding link created'
  };
};

// Mock payout creation
export const createPayout = async (
  accountId: string,
  amountCents: number,
  bookingIds: string[]
): Promise<{ success: boolean; payoutId: string; message: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const mockPayoutId = `po_mock_${Date.now()}`;
  
  return {
    success: true,
    payoutId: mockPayoutId,
    message: `Mock payout of ${formatPrice(amountCents)} created`
  };
};

// Calculate creator earnings from a booking (total - platform fee)
export const calculateCreatorEarnings = (
  totalPriceCents: number,
  platformFeeCents: number
): number => {
  return totalPriceCents - platformFeeCents;
};
