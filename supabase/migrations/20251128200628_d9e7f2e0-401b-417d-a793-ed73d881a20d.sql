-- Create brand_subscriptions table
CREATE TABLE public.brand_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_profile_id UUID NOT NULL REFERENCES public.brand_profiles(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('basic', 'pro', 'premium')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.brand_subscriptions ENABLE ROW LEVEL SECURITY;

-- Brands can view their own subscription
CREATE POLICY "Brands can view their own subscription"
ON public.brand_subscriptions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.brand_profiles
    WHERE brand_profiles.id = brand_subscriptions.brand_profile_id
    AND brand_profiles.user_id = auth.uid()
  )
);

-- Brands can insert their own subscription
CREATE POLICY "Brands can insert their own subscription"
ON public.brand_subscriptions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.brand_profiles
    WHERE brand_profiles.id = brand_subscriptions.brand_profile_id
    AND brand_profiles.user_id = auth.uid()
  )
);

-- Brands can update their own subscription
CREATE POLICY "Brands can update their own subscription"
ON public.brand_subscriptions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.brand_profiles
    WHERE brand_profiles.id = brand_subscriptions.brand_profile_id
    AND brand_profiles.user_id = auth.uid()
  )
);

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
ON public.brand_subscriptions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_brand_subscriptions_updated_at
BEFORE UPDATE ON public.brand_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_brand_subscriptions_brand_profile_id ON public.brand_subscriptions(brand_profile_id);
CREATE INDEX idx_brand_subscriptions_status ON public.brand_subscriptions(status);