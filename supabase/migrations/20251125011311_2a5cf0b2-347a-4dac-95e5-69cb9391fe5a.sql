-- Fix search_path security - drop trigger first
DROP TRIGGER IF EXISTS set_dispute_stage ON public.disputes;
DROP FUNCTION IF EXISTS calculate_dispute_stage();

CREATE OR REPLACE FUNCTION calculate_dispute_stage()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
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
$$;

CREATE TRIGGER set_dispute_stage
  BEFORE INSERT OR UPDATE OF workflow_state ON public.disputes
  FOR EACH ROW
  EXECUTE FUNCTION calculate_dispute_stage();

-- Fix other functions
CREATE OR REPLACE FUNCTION execute_resolution(p_resolution_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_resolution RECORD;
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
$$;

CREATE OR REPLACE FUNCTION auto_escalate_disputes()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION detect_early_warnings()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;