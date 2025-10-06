-- ============================================================================
-- Phase 1 Foundation: Admin Scopes, Job State Machine, Booking Risk Monitor
-- ============================================================================

-- 1. ADMIN SCOPES & DUAL CONTROL
-- Add scope to admin_permissions for persona separation
ALTER TABLE public.admin_permissions 
ADD COLUMN IF NOT EXISTS scope TEXT 
CHECK (scope IN ('global', 'ops', 'finance', 'moderation', 'support', 'analytics'));

-- Update existing permissions to have global scope
UPDATE public.admin_permissions SET scope = 'global' WHERE scope IS NULL;

-- Create dual control approvals for high-risk actions
CREATE TABLE IF NOT EXISTS public.dual_control_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  reason TEXT NOT NULL,
  payload JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.dual_control_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view dual control approvals"
  ON public.dual_control_approvals FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can create dual control requests"
  ON public.dual_control_approvals FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND auth.uid() = requested_by);

CREATE POLICY "Admins can approve dual control requests"
  ON public.dual_control_approvals FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) AND auth.uid() != requested_by);

-- 2. JOB STATE MACHINE & VERSIONING
-- Add workflow state to jobs
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS workflow_state TEXT DEFAULT 'draft' 
CHECK (workflow_state IN ('draft', 'published', 'matching', 'offered', 'withdrawn', 'expired', 'archived'));

-- Create job versions for edit history
CREATE TABLE IF NOT EXISTS public.job_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  changes JSONB NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  change_reason TEXT,
  invalidated_offers BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(job_id, version_number)
);

ALTER TABLE public.job_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Job owners and admins can view versions"
  ON public.job_versions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.jobs WHERE id = job_versions.job_id AND client_id = auth.uid())
    OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can create job versions"
  ON public.job_versions FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create job state transitions log
CREATE TABLE IF NOT EXISTS public.job_state_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  from_state TEXT NOT NULL,
  to_state TEXT NOT NULL,
  triggered_by UUID REFERENCES auth.users(id),
  reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.job_state_transitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view state transitions"
  ON public.job_state_transitions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert state transitions"
  ON public.job_state_transitions FOR INSERT
  WITH CHECK (true);

-- 3. BOOKING RISK MONITOR
-- Add escrow and check-in fields to bookings
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS escrow_funded_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS checkin_window_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS checkin_window_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS auto_complete_eligible_at TIMESTAMPTZ;

-- Create booking risk flags
CREATE TABLE IF NOT EXISTS public.booking_risk_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  risk_type TEXT NOT NULL CHECK (risk_type IN ('escrow_missing', 'start_soon_unconfirmed', 'availability_conflict', 'no_checkin', 'delayed_completion')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  detected_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.booking_risk_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view booking risk flags"
  ON public.booking_risk_flags FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert booking risk flags"
  ON public.booking_risk_flags FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can resolve booking risk flags"
  ON public.booking_risk_flags FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. DISPUTE WORKFLOW STATE
-- Add workflow state to disputes if not exists
ALTER TABLE public.disputes 
ADD COLUMN IF NOT EXISTS workflow_state TEXT DEFAULT 'open' 
CHECK (workflow_state IN ('open', 'evidence_gathering', 'mediation', 'decision_pending', 'appeal_window', 'resolved'));

-- Create helper function to check admin scope
CREATE OR REPLACE FUNCTION public.has_admin_scope(p_user_id uuid, p_scope text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_permissions
    WHERE admin_id = p_user_id
      AND (scope = p_scope OR scope = 'global')
  );
$$;

-- Create function to log state transitions
CREATE OR REPLACE FUNCTION public.log_job_state_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.workflow_state IS DISTINCT FROM NEW.workflow_state THEN
    INSERT INTO public.job_state_transitions (job_id, from_state, to_state, triggered_by, metadata)
    VALUES (NEW.id, OLD.workflow_state, NEW.workflow_state, auth.uid(), 
            jsonb_build_object('status', NEW.status, 'updated_at', NEW.updated_at));
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for job state transitions
DROP TRIGGER IF EXISTS job_state_transition_trigger ON public.jobs;
CREATE TRIGGER job_state_transition_trigger
  AFTER UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.log_job_state_transition();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_dual_control_status ON public.dual_control_approvals(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_job_versions_job_id ON public.job_versions(job_id);
CREATE INDEX IF NOT EXISTS idx_job_state_transitions_job_id ON public.job_state_transitions(job_id);
CREATE INDEX IF NOT EXISTS idx_booking_risk_flags_booking_id ON public.booking_risk_flags(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_risk_flags_unresolved ON public.booking_risk_flags(booking_id) WHERE resolved_at IS NULL;