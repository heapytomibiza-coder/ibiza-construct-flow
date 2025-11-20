-- Create demo user accounts for testing
-- These are temporary accounts for pre-launch development only
-- DELETE before production: DELETE FROM auth.users WHERE email LIKE '%.demo@platform.com'

-- Generate fixed UUIDs for demo accounts (for consistency)
DO $$
DECLARE
  client_demo_id UUID := '00000000-0000-0000-0000-000000000001';
  pro_demo_id UUID := '00000000-0000-0000-0000-000000000002';
  admin_demo_id UUID := '00000000-0000-0000-0000-000000000003';
BEGIN

-- Insert demo users into auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
) VALUES
  (
    client_demo_id,
    '00000000-0000-0000-0000-000000000000',
    'client.demo@platform.com',
    crypt('ClientDemo123!', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Client Demo"}',
    'authenticated',
    'authenticated'
  ),
  (
    pro_demo_id,
    '00000000-0000-0000-0000-000000000000',
    'pro.demo@platform.com',
    crypt('ProDemo123!', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Professional Demo"}',
    'authenticated',
    'authenticated'
  ),
  (
    admin_demo_id,
    '00000000-0000-0000-0000-000000000000',
    'admin.demo@platform.com',
    crypt('AdminDemo123!', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Admin Demo"}',
    'authenticated',
    'authenticated'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert profiles for demo users
INSERT INTO public.profiles (
  id,
  full_name,
  display_name,
  active_role,
  tasker_onboarding_status,
  preferred_language,
  created_at,
  updated_at
) VALUES
  (
    client_demo_id,
    'Client Demo',
    'Client Demo',
    'client',
    'complete',
    'en',
    now(),
    now()
  ),
  (
    pro_demo_id,
    'Professional Demo',
    'Professional Demo',
    'professional',
    'complete',
    'en',
    now(),
    now()
  ),
  (
    admin_demo_id,
    'Admin Demo',
    'Admin Demo',
    'admin',
    'complete',
    'en',
    now(),
    now()
  )
ON CONFLICT (id) DO NOTHING;

-- Assign roles to demo users
INSERT INTO public.user_roles (user_id, role) VALUES
  (client_demo_id, 'client'),
  (pro_demo_id, 'professional'),
  (admin_demo_id, 'admin'),
  (admin_demo_id, 'professional'),
  (admin_demo_id, 'client')
ON CONFLICT (user_id, role) DO NOTHING;

END $$;