-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Public can view brand profiles for campaigns" ON public.brand_profiles;

-- Create a more restrictive policy that only exposes brand profiles with active campaigns
CREATE POLICY "Public can view brand profiles with active campaigns" 
ON public.brand_profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE campaigns.brand_profile_id = brand_profiles.id 
    AND campaigns.status = 'active'
  )
);