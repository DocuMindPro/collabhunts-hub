-- Create creator profiles table
CREATE TABLE public.creator_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  bio TEXT,
  profile_image_url TEXT,
  location_city TEXT,
  location_state TEXT,
  location_country TEXT,
  categories TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Create creator social accounts table
CREATE TABLE public.creator_social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_profile_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'youtube', 'twitter', 'twitch')),
  username TEXT NOT NULL,
  follower_count INTEGER DEFAULT 0,
  profile_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(creator_profile_id, platform)
);

-- Create creator services table
CREATE TABLE public.creator_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_profile_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL CHECK (service_type IN ('instagram_post', 'instagram_story', 'instagram_reel', 'tiktok_video', 'youtube_video', 'youtube_short', 'ugc_content')),
  price_cents INTEGER NOT NULL,
  description TEXT,
  delivery_days INTEGER DEFAULT 7,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(creator_profile_id, service_type)
);

-- Create brand profiles table
CREATE TABLE public.brand_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  website_url TEXT,
  industry TEXT,
  company_size TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for creator_profiles
CREATE POLICY "Creators can view own profile"
  ON public.creator_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Creators can update own profile"
  ON public.creator_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Creators can insert own profile"
  ON public.creator_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all creator profiles"
  ON public.creator_profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all creator profiles"
  ON public.creator_profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view approved creator profiles"
  ON public.creator_profiles FOR SELECT
  USING (status = 'approved');

-- RLS Policies for creator_social_accounts
CREATE POLICY "Creators can manage own social accounts"
  ON public.creator_social_accounts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.creator_profiles
      WHERE id = creator_social_accounts.creator_profile_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view approved creator social accounts"
  ON public.creator_social_accounts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.creator_profiles
      WHERE id = creator_social_accounts.creator_profile_id
      AND status = 'approved'
    )
  );

-- RLS Policies for creator_services
CREATE POLICY "Creators can manage own services"
  ON public.creator_services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.creator_profiles
      WHERE id = creator_services.creator_profile_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view services of approved creators"
  ON public.creator_services FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.creator_profiles
      WHERE id = creator_services.creator_profile_id
      AND status = 'approved'
    )
  );

-- RLS Policies for brand_profiles
CREATE POLICY "Brands can view own profile"
  ON public.brand_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Brands can update own profile"
  ON public.brand_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Brands can insert own profile"
  ON public.brand_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all brand profiles"
  ON public.brand_profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_creator_profiles_updated_at
  BEFORE UPDATE ON public.creator_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_brand_profiles_updated_at
  BEFORE UPDATE ON public.brand_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();