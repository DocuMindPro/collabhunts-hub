-- Insert missing profile for existing user
INSERT INTO public.profiles (id, email, full_name)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', '')
FROM auth.users
WHERE email = 'elie.goole@gmail.com'
ON CONFLICT (id) DO NOTHING;