-- Phase 1: Fix Campaign Visibility RLS Policy
-- Drop the existing restrictive policy and create a permissive one
DROP POLICY IF EXISTS "Anyone can view active campaigns" ON campaigns;

CREATE POLICY "Anyone can view active campaigns"
ON campaigns
FOR SELECT
TO authenticated
USING (
  status = 'active' 
  OR 
  EXISTS (
    SELECT 1 FROM brand_profiles
    WHERE brand_profiles.id = campaigns.brand_profile_id
    AND brand_profiles.user_id = auth.uid()
  )
);

-- Phase 3: Auto-create Brand Subscriptions on Signup
-- Create a trigger function to automatically create a default "basic" subscription
CREATE OR REPLACE FUNCTION public.create_default_brand_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create a default "basic" subscription for new brand profiles
  INSERT INTO public.brand_subscriptions (
    brand_profile_id,
    plan_type,
    status,
    current_period_start,
    current_period_end
  ) VALUES (
    NEW.id,
    'basic',
    'active',
    NOW(),
    NOW() + INTERVAL '1 year'  -- Set far future date for basic plan
  );
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS create_brand_subscription_trigger ON brand_profiles;
CREATE TRIGGER create_brand_subscription_trigger
  AFTER INSERT ON brand_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_brand_subscription();