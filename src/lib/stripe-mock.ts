// Mock Stripe integration for development
// This simulates Stripe functionality until real integration is set up

export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: 'price_free',
    features: [
      'Browse creators on the marketplace',
      'Direct messaging',
      'AI-drafted agreements',
      'Pay $15 per opportunity post',
    ],
    lockedFeatures: [
      'Verified Business Badge',
      'Free opportunity posts',
      'Dedicated CSM',
    ]
  },
  basic: {
    name: 'Basic',
    price: 9900,
    priceId: 'price_basic_annual',
    features: [
      'Verified Business Badge for 1 year',
      '3 free opportunity posts per month',
      'Priority visibility with creators',
      'Browse creators on the marketplace',
      'Direct messaging',
      'AI-drafted agreements',
    ],
    lockedFeatures: [
      'Dedicated CSM',
    ]
  },
  pro: {
    name: 'Pro',
    price: 0, // Custom pricing
    priceId: 'price_pro_custom',
    features: [
      'Verified Business Badge',
      'Unlimited opportunity posts',
      'Dedicated Customer Success Manager',
      'Priority visibility with creators',
      'Browse creators on the marketplace',
      'Direct messaging',
      'AI-drafted agreements',
    ],
    lockedFeatures: []
  }
} as const;

export type PlanType = keyof typeof SUBSCRIPTION_PLANS;

// Legacy helpers - kept for backward compatibility, all return permissive defaults
// since the old tiered subscription system has been replaced with a single $99/year bundle
export const canViewCreatorPricing = (_planType: PlanType): boolean => true;
export const canContactCreators = (_planType: PlanType): boolean => true;
export const getCampaignLimit = (_planType: PlanType): number => Infinity;
export const hasAdvancedFilters = (_planType: PlanType): boolean => true;
export const hasCRM = (_planType: PlanType): boolean => true;
export const hasContentLibrary = (_planType: PlanType): boolean => true;
export const getStorageLimit = (_planType: PlanType): number => 10 * 1024 * 1024 * 1024;
export const canRequestVerifiedBadge = (_planType: PlanType): boolean => true;

// Storage add-on configuration
export const STORAGE_ADDON = {
  amountBytes: 100 * 1024 * 1024 * 1024, // 100 GB
  priceCents: 1000, // $10
  name: '100 GB Storage Add-on',
} as const;

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