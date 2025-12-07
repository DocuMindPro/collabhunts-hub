-- First, delete duplicate profile views keeping only the earliest one per creator/viewer/date
DELETE FROM public.profile_views a
USING public.profile_views b
WHERE a.id > b.id
  AND a.creator_profile_id = b.creator_profile_id
  AND a.viewer_id = b.viewer_id
  AND a.view_date = b.view_date;

-- Now add the unique constraint to prevent future duplicates
ALTER TABLE public.profile_views
ADD CONSTRAINT unique_viewer_per_creator_per_day 
UNIQUE (creator_profile_id, viewer_id, view_date);

-- Create secure INSERT policy that requires authentication and validates viewer_id
CREATE POLICY "Authenticated users can insert profile views"
ON public.profile_views
FOR INSERT
TO authenticated
WITH CHECK (viewer_id = auth.uid());

-- Create a helper function to safely record profile views (handles duplicates gracefully)
CREATE OR REPLACE FUNCTION public.record_profile_view(p_creator_profile_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  INSERT INTO public.profile_views (creator_profile_id, viewer_id, view_date)
  VALUES (p_creator_profile_id, auth.uid(), CURRENT_DATE)
  ON CONFLICT (creator_profile_id, viewer_id, view_date) DO NOTHING;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;