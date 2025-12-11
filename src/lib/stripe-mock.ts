// Mock Stripe integration for development
// This simulates Stripe functionality until real integration is set up

export const SUBSCRIPTION_PLANS = {
  none: {
    name: 'No Package',
    price: 0,
    priceId: 'price_none_free',
    marketplaceFee: 0.20, // 20%
    campaignLimit: 0,
    canContactCreators: false,
    canBookCreators: true, // Can book but need to pay first
    canMessageAfterDelivery: false, // Cannot message after booking is completed
    hasAdvancedFilters: false,
    hasCRM: false,
    hasContentLibrary: false,
    storageLimit: 0, // 0 bytes - no access
    canRequestVerifiedBadge: false,
    massMessageLimit: 0,
    features: [
      'Search influencers on the marketplace',
      'Book creators with 20% marketplace fee',
    ],
    lockedFeatures: [
      'Chat & negotiate with creators',
      'Post campaigns',
      'Advanced filters for age, language, and more',
      'Save creators & add notes (CRM)',
      'Mass message creators',
      'Content Library',
      'Verified Business Badge',
    ]
  },
  basic: {
    name: 'Basic',
    price: 3900, // $39 in cents
    priceId: 'price_basic_monthly',
    marketplaceFee: 0.15, // 15%
    campaignLimit: 0,
    canContactCreators: true,
    canBookCreators: true,
    canMessageAfterDelivery: true,
    hasAdvancedFilters: false,
    hasCRM: false,
    hasContentLibrary: true,
    storageLimit: 10 * 1024 * 1024 * 1024, // 10 GB
    canRequestVerifiedBadge: false,
    massMessageLimit: 0,
    features: [
      'Search influencers on the marketplace',
      'Chat & negotiate with creators',
      'Content Library with 10 GB storage',
      '15% marketplace fee on bookings',
    ],
    lockedFeatures: [
      'Post campaigns',
      'Advanced filters for age, language, and more',
      'Save creators & add notes (CRM)',
      'Mass message creators',
      'Verified Business Badge',
    ]
  },
  pro: {
    name: 'Pro',
    price: 9900, // $99 in cents
    priceId: 'price_pro_monthly',
    marketplaceFee: 0.15, // 15%
    campaignLimit: 1,
    canContactCreators: true,
    canBookCreators: true,
    canMessageAfterDelivery: true,
    hasAdvancedFilters: true,
    hasCRM: true,
    hasContentLibrary: true,
    storageLimit: 10 * 1024 * 1024 * 1024, // 10 GB
    canRequestVerifiedBadge: true,
    massMessageLimit: 50, // per day
    features: [
      'Everything in Basic',
      'Post 1 campaign per month',
      'Advanced filters for age, ethnicity, language and more',
      'Save creators & add private notes (CRM)',
      'Mass message up to 50 creators/day',
      'Verified Business Badge (upon approval)',
      '15% marketplace fee on bookings',
    ],
    lockedFeatures: [
      'Unlimited campaigns',
      '50 GB storage',
      '100 mass messages/day',
    ]
  },
  premium: {
    name: 'Premium',
    price: 29900, // $299 in cents
    priceId: 'price_premium_monthly',
    marketplaceFee: 0.15, // 15%
    campaignLimit: Infinity,
    canContactCreators: true,
    canBookCreators: true,
    canMessageAfterDelivery: true,
    hasAdvancedFilters: true,
    hasCRM: true,
    hasContentLibrary: true,
    storageLimit: 50 * 1024 * 1024 * 1024, // 50 GB
    canRequestVerifiedBadge: true,
    massMessageLimit: 100, // per day
    features: [
      'Everything in Pro',
      'Post unlimited campaigns',
      'Content Library with 50 GB storage',
      'Mass message up to 100 creators/day',
      '15% marketplace fee on bookings',
      'Priority customer support (Coming Soon)',
      'Dedicated account manager (Coming Soon)',
    ],
    lockedFeatures: []
  }
} as const;

// Storage add-on configuration
export const STORAGE_ADDON = {
  amountBytes: 100 * 1024 * 1024 * 1024, // 100 GB
  priceCents: 1000, // $10
  name: '100 GB Storage Add-on',
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

export const hasContentLibrary = (planType: PlanType): boolean => {
  return SUBSCRIPTION_PLANS[planType].hasContentLibrary;
};

export const getStorageLimit = (planType: PlanType): number => {
  return SUBSCRIPTION_PLANS[planType].storageLimit;
};

export const canRequestVerifiedBadge = (planType: PlanType): boolean => {
  return SUBSCRIPTION_PLANS[planType].canRequestVerifiedBadge;
};

export const calculatePlatformFee = (totalPriceCents: number, planType: PlanType): number => {
  const feePercentage = getMarketplaceFee(planType);
  return Math.round(totalPriceCents * feePercentage);
};

export const formatPrice = (cents: number): string => {
  return `$${(cents / 100).toFixed(2)}`;
};

// Mock card details interface
export interface MockCardDetails {
  cardNumber: string;
  expiry: string;
  cvv: string;
  cardholderName: string;
}

// Test card numbers for different scenarios
const TEST_CARDS = {
  SUCCESS: "4242424242424242",
  DECLINE: "4000000000000002",
  INSUFFICIENT_FUNDS: "4000000000009995",
};

// Mock payment confirmation - simulates Stripe payment processing
export const confirmMockPayment = async (
  amountCents: number,
  cardDetails: MockCardDetails
): Promise<{ success: boolean; paymentId: string; error?: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

  const cleanCardNumber = cardDetails.cardNumber.replace(/\s/g, "");

  if (cleanCardNumber === TEST_CARDS.DECLINE) {
    return { success: false, paymentId: "", error: "Your card was declined." };
  }

  if (cleanCardNumber === TEST_CARDS.INSUFFICIENT_FUNDS) {
    return { success: false, paymentId: "", error: "Insufficient funds." };
  }

  if (cleanCardNumber.length !== 16) {
    return { success: false, paymentId: "", error: "Invalid card number." };
  }

  return {
    success: true,
    paymentId: `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
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