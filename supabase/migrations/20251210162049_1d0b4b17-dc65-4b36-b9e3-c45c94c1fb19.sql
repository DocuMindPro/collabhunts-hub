-- Fix the validate_booking_update trigger by removing platform_fee_cents check
-- The platform_fee_cents column is GENERATED ALWAYS, so PostgreSQL prevents direct modification anyway
CREATE OR REPLACE FUNCTION public.validate_booking_update()
RETURNS TRIGGER AS $$
BEGIN
  -- If payment_status is being changed
  IF OLD.payment_status IS DISTINCT FROM NEW.payment_status THEN
    -- Only allow valid transitions:
    -- pending -> paid (by system/admin when payment confirmed)
    -- pending -> cancelled (when booking cancelled)
    -- paid -> refunded (by admin)
    IF NOT (
      (OLD.payment_status = 'pending' AND NEW.payment_status IN ('paid', 'cancelled')) OR
      (OLD.payment_status = 'paid' AND NEW.payment_status = 'refunded')
    ) THEN
      RAISE EXCEPTION 'Invalid payment status transition from % to %', OLD.payment_status, NEW.payment_status;
    END IF;
  END IF;
  
  -- Prevent users from modifying total_price_cents after creation
  IF OLD.total_price_cents IS DISTINCT FROM NEW.total_price_cents THEN
    RAISE EXCEPTION 'Total price cannot be modified after booking creation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;