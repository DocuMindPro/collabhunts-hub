-- Add new roles to app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'franchise';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'affiliate';

-- Add location_country to brand_profiles if not exists
ALTER TABLE public.brand_profiles ADD COLUMN IF NOT EXISTS location_country TEXT;

-- =====================
-- FRANCHISE TABLES
-- =====================

-- Franchise owners table
CREATE TABLE public.franchise_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.70,
  platform_rate DECIMAL(5,4) NOT NULL DEFAULT 0.30,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  activated_by UUID REFERENCES auth.users(id),
  activated_at TIMESTAMP WITH TIME ZONE,
  total_earnings_cents BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Franchise countries assignment
CREATE TABLE public.franchise_countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_owner_id UUID REFERENCES public.franchise_owners(id) ON DELETE CASCADE NOT NULL,
  country_code TEXT NOT NULL,
  country_name TEXT NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE (country_code)
);

-- Franchise earnings tracking
CREATE TABLE public.franchise_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_owner_id UUID REFERENCES public.franchise_owners(id) ON DELETE CASCADE NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('booking', 'subscription')),
  source_id UUID NOT NULL,
  user_id UUID NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('creator', 'brand')),
  country_code TEXT NOT NULL,
  gross_amount_cents BIGINT NOT NULL,
  franchise_amount_cents BIGINT NOT NULL,
  platform_amount_cents BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================
-- AFFILIATE TABLES
-- =====================

-- Affiliates table
CREATE TABLE public.affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  referral_code TEXT NOT NULL UNIQUE,
  commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.50,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  activated_by UUID REFERENCES auth.users(id),
  activated_at TIMESTAMP WITH TIME ZONE,
  total_earnings_cents BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Referrals tracking
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE CASCADE NOT NULL,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  referred_user_type TEXT NOT NULL CHECK (referred_user_type IN ('creator', 'brand')),
  referral_code_used TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Affiliate earnings tracking
CREATE TABLE public.affiliate_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE CASCADE NOT NULL,
  referral_id UUID REFERENCES public.referrals(id) ON DELETE CASCADE NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('booking', 'subscription')),
  source_id UUID NOT NULL,
  gross_revenue_cents BIGINT NOT NULL,
  affiliate_amount_cents BIGINT NOT NULL,
  platform_amount_cents BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================
-- ENABLE RLS
-- =====================

ALTER TABLE public.franchise_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.franchise_countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.franchise_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_earnings ENABLE ROW LEVEL SECURITY;

-- =====================
-- HELPER FUNCTIONS
-- =====================

-- Check if user is super admin (elie.goole@gmail.com)
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND email = 'elie.goole@gmail.com'
  )
$$;

-- Check if user is franchise owner for a specific country
CREATE OR REPLACE FUNCTION public.is_franchise_owner_for_country(_user_id UUID, _country_code TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.franchise_owners fo
    JOIN public.franchise_countries fc ON fc.franchise_owner_id = fo.id
    WHERE fo.user_id = _user_id 
      AND fo.status = 'active'
      AND fc.country_code = _country_code
  )
$$;

-- Get affiliate by referral code
CREATE OR REPLACE FUNCTION public.get_affiliate_by_code(_code TEXT)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.affiliates
  WHERE referral_code = _code AND status = 'active'
  LIMIT 1
$$;

-- =====================
-- FRANCHISE RLS POLICIES
-- =====================

-- Super admin can manage all franchise owners
CREATE POLICY "Super admin can manage franchise owners"
ON public.franchise_owners FOR ALL
USING (public.is_super_admin(auth.uid()));

-- Franchise owners can view their own profile
CREATE POLICY "Franchise owners can view own profile"
ON public.franchise_owners FOR SELECT
USING (user_id = auth.uid());

-- Franchise owners can update their own profile (limited fields)
CREATE POLICY "Franchise owners can update own profile"
ON public.franchise_owners FOR UPDATE
USING (user_id = auth.uid());

-- Super admin can manage franchise countries
CREATE POLICY "Super admin can manage franchise countries"
ON public.franchise_countries FOR ALL
USING (public.is_super_admin(auth.uid()));

