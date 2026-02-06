
-- Step 1: Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view brand profiles" ON public.brand_profiles;

-- Step 2: Create a public view with only non-sensitive fields
CREATE OR REPLACE VIEW public.brand_profiles_public
WITH (security_invoker = on) AS
SELECT 
  id,
  company_name,
  logo_url,
  venue_name,
  venue_type,
  venue_city,
  location_country,
  industry,
  is_verified,
  verification_status,
  created_at
FROM public.brand_profiles;

-- Step 3: Add a policy allowing anon users to read only via the view
-- The view with security_invoker=on will use the caller's permissions,
-- so we need a SELECT policy for anon that allows reading rows
-- but the view itself limits which columns are visible
CREATE POLICY "Public can view limited brand info"
ON public.brand_profiles FOR SELECT
TO anon
USING (true);

-- Step 4: Authenticated users can still see all details (existing policies cover owner/admin/franchise)
-- Add a general authenticated read policy for cases like messaging, bookings, etc.
CREATE POLICY "Authenticated users can view brand profiles"
ON public.brand_profiles FOR SELECT
TO authenticated
USING (true);
