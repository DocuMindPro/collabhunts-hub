-- Update the distribute_subscription_revenue function with new pricing
CREATE OR REPLACE FUNCTION public.distribute_subscription_revenue()
RETURNS TRIGGER AS $$
DECLARE
  brand_country TEXT;
  franchise_owner_record RECORD;
  referral_record RECORD;
  subscription_amount INTEGER;
  franchise_share INTEGER;
  platform_share INTEGER;
  affiliate_share INTEGER;
  final_platform_share INTEGER;
BEGIN
  -- Only process new active subscriptions
  IF NEW.status != 'active' THEN
    RETURN NEW;
  END IF;

  -- Get subscription amount based on plan type (NEW PRICING)
  subscription_amount := CASE NEW.plan_type
    WHEN 'basic' THEN 1000   -- $10
    WHEN 'pro' THEN 4900     -- $49
    WHEN 'premium' THEN 9900 -- $99
    ELSE 0
  END;

  IF subscription_amount = 0 THEN
    RETURN NEW;
  END IF;

  -- Get brand's country
  SELECT location_country INTO brand_country
  FROM public.brand_profiles
  WHERE id = NEW.brand_profile_id;

  -- Check for franchise owner in brand's country
  SELECT fo.* INTO franchise_owner_record
  FROM public.franchise_owners fo
  JOIN public.franchise_countries fc ON fo.id = fc.franchise_owner_id
  WHERE fc.country_code = brand_country
    AND fo.status = 'active';

  -- Check for affiliate referral
  SELECT r.*, a.id as affiliate_id INTO referral_record
  FROM public.referrals r
  JOIN public.affiliates a ON r.affiliate_id = a.id
  WHERE r.referred_brand_profile_id = NEW.brand_profile_id
    AND r.status = 'converted'
    AND a.status = 'active';

  -- Calculate revenue distribution
  IF franchise_owner_record.id IS NOT NULL THEN
    -- 70/30 split for franchise
    franchise_share := ROUND(subscription_amount * 0.70);
    platform_share := subscription_amount - franchise_share;

    -- Record franchise earnings
    INSERT INTO public.franchise_earnings (
      franchise_owner_id,
      source_type,
      source_id,
      user_id,
      user_type,
      country_code,
      gross_amount_cents,
      franchise_amount_cents,
      platform_amount_cents
    ) VALUES (
      franchise_owner_record.id,
      'subscription',
      NEW.id,
      NEW.brand_profile_id,
      'brand',
      brand_country,
      subscription_amount,
      franchise_share,
      platform_share
    );

    -- Update franchise owner balance
    UPDATE public.franchise_owners
    SET 
      total_earnings_cents = total_earnings_cents + franchise_share,
      available_balance_cents = available_balance_cents + franchise_share,
      updated_at = NOW()
    WHERE id = franchise_owner_record.id;
  ELSE
    platform_share := subscription_amount;
  END IF;

  -- Check for affiliate referral and split platform share 50/50
  IF referral_record.affiliate_id IS NOT NULL THEN
    affiliate_share := ROUND(platform_share * 0.50);
    final_platform_share := platform_share - affiliate_share;

    -- Record affiliate earnings
    INSERT INTO public.affiliate_earnings (
      affiliate_id,
      referral_id,
      source_type,
      source_id,
      gross_revenue_cents,
      affiliate_amount_cents,
      platform_amount_cents
    ) VALUES (
      referral_record.affiliate_id,
      referral_record.id,
      'subscription',
      NEW.id,
      subscription_amount,
      affiliate_share,
      final_platform_share
    );

    -- Update affiliate balance
    UPDATE public.affiliates
    SET 
      total_earnings_cents = total_earnings_cents + affiliate_share,
      available_balance_cents = available_balance_cents + affiliate_share,
      updated_at = NOW()
    WHERE id = referral_record.affiliate_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;