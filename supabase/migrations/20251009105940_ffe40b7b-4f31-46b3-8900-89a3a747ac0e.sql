
-- Fix remaining 9 SECURITY DEFINER functions missing search path protection
-- This prevents search path hijacking attacks where malicious schemas could intercept function calls

-- 1. escalation_reasons_updater - Dispute escalation logic
CREATE OR REPLACE FUNCTION public.escalation_reasons_updater(p_dispute_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  d record;
  new_reasons jsonb := '{}'::jsonb;
BEGIN
  SELECT * INTO d FROM public.disputes WHERE id = p_dispute_id;
  IF d IS NULL THEN RETURN; END IF;

  -- Check inactivity > 48h
  IF d.last_activity_at IS NOT NULL AND (now() - d.last_activity_at) > interval '48 hours' THEN
    new_reasons := new_reasons || jsonb_build_object(
      'inactivity_hours', 
      EXTRACT(EPOCH FROM (now() - d.last_activity_at))/3600
    );
  END IF;

  -- Check deadline passed
  IF d.response_deadline IS NOT NULL AND now() > d.response_deadline THEN
    new_reasons := new_reasons || jsonb_build_object(
      'deadline_passed', 
      true,
      'hours_overdue',
      EXTRACT(EPOCH FROM (now() - d.response_deadline))/3600
    );
  END IF;

  -- Update escalation reasons if any found
  IF new_reasons != '{}'::jsonb THEN
    UPDATE public.disputes 
    SET escalation_reasons = COALESCE(escalation_reasons, '{}'::jsonb) || new_reasons
    WHERE id = p_dispute_id;

    -- Add timeline event
    INSERT INTO public.dispute_timeline (dispute_id, event_type, description, metadata)
    VALUES (
      p_dispute_id,
      'deadline_warning',
      'Escalation check triggered',
      new_reasons
    );
  END IF;
END;
$function$;

-- 2. get_auto_closeable_disputes - Auto-close logic
CREATE OR REPLACE FUNCTION public.get_auto_closeable_disputes()
 RETURNS TABLE(dispute_id uuid, days_open integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    id,
    EXTRACT(DAY FROM (now() - created_at))::integer
  FROM disputes
  WHERE status = 'resolved'
    AND auto_close_date IS NOT NULL
    AND auto_close_date <= now();
END;
$function$;

-- 3. get_cached_kpi - KPI caching
CREATE OR REPLACE FUNCTION public.get_cached_kpi(p_cache_key text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_data JSONB;
BEGIN
  SELECT data INTO v_data
  FROM public.kpi_cache
  WHERE cache_key = p_cache_key
    AND expires_at > now();
  
  RETURN v_data;
END;
$function$;

-- 4. get_dashboard_kpis (no params) - Dashboard metrics
CREATE OR REPLACE FUNCTION public.get_dashboard_kpis()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_cached JSONB;
  v_kpis JSONB;
BEGIN
  -- Try cache first
  v_cached := public.get_cached_kpi('dashboard_kpis');
  IF v_cached IS NOT NULL THEN
    RETURN v_cached;
  END IF;

  -- Calculate fresh KPIs
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'active_jobs', (SELECT COUNT(*) FROM jobs WHERE status = 'open'),
    'total_bookings', (SELECT COUNT(*) FROM bookings),
    'pending_verifications', (SELECT COUNT(*) FROM professional_verifications WHERE status = 'pending'),
    'active_disputes', (SELECT COUNT(*) FROM disputes WHERE status IN ('open', 'in_progress')),
    'total_revenue', (
      SELECT COALESCE(SUM(amount), 0) 
      FROM payment_transactions 
      WHERE status IN ('completed', 'succeeded')
      AND created_at >= now() - interval '30 days'
    ),
    'pending_support_tickets', (SELECT COUNT(*) FROM support_tickets WHERE status IN ('open', 'in_progress')),
    'flagged_reviews', (SELECT COUNT(*) FROM review_flags WHERE status = 'pending'),
    'sla_breaches', (
      SELECT COUNT(*) FROM support_tickets 
      WHERE status NOT IN ('resolved', 'closed')
      AND sla_deadline < now()
    ),
    'fraud_alerts', (SELECT COUNT(*) FROM fraud_patterns WHERE is_active = true AND last_detected_at > now() - interval '7 days'),
    'churn_risk_users', (SELECT COUNT(*) FROM churn_predictions WHERE churn_probability > 70)
  ) INTO v_kpis;

  -- Cache for 5 minutes
  INSERT INTO public.kpi_cache (cache_key, data, expires_at)
  VALUES ('dashboard_kpis', v_kpis, now() + interval '5 minutes')
  ON CONFLICT (cache_key) DO UPDATE SET
    data = EXCLUDED.data,
    expires_at = EXCLUDED.expires_at;

  RETURN v_kpis;
END;
$function$;

-- 5. get_online_professionals - Professional availability
CREATE OR REPLACE FUNCTION public.get_online_professionals(professional_ids uuid[] DEFAULT NULL::uuid[])
 RETURNS TABLE(professional_id uuid, status text, custom_message text, available_until timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    pa.professional_id,
    pa.status,
    pa.custom_message,
    pa.available_until,
    pa.updated_at
  FROM professional_availability pa
  WHERE 
    (professional_ids IS NULL OR pa.professional_id = ANY(professional_ids))
    AND pa.status IN ('available', 'busy')
    AND (pa.available_until IS NULL OR pa.available_until > now())
  ORDER BY 
    CASE pa.status
      WHEN 'available' THEN 1
      WHEN 'busy' THEN 2
      ELSE 3
    END,
    pa.updated_at DESC;
END;
$function$;

-- 6. log_dispute_event - Dispute timeline trigger
CREATE OR REPLACE FUNCTION public.log_dispute_event()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO dispute_timeline (dispute_id, event_type, actor_id, description)
    VALUES (NEW.id, 'created', NEW.created_by, 'Dispute opened: ' || NEW.title);
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      INSERT INTO dispute_timeline (dispute_id, event_type, actor_id, description, metadata)
      VALUES (
        NEW.id, 
        'status_changed', 
        auth.uid(),
        'Status changed from ' || OLD.status || ' to ' || NEW.status,
        jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
      );
    END IF;
    IF OLD.escalation_level != NEW.escalation_level THEN
      INSERT INTO dispute_timeline (dispute_id, event_type, actor_id, description)
      VALUES (NEW.id, 'escalated', auth.uid(), 'Escalated to level ' || NEW.escalation_level);
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- 7. log_milestone_approval - Milestone approval trigger
CREATE OR REPLACE FUNCTION public.log_milestone_approval()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.approved_by IS NOT NULL THEN
    INSERT INTO milestone_approvals (milestone_id, approver_id, action, notes)
    VALUES (NEW.id, NEW.approved_by, 'approved', 'Milestone approved');
  ELSIF NEW.status = 'rejected' AND OLD.status != 'rejected' AND NEW.rejected_by IS NOT NULL THEN
    INSERT INTO milestone_approvals (milestone_id, approver_id, action, notes)
    VALUES (NEW.id, NEW.rejected_by, 'rejected', NEW.rejection_reason);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 8. log_security_event - Security event logging
CREATE OR REPLACE FUNCTION public.log_security_event(p_user_id uuid, p_event_type text, p_event_category text, p_severity text DEFAULT 'low'::text, p_event_data jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO public.security_events (
    user_id, event_type, event_category, severity, event_data
  ) VALUES (
    p_user_id, p_event_type, p_event_category, p_severity, p_event_data
  ) RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$function$;

-- 9. track_document_edit - Document versioning trigger
CREATE OR REPLACE FUNCTION public.track_document_edit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Insert edit record
  INSERT INTO document_edits (document_id, user_id, change_type, change_data)
  VALUES (
    NEW.id,
    auth.uid(),
    TG_OP,
    jsonb_build_object(
      'version', NEW.version,
      'content_changed', OLD.content IS DISTINCT FROM NEW.content
    )
  );
  
  -- Update last_edited info
  NEW.last_edited_by = auth.uid();
  NEW.last_edited_at = now();
  NEW.version = OLD.version + 1;
  
  RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION public.escalation_reasons_updater IS 'Protected against search path hijacking - Phase 4 security hardening';
COMMENT ON FUNCTION public.get_auto_closeable_disputes IS 'Protected against search path hijacking - Phase 4 security hardening';
COMMENT ON FUNCTION public.get_cached_kpi IS 'Protected against search path hijacking - Phase 4 security hardening';
COMMENT ON FUNCTION public.get_dashboard_kpis() IS 'Protected against search path hijacking - Phase 4 security hardening';
COMMENT ON FUNCTION public.get_online_professionals IS 'Protected against search path hijacking - Phase 4 security hardening';
COMMENT ON FUNCTION public.log_dispute_event IS 'Protected against search path hijacking - Phase 4 security hardening';
COMMENT ON FUNCTION public.log_milestone_approval IS 'Protected against search path hijacking - Phase 4 security hardening';
COMMENT ON FUNCTION public.log_security_event IS 'Protected against search path hijacking - Phase 4 security hardening';
COMMENT ON FUNCTION public.track_document_edit IS 'Protected against search path hijacking - Phase 4 security hardening';
