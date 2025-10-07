-- Create new demo user accounts
-- Using DO block to handle existing users gracefully

DO $$
DECLARE
  v_client_id uuid;
  v_pro_id uuid;
  v_admin_id uuid;
BEGIN
  -- Create client demo user
  BEGIN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'client.demo@platform.com',
      crypt('ClientDemo123!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Client Demo User"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    ) RETURNING id INTO v_client_id;
  EXCEPTION WHEN unique_violation THEN
    SELECT id INTO v_client_id FROM auth.users WHERE email = 'client.demo@platform.com';
  END;

  -- Create professional demo user
  BEGIN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'pro.demo@platform.com',
      crypt('ProDemo123!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Professional Demo User"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    ) RETURNING id INTO v_pro_id;
  EXCEPTION WHEN unique_violation THEN
    SELECT id INTO v_pro_id FROM auth.users WHERE email = 'pro.demo@platform.com';
  END;

  -- Create admin demo user
  BEGIN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin.demo@platform.com',
      crypt('AdminDemo123!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Admin Demo User"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    ) RETURNING id INTO v_admin_id;
  EXCEPTION WHEN unique_violation THEN
    SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin.demo@platform.com';
  END;

  -- Create profiles
  INSERT INTO public.profiles (id, full_name, display_name, active_role)
  VALUES 
    (v_client_id, 'Client Demo User', 'Client Demo User', 'client'),
    (v_pro_id, 'Professional Demo User', 'Professional Demo User', 'professional'),
    (v_admin_id, 'Admin Demo User', 'Admin Demo User', 'admin')
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    display_name = EXCLUDED.display_name,
    active_role = EXCLUDED.active_role;

  -- Assign roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES 
    (v_client_id, 'client'::app_role),
    (v_pro_id, 'professional'::app_role),
    (v_admin_id, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;