-- Create brand_opportunities table for brands to post event opportunities
CREATE TABLE public.brand_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_profile_id uuid REFERENCES public.brand_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  package_type text,
  event_date date NOT NULL,
  start_time time,
  end_time time,
  is_paid boolean NOT NULL DEFAULT true,
  budget_cents integer,
  spots_available integer NOT NULL DEFAULT 1,
  spots_filled integer NOT NULL DEFAULT 0,
  requirements text,
  min_followers integer,
  required_categories text[],
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'filled', 'completed', 'cancelled')),
  application_deadline timestamptz,
  location_city text,
  location_country text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create opportunity_applications table for creators to apply
CREATE TABLE public.opportunity_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid REFERENCES public.brand_opportunities(id) ON DELETE CASCADE NOT NULL,
  creator_profile_id uuid REFERENCES public.creator_profiles(id) ON DELETE CASCADE NOT NULL,
  message text,
  proposed_price_cents integer,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  delivery_links text[],
  delivered_at timestamptz,
  confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(opportunity_id, creator_profile_id)
);

-- Enable RLS on both tables
ALTER TABLE public.brand_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_applications ENABLE ROW LEVEL SECURITY;

-- Trigger for updated_at on brand_opportunities
CREATE TRIGGER update_brand_opportunities_updated_at
  BEFORE UPDATE ON public.brand_opportunities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for brand_opportunities

-- Brands can view their own opportunities
CREATE POLICY "Brands can view own opportunities"
  ON public.brand_opportunities FOR SELECT
  USING (
    brand_profile_id IN (
      SELECT id FROM public.brand_profiles WHERE user_id = auth.uid()
    )
  );

-- Creators can view open opportunities (paid ones, or free ones if they're open to invites)
CREATE POLICY "Creators can view open opportunities"
  ON public.brand_opportunities FOR SELECT
  USING (
    status = 'open' AND (
      is_paid = true OR 
      EXISTS (
        SELECT 1 FROM public.creator_profiles 
        WHERE user_id = auth.uid() AND open_to_invitations = true
      )
    )
  );

-- Brands can insert their own opportunities
CREATE POLICY "Brands can create opportunities"
  ON public.brand_opportunities FOR INSERT
  WITH CHECK (
    brand_profile_id IN (
      SELECT id FROM public.brand_profiles WHERE user_id = auth.uid()
    )
  );

-- Brands can update their own opportunities
CREATE POLICY "Brands can update own opportunities"
  ON public.brand_opportunities FOR UPDATE
  USING (
    brand_profile_id IN (
      SELECT id FROM public.brand_profiles WHERE user_id = auth.uid()
    )
  );

-- Brands can delete their own opportunities
CREATE POLICY "Brands can delete own opportunities"
  ON public.brand_opportunities FOR DELETE
  USING (
    brand_profile_id IN (
      SELECT id FROM public.brand_profiles WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for opportunity_applications

-- Creators can view their own applications
CREATE POLICY "Creators can view own applications"
  ON public.opportunity_applications FOR SELECT
  USING (
    creator_profile_id IN (
      SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()
    )
  );

-- Brands can view applications on their opportunities
CREATE POLICY "Brands can view applications on their opportunities"
  ON public.opportunity_applications FOR SELECT
  USING (
    opportunity_id IN (
      SELECT id FROM public.brand_opportunities 
      WHERE brand_profile_id IN (
        SELECT id FROM public.brand_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Creators can create applications
CREATE POLICY "Creators can apply to opportunities"
  ON public.opportunity_applications FOR INSERT
  WITH CHECK (
    creator_profile_id IN (
      SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()
    )
  );

-- Creators can update their own applications (withdraw, submit delivery)
CREATE POLICY "Creators can update own applications"
  ON public.opportunity_applications FOR UPDATE
  USING (
    creator_profile_id IN (
      SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()
    )
  );

-- Brands can update applications on their opportunities (accept/reject, confirm)
CREATE POLICY "Brands can update applications on their opportunities"
  ON public.opportunity_applications FOR UPDATE
  USING (
    opportunity_id IN (
      SELECT id FROM public.brand_opportunities 
      WHERE brand_profile_id IN (
        SELECT id FROM public.brand_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Creators can delete/withdraw their own applications
CREATE POLICY "Creators can withdraw applications"
  ON public.opportunity_applications FOR DELETE
  USING (
    creator_profile_id IN (
      SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()
    )
  );