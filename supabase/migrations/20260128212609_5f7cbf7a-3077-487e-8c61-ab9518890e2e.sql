-- Phase 1: Add event-related columns to existing tables and create new tables

-- Add event-related columns to creator_profiles
ALTER TABLE public.creator_profiles 
ADD COLUMN IF NOT EXISTS event_experience_description TEXT,
ADD COLUMN IF NOT EXISTS availability_calendar JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS event_portfolio_urls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS min_event_price_cents INTEGER,
ADD COLUMN IF NOT EXISTS max_event_price_cents INTEGER,
ADD COLUMN IF NOT EXISTS travel_radius_km INTEGER DEFAULT 50;

-- Add venue-related columns to brand_profiles (repurposing for venues)
ALTER TABLE public.brand_profiles
ADD COLUMN IF NOT EXISTS venue_name TEXT,
ADD COLUMN IF NOT EXISTS venue_address TEXT,
ADD COLUMN IF NOT EXISTS venue_city TEXT,
ADD COLUMN IF NOT EXISTS venue_capacity INTEGER,
ADD COLUMN IF NOT EXISTS venue_type TEXT,
ADD COLUMN IF NOT EXISTS amenities TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS parking_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS accessibility_info TEXT;

-- Add event-related columns to bookings table
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS event_date DATE,
ADD COLUMN IF NOT EXISTS event_time_start TIME,
ADD COLUMN IF NOT EXISTS event_time_end TIME,
ADD COLUMN IF NOT EXISTS venue_id UUID REFERENCES public.brand_profiles(id),
ADD COLUMN IF NOT EXISTS event_type TEXT,
ADD COLUMN IF NOT EXISTS package_type TEXT,
ADD COLUMN IF NOT EXISTS escrow_status TEXT DEFAULT 'pending_deposit',
ADD COLUMN IF NOT EXISTS deposit_amount_cents INTEGER,
ADD COLUMN IF NOT EXISTS final_amount_cents INTEGER,
ADD COLUMN IF NOT EXISTS attendance_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_capacity INTEGER;

-- Modify creator_services for event packages
ALTER TABLE public.creator_services
ADD COLUMN IF NOT EXISTS duration_hours INTEGER,
ADD COLUMN IF NOT EXISTS includes_description TEXT,
ADD COLUMN IF NOT EXISTS min_attendees INTEGER,
ADD COLUMN IF NOT EXISTS max_attendees INTEGER;

-- Create events table for public calendar
CREATE TABLE IF NOT EXISTS public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_profile_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES public.brand_profiles(id) ON DELETE SET NULL,
  event_booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL,
  package_type TEXT,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_public BOOLEAN DEFAULT true,
  ticket_price_cents INTEGER DEFAULT 0,
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Events are publicly viewable when is_public is true
CREATE POLICY "Public events are viewable by everyone"
ON public.events FOR SELECT
USING (is_public = true OR 
  creator_profile_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()) OR
  venue_id IN (SELECT id FROM public.brand_profiles WHERE user_id = auth.uid()));

-- Creators can manage their own events
CREATE POLICY "Creators can manage their events"
ON public.events FOR ALL
USING (creator_profile_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()));

-- Venues can view events at their venue
CREATE POLICY "Venues can view their events"
ON public.events FOR SELECT
USING (venue_id IN (SELECT id FROM public.brand_profiles WHERE user_id = auth.uid()));

-- Create event_registrations table for fan attendance
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  fan_email TEXT NOT NULL,
  fan_name TEXT NOT NULL,
  fan_phone TEXT,
  status TEXT DEFAULT 'registered',
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  checked_in_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on event_registrations
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Anyone can register for public events
CREATE POLICY "Anyone can register for events"
ON public.event_registrations FOR INSERT
WITH CHECK (event_id IN (SELECT id FROM public.events WHERE is_public = true));

-- Creators and venues can view registrations for their events
CREATE POLICY "Creators and venues can view registrations"
ON public.event_registrations FOR SELECT
USING (
  event_id IN (
    SELECT e.id FROM public.events e 
    WHERE e.creator_profile_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid())
    OR e.venue_id IN (SELECT id FROM public.brand_profiles WHERE user_id = auth.uid())
  )
);

-- Create event_gallery table for post-event content
CREATE TABLE IF NOT EXISTS public.event_gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL,
  uploaded_by_creator BOOLEAN DEFAULT false,
  uploaded_by_venue BOOLEAN DEFAULT false,
  uploader_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on event_gallery
ALTER TABLE public.event_gallery ENABLE ROW LEVEL SECURITY;

-- Anyone can view gallery items for public events
CREATE POLICY "Public event galleries are viewable"
ON public.event_gallery FOR SELECT
USING (event_id IN (SELECT id FROM public.events WHERE is_public = true));

-- Creators and venues can upload to their events
CREATE POLICY "Creators can upload to their events"
ON public.event_gallery FOR INSERT
WITH CHECK (
  event_id IN (
    SELECT e.id FROM public.events e 
    WHERE e.creator_profile_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Venues can upload to their events"
ON public.event_gallery FOR INSERT
WITH CHECK (
  event_id IN (
    SELECT e.id FROM public.events e 
    WHERE e.venue_id IN (SELECT id FROM public.brand_profiles WHERE user_id = auth.uid())
  )
);

-- Create event_reviews table
CREATE TABLE IF NOT EXISTS public.event_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  reviewer_type TEXT NOT NULL,
  reviewer_id UUID,
  reviewer_email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on event_reviews
ALTER TABLE public.event_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view reviews
CREATE POLICY "Reviews are publicly viewable"
ON public.event_reviews FOR SELECT
USING (true);

-- Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews"
ON public.event_reviews FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Create escrow_transactions table
CREATE TABLE IF NOT EXISTS public.escrow_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  transaction_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on escrow_transactions
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;

-- Only admins can view escrow transactions (for now)
CREATE POLICY "Admins can manage escrow"
ON public.escrow_transactions FOR ALL
USING (
  auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin')
);

-- Participants can view their own transactions
CREATE POLICY "Participants can view their escrow"
ON public.escrow_transactions FOR SELECT
USING (
  event_booking_id IN (
    SELECT b.id FROM public.bookings b
    WHERE b.creator_profile_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid())
    OR b.brand_profile_id IN (SELECT id FROM public.brand_profiles WHERE user_id = auth.uid())
  )
);

-- Add trigger for updating events.updated_at
CREATE OR REPLACE FUNCTION public.update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_events_updated_at();