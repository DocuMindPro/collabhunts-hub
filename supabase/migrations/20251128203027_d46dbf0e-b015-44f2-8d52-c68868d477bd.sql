-- Add payment_status column to bookings table
ALTER TABLE public.bookings 
ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'pending';

-- Add check constraint for valid payment statuses
ALTER TABLE public.bookings
ADD CONSTRAINT payment_status_check 
CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));

-- Update existing completed bookings to mark them as paid (backward compatibility)
UPDATE public.bookings 
SET payment_status = 'paid' 
WHERE status = 'completed';

-- Add index for better query performance
CREATE INDEX idx_bookings_payment_status ON public.bookings(payment_status);

-- Drop the old review policy
DROP POLICY IF EXISTS "Brands can create reviews for completed bookings" ON public.reviews;

-- Create updated policy that checks both completion AND payment
CREATE POLICY "Brands can create reviews for completed paid bookings" 
ON public.reviews 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.bookings
    JOIN public.brand_profiles ON brand_profiles.id = bookings.brand_profile_id
    WHERE bookings.id = reviews.booking_id
      AND brand_profiles.user_id = auth.uid()
      AND bookings.status = 'completed'
      AND bookings.payment_status = 'paid'
  )
);