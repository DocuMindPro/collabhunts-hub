-- Add parent_message_id to messages table for threading negotiations
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS parent_message_id UUID REFERENCES public.messages(id);

-- Create index for efficient thread lookups
CREATE INDEX IF NOT EXISTS idx_messages_parent_id ON public.messages(parent_message_id);

-- Add negotiation_status for tracking inquiry/counter-offer state
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS negotiation_status TEXT DEFAULT NULL;

-- Comment: negotiation_status values: 'pending', 'accepted', 'declined', 'countered'