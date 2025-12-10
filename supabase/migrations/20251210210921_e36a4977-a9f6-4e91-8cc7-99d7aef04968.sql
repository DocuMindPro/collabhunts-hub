-- Make email column nullable for phone-based signups
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;

-- Update the handle_new_user trigger to handle phone signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id, 
    COALESCE(new.email, new.phone),  -- Use phone as fallback if no email
    new.raw_user_meta_data ->> 'full_name'
  );
  RETURN new;
END;
$$;