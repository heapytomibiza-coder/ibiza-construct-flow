-- =============================================================
-- Multi-Role User System - Hardened Role Assignment
-- =============================================================

-- 1. Add intent_role to profiles (stores signup intent, not authorization)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS intent_role text DEFAULT NULL;

-- 2. Replace handle_new_user trigger to always assign 'client' role
-- and store intent_role separately (no privilege escalation)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  _intent_role text;
BEGIN
  -- Extract intent (for UI routing only, not authorization)
  _intent_role := COALESCE(NEW.raw_user_meta_data->>'intent_role', 'client');
  
  -- Create profile with intent stored (not as a role)
  INSERT INTO public.profiles (id, full_name, active_role, intent_role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    _intent_role,  -- UI preference only
    _intent_role   -- Stored for reference
  )
  ON CONFLICT (id) DO UPDATE SET
    intent_role = EXCLUDED.intent_role;
  
  -- SECURITY: Always assign 'client' role - never trust user-provided role data
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- If intent is professional, auto-create pending verification request
  IF _intent_role = 'professional' THEN
    INSERT INTO public.professional_verifications (professional_id, status)
    VALUES (NEW.id, 'pending')
    ON CONFLICT (professional_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Ensure trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Admin-only RPC to approve professional verification
CREATE OR REPLACE FUNCTION public.approve_professional(
  _professional_id uuid,
  _notes text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  _admin_id uuid;
BEGIN
  _admin_id := auth.uid();
  
  -- Check caller is admin
  IF NOT public.has_role(_admin_id, 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;
  
  -- Update verification status
  UPDATE public.professional_verifications
  SET status = 'approved',
      reviewed_at = now(),
      reviewed_by = _admin_id,
      reviewer_notes = _notes,
      updated_at = now()
  WHERE professional_id = _professional_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No pending verification found for user';
  END IF;
  
  -- Grant professional role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_professional_id, 'professional'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Log admin action
  INSERT INTO public.admin_audit_log (admin_id, action, entity_type, entity_id, changes)
  VALUES (
    _admin_id,
    'approve_professional',
    'professional_verification',
    _professional_id::text,
    jsonb_build_object('notes', _notes, 'approved_at', now())
  );
  
  RETURN true;
END;
$$;

-- 4. Admin-only RPC to reject professional verification
CREATE OR REPLACE FUNCTION public.reject_professional(
  _professional_id uuid,
  _reason text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  _admin_id uuid;
BEGIN
  _admin_id := auth.uid();
  
  -- Check caller is admin
  IF NOT public.has_role(_admin_id, 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;
  
  -- Update verification status
  UPDATE public.professional_verifications
  SET status = 'rejected',
      reviewed_at = now(),
      reviewed_by = _admin_id,
      reviewer_notes = _reason,
      updated_at = now()
  WHERE professional_id = _professional_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No pending verification found for user';
  END IF;
  
  -- Log admin action
  INSERT INTO public.admin_audit_log (admin_id, action, entity_type, entity_id, changes)
  VALUES (
    _admin_id,
    'reject_professional',
    'professional_verification',
    _professional_id::text,
    jsonb_build_object('reason', _reason, 'rejected_at', now())
  );
  
  RETURN true;
END;
$$;

-- 5. Remove the old profiles trigger (now handled by auth.users trigger)
DROP TRIGGER IF EXISTS ensure_user_role_on_profile ON public.profiles;

-- 6. User-callable RPC to apply to become professional (self-service)
CREATE OR REPLACE FUNCTION public.apply_to_become_professional()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.professional_verifications (professional_id, status)
  VALUES (auth.uid(), 'pending')
  ON CONFLICT (professional_id) DO NOTHING;
  
  -- Update intent_role in profile
  UPDATE public.profiles
  SET intent_role = 'professional',
      active_role = 'professional',
      updated_at = now()
  WHERE id = auth.uid();
  
  RETURN true;
END;
$$;