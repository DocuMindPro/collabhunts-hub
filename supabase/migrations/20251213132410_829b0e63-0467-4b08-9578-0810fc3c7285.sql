-- Create function to distribute franchise earnings on booking payment
CREATE OR REPLACE FUNCTION public.distribute_franchise_earnings_on_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  creator_country TEXT;
  brand_country TEXT;
  franchise_id UUID;
  franchise_rate NUMERIC;
  platform_rate NUMERIC;
  platform_fee_amount BIGINT;
  franchise_amount BIGINT;
  platform_amount BIGINT;
  creator_user_id UUID;
  brand_user_id UUID;
BEGIN
  -- Only trigger when payment_status changes to 'paid'
  IF OLD.payment_status IS DISTINCT FROM NEW.payment_status AND NEW.payment_status = 'paid' THEN
    -- Get creator country and user_id
    SELECT location_country, user_id INTO creator_country, creator_user_id
    FROM creator_profiles WHERE id = NEW.creator_profile_id;
    
    -- Get brand country and user_id
    SELECT location_country, user_id INTO brand_country, brand_user_id
    FROM brand_profiles WHERE id = NEW.brand_profile_id;
    
    -- Calculate platform fee (use the booking's platform_fee_cents or calculate 15%)
    platform_fee_amount := COALESCE(NEW.platform_fee_cents, (NEW.total_price_cents * 0.15)::BIGINT);
    
    -- Check if creator's country is franchised
    IF creator_country IS NOT NULL THEN
      SELECT fo.id, fo.commission_rate, fo.platform_rate
      INTO franchise_id, franchise_rate, platform_rate
      FROM franchise_owners fo
      JOIN franchise_countries fc ON fc.franchise_owner_id = fo.id
      WHERE fc.country_code = creator_country AND fo.status = 'active'
      LIMIT 1;
      
      IF franchise_id IS NOT NULL THEN
        -- Calculate splits (franchise gets 70% of platform fee by default)
        franchise_amount := (platform_fee_amount * franchise_rate)::BIGINT;
        platform_amount := platform_fee_amount - franchise_amount;
        
        -- Record franchise earning
        INSERT INTO franchise_earnings (
          franchise_owner_id, source_type, source_id, user_id, user_type,
          country_code, gross_amount_cents, franchise_amount_cents, platform_amount_cents
        ) VALUES (
          franchise_id, 'booking', NEW.id, creator_user_id, 'creator',
          creator_country, NEW.total_price_cents, franchise_amount, platform_amount
        );
        
        -- Update franchise total earnings
        UPDATE franchise_owners
        SET total_earnings_cents = total_earnings_cents + franchise_amount, updated_at = now()
        WHERE id = franchise_id;
      END IF;
    END IF;
    
    -- Check for affiliate referrals (creator or brand)
    -- Check if creator was referred
    PERFORM distribute_affiliate_earnings_for_user(creator_user_id, 'booking', NEW.id, platform_fee_amount);
    
    -- Check if brand was referred
    PERFORM distribute_affiliate_earnings_for_user(brand_user_id, 'booking', NEW.id, platform_fee_amount);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create helper function for affiliate earnings distribution
CREATE OR REPLACE FUNCTION public.distribute_affiliate_earnings_for_user(
  p_user_id UUID,
  p_source_type TEXT,
  p_source_id UUID,
  p_platform_fee_cents BIGINT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referral_record RECORD;
  affiliate_record RECORD;
  affiliate_amount BIGINT;
  platform_amount BIGINT;
BEGIN
  -- Find referral for this user
  SELECT r.*, a.id as affiliate_id, a.commission_rate
  INTO referral_record
  FROM referrals r
  JOIN affiliates a ON a.id = r.affiliate_id
  WHERE r.referred_user_id = p_user_id AND a.status = 'active'
  LIMIT 1;
  
  IF referral_record IS NOT NULL THEN
    -- Calculate affiliate's share (50% of platform's portion by default)
    affiliate_amount := (p_platform_fee_cents * referral_record.commission_rate)::BIGINT;
    platform_amount := p_platform_fee_cents - affiliate_amount;
    
    -- Record affiliate earning
    INSERT INTO affiliate_earnings (
      affiliate_id, referral_id, source_type, source_id,
      gross_revenue_cents, affiliate_amount_cents, platform_amount_cents
    ) VALUES (
      referral_record.affiliate_id, referral_record.id, p_source_type, p_source_id,
      p_platform_fee_cents, affiliate_amount, platform_amount
    );
    
    -- Update affiliate total earnings
    UPDATE affiliates
    SET total_earnings_cents = total_earnings_cents + affiliate_amount, updated_at = now()
    WHERE id = referral_record.affiliate_id;
  END IF;
END;
$$;

-- Create trigger for booking payment
DROP TRIGGER IF EXISTS on_booking_payment_distribute_earnings ON bookings;
CREATE TRIGGER on_booking_payment_distribute_earnings
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION distribute_franchise_earnings_on_booking();

-- Create function to distribute franchise earnings on subscription
CREATE OR REPLACE FUNCTION public.distribute_franchise_earnings_on_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  brand_country TEXT;
  franchise_id UUID;
  franchise_rate NUMERIC;
  platform_rate NUMERIC;
  subscription_amount BIGINT;
  franchise_amount BIGINT;
  platform_amount BIGINT;
  brand_user_id UUID;
BEGIN
  -- Only trigger on new paid subscriptions (not 'none' tier)
  IF TG_OP = 'INSERT' AND NEW.plan_type != 'none' AND NEW.status = 'active' THEN
    -- Get subscription price in cents based on plan type
    subscription_amount := CASE NEW.plan_type
      WHEN 'basic' THEN 3900   -- $39
      WHEN 'pro' THEN 9900     -- $99
      WHEN 'premium' THEN 29900 -- $299
      ELSE 0
    END;
    
    IF subscription_amount > 0 THEN
      -- Get brand country and user_id
      SELECT bp.location_country, bp.user_id INTO brand_country, brand_user_id
      FROM brand_profiles bp WHERE bp.id = NEW.brand_profile_id;
      
      -- Check if brand's country is franchised
      IF brand_country IS NOT NULL THEN
        SELECT fo.id, fo.commission_rate, fo.platform_rate
        INTO franchise_id, franchise_rate, platform_rate
        FROM franchise_owners fo
        JOIN franchise_countries fc ON fc.franchise_owner_id = fo.id
        WHERE fc.country_code = brand_country AND fo.status = 'active'
        LIMIT 1;
        
        IF franchise_id IS NOT NULL THEN
          -- Calculate splits
          franchise_amount := (subscription_amount * franchise_rate)::BIGINT;
          platform_amount := subscription_amount - franchise_amount;
          
          -- Record franchise earning
          INSERT INTO franchise_earnings (
            franchise_owner_id, source_type, source_id, user_id, user_type,
            country_code, gross_amount_cents, franchise_amount_cents, platform_amount_cents
          ) VALUES (
            franchise_id, 'subscription', NEW.id, brand_user_id, 'brand',
            brand_country, subscription_amount, franchise_amount, platform_amount
          );
          
          -- Update franchise total earnings
          UPDATE franchise_owners
          SET total_earnings_cents = total_earnings_cents + franchise_amount, updated_at = now()
          WHERE id = franchise_id;
        END IF;
      END IF;
      
      -- Check for affiliate referral
      PERFORM distribute_affiliate_earnings_for_user(brand_user_id, 'subscription', NEW.id, subscription_amount);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for subscription creation
DROP TRIGGER IF EXISTS on_subscription_distribute_earnings ON brand_subscriptions;
CREATE TRIGGER on_subscription_distribute_earnings
  AFTER INSERT ON brand_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION distribute_franchise_earnings_on_subscription();

-- Create notification functions for franchise and affiliate events
CREATE OR REPLACE FUNCTION public.notify_franchise_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  franchise_record RECORD;
  user_type TEXT;
  user_name TEXT;
  user_country TEXT;
BEGIN
  -- Determine if this is creator or brand
  IF TG_TABLE_NAME = 'creator_profiles' THEN
    user_type := 'creator';
    user_name := NEW.display_name;
    user_country := NEW.location_country;
  ELSE
    user_type := 'brand';
    user_name := NEW.company_name;
    user_country := NEW.location_country;
  END IF;
  
  -- Only proceed if country is set
  IF user_country IS NOT NULL THEN
    -- Find franchise owner for this country
    SELECT fo.user_id, fo.company_name
    INTO franchise_record
    FROM franchise_owners fo
    JOIN franchise_countries fc ON fc.franchise_owner_id = fo.id
    WHERE fc.country_code = user_country AND fo.status = 'active'
    LIMIT 1;
    
    IF franchise_record IS NOT NULL THEN
      -- Notify franchise owner
      INSERT INTO notifications (user_id, title, message, type, link)
      VALUES (
        franchise_record.user_id,
        '🌍 New ' || INITCAP(user_type) || ' in Your Territory',
        user_name || ' just signed up from your franchised territory.',
        'franchise',
        '/franchise-dashboard?tab=' || user_type || 's'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers for franchise notifications
DROP TRIGGER IF EXISTS on_creator_notify_franchise ON creator_profiles;
CREATE TRIGGER on_creator_notify_franchise
  AFTER INSERT ON creator_profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_franchise_new_user();

DROP TRIGGER IF EXISTS on_brand_notify_franchise ON brand_profiles;
CREATE TRIGGER on_brand_notify_franchise
  AFTER INSERT ON brand_profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_franchise_new_user();

-- Create notification function for affiliate referrals
CREATE OR REPLACE FUNCTION public.notify_affiliate_new_referral()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affiliate_user_id UUID;
  referred_name TEXT;
BEGIN
  -- Get affiliate user_id
  SELECT user_id INTO affiliate_user_id
  FROM affiliates WHERE id = NEW.affiliate_id;
  
  -- Get referred user name
  IF NEW.referred_user_type = 'creator' THEN
    SELECT display_name INTO referred_name
    FROM creator_profiles WHERE user_id = NEW.referred_user_id;
  ELSE
    SELECT company_name INTO referred_name
    FROM brand_profiles WHERE user_id = NEW.referred_user_id;
  END IF;
  
  -- Notify affiliate
  INSERT INTO notifications (user_id, title, message, type, link)
  VALUES (
    affiliate_user_id,
    '🎉 New Referral!',
    COALESCE(referred_name, 'Someone') || ' signed up using your referral link!',
    'affiliate',
    '/affiliate-dashboard?tab=referrals'
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for affiliate referral notifications
DROP TRIGGER IF EXISTS on_referral_notify_affiliate ON referrals;
CREATE TRIGGER on_referral_notify_affiliate
  AFTER INSERT ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION notify_affiliate_new_referral();

-- Create notification function for affiliate earnings
CREATE OR REPLACE FUNCTION public.notify_affiliate_earning()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affiliate_user_id UUID;
  earning_amount TEXT;
BEGIN
  -- Get affiliate user_id
  SELECT user_id INTO affiliate_user_id
  FROM affiliates WHERE id = NEW.affiliate_id;
  
  earning_amount := '$' || (NEW.affiliate_amount_cents / 100.0)::TEXT;
  
  -- Notify affiliate
  INSERT INTO notifications (user_id, title, message, type, link)
  VALUES (
    affiliate_user_id,
    '💰 You Earned Commission!',
    'You earned ' || earning_amount || ' from a referral ' || NEW.source_type || '.',
    'affiliate',
    '/affiliate-dashboard?tab=earnings'
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for affiliate earning notifications
DROP TRIGGER IF EXISTS on_affiliate_earning_notify ON affiliate_earnings;
CREATE TRIGGER on_affiliate_earning_notify
  AFTER INSERT ON affiliate_earnings
  FOR EACH ROW
  EXECUTE FUNCTION notify_affiliate_earning();

-- Create notification function for franchise earnings
CREATE OR REPLACE FUNCTION public.notify_franchise_earning()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  franchise_user_id UUID;
  earning_amount TEXT;
BEGIN
  -- Get franchise owner user_id
  SELECT user_id INTO franchise_user_id
  FROM franchise_owners WHERE id = NEW.franchise_owner_id;
  
  earning_amount := '$' || (NEW.franchise_amount_cents / 100.0)::TEXT;
  
  -- Notify franchise owner
  INSERT INTO notifications (user_id, title, message, type, link)
  VALUES (
    franchise_user_id,
    '💰 Franchise Commission Earned!',
    'You earned ' || earning_amount || ' from a ' || NEW.source_type || ' in ' || NEW.country_code || '.',
    'franchise',
    '/franchise-dashboard?tab=earnings'
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for franchise earning notifications
DROP TRIGGER IF EXISTS on_franchise_earning_notify ON franchise_earnings;
CREATE TRIGGER on_franchise_earning_notify
  AFTER INSERT ON franchise_earnings
  FOR EACH ROW
  EXECUTE FUNCTION notify_franchise_earning();