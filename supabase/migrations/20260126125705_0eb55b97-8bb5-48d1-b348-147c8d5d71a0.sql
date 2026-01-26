-- Upgrade apply_to_become_professional() to handle re-applications:
-- If a user was rejected, they can re-apply (resets status to pending)
-- This prevents infinite admin work by allowing users to fix issues and resubmit

CREATE OR REPLACE FUNCTION public.apply_to_become_professional()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  _uid uuid;
  _existing_status text;
BEGIN
  _uid := auth.uid();
  
  -- Fail-fast with structured error if not authenticated
  IF _uid IS NULL THEN
    RAISE EXCEPTION USING
      ERRCODE = '28000',
      MESSAGE = 'Not authenticated';
  END IF;
  
  -- Check if verification row already exists
  SELECT status INTO _existing_status
  FROM public.professional_verifications
  WHERE professional_id = _uid;
  
  IF _existing_status IS NULL THEN
    -- No existing row, create new pending verification
    INSERT INTO public.professional_verifications (professional_id, status)
    VALUES (_uid, 'pending');
  ELSIF _existing_status = 'rejected' THEN
    -- Allow re-application: reset rejected to pending
    UPDATE public.professional_verifications
    SET status = 'pending',
        rejection_reason = NULL,
        reviewer_notes = NULL,
        reviewed_at = NULL,
        reviewed_by = NULL,
        updated_at = now()
    WHERE professional_id = _uid;
  END IF;
  -- If status is 'pending' or 'approved', do nothing (idempotent)
  
  -- Update profile intent ONLY (do NOT change active_role here)
  -- active_role switch happens explicitly when user starts onboarding in UI
  UPDATE public.profiles
  SET intent_role = 'professional',
      updated_at = now()
  WHERE id = _uid;
  
  RETURN true;
END;
$$;