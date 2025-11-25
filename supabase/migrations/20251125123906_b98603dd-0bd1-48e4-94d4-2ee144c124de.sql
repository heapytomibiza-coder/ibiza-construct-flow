-- Phase 9: Dispute Resolution & Mediation System Enhancement

-- Create counter_proposals table
CREATE TABLE IF NOT EXISTS public.counter_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
  proposed_by UUID NOT NULL REFERENCES public.profiles(id),
  proposal_type TEXT NOT NULL CHECK (proposal_type IN ('settlement', 'payment_plan', 'scope_change', 'timeline_adjustment')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired', 'superseded')),
  amount NUMERIC,
  currency TEXT DEFAULT 'EUR',
  terms JSONB NOT NULL DEFAULT '{}',
  notes TEXT,
  expires_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  responded_by UUID REFERENCES public.profiles(id),
  response_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create mediation_sessions table
CREATE TABLE IF NOT EXISTS public.mediation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
  mediator_id UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  session_type TEXT NOT NULL CHECK (session_type IN ('video', 'phone', 'chat', 'email')),
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  outcome TEXT,
  notes TEXT,
  meeting_link TEXT,
  recording_url TEXT,
  transcript JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create dispute_escalation_history table
CREATE TABLE IF NOT EXISTS public.dispute_escalation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
  escalation_level INTEGER NOT NULL,
  reason TEXT NOT NULL,
  escalated_by UUID REFERENCES public.profiles(id),
  escalation_type TEXT NOT NULL CHECK (escalation_type IN ('auto', 'manual', 'timeout', 'complexity')),
  previous_state TEXT,
  new_state TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create resolution_execution_log table
CREATE TABLE IF NOT EXISTS public.resolution_execution_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resolution_id UUID NOT NULL REFERENCES public.dispute_resolutions(id) ON DELETE CASCADE,
  execution_step TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  details TEXT,
  executed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_counter_proposals_dispute ON public.counter_proposals(dispute_id);
CREATE INDEX IF NOT EXISTS idx_counter_proposals_status ON public.counter_proposals(status);
CREATE INDEX IF NOT EXISTS idx_mediation_sessions_dispute ON public.mediation_sessions(dispute_id);
CREATE INDEX IF NOT EXISTS idx_mediation_sessions_status ON public.mediation_sessions(status);
CREATE INDEX IF NOT EXISTS idx_escalation_history_dispute ON public.dispute_escalation_history(dispute_id);
CREATE INDEX IF NOT EXISTS idx_resolution_execution_resolution ON public.resolution_execution_log(resolution_id);

-- Enable RLS
ALTER TABLE public.counter_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mediation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispute_escalation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resolution_execution_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for counter_proposals
CREATE POLICY "Users can view counter proposals for their disputes"
  ON public.counter_proposals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.disputes d
      WHERE d.id = counter_proposals.dispute_id
      AND (d.created_by = auth.uid() OR d.disputed_against = auth.uid())
    )
  );

CREATE POLICY "Users can create counter proposals for their disputes"
  ON public.counter_proposals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.disputes d
      WHERE d.id = dispute_id
      AND (d.created_by = auth.uid() OR d.disputed_against = auth.uid())
    )
    AND proposed_by = auth.uid()
  );

CREATE POLICY "Users can update their own counter proposals"
  ON public.counter_proposals FOR UPDATE
  USING (proposed_by = auth.uid());

-- RLS Policies for mediation_sessions
CREATE POLICY "Users can view mediation sessions for their disputes"
  ON public.mediation_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.disputes d
      WHERE d.id = mediation_sessions.dispute_id
      AND (d.created_by = auth.uid() OR d.disputed_against = auth.uid())
    )
  );

-- RLS Policies for escalation history
CREATE POLICY "Users can view escalation history for their disputes"
  ON public.dispute_escalation_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.disputes d
      WHERE d.id = dispute_escalation_history.dispute_id
      AND (d.created_by = auth.uid() OR d.disputed_against = auth.uid())
    )
  );

-- RLS Policies for resolution execution log
CREATE POLICY "Users can view execution log for their dispute resolutions"
  ON public.resolution_execution_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.dispute_resolutions dr
      JOIN public.disputes d ON d.id = dr.dispute_id
      WHERE dr.id = resolution_execution_log.resolution_id
      AND (d.created_by = auth.uid() OR d.disputed_against = auth.uid())
    )
  );

-- Function to escalate dispute automatically
CREATE OR REPLACE FUNCTION public.escalation_reasons_updater(p_dispute_id UUID, p_reason TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_dispute RECORD;
  v_new_level INTEGER;
BEGIN
  SELECT * INTO v_dispute FROM public.disputes WHERE id = p_dispute_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Dispute not found');
  END IF;
  
  v_new_level := COALESCE(v_dispute.auto_escalation_count, 0) + 1;
  
  UPDATE public.disputes
  SET 
    auto_escalation_count = v_new_level,
    response_deadline = now() + interval '48 hours',
    workflow_state = CASE 
      WHEN v_new_level >= 3 THEN 'escalated'
      ELSE workflow_state
    END
  WHERE id = p_dispute_id;
  
  INSERT INTO public.dispute_escalation_history (
    dispute_id,
    escalation_level,
    reason,
    escalation_type,
    previous_state,
    new_state
  ) VALUES (
    p_dispute_id,
    v_new_level,
    p_reason,
    'auto',
    v_dispute.workflow_state,
    CASE WHEN v_new_level >= 3 THEN 'escalated' ELSE v_dispute.workflow_state END
  );
  
  INSERT INTO public.activity_feed (
    user_id,
    event_type,
    entity_type,
    entity_id,
    title,
    description,
    priority
  ) VALUES
    (v_dispute.created_by, 'dispute_escalated', 'dispute', p_dispute_id, 
     'Dispute Escalated', 'Your dispute has been automatically escalated due to: ' || p_reason, 'high'),
    (v_dispute.disputed_against, 'dispute_escalated', 'dispute', p_dispute_id,
     'Dispute Escalated', 'A dispute against you has been escalated due to: ' || p_reason, 'high');
  
  RETURN jsonb_build_object('success', true, 'level', v_new_level);
END;
$$;

-- Function to update counter proposal status
CREATE OR REPLACE FUNCTION public.update_counter_proposal_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    UPDATE public.counter_proposals
    SET status = 'superseded'
    WHERE dispute_id = NEW.dispute_id
      AND id != NEW.id
      AND status = 'pending';
    
    INSERT INTO public.dispute_resolutions (
      dispute_id,
      resolution_type,
      amount,
      terms,
      status
    ) VALUES (
      NEW.dispute_id,
      NEW.proposal_type,
      NEW.amount,
      NEW.terms,
      'agreed'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_counter_proposal_status
  AFTER UPDATE ON public.counter_proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_counter_proposal_status();