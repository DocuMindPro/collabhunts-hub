-- Drop the recursive policy that causes infinite recursion
DROP POLICY IF EXISTS "Public can view brand profiles with active campaigns" ON public.brand_profiles;

-- Create a simple policy: anyone can view brand profiles for SELECT
-- (brand_profiles contains no sensitive PII, just company info)
CREATE POLICY "Anyone can view brand profiles" 
ON public.brand_profiles 
FOR SELECT 
USING (true);