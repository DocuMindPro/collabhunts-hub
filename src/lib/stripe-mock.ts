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
