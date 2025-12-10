-- Create booking_disputes table for dispute resolution system
CREATE TABLE public.booking_disputes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  opened_by_user_id UUID NOT NULL,
  opened_by_role TEXT NOT NULL CHECK (opened_by_role IN ('brand', 'creator')),
  reason TEXT NOT NULL,
  evidence_description TEXT,
  status TEXT NOT NULL DEFAULT 'pending_response' CHECK (status IN ('pending_response', 'pending_admin_review', 'resolved_refund', 'resolved_release', 'resolved_split', 'cancelled')),
  response_text TEXT,
  response_submitted_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  admin_decision_reason TEXT,
  resolved_by_user_id UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  refund_percentage INTEGER CHECK (refund_percentage >= 0 AND refund_percentage <= 100),
  response_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  resolution_deadline TIMESTAMP WITH TIME ZONE,
  reminder_sent_day2 BOOLEAN DEFAULT false,
  reminder_sent_day3 BOOLEAN DEFAULT false,
  escalated_to_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(booking_id)
);

-- Enable RLS
ALTER TABLE public.booking_disputes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Brands can view disputes for their bookings"
ON public.booking_disputes FOR SELECT
USING (EXISTS (
  SELECT 1 FROM bookings b
  JOIN brand_profiles bp ON bp.id = b.brand_profile_id
  WHERE b.id = booking_disputes.booking_id AND bp.user_id = auth.uid()
));

CREATE POLICY "Creators can view disputes for their bookings"
ON public.booking_disputes FOR SELECT
USING (EXISTS (
  SELECT 1 FROM bookings b
  JOIN creator_profiles cp ON cp.id = b.creator_profile_id
  WHERE b.id = booking_disputes.booking_id AND cp.user_id = auth.uid()
));

CREATE POLICY "Admins can view all disputes"
ON public.booking_disputes FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Brands can create disputes for their bookings"
ON public.booking_disputes FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM bookings b
  JOIN brand_profiles bp ON bp.id = b.brand_profile_id
  WHERE b.id = booking_disputes.booking_id AND bp.user_id = auth.uid()
));

CREATE POLICY "Creators can create disputes for their bookings"
ON public.booking_disputes FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM bookings b
  JOIN creator_profiles cp ON cp.id = b.creator_profile_id
  WHERE b.id = booking_disputes.booking_id AND cp.user_id = auth.uid()
));

CREATE POLICY "Users can update disputes they are party to"
ON public.booking_disputes FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM bookings b
    JOIN brand_profiles bp ON bp.id = b.brand_profile_id
    WHERE b.id = booking_disputes.booking_id AND bp.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM bookings b
    JOIN creator_profiles cp ON cp.id = b.creator_profile_id
    WHERE b.id = booking_disputes.booking_id AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all disputes"
ON public.booking_disputes FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Trigger to update updated_at
CREATE TRIGGER update_booking_disputes_updated_at
BEFORE UPDATE ON public.booking_disputes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Notification trigger when dispute is opened
CREATE OR REPLACE FUNCTION public.notify_dispute_opened()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  other_user_id UUID;
  opener_name TEXT;
  booking_info RECORD;
BEGIN
  -- Get booking details
  SELECT b.*, bp.company_name, bp.user_id as brand_user_id, cp.display_name, cp.user_id as creator_user_id
  INTO booking_info
  FROM bookings b
  JOIN brand_profiles bp ON bp.id = b.brand_profile_id
  JOIN creator_profiles cp ON cp.id = b.creator_profile_id
  WHERE b.id = NEW.booking_id;

  -- Determine who to notify
  IF NEW.opened_by_role = 'brand' THEN
    other_user_id := booking_info.creator_user_id;
    opener_name := booking_info.company_name;
  ELSE
    other_user_id := booking_info.brand_user_id;
    opener_name := booking_info.display_name;
  END IF;

  -- Notify the other party
  INSERT INTO public.notifications (user_id, title, message, type, link)
  VALUES (
    other_user_id,
    '⚠️ Dispute Opened',
    opener_name || ' has opened a dispute. You have 3 days to respond.',
    'dispute',
    CASE WHEN NEW.opened_by_role = 'brand' THEN '/creator-dashboard?tab=bookings' ELSE '/brand-dashboard?tab=bookings' END
  );

  -- Notify admins
  INSERT INTO public.notifications (user_id, title, message, type, link)
  SELECT 
    user_roles.user_id,
    '🔔 New Dispute Filed',
    opener_name || ' opened a dispute requiring attention.',
    'dispute',
    '/admin?tab=disputes'
  FROM public.user_roles
  WHERE user_roles.role = 'admin';

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_dispute_opened
AFTER INSERT ON public.booking_disputes
FOR EACH ROW
EXECUTE FUNCTION public.notify_dispute_opened();

