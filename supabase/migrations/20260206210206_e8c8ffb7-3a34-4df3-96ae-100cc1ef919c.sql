
-- Allow admins to insert featuring records
CREATE POLICY "Admins can insert featuring"
ON public.creator_featuring FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Allow admins to update featuring records
CREATE POLICY "Admins can update featuring"
ON public.creator_featuring FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Allow admins to view all featuring records
CREATE POLICY "Admins can view all featuring"
ON public.creator_featuring FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
