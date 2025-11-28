-- Create creator_payout_settings table to track Stripe Connect account status
CREATE TABLE public.creator_payout_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_profile_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  stripe_account_id TEXT,
  account_status TEXT NOT NULL DEFAULT 'not_connected', -- not_connected, pending, connected, disabled
  payout_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(creator_profile_id)
);

-- Create payouts table to track payout history
CREATE TABLE public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_profile_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, paid, failed
  payout_date TIMESTAMP WITH TIME ZONE,
  stripe_payout_id TEXT,
  booking_ids UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.creator_payout_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for creator_payout_settings
CREATE POLICY "Creators can view own payout settings"
ON public.creator_payout_settings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.creator_profiles
    WHERE creator_profiles.id = creator_payout_settings.creator_profile_id
      AND creator_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Creators can insert own payout settings"
ON public.creator_payout_settings
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.creator_profiles
    WHERE creator_profiles.id = creator_payout_settings.creator_profile_id
      AND creator_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Creators can update own payout settings"
ON public.creator_payout_settings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.creator_profiles
    WHERE creator_profiles.id = creator_payout_settings.creator_profile_id
      AND creator_profiles.user_id = auth.uid()
  )
);

-- RLS Policies for payouts
CREATE POLICY "Creators can view own payouts"
ON public.payouts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.creator_profiles
    WHERE creator_profiles.id = payouts.creator_profile_id
      AND creator_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all payouts"
ON public.payouts
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage payouts"
ON public.payouts
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add indexes for performance
CREATE INDEX idx_creator_payout_settings_creator_profile_id ON public.creator_payout_settings(creator_profile_id);
CREATE INDEX idx_payouts_creator_profile_id ON public.payouts(creator_profile_id);
CREATE INDEX idx_payouts_status ON public.payouts(status);

-- Add trigger for updated_at
CREATE TRIGGER update_creator_payout_settings_updated_at
BEFORE UPDATE ON public.creator_payout_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payouts_updated_at
BEFORE UPDATE ON public.payouts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();