-- Notification trigger when dispute response is submitted
CREATE OR REPLACE FUNCTION public.notify_dispute_response()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  opener_user_id UUID;
  responder_name TEXT;
  booking_info RECORD;
BEGIN
  -- Only trigger when response is submitted
  IF OLD.response_text IS NULL AND NEW.response_text IS NOT NULL THEN
    -- Get booking details
    SELECT b.*, bp.company_name, bp.user_id as brand_user_id, cp.display_name, cp.user_id as creator_user_id
    INTO booking_info
    FROM bookings b
    JOIN brand_profiles bp ON bp.id = b.brand_profile_id
    JOIN creator_profiles cp ON cp.id = b.creator_profile_id
    WHERE b.id = NEW.booking_id;

    -- Determine who opened and who responded
    IF NEW.opened_by_role = 'brand' THEN
      opener_user_id := booking_info.brand_user_id;
      responder_name := booking_info.display_name;
    ELSE
      opener_user_id := booking_info.creator_user_id;
      responder_name := booking_info.company_name;
    END IF;

    -- Notify the opener
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      opener_user_id,
      '💬 Dispute Response Received',
      responder_name || ' has responded to your dispute.',
      'dispute',
      CASE WHEN NEW.opened_by_role = 'brand' THEN '/brand-dashboard?tab=bookings' ELSE '/creator-dashboard?tab=bookings' END
    );

    -- Notify admins that review is needed
    INSERT INTO public.notifications (user_id, title, message, type, link)
    SELECT 
      user_roles.user_id,
      '⏳ Dispute Ready for Review',
      'A dispute response has been submitted. Admin review required.',
      'dispute',
      '/admin?tab=disputes'
    FROM public.user_roles
    WHERE user_roles.role = 'admin';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_dispute_response
AFTER UPDATE ON public.booking_disputes
FOR EACH ROW
EXECUTE FUNCTION public.notify_dispute_response();

-- Notification trigger when dispute is resolved
CREATE OR REPLACE FUNCTION public.notify_dispute_resolved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  booking_info RECORD;
  resolution_msg TEXT;
BEGIN
  -- Only trigger when status changes to resolved
  IF OLD.status NOT LIKE 'resolved_%' AND NEW.status LIKE 'resolved_%' THEN
    -- Get booking details
    SELECT b.*, bp.company_name, bp.user_id as brand_user_id, cp.display_name, cp.user_id as creator_user_id
    INTO booking_info
    FROM bookings b
    JOIN brand_profiles bp ON bp.id = b.brand_profile_id
    JOIN creator_profiles cp ON cp.id = b.creator_profile_id
    WHERE b.id = NEW.booking_id;

    -- Determine resolution message
    IF NEW.status = 'resolved_refund' THEN
      resolution_msg := 'Full refund issued to brand.';
    ELSIF NEW.status = 'resolved_release' THEN
      resolution_msg := 'Full payment released to creator.';
    ELSE
      resolution_msg := 'Payment split: ' || (100 - COALESCE(NEW.refund_percentage, 0)) || '% to creator, ' || COALESCE(NEW.refund_percentage, 0) || '% refunded.';
    END IF;

    -- Notify brand
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      booking_info.brand_user_id,
      '✅ Dispute Resolved',
      resolution_msg,
      'dispute',
      '/brand-dashboard?tab=bookings'
    );

    -- Notify creator
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      booking_info.creator_user_id,
      '✅ Dispute Resolved',
      resolution_msg,
      'dispute',
      '/creator-dashboard?tab=bookings'
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_dispute_resolved
AFTER UPDATE ON public.booking_disputes
FOR EACH ROW
EXECUTE FUNCTION public.notify_dispute_resolved();

-- Enable realtime for disputes
ALTER PUBLICATION supabase_realtime ADD TABLE public.booking_disputes;