-- Franchise owners can view their assigned countries
CREATE POLICY "Franchise owners can view own countries"
ON public.franchise_countries FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.franchise_owners fo
  WHERE fo.id = franchise_countries.franchise_owner_id
  AND fo.user_id = auth.uid()
));

-- Franchise owners can view their earnings
CREATE POLICY "Franchise owners can view own earnings"
ON public.franchise_earnings FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.franchise_owners fo
  WHERE fo.id = franchise_earnings.franchise_owner_id
  AND fo.user_id = auth.uid()
));

-- Admins can view all franchise earnings
CREATE POLICY "Admins can view all franchise earnings"
ON public.franchise_earnings FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- =====================
-- AFFILIATE RLS POLICIES
-- =====================

-- Admins can manage all affiliates
CREATE POLICY "Admins can manage affiliates"
ON public.affiliates FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Affiliates can view their own profile
CREATE POLICY "Affiliates can view own profile"
ON public.affiliates FOR SELECT
USING (user_id = auth.uid());

-- Affiliates can update their own profile
CREATE POLICY "Affiliates can update own profile"
ON public.affiliates FOR UPDATE
USING (user_id = auth.uid());

-- Affiliates can view their referrals
CREATE POLICY "Affiliates can view own referrals"
ON public.referrals FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.affiliates a
  WHERE a.id = referrals.affiliate_id
  AND a.user_id = auth.uid()
));

-- Admins can view all referrals
CREATE POLICY "Admins can view all referrals"
ON public.referrals FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- System can insert referrals (for signup tracking)
CREATE POLICY "Anyone can create referrals"
ON public.referrals FOR INSERT
WITH CHECK (true);

-- Affiliates can view their earnings
CREATE POLICY "Affiliates can view own earnings"
ON public.affiliate_earnings FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.affiliates a
  WHERE a.id = affiliate_earnings.affiliate_id
  AND a.user_id = auth.uid()
));

-- Admins can view all affiliate earnings
CREATE POLICY "Admins can view all affiliate earnings"
ON public.affiliate_earnings FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- =====================
-- FRANCHISE ACCESS TO CREATORS/BRANDS
-- =====================

-- Franchise owners can view creators from their countries
CREATE POLICY "Franchise owners can view creators from their countries"
ON public.creator_profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.franchise_owners fo
    JOIN public.franchise_countries fc ON fc.franchise_owner_id = fo.id
    WHERE fo.user_id = auth.uid()
    AND fo.status = 'active'
    AND fc.country_code = creator_profiles.location_country
  )
);

-- Franchise owners can update creators from their countries (for approval)
CREATE POLICY "Franchise owners can update creators from their countries"
ON public.creator_profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.franchise_owners fo
    JOIN public.franchise_countries fc ON fc.franchise_owner_id = fo.id
    WHERE fo.user_id = auth.uid()
    AND fo.status = 'active'
    AND fc.country_code = creator_profiles.location_country
  )
);

-- Franchise owners can view brands from their countries
CREATE POLICY "Franchise owners can view brands from their countries"
ON public.brand_profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.franchise_owners fo
    JOIN public.franchise_countries fc ON fc.franchise_owner_id = fo.id
    WHERE fo.user_id = auth.uid()
    AND fo.status = 'active'
    AND fc.country_code = brand_profiles.location_country
  )
);

-- =====================
-- INDEXES
-- =====================

CREATE INDEX idx_franchise_countries_country ON public.franchise_countries(country_code);
CREATE INDEX idx_franchise_earnings_owner ON public.franchise_earnings(franchise_owner_id);
CREATE INDEX idx_franchise_earnings_created ON public.franchise_earnings(created_at);
CREATE INDEX idx_affiliates_code ON public.affiliates(referral_code);
CREATE INDEX idx_referrals_affiliate ON public.referrals(affiliate_id);
CREATE INDEX idx_referrals_user ON public.referrals(referred_user_id);
CREATE INDEX idx_affiliate_earnings_affiliate ON public.affiliate_earnings(affiliate_id);
CREATE INDEX idx_brand_profiles_country ON public.brand_profiles(location_country);

-- =====================
-- UPDATE TRIGGERS
-- =====================

CREATE TRIGGER update_franchise_owners_updated_at
BEFORE UPDATE ON public.franchise_owners
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_affiliates_updated_at
BEFORE UPDATE ON public.affiliates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();