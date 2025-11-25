-- Drop existing function to recreate with new return type
DROP FUNCTION IF EXISTS execute_resolution(UUID);

-- Trust-First Enhancements
ALTER TABLE public.disputes 
  ADD COLUMN IF NOT EXISTS stage INTEGER DEFAULT 1 CHECK (stage >= 1 AND stage <= 5),
  ADD COLUMN IF NOT EXISTS cooling_off_period_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS auto_escalation_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS escrow_frozen BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS escrow_amount DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS false_claim_flag BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS technical_validation_required BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS evidence_deadline TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS mediation_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS resolution_deadline TIMESTAMPTZ;

ALTER TABLE public.dispute_evidence
  ADD COLUMN IF NOT EXISTS uploaded_by_role TEXT CHECK (uploaded_by_role IN ('client', 'professional', 'admin')),
  ADD COLUMN IF NOT EXISTS timestamp_claimed TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_by UUID,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

UPDATE public.dispute_evidence e
SET uploaded_by_role = CASE
  WHEN e.uploaded_by IN (SELECT created_by FROM disputes WHERE id = e.dispute_id) THEN 'client'
  WHEN e.uploaded_by IN (SELECT disputed_against FROM disputes WHERE id = e.dispute_id) THEN 'professional'
  ELSE 'admin'
END
WHERE uploaded_by_role IS NULL;

ALTER TABLE public.dispute_resolutions
  ADD COLUMN IF NOT EXISTS proposed_by TEXT CHECK (proposed_by IN ('platform', 'client', 'professional', 'mediator')),
  ADD COLUMN IF NOT EXISTS proposed_by_user_id UUID,
  ADD COLUMN IF NOT EXISTS client_response_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS professional_response_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS work_required TEXT,
  ADD COLUMN IF NOT EXISTS timeline_days INTEGER,
  ADD COLUMN IF NOT EXISTS client_status TEXT DEFAULT 'pending' CHECK (client_status IN ('pending', 'accepted', 'rejected', 'counter_proposed')),
  ADD COLUMN IF NOT EXISTS professional_status TEXT DEFAULT 'pending' CHECK (professional_status IN ('pending', 'accepted', 'rejected', 'counter_proposed'));

-- Migrate boolean to status if columns exist
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dispute_resolutions' AND column_name = 'party_client_agreed') THEN
    UPDATE public.dispute_resolutions
    SET 
      client_status = CASE WHEN party_client_agreed = true THEN 'accepted'::text WHEN party_client_agreed = false THEN 'rejected'::text ELSE 'pending'::text END,
      professional_status = CASE WHEN party_professional_agreed = true THEN 'accepted'::text WHEN party_professional_agreed = false THEN 'rejected'::text ELSE 'pending'::text END
    WHERE client_status = 'pending';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.early_warnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
  warning_type TEXT NOT NULL CHECK (warning_type IN (
    'communication_gap', 'missed_milestone', 'payment_overdue',
    'quality_concern', 'scope_creep', 'timeline_risk', 'escrow_delay'
  )),
  severity TEXT NOT NULL DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  suggested_action TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'dismissed', 'escalated_to_dispute')),
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  dismissed_by UUID,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.enforcement_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'escrow_frozen', 'escrow_released', 'escrow_partial_release',
    'warning_issued', 'deadline_set', 'evidence_requested',
    'expert_assigned', 'mediation_scheduled', 'resolution_proposed',
    'resolution_executed', 'dispute_escalated', 'false_claim_flagged',
    'cooling_off_started', 'auto_escalation_triggered'
  )),
  performed_by TEXT NOT NULL CHECK (performed_by IN ('system', 'admin', 'mediator', 'client', 'professional')),
  performed_by_user_id UUID,
  action_details TEXT NOT NULL,
  amount_affected DECIMAL(10,2),
  deadline_set TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.early_warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enforcement_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view warnings for their jobs" ON public.early_warnings;
CREATE POLICY "Users can view warnings for their jobs"
  ON public.early_warnings FOR SELECT
  USING (
    (job_id IN (SELECT id FROM public.jobs WHERE client_id = auth.uid())) OR
    (contract_id IN (SELECT id FROM public.contracts WHERE client_id = auth.uid() OR tasker_id = auth.uid())) OR
    has_role(auth.uid(), 'admin')
  );

DROP POLICY IF EXISTS "System can create warnings" ON public.early_warnings;
CREATE POLICY "System can create warnings"
  ON public.early_warnings FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can resolve their warnings" ON public.early_warnings;
CREATE POLICY "Users can resolve their warnings"
  ON public.early_warnings FOR UPDATE
  USING (
    (job_id IN (SELECT id FROM public.jobs WHERE client_id = auth.uid())) OR
    (contract_id IN (SELECT id FROM public.contracts WHERE client_id = auth.uid() OR tasker_id = auth.uid())) OR
    has_role(auth.uid(), 'admin')
  );

DROP POLICY IF EXISTS "Users can view logs for their disputes" ON public.enforcement_logs;
CREATE POLICY "Users can view logs for their disputes"
  ON public.enforcement_logs FOR SELECT
  USING (
    dispute_id IN (SELECT id FROM public.disputes WHERE created_by = auth.uid() OR disputed_against = auth.uid()) 
    OR has_role(auth.uid(), 'admin')
  );

