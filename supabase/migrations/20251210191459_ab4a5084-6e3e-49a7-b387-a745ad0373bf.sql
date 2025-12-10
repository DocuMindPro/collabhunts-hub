-- Add notification tracking columns to platform_changelog
ALTER TABLE public.platform_changelog 
ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notification_sent_at TIMESTAMPTZ;