-- Update approve_professional to ensure both client and professional roles exist
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
  
  -- Ensure client role also exists (for role switching)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_professional_id, 'client'::app_role)
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

-- Backfill: ensure all existing professionals also have client role
INSERT INTO public.user_roles (user_id, role)
SELECT ur.user_id, 'client'::app_role
FROM public.user_roles ur
WHERE ur.role = 'professional'
ON CONFLICT (user_id, role) DO NOTHING;