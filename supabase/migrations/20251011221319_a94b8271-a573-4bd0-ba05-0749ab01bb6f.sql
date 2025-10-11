-- Fix handle_verification_approval() to update professional_profiles.onboarding_phase
CREATE OR REPLACE FUNCTION public.handle_verification_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only proceed if status changed to 'approved'
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Update professional_profiles onboarding_phase to 'verified'
    UPDATE public.professional_profiles
    SET 
      onboarding_phase = 'verified',
      verification_status = 'verified',
      updated_at = now()
    WHERE user_id = NEW.professional_id;
    
    -- Update onboarding_checklist to mark verification step as completed
    UPDATE public.onboarding_checklist
    SET 
      status = 'completed',
      completed_at = now(),
      updated_at = now()
    WHERE user_id = NEW.professional_id
      AND step_id = 'verification'
      AND status != 'completed';
    
    -- Log the event
    INSERT INTO public.onboarding_events (
      user_id,
      step_id,
      event_type,
      metadata
    ) VALUES (
      NEW.professional_id,
      'verification',
      'completed',
      jsonb_build_object(
        'verification_id', NEW.id,
        'verification_method', NEW.verification_method,
        'reviewed_by', NEW.reviewed_by,
        'auto_completed', true
      )
    );
  -- Handle rejection to keep user in verification_pending
  ELSIF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
    UPDATE public.professional_profiles
    SET 
      onboarding_phase = 'verification_pending',
      verification_status = 'rejected',
      rejection_reason = NEW.rejection_reason,
      updated_at = now()
    WHERE user_id = NEW.professional_id;
  END IF;
  
  RETURN NEW;
END;
$$;