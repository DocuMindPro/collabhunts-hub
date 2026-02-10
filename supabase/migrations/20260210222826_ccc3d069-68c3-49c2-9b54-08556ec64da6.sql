
-- Create feedbacks table
CREATE TABLE public.feedbacks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  details TEXT NOT NULL,
  rating INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert feedback (public form)
CREATE POLICY "Anyone can submit feedback"
ON public.feedbacks
FOR INSERT
WITH CHECK (true);

-- Only admins can view feedbacks
CREATE POLICY "Admins can view all feedbacks"
ON public.feedbacks
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Only admins can update feedbacks (change status)
CREATE POLICY "Admins can update feedbacks"
ON public.feedbacks
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Validation trigger to ensure rating is 1-3
CREATE OR REPLACE FUNCTION public.validate_feedback_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.rating < 1 OR NEW.rating > 3 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 3';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER validate_feedback_rating_trigger
BEFORE INSERT OR UPDATE ON public.feedbacks
FOR EACH ROW
EXECUTE FUNCTION public.validate_feedback_rating();
