-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  brand_profile_id UUID NOT NULL REFERENCES public.brand_profiles(id) ON DELETE CASCADE,
  creator_profile_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(booking_id)
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Brands can create reviews for their completed bookings
CREATE POLICY "Brands can create reviews for completed bookings"
ON public.reviews
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.bookings
    JOIN public.brand_profiles ON brand_profiles.id = bookings.brand_profile_id
    WHERE bookings.id = reviews.booking_id
    AND brand_profiles.user_id = auth.uid()
    AND bookings.status = 'completed'
  )
);

-- Brands can update their own reviews
CREATE POLICY "Brands can update their own reviews"
ON public.reviews
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.brand_profiles
    WHERE brand_profiles.id = reviews.brand_profile_id
    AND brand_profiles.user_id = auth.uid()
  )
);

-- Anyone can view reviews for approved creators
CREATE POLICY "Anyone can view reviews for approved creators"
ON public.reviews
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.creator_profiles
    WHERE creator_profiles.id = reviews.creator_profile_id
    AND creator_profiles.status = 'approved'
  )
);

-- Public can view reviews for approved creators
CREATE POLICY "Public can view reviews for approved creators"
ON public.reviews
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.creator_profiles
    WHERE creator_profiles.id = reviews.creator_profile_id
    AND creator_profiles.status = 'approved'
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for performance
CREATE INDEX idx_reviews_creator_profile_id ON public.reviews(creator_profile_id);
CREATE INDEX idx_reviews_booking_id ON public.reviews(booking_id);