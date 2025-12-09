-- Create saved_creators table for brand favorites
CREATE TABLE public.saved_creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_profile_id UUID NOT NULL REFERENCES public.brand_profiles(id) ON DELETE CASCADE,
  creator_profile_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  folder_name TEXT DEFAULT 'Favorites',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(brand_profile_id, creator_profile_id)
);

-- Create creator_notes table for private brand notes
CREATE TABLE public.creator_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_profile_id UUID NOT NULL REFERENCES public.brand_profiles(id) ON DELETE CASCADE,
  creator_profile_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  note_content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.saved_creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_notes ENABLE ROW LEVEL SECURITY;

-- RLS policies for saved_creators
CREATE POLICY "Brands can view their saved creators"
ON public.saved_creators FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.brand_profiles
  WHERE brand_profiles.id = saved_creators.brand_profile_id
  AND brand_profiles.user_id = auth.uid()
));

CREATE POLICY "Brands can save creators"
ON public.saved_creators FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.brand_profiles
  WHERE brand_profiles.id = saved_creators.brand_profile_id
  AND brand_profiles.user_id = auth.uid()
));

CREATE POLICY "Brands can unsave creators"
ON public.saved_creators FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.brand_profiles
  WHERE brand_profiles.id = saved_creators.brand_profile_id
  AND brand_profiles.user_id = auth.uid()
));

-- RLS policies for creator_notes
CREATE POLICY "Brands can view their notes"
ON public.creator_notes FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.brand_profiles
  WHERE brand_profiles.id = creator_notes.brand_profile_id
  AND brand_profiles.user_id = auth.uid()
));

CREATE POLICY "Brands can create notes"
ON public.creator_notes FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.brand_profiles
  WHERE brand_profiles.id = creator_notes.brand_profile_id
  AND brand_profiles.user_id = auth.uid()
));

CREATE POLICY "Brands can update their notes"
ON public.creator_notes FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.brand_profiles
  WHERE brand_profiles.id = creator_notes.brand_profile_id
  AND brand_profiles.user_id = auth.uid()
));

CREATE POLICY "Brands can delete their notes"
ON public.creator_notes FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.brand_profiles
  WHERE brand_profiles.id = creator_notes.brand_profile_id
  AND brand_profiles.user_id = auth.uid()
));

-- Trigger for updating updated_at on notes
CREATE TRIGGER update_creator_notes_updated_at
BEFORE UPDATE ON public.creator_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();