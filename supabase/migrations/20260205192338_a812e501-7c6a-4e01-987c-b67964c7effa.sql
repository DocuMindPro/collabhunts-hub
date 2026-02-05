-- Create calendar_events table to store unified calendar entries
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('booking', 'agreement', 'deadline')),
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  source_table TEXT NOT NULL CHECK (source_table IN ('bookings', 'creator_agreements')),
  source_id UUID NOT NULL,
  metadata JSONB DEFAULT '{}',
  reminder_7d_sent BOOLEAN DEFAULT FALSE,
  reminder_1d_sent BOOLEAN DEFAULT FALSE,
  reminder_0d_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX idx_calendar_events_start_date ON public.calendar_events(start_date);
CREATE INDEX idx_calendar_events_source ON public.calendar_events(source_table, source_id);
CREATE INDEX idx_calendar_events_reminders ON public.calendar_events(start_date) WHERE reminder_7d_sent = false OR reminder_1d_sent = false OR reminder_0d_sent = false;

-- Enable RLS
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- RLS policies - users can only see their own calendar events
CREATE POLICY "Users can view their own calendar events"
ON public.calendar_events FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar events"
ON public.calendar_events FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can insert calendar events"
ON public.calendar_events FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can delete their own calendar events"
ON public.calendar_events FOR DELETE
USING (auth.uid() = user_id);

-- Trigger function to create calendar events when booking status changes to accepted
CREATE OR REPLACE FUNCTION public.create_calendar_event_on_booking_accepted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  creator_user_id UUID;
  brand_user_id UUID;
  creator_name TEXT;
  brand_name TEXT;
  event_title TEXT;
  event_desc TEXT;
BEGIN
  -- Only trigger when status changes to accepted and event_date exists
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' AND NEW.event_date IS NOT NULL THEN
    -- Get creator user_id and name
    SELECT cp.user_id, cp.display_name INTO creator_user_id, creator_name
    FROM creator_profiles cp WHERE cp.id = NEW.creator_profile_id;
    
    -- Get brand user_id and name
    SELECT bp.user_id, bp.company_name INTO brand_user_id, brand_name
    FROM brand_profiles bp WHERE bp.id = NEW.brand_profile_id;
    
    event_title := 'Event with ' || COALESCE(brand_name, 'Brand');
    event_desc := COALESCE(NEW.package_type, 'Event') || ' booking';
    
    -- Create calendar event for creator
    INSERT INTO calendar_events (user_id, event_type, title, description, start_date, start_time, end_time, source_table, source_id, metadata)
    VALUES (
      creator_user_id,
      'booking',
      event_title,
      event_desc,
      NEW.event_date::date,
      NEW.event_time_start::time,
      NEW.event_time_end::time,
      'bookings',
      NEW.id,
      jsonb_build_object(
        'package_type', NEW.package_type,
        'total_price_cents', NEW.total_price_cents,
        'brand_name', brand_name,
        'creator_name', creator_name
      )
    );
    
    -- Create calendar event for brand
    event_title := 'Event with ' || COALESCE(creator_name, 'Creator');
    INSERT INTO calendar_events (user_id, event_type, title, description, start_date, start_time, end_time, source_table, source_id, metadata)
    VALUES (
      brand_user_id,
      'booking',
      event_title,
      event_desc,
      NEW.event_date::date,
      NEW.event_time_start::time,
      NEW.event_time_end::time,
      'bookings',
      NEW.id,
      jsonb_build_object(
        'package_type', NEW.package_type,
        'total_price_cents', NEW.total_price_cents,
        'brand_name', brand_name,
        'creator_name', creator_name
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on bookings table
CREATE TRIGGER trigger_create_calendar_on_booking_accepted
AFTER UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.create_calendar_event_on_booking_accepted();

-- Trigger function to create calendar events when agreement is confirmed
CREATE OR REPLACE FUNCTION public.create_calendar_event_on_agreement_confirmed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  creator_user_id UUID;
  brand_user_id UUID;
  creator_name TEXT;
  brand_name TEXT;
  event_title TEXT;
BEGIN
  -- Only trigger when status changes to confirmed and event_date exists
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' AND NEW.event_date IS NOT NULL THEN
    -- Get creator user_id and name
    SELECT cp.user_id, cp.display_name INTO creator_user_id, creator_name
    FROM creator_profiles cp WHERE cp.id = NEW.creator_profile_id;
    
    -- Get brand user_id and name
    SELECT bp.user_id, bp.company_name INTO brand_user_id, brand_name
    FROM brand_profiles bp WHERE bp.id = NEW.brand_profile_id;
    
    event_title := 'Agreement with ' || COALESCE(brand_name, 'Brand');
    
    -- Create calendar event for creator
    INSERT INTO calendar_events (user_id, event_type, title, description, start_date, start_time, source_table, source_id, metadata)
    VALUES (
      creator_user_id,
      'agreement',
      event_title,
      NEW.template_type || ' agreement',
      NEW.event_date::date,
      NEW.event_time::time,
      'creator_agreements',
      NEW.id,
      jsonb_build_object(
        'template_type', NEW.template_type,
        'proposed_price_cents', NEW.proposed_price_cents,
        'brand_name', brand_name,
        'creator_name', creator_name,
        'duration_hours', NEW.duration_hours
      )
    );
    
    -- Create calendar event for brand
    event_title := 'Agreement with ' || COALESCE(creator_name, 'Creator');
    INSERT INTO calendar_events (user_id, event_type, title, description, start_date, start_time, source_table, source_id, metadata)
    VALUES (
      brand_user_id,
      'agreement',
      event_title,
      NEW.template_type || ' agreement',
      NEW.event_date::date,
      NEW.event_time::time,
      'creator_agreements',
      NEW.id,
      jsonb_build_object(
        'template_type', NEW.template_type,
        'proposed_price_cents', NEW.proposed_price_cents,
        'brand_name', brand_name,
        'creator_name', creator_name,
        'duration_hours', NEW.duration_hours
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on creator_agreements table
CREATE TRIGGER trigger_create_calendar_on_agreement_confirmed
AFTER UPDATE ON public.creator_agreements
FOR EACH ROW
EXECUTE FUNCTION public.create_calendar_event_on_agreement_confirmed();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_calendar_events_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger for updated_at
CREATE TRIGGER update_calendar_events_updated_at
BEFORE UPDATE ON public.calendar_events
FOR EACH ROW
EXECUTE FUNCTION public.update_calendar_events_updated_at();

-- Enable realtime for calendar_events
ALTER PUBLICATION supabase_realtime ADD TABLE public.calendar_events;