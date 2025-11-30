-- Allow public/creators to view brand profiles for campaigns
CREATE POLICY "Public can view brand profiles for campaigns"
ON brand_profiles
FOR SELECT
TO authenticated
USING (true);