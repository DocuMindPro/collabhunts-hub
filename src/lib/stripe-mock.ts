// Mock Stripe integration for development
// This simulates Stripe functionality until real integration is set up

export const SUBSCRIPTION_PLANS = {
  basic: {
    name: 'Basic',
    price: 0,
    priceId: 'price_basic_free',
    marketplaceFee: 0.15, // 15%
    features: [
      'Browse creator profiles',
      'Direct messaging',
      'Basic booking system',
      '15% marketplace fee'
    ]
  },
  pro: {
    name: 'Pro',
    price: 29900, // $299 in cents
    priceId: 'price_pro_monthly',
    marketplaceFee: 0.10, // 10%
    features: [
      'All Basic features',
      'Priority support',
      'Advanced analytics',
      '10% marketplace fee',
      'Campaign management'
    ]
  },
  premium: {
    name: 'Premium',
    price: 39900, // $399 in cents
    priceId: 'price_premium_monthly',
    marketplaceFee: 0.05, // 5%
    features: [
      'All Pro features',
      'Dedicated account manager',
      'Custom contracts',
      '5% marketplace fee',
      'Priority placement'
    ]
  }
} as const;

export type PlanType = keyof typeof SUBSCRIPTION_PLANS;

export const getMarketplaceFee = (planType: PlanType): number => {
  return SUBSCRIPTION_PLANS[planType].marketplaceFee;
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
