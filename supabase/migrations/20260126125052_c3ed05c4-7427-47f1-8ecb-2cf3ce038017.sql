-- Security hardening for professional verification flow
-- Phase 2-4 of the security tightening plan

-- 1. Add auth guard to apply_to_become_professional()
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
  
  -- Create pending verification entry
  INSERT INTO public.professional_verifications (professional_id, status)
  VALUES (auth.uid(), 'pending')
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

-- 2. Add rejection_reason column for user-facing messages
ALTER TABLE public.professional_verifications 
ADD COLUMN IF NOT EXISTS rejection_reason text;

COMMENT ON COLUMN public.professional_verifications.rejection_reason IS 'User-facing reason for rejection';
COMMENT ON COLUMN public.professional_verifications.reviewer_notes IS 'Internal admin notes (not shown to user)';

-- 3. Update reject_professional to use the new rejection_reason column
CREATE OR REPLACE FUNCTION public.reject_professional(_professional_id uuid, _reason text DEFAULT NULL, _notes text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  _admin_id uuid;
BEGIN
  _admin_id := auth.uid();
  
  -- Verify caller is admin
  IF NOT public.has_role(_admin_id, 'admin') THEN
    RAISE EXCEPTION 'Only admins can reject professionals';
  END IF;
  
  -- Update verification status with user-facing reason and internal notes
  UPDATE public.professional_verifications
  SET status = 'rejected',
      rejection_reason = _reason,
      reviewer_notes = _notes,
      reviewed_by = _admin_id,
      reviewed_at = now(),
      updated_at = now()
  WHERE professional_id = _professional_id;
  
  -- Log the admin action
  INSERT INTO public.admin_audit_log (admin_id, action, entity_type, entity_id, changes)
  VALUES (_admin_id, 'reject_professional', 'professional_verification', _professional_id::text, 
          jsonb_build_object('reason', _reason, 'notes', _notes));
  
  RETURN true;
END;
$$;

-- 4. Fix handle_new_user to default active_role to 'client' always
-- Store intent separately but don't switch UI context until they start onboarding
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
  INSERT INTO public.profiles (id, full_name, active_role, intent_role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'client',      -- Always start as client context
    _intent_role   -- Store intent separately for routing
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
    INSERT INTO public.professional_verifications (professional_id, status)
    VALUES (NEW.id, 'pending')
    ON CONFLICT (professional_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;