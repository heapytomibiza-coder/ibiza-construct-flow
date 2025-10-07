-- Update handle_new_user function to give all users both client and professional roles
-- This allows users to switch between roles freely with the same email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  intent_role text;
BEGIN
  -- Get the intent_role from user metadata (determines default active_role)
  intent_role := COALESCE(NEW.raw_user_meta_data->>'intent_role', 'client');
  
  -- Map frontend terms to database terms
  IF intent_role = 'asker' THEN
    intent_role := 'client';
  ELSIF intent_role = 'tasker' THEN
    intent_role := 'professional';
  END IF;
  
  -- Insert into profiles table with their chosen active_role
  INSERT INTO public.profiles (id, full_name, active_role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    intent_role
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    active_role = EXCLUDED.active_role,
    updated_at = now();
  
  -- ALWAYS create BOTH client and professional roles for all users
  -- This allows users to access both sides of the platform
  INSERT INTO public.user_roles (user_id, role)
  VALUES 
    (NEW.id, 'client'::app_role),
    (NEW.id, 'professional'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;