DROP POLICY IF EXISTS "System and admins can create logs" ON public.enforcement_logs;
CREATE POLICY "System and admins can create logs"
  ON public.enforcement_logs FOR INSERT
  WITH CHECK (performed_by IN ('system', 'admin') OR has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_disputes_stage ON public.disputes(stage);
CREATE INDEX IF NOT EXISTS idx_disputes_escrow_frozen ON public.disputes(escrow_frozen) WHERE escrow_frozen = true;
CREATE INDEX IF NOT EXISTS idx_early_warnings_job_id ON public.early_warnings(job_id);
CREATE INDEX IF NOT EXISTS idx_early_warnings_contract_id ON public.early_warnings(contract_id);
CREATE INDEX IF NOT EXISTS idx_enforcement_logs_dispute_id ON public.enforcement_logs(dispute_id);

DROP TRIGGER IF EXISTS set_dispute_stage ON public.disputes;
CREATE OR REPLACE FUNCTION calculate_dispute_stage()
RETURNS TRIGGER AS $$
BEGIN
  NEW.stage = CASE
    WHEN NEW.workflow_state IN ('open', 'pending') THEN 1
    WHEN NEW.workflow_state IN ('evidence_gathering') THEN 2
    WHEN NEW.workflow_state IN ('under_review', 'mediation', 'in_progress') THEN 3
    WHEN NEW.workflow_state IN ('awaiting_response', 'awaiting_payment') THEN 4
    WHEN NEW.workflow_state IN ('resolved', 'escalated', 'closed', 'cancelled') THEN 5
    ELSE COALESCE(NEW.stage, 1)
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_dispute_stage
  BEFORE INSERT OR UPDATE OF workflow_state ON public.disputes
  FOR EACH ROW
  EXECUTE FUNCTION calculate_dispute_stage();

CREATE OR REPLACE FUNCTION execute_resolution(p_resolution_id UUID)
RETURNS jsonb AS $$
DECLARE
  v_resolution RECORD;
  v_result jsonb;
BEGIN
  SELECT * INTO v_resolution FROM dispute_resolutions WHERE id = p_resolution_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Resolution not found'; END IF;
  IF v_resolution.client_status != 'accepted' OR v_resolution.professional_status != 'accepted' THEN
    RAISE EXCEPTION 'Both parties must accept before execution';
  END IF;
  
  UPDATE dispute_resolutions SET status = 'executed', finalized_at = now(), agreement_finalized_at = now() WHERE id = p_resolution_id;
  UPDATE disputes SET status = 'resolved', workflow_state = 'resolved', resolved_at = now(), resolution_amount = v_resolution.amount WHERE id = v_resolution.dispute_id;
  UPDATE disputes SET escrow_frozen = false WHERE id = v_resolution.dispute_id AND escrow_frozen = true;
  
  INSERT INTO enforcement_logs (dispute_id, action_type, performed_by, action_details, amount_affected)
  VALUES (v_resolution.dispute_id, 'resolution_executed', 'system', 'Resolution executed: ' || v_resolution.resolution_type, v_resolution.amount);
  
  RETURN jsonb_build_object('success', true, 'resolution_id', p_resolution_id, 'dispute_id', v_resolution.dispute_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auto_escalate_disputes()
RETURNS jsonb AS $$
DECLARE
  v_escalated INTEGER := 0;
  v_dispute RECORD;
BEGIN
  FOR v_dispute IN
    SELECT * FROM disputes WHERE workflow_state IN ('open', 'awaiting_response') AND response_deadline < now() AND auto_escalation_count < 3
  LOOP
    UPDATE disputes SET auto_escalation_count = auto_escalation_count + 1, response_deadline = now() + interval '48 hours' WHERE id = v_dispute.id;
    INSERT INTO enforcement_logs (dispute_id, action_type, performed_by, action_details)
    VALUES (v_dispute.id, 'auto_escalation_triggered', 'system', 'Auto-escalated - no response');
    v_escalated := v_escalated + 1;
  END LOOP;
  RETURN jsonb_build_object('success', true, 'escalated', v_escalated);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION detect_early_warnings()
RETURNS jsonb AS $$
DECLARE
  v_warnings INTEGER := 0;
  v_contract RECORD;
BEGIN
  FOR v_contract IN
    SELECT c.*, j.title FROM contracts c JOIN jobs j ON j.id = c.job_id
    WHERE c.escrow_status = 'none' AND c.created_at < (now() - interval '7 days')
    AND NOT EXISTS (SELECT 1 FROM early_warnings WHERE contract_id = c.id AND warning_type = 'payment_overdue' AND status = 'active')
  LOOP
    INSERT INTO early_warnings (contract_id, job_id, warning_type, severity, title, description, suggested_action)
    VALUES (v_contract.id, v_contract.job_id, 'payment_overdue', 'medium', 'Payment Setup Delayed', 
      'Contract pending payment for 7+ days', 'Complete payment setup to secure booking');
    v_warnings := v_warnings + 1;
  END LOOP;
  RETURN jsonb_build_object('success', true, 'warnings_created', v_warnings);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;