-- Fix apply_to_become_professional() to:
-- 1. Use structured error code for authentication failure
-- 2. NOT update active_role (that should happen explicitly in UI when starting onboarding)

CREATE OR REPLACE FUNCTION public.apply_to_become_professional()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  _uid uuid;
BEGIN
  _uid := auth.uid();
  
  -- Fail-fast with structured error if not authenticated
  IF _uid IS NULL THEN
    RAISE EXCEPTION USING
      ERRCODE = '28000',
      MESSAGE = 'Not authenticated';
  END IF;
  
  -- Create pending verification entry
  INSERT INTO public.professional_verifications (professional_id, status)
  VALUES (_uid, 'pending')
  ON CONFLICT (professional_id) DO NOTHING;
  
  -- Update profile intent ONLY (do NOT change active_role here)
  -- active_role switch happens explicitly when user starts onboarding in UI
  UPDATE public.profiles
  SET intent_role = 'professional',
      updated_at = now()
  WHERE id = _uid;
  
  RETURN true;
END;
$$;