-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_profile_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  brand_profile_id UUID NOT NULL REFERENCES public.brand_profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.creator_services(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed', 'cancelled')),
  message TEXT,
  booking_date TIMESTAMPTZ,
  total_price_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create conversations table
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_profile_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  brand_profile_id UUID NOT NULL REFERENCES public.brand_profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(creator_profile_id, brand_profile_id)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create profile_views table
CREATE TABLE public.profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_profile_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  viewer_id UUID,
  view_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bookings
CREATE POLICY "Creators can view their bookings"
  ON public.bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM creator_profiles
      WHERE creator_profiles.id = bookings.creator_profile_id
      AND creator_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Brands can view their bookings"
  ON public.bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM brand_profiles
      WHERE brand_profiles.id = bookings.brand_profile_id
      AND brand_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Brands can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM brand_profiles
      WHERE brand_profiles.id = bookings.brand_profile_id
      AND brand_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Creators can update their bookings"
  ON public.bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM creator_profiles
      WHERE creator_profiles.id = bookings.creator_profile_id
      AND creator_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Brands can update their bookings"
  ON public.bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM brand_profiles
      WHERE brand_profiles.id = bookings.brand_profile_id
      AND brand_profiles.user_id = auth.uid()
    )
  );

-- RLS Policies for conversations
CREATE POLICY "Creators can view their conversations"
  ON public.conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM creator_profiles
      WHERE creator_profiles.id = conversations.creator_profile_id
      AND creator_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Brands can view their conversations"
  ON public.conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM brand_profiles
      WHERE brand_profiles.id = conversations.brand_profile_id
      AND brand_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Brands can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM brand_profiles
      WHERE brand_profiles.id = conversations.brand_profile_id
      AND brand_profiles.user_id = auth.uid()
    )
  );

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      JOIN creator_profiles ON creator_profiles.id = conversations.creator_profile_id
      WHERE conversations.id = messages.conversation_id
      AND creator_profiles.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM conversations
      JOIN brand_profiles ON brand_profiles.id = conversations.brand_profile_id
      WHERE conversations.id = messages.conversation_id
      AND brand_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON public.messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      JOIN creator_profiles ON creator_profiles.id = conversations.creator_profile_id
      WHERE conversations.id = messages.conversation_id
      AND creator_profiles.user_id = auth.uid()
      AND messages.sender_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM conversations
      JOIN brand_profiles ON brand_profiles.id = conversations.brand_profile_id
      WHERE conversations.id = messages.conversation_id
      AND brand_profiles.user_id = auth.uid()
      AND messages.sender_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages"
  ON public.messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      JOIN creator_profiles ON creator_profiles.id = conversations.creator_profile_id
      WHERE conversations.id = messages.conversation_id
      AND creator_profiles.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM conversations
      JOIN brand_profiles ON brand_profiles.id = conversations.brand_profile_id
      WHERE conversations.id = messages.conversation_id
      AND brand_profiles.user_id = auth.uid()
    )
  );

-- RLS Policies for profile_views
CREATE POLICY "Creators can view their profile views"
  ON public.profile_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM creator_profiles
      WHERE creator_profiles.id = profile_views.creator_profile_id
      AND creator_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert profile views"
  ON public.profile_views FOR INSERT
  WITH CHECK (true);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Create trigger for updating bookings updated_at
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updating conversations last_message_at
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_conversation_on_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_last_message();