-- Create a function to check if creator qualifies for auto-approval
CREATE OR REPLACE FUNCTION public.check_creator_auto_approval(creator_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  profile_record RECORD;
  total_followers INTEGER;
  service_count INTEGER;
  qualifies BOOLEAN := FALSE;
BEGIN
  -- Get creator profile
  SELECT * INTO profile_record 
  FROM public.creator_profiles 
  WHERE id = creator_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Get total followers from social accounts
  SELECT COALESCE(SUM(follower_count), 0) INTO total_followers
  FROM public.creator_social_accounts
  WHERE creator_profile_id = creator_id;
  
  -- Get service count
  SELECT COUNT(*) INTO service_count
  FROM public.creator_services
  WHERE creator_profile_id = creator_id AND is_active = true;
  
  -- Check all auto-approval criteria
  qualifies := (
    profile_record.phone_verified = true AND                    -- Phone must be verified
    total_followers >= 1000 AND                                 -- At least 1000 followers total
    profile_record.profile_image_url IS NOT NULL AND            -- Profile photo uploaded
    LENGTH(COALESCE(profile_record.bio, '')) >= 50 AND          -- Bio at least 50 characters
    service_count >= 1 AND                                      -- At least 1 service created
    profile_record.location_country IS NOT NULL                 -- Country provided
  );
  
  RETURN qualifies;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create a function to auto-approve eligible creators
CREATE OR REPLACE FUNCTION public.auto_approve_creator()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if status is still pending
  IF NEW.status = 'pending' THEN
    -- Check if creator qualifies for auto-approval
    IF public.check_creator_auto_approval(NEW.id) THEN
      -- Auto-approve the creator
      UPDATE public.creator_profiles
      SET status = 'approved'
      WHERE id = NEW.id;
      
      -- Log the auto-approval for admin visibility
      RAISE LOG 'Creator % auto-approved based on criteria', NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger that runs AFTER insert on creator_profiles
-- Uses AFTER because we need social accounts and services to exist first
DROP TRIGGER IF EXISTS trigger_auto_approve_creator ON public.creator_profiles;

-- Create a function that can be called manually to check and approve
-- This is called after all signup data is inserted
CREATE OR REPLACE FUNCTION public.finalize_creator_signup(creator_id UUID)
RETURNS TEXT AS $$
DECLARE
  qualifies BOOLEAN;
  result_status TEXT;
BEGIN
  -- Check if creator qualifies
  qualifies := public.check_creator_auto_approval(creator_id);
  
  IF qualifies THEN
    UPDATE public.creator_profiles
    SET status = 'approved'
    WHERE id = creator_id AND status = 'pending';
    
    result_status := 'approved';
  ELSE
    result_status := 'pending';
  END IF;
  
  RETURN result_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;