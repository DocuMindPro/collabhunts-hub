
-- 1. Make booking_id nullable
ALTER TABLE public.reviews ALTER COLUMN booking_id DROP NOT NULL;

-- 2. Add agreement_id column
ALTER TABLE public.reviews ADD COLUMN agreement_id uuid REFERENCES public.creator_agreements(id);

-- 3. Ensure at least one of booking_id or agreement_id is set
ALTER TABLE public.reviews ADD CONSTRAINT reviews_booking_or_agreement_check
  CHECK (booking_id IS NOT NULL OR agreement_id IS NOT NULL);

-- 4. Unique constraint: one review per agreement per brand
ALTER TABLE public.reviews ADD CONSTRAINT reviews_agreement_brand_unique
  UNIQUE (agreement_id, brand_profile_id);

-- 5. Drop the old INSERT policy that requires completed+paid bookings
DROP POLICY "Brands can create reviews for completed paid bookings" ON public.reviews;

-- 6. New INSERT policy: brands can review via completed bookings OR confirmed agreements
CREATE POLICY "Brands can create reviews for bookings or agreements"
ON public.reviews FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM brand_profiles
    WHERE brand_profiles.id = reviews.brand_profile_id
      AND brand_profiles.user_id = auth.uid()
  )
  AND (
    -- Booking-based review
    (reviews.booking_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = reviews.booking_id
        AND bookings.brand_profile_id = reviews.brand_profile_id
        AND bookings.status = 'completed'
    ))
    OR
    -- Agreement-based review
    (reviews.agreement_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM creator_agreements
      WHERE creator_agreements.id = reviews.agreement_id
        AND creator_agreements.brand_profile_id = reviews.brand_profile_id
        AND creator_agreements.status = 'confirmed'
        AND (
          creator_agreements.event_date < CURRENT_DATE
          OR creator_agreements.confirmed_at < now() - interval '7 days'
        )
    ))
  )
);

-- 7. Trigger to update creator_profiles average_rating and total_reviews
CREATE OR REPLACE FUNCTION public.update_creator_review_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE creator_profiles
  SET
    average_rating = (SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE creator_profile_id = COALESCE(NEW.creator_profile_id, OLD.creator_profile_id)),
    total_reviews = (SELECT COUNT(*) FROM reviews WHERE creator_profile_id = COALESCE(NEW.creator_profile_id, OLD.creator_profile_id))
  WHERE id = COALESCE(NEW.creator_profile_id, OLD.creator_profile_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_update_creator_review_stats
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_creator_review_stats();
