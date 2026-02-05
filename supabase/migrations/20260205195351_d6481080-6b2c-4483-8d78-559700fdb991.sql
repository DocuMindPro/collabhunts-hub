-- Add verification payment tracking columns to brand_profiles
ALTER TABLE public.brand_profiles
ADD COLUMN IF NOT EXISTS verification_payment_status text DEFAULT 'not_paid',
ADD COLUMN IF NOT EXISTS verification_paid_at timestamptz,
ADD COLUMN IF NOT EXISTS verification_expires_at timestamptz,
ADD COLUMN IF NOT EXISTS verification_payment_id text;