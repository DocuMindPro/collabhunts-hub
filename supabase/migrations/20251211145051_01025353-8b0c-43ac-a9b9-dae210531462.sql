-- Add campaign_id to mass_messages_log for tracking campaign invitations
ALTER TABLE public.mass_messages_log ADD COLUMN campaign_id UUID REFERENCES public.campaigns(id);

-- Create index for efficient campaign-based queries
CREATE INDEX idx_mass_messages_log_campaign_id ON public.mass_messages_log(campaign_id);