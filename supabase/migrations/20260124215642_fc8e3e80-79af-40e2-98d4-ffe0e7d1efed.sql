-- Create a function to check if campaign qualifies for auto-approval
CREATE OR REPLACE FUNCTION public.check_campaign_auto_approval(campaign_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  campaign_record RECORD;
  brand_record RECORD;
  subscription_record RECORD;
  approved_campaign_count INTEGER;
  qualifies BOOLEAN := FALSE;
BEGIN
  -- Get campaign details
  SELECT * INTO campaign_record 
  FROM public.campaigns 
  WHERE id = campaign_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Get brand profile
  SELECT * INTO brand_record
  FROM public.brand_profiles
  WHERE id = campaign_record.brand_profile_id;
  
  -- Get brand subscription
  SELECT * INTO subscription_record
  FROM public.brand_subscriptions
  WHERE brand_profile_id = campaign_record.brand_profile_id
    AND status = 'active'
  ORDER BY 
    CASE plan_type 
      WHEN 'premium' THEN 1 
      WHEN 'pro' THEN 2 
      WHEN 'basic' THEN 3 
      ELSE 4 
    END
  LIMIT 1;
  
  -- Count previously approved campaigns
  SELECT COUNT(*) INTO approved_campaign_count
  FROM public.campaigns
  WHERE brand_profile_id = campaign_record.brand_profile_id
    AND status = 'active';
  
  -- Check auto-approval criteria (ANY condition met)
  qualifies := (
    brand_record.is_verified = true OR                          -- Brand is verified
    subscription_record.plan_type IN ('pro', 'premium') OR      -- Pro or Premium subscription
    approved_campaign_count >= 3 OR                             -- 3+ previously approved campaigns
    campaign_record.budget_cents <= 50000                       -- Budget <= $500
  );
  
  RETURN qualifies;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger function for campaign auto-approval
CREATE OR REPLACE FUNCTION public.auto_approve_campaign()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if status is pending (new campaigns)
  IF NEW.status = 'pending' THEN
    -- Check if campaign qualifies for auto-approval
    IF public.check_campaign_auto_approval(NEW.id) THEN
      -- Auto-approve the campaign
      NEW.status := 'active';
      RAISE LOG 'Campaign % auto-approved based on trust criteria', NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger that runs BEFORE insert on campaigns
DROP TRIGGER IF EXISTS trigger_auto_approve_campaign ON public.campaigns;
CREATE TRIGGER trigger_auto_approve_campaign
  BEFORE INSERT ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_approve_campaign();