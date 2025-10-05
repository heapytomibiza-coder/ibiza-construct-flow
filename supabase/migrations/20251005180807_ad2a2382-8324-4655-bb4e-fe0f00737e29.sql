-- Create professional_verifications table
CREATE TABLE public.professional_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.professional_profiles(user_id) ON DELETE CASCADE,
  verification_method TEXT NOT NULL CHECK (verification_method IN ('id_document', 'business_license', 'certification', 'insurance')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  notes TEXT,
  reviewer_notes TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.professional_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Professionals can insert their own verification requests
CREATE POLICY "Professionals can submit verifications"
ON public.professional_verifications
FOR INSERT
TO authenticated
WITH CHECK (professional_id = auth.uid());

-- RLS Policy: Professionals can view their own verifications
CREATE POLICY "Professionals can view own verifications"
ON public.professional_verifications
FOR SELECT
TO authenticated
USING (professional_id = auth.uid());

-- RLS Policy: Admins can view all verifications
CREATE POLICY "Admins can view all verifications"
ON public.professional_verifications
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- RLS Policy: Admins can update verifications
CREATE POLICY "Admins can update verifications"
ON public.professional_verifications
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX idx_professional_verifications_professional_id 
ON public.professional_verifications(professional_id);

CREATE INDEX idx_professional_verifications_status 
ON public.professional_verifications(status);

CREATE INDEX idx_professional_verifications_professional_status 
ON public.professional_verifications(professional_id, status);

-- Add trigger for updated_at timestamp
CREATE TRIGGER update_professional_verifications_updated_at
BEFORE UPDATE ON public.professional_verifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to update onboarding checklist when verification is approved
CREATE OR REPLACE FUNCTION public.handle_verification_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only proceed if status changed to 'approved'
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
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
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_verification_approval
AFTER UPDATE ON public.professional_verifications
FOR EACH ROW
EXECUTE FUNCTION public.handle_verification_approval();