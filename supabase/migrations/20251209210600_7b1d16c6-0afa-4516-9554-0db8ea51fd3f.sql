-- Create content_folders table for folder organization
CREATE TABLE public.content_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_profile_id UUID NOT NULL REFERENCES public.brand_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  parent_folder_id UUID REFERENCES public.content_folders(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(brand_profile_id, name, parent_folder_id)
);

-- Enable RLS
ALTER TABLE public.content_folders ENABLE ROW LEVEL SECURITY;

-- RLS policies for content_folders
CREATE POLICY "Brands can view their own folders"
ON public.content_folders FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.brand_profiles
  WHERE brand_profiles.id = content_folders.brand_profile_id
  AND brand_profiles.user_id = auth.uid()
));

CREATE POLICY "Brands can insert their own folders"
ON public.content_folders FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.brand_profiles
  WHERE brand_profiles.id = content_folders.brand_profile_id
  AND brand_profiles.user_id = auth.uid()
));

CREATE POLICY "Brands can update their own folders"
ON public.content_folders FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.brand_profiles
  WHERE brand_profiles.id = content_folders.brand_profile_id
  AND brand_profiles.user_id = auth.uid()
));

CREATE POLICY "Brands can delete their own folders"
ON public.content_folders FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.brand_profiles
  WHERE brand_profiles.id = content_folders.brand_profile_id
  AND brand_profiles.user_id = auth.uid()
));

-- Admin policies
CREATE POLICY "Admins can manage all folders"
ON public.content_folders FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add folder_id to content_library
ALTER TABLE public.content_library 
ADD COLUMN folder_id UUID REFERENCES public.content_folders(id) ON DELETE SET NULL;

-- Add last_expiry_notification_sent for email tracking
ALTER TABLE public.content_library 
ADD COLUMN last_expiry_notification_sent TIMESTAMPTZ;

-- Create index for folder queries
CREATE INDEX idx_content_library_folder_id ON public.content_library(folder_id);
CREATE INDEX idx_content_folders_brand_id ON public.content_folders(brand_profile_id);

-- Trigger for updated_at on content_folders
CREATE TRIGGER update_content_folders_updated_at
BEFORE UPDATE ON public.content_folders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();