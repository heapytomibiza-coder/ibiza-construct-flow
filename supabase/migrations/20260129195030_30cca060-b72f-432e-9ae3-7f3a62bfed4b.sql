-- =============================================================================
-- MIGRATION: Fix professional signup + add onboarding_completed (P0-B + P1-A)
-- =============================================================================

-- 1) Safety net default for verification_method (P0-B)
ALTER TABLE public.professional_verifications
ALTER COLUMN verification_method SET DEFAULT 'application';

-- 2) Add onboarding_completed to profiles (P1-A)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- 3) Update handle_new_user trigger to always set verification_method (P0-B)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  _intent_role text;
BEGIN
  -- Extract intent from metadata (defaults to 'client')
  _intent_role := COALESCE(NEW.raw_user_meta_data->>'intent_role', 'client');
  
  -- Create profile - always start with client active_role to prevent UX confusion
  INSERT INTO public.profiles (id, full_name, active_role, intent_role, onboarding_completed)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'client',      -- Always start as client context
    _intent_role,  -- Store intent separately for routing
    false          -- New users have not completed onboarding
  )
  ON CONFLICT (id) DO UPDATE SET
    intent_role = EXCLUDED.intent_role,
    updated_at = now();
  
  -- Everyone gets client role by default (prevents privilege escalation)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- If they signed up with professional intent, create pending verification
  IF _intent_role = 'professional' THEN
    INSERT INTO public.professional_verifications (
      professional_id, 
      status, 
      verification_method
    )
    VALUES (
      NEW.id, 
      'pending', 
      'application'
    )
    ON CONFLICT (professional_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 4) Also fix apply_to_become_professional to include verification_method
CREATE OR REPLACE FUNCTION public.apply_to_become_professional()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Fail-fast if not authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Create pending verification entry with verification_method
  INSERT INTO public.professional_verifications (
    professional_id, 
    status, 
    verification_method
  )
  VALUES (
    auth.uid(), 
    'pending', 
    'application'
  )
  ON CONFLICT (professional_id) DO NOTHING;
  
  -- Update profile to indicate professional intent and switch context
  UPDATE public.profiles
  SET intent_role = 'professional',
      active_role = 'professional',
      updated_at = now()
  WHERE id = auth.uid();
  
  RETURN true;
END;
$$;