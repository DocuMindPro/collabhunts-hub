-- Add platform fee column to bookings table (15% commission)
ALTER TABLE public.bookings 
ADD COLUMN platform_fee_cents integer GENERATED ALWAYS AS (total_price_cents * 15 / 100) STORED;