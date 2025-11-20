-- Clean up malformed demo users and recreate properly
-- First, delete any existing demo users and their data
DELETE FROM public.user_roles WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE '%.demo@platform.com'
);

DELETE FROM public.profiles WHERE id IN (
  SELECT id FROM auth.users WHERE email LIKE '%.demo@platform.com'
);

-- Delete from auth.users (requires proper permissions)
DELETE FROM auth.users WHERE email LIKE '%.demo@platform.com';