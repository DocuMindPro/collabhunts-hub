-- Create booking_offers table for formal quotes sent by creators in chat
CREATE TABLE public.booking_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  creator_profile_id UUID NOT NULL REFERENCES public.creator_profiles(id),
  brand_profile_id UUID NOT NULL REFERENCES public.brand_profiles(id),
  message_id UUID REFERENCES public.messages(id),
  package_type TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  event_date DATE,
  event_time_start TIME,
  duration_hours INTEGER,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
  booking_id UUID REFERENCES public.bookings(id)
);

-- Enable RLS
ALTER TABLE public.booking_offers ENABLE ROW LEVEL SECURITY;

-- Creators can view and create offers for their conversations
CREATE POLICY "Creators can view their offers"
  ON public.booking_offers
  FOR SELECT
  USING (
    creator_profile_id IN (
      SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Creators can create offers"
  ON public.booking_offers
  FOR INSERT
  WITH CHECK (
    creator_profile_id IN (
      SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()
    )
  );

-- Brands can view offers sent to them
CREATE POLICY "Brands can view offers sent to them"
  ON public.booking_offers
  FOR SELECT
  USING (
    brand_profile_id IN (
      SELECT id FROM public.brand_profiles WHERE user_id = auth.uid()
    )
  );

-- Brands can accept/decline offers (update status)
CREATE POLICY "Brands can update offer status"
  ON public.booking_offers
  FOR UPDATE
  USING (
    brand_profile_id IN (
      SELECT id FROM public.brand_profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    brand_profile_id IN (
      SELECT id FROM public.brand_profiles WHERE user_id = auth.uid()
    )
  );

-- Create index for faster lookups
CREATE INDEX idx_booking_offers_conversation ON public.booking_offers(conversation_id);
CREATE INDEX idx_booking_offers_status ON public.booking_offers(status);

-- Add message_type column to messages table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'messages' 
    AND column_name = 'message_type'
  ) THEN
    ALTER TABLE public.messages ADD COLUMN message_type TEXT DEFAULT 'text';
  END IF;
END $$;

-- Add offer_id column to messages table for linking offer messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'messages' 
    AND column_name = 'offer_id'
  ) THEN
    ALTER TABLE public.messages ADD COLUMN offer_id UUID REFERENCES public.booking_offers(id);
  END IF;
END $$;