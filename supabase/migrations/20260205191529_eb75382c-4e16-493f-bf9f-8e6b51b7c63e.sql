-- Add verification payment tracking to creator_profiles
ALTER TABLE public.creator_profiles
ADD COLUMN IF NOT EXISTS verification_payment_status TEXT DEFAULT 'unpaid',
ADD COLUMN IF NOT EXISTS verification_paid_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verification_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verification_payment_id TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.creator_profiles.verification_payment_status IS 'Status: unpaid, paid, expired';
COMMENT ON COLUMN public.creator_profiles.verification_expires_at IS 'When the verification badge expires (1 year from payment)';