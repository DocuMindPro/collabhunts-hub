-- Mass message templates for brands
CREATE TABLE public.mass_message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_profile_id UUID NOT NULL REFERENCES public.brand_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Mass message log for tracking/limits
CREATE TABLE public.mass_messages_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_profile_id UUID NOT NULL REFERENCES public.brand_profiles(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.mass_message_templates(id) ON DELETE SET NULL,
  creator_profile_ids UUID[] NOT NULL,
  message_count INTEGER NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now()
);

-- Add opt-out column to creator_profiles
ALTER TABLE public.creator_profiles 
ADD COLUMN IF NOT EXISTS allow_mass_messages BOOLEAN DEFAULT true;

-- Enable RLS
ALTER TABLE public.mass_message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mass_messages_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for mass_message_templates
CREATE POLICY "Brands can manage their own templates"
ON public.mass_message_templates
FOR ALL
USING (EXISTS (
  SELECT 1 FROM brand_profiles
  WHERE brand_profiles.id = mass_message_templates.brand_profile_id
  AND brand_profiles.user_id = auth.uid()
));

-- RLS policies for mass_messages_log
CREATE POLICY "Brands can view their own message logs"
ON public.mass_messages_log
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM brand_profiles
  WHERE brand_profiles.id = mass_messages_log.brand_profile_id
  AND brand_profiles.user_id = auth.uid()
));

CREATE POLICY "Brands can insert their own message logs"
ON public.mass_messages_log
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM brand_profiles
  WHERE brand_profiles.id = mass_messages_log.brand_profile_id
  AND brand_profiles.user_id = auth.uid()
));

-- Admins can view all logs
CREATE POLICY "Admins can view all message logs"
ON public.mass_messages_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for efficient querying
CREATE INDEX idx_mass_messages_log_brand_sent ON public.mass_messages_log(brand_profile_id, sent_at DESC);
CREATE INDEX idx_mass_message_templates_brand ON public.mass_message_templates(brand_profile_id);