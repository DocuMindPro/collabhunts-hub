-- Create campaigns table
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_profile_id UUID NOT NULL REFERENCES public.brand_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('instagram_post', 'instagram_story', 'instagram_reel', 'tiktok_video', 'youtube_video', 'ugc_content', 'multi_platform')),
  budget_cents INTEGER NOT NULL CHECK (budget_cents > 0),
  spots_available INTEGER NOT NULL DEFAULT 1 CHECK (spots_available > 0),
  spots_filled INTEGER NOT NULL DEFAULT 0 CHECK (spots_filled >= 0),
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  requirements TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create campaign_applications table
CREATE TABLE public.campaign_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  creator_profile_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  message TEXT,
  proposed_price_cents INTEGER NOT NULL CHECK (proposed_price_cents > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, creator_profile_id)
);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_applications ENABLE ROW LEVEL SECURITY;

-- Campaigns policies
CREATE POLICY "Anyone can view active campaigns"
ON public.campaigns
FOR SELECT
USING (status = 'active' OR EXISTS (
  SELECT 1 FROM public.brand_profiles
  WHERE brand_profiles.id = campaigns.brand_profile_id
  AND brand_profiles.user_id = auth.uid()
));

CREATE POLICY "Brands can create campaigns"
ON public.campaigns
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.brand_profiles
    WHERE brand_profiles.id = campaigns.brand_profile_id
    AND brand_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Brands can update their campaigns"
ON public.campaigns
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.brand_profiles
    WHERE brand_profiles.id = campaigns.brand_profile_id
    AND brand_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Brands can delete their campaigns"
ON public.campaigns
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.brand_profiles
    WHERE brand_profiles.id = campaigns.brand_profile_id
    AND brand_profiles.user_id = auth.uid()
  )
);

-- Campaign applications policies
CREATE POLICY "Creators can view their applications"
ON public.campaign_applications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.creator_profiles
    WHERE creator_profiles.id = campaign_applications.creator_profile_id
    AND creator_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Brands can view applications to their campaigns"
ON public.campaign_applications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns
    JOIN public.brand_profiles ON brand_profiles.id = campaigns.brand_profile_id
    WHERE campaigns.id = campaign_applications.campaign_id
    AND brand_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Creators can create applications"
ON public.campaign_applications
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.creator_profiles
    WHERE creator_profiles.id = campaign_applications.creator_profile_id
    AND creator_profiles.user_id = auth.uid()
    AND creator_profiles.status = 'approved'
  )
);

CREATE POLICY "Creators can update their applications"
ON public.campaign_applications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.creator_profiles
    WHERE creator_profiles.id = campaign_applications.creator_profile_id
    AND creator_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Brands can update applications to their campaigns"
ON public.campaign_applications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns
    JOIN public.brand_profiles ON brand_profiles.id = campaigns.brand_profile_id
    WHERE campaigns.id = campaign_applications.campaign_id
    AND brand_profiles.user_id = auth.uid()
  )
);

-- Add triggers for updated_at
CREATE TRIGGER update_campaigns_updated_at
BEFORE UPDATE ON public.campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaign_applications_updated_at
BEFORE UPDATE ON public.campaign_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_campaigns_brand_profile_id ON public.campaigns(brand_profile_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_campaigns_deadline ON public.campaigns(deadline);
CREATE INDEX idx_campaign_applications_campaign_id ON public.campaign_applications(campaign_id);
CREATE INDEX idx_campaign_applications_creator_profile_id ON public.campaign_applications(creator_profile_id);
CREATE INDEX idx_campaign_applications_status ON public.campaign_applications(status);