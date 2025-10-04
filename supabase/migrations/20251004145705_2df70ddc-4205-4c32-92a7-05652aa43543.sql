-- Phase 2: Drop profiles.roles column and update trigger

-- 1. Add RLS policies for user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their own roles during signup" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roles during signup"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Update handle_new_user trigger to create user_roles entries
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  intent_role text;
BEGIN
  -- Get the intent_role from user metadata
  intent_role := COALESCE(NEW.raw_user_meta_data->>'intent_role', 'client');
  
  -- Insert into profiles table
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
  
  -- Insert into user_roles table based on intent_role
  -- Map frontend terms to database terms if needed
  IF intent_role = 'asker' OR intent_role = 'client' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'client'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSIF intent_role = 'tasker' OR intent_role = 'professional' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'professional'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    -- Default to client role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'client'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 3. Drop the profiles.roles column (now that all dependencies are fixed)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS roles CASCADE;