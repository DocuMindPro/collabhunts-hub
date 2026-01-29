-- First, drop and recreate the check constraint to allow 'testing' category
ALTER TABLE site_settings DROP CONSTRAINT IF EXISTS site_settings_category_check;

-- Add new check constraint with 'testing' included
ALTER TABLE site_settings ADD CONSTRAINT site_settings_category_check 
CHECK (category IN ('branding', 'seo', 'social', 'testing'));

-- Insert default verification settings (both enabled by default)
INSERT INTO site_settings (key, value, category, description)
VALUES 
  ('require_phone_verification', 'true', 'testing', 'Require phone OTP verification during signup'),
  ('require_email_verification', 'true', 'testing', 'Require email verification before dashboard access')
ON CONFLICT (key) DO NOTHING;