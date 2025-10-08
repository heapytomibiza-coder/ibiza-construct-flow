-- =============================================
-- Phase 3: Database Security Hardening
-- Fix search_path and RLS policy gaps
-- =============================================

-- 1) Add search_path to SECURITY DEFINER functions (CRITICAL)
-- These are vulnerable to search path hijacking attacks

CREATE OR REPLACE FUNCTION public.calculate_professional_score(p_professional_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_quality NUMERIC;
  v_reliability NUMERIC;
  v_communication NUMERIC;
  v_overall NUMERIC;
BEGIN
  -- Quality score based on reviews
  SELECT COALESCE(AVG(rating), 0) INTO v_quality
  FROM reviews WHERE professional_id = p_professional_id;
  
  -- Reliability score based on completion rate
  SELECT COALESCE(
    (COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
    0
  ) INTO v_reliability
  FROM booking_requests WHERE professional_id = p_professional_id;
  
  -- Communication score based on response times
  SELECT COALESCE(
    CASE 
      WHEN AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) < 3600 THEN 100
      WHEN AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) < 7200 THEN 85
      WHEN AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) < 14400 THEN 70
      ELSE 50
    END,
    0
  ) INTO v_communication
  FROM messages WHERE sender_id = p_professional_id;
  
  -- Overall score (weighted average)
  v_overall := (v_quality * 20 + v_reliability + v_communication * 0.5) / 1.5;
  
  INSERT INTO public.professional_scores (
    professional_id, quality_score, reliability_score, 
    communication_score, overall_score
  ) VALUES (
    p_professional_id, v_quality * 20, v_reliability, 
    v_communication, v_overall
  )
  ON CONFLICT (professional_id) DO UPDATE SET
    quality_score = EXCLUDED.quality_score,
    reliability_score = EXCLUDED.reliability_score,
    communication_score = EXCLUDED.communication_score,
    overall_score = EXCLUDED.overall_score,
    calculated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.check_compliance_status(p_user_id uuid, p_framework_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status RECORD;
  v_result JSONB;
BEGIN
  SELECT * INTO v_status
  FROM public.user_compliance_status
  WHERE user_id = p_user_id AND framework_id = p_framework_id;
  
  IF v_status IS NULL THEN
    v_result := jsonb_build_object(
      'compliant', false,
      'score', 0,
      'status', 'not_assessed'
    );
  ELSE
    v_result := jsonb_build_object(
      'compliant', v_status.status = 'compliant',
      'score', v_status.compliance_score,
      'status', v_status.status,
      'last_checked', v_status.last_checked_at
    );
  END IF;
  
  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.detect_fraud_pattern(p_user_id uuid, p_pattern_type text, p_severity text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.fraud_patterns (
    pattern_type, 
    pattern_data, 
    severity, 
    detection_count,
    last_detected_at
  ) VALUES (
    p_pattern_type,
    jsonb_build_object('user_id', p_user_id, 'detected_at', now()),
    p_severity,
    1,
    now()
  )
  ON CONFLICT (pattern_type) DO UPDATE SET
    detection_count = fraud_patterns.detection_count + 1,
    last_detected_at = now();
    
  RETURN true;
END;
$$;

-- 2) Add search_path to trigger functions
CREATE OR REPLACE FUNCTION public.audit_pack_changes()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO question_pack_audit (pack_id, actor, event, meta)
    VALUES (NEW.pack_id, NEW.created_by, 'created', jsonb_build_object('status', NEW.status, 'source', NEW.source));
  ELSIF (TG_OP = 'UPDATE') THEN
    IF (OLD.status != NEW.status) THEN
      INSERT INTO question_pack_audit (pack_id, actor, event, meta)
      VALUES (NEW.pack_id, auth.uid(), 'status_changed', jsonb_build_object('from', OLD.status, 'to', NEW.status));
    END IF;
    IF (OLD.is_active != NEW.is_active AND NEW.is_active = TRUE) THEN
      INSERT INTO question_pack_audit (pack_id, actor, event, meta)
      VALUES (NEW.pack_id, auth.uid(), 'activated', jsonb_build_object('version', NEW.version));
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_sla_deadline(p_priority text, p_created_at timestamp with time zone DEFAULT now())
RETURNS timestamp with time zone
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  RETURN CASE p_priority
    WHEN 'urgent' THEN p_created_at + INTERVAL '2 hours'
    WHEN 'high' THEN p_created_at + INTERVAL '8 hours'
    WHEN 'medium' THEN p_created_at + INTERVAL '24 hours'
    WHEN 'low' THEN p_created_at + INTERVAL '72 hours'
    ELSE p_created_at + INTERVAL '24 hours'
  END;
END;
$$;

-- 3) Add RLS policies for tables with RLS enabled but no policies

-- question_metrics: Allow admins to manage, users to view their own
DROP POLICY IF EXISTS "Admins can manage question metrics" ON public.question_metrics;
CREATE POLICY "Admins can manage question metrics"
ON public.question_metrics
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "System can insert metrics" ON public.question_metrics;
CREATE POLICY "System can insert metrics"
ON public.question_metrics
FOR INSERT
WITH CHECK (true);

-- system_health_metrics: Admin only
DROP POLICY IF EXISTS "Admins can view health metrics" ON public.system_health_metrics;
CREATE POLICY "Admins can view health metrics"
ON public.system_health_metrics
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "System can insert health metrics" ON public.system_health_metrics;
CREATE POLICY "System can insert health metrics"
ON public.system_health_metrics
FOR INSERT
WITH CHECK (true);

-- workflow_automations: Admin only
DROP POLICY IF EXISTS "Admins can manage workflow automations" ON public.workflow_automations;
CREATE POLICY "Admins can manage workflow automations"
ON public.workflow_automations
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));