-- ============================================
-- Security Fix: Add search_path to SECURITY DEFINER Functions
-- This migration adds SET search_path = public to functions
-- that were missing it, protecting against search path manipulation attacks.
-- ============================================

-- 1. Fix log_activity function
CREATE OR REPLACE FUNCTION public.log_activity(
  p_action TEXT,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_changes JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.system_activity_log (
    user_id, action, entity_type, entity_id, changes
  ) VALUES (
    auth.uid(), p_action, p_entity_type, p_entity_id, p_changes
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Fix track_job_lifecycle function
CREATE OR REPLACE FUNCTION public.track_job_lifecycle()
RETURNS TRIGGER AS $$
BEGIN
  -- Only track status changes
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.job_lifecycle_events (
      job_id, event_type, from_status, to_status, triggered_by
    ) VALUES (
      NEW.id, 'status_change', OLD.status, NEW.status, auth.uid()
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Fix track_document_edit function
CREATE OR REPLACE FUNCTION track_document_edit()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Fix get_online_professionals function
CREATE OR REPLACE FUNCTION get_online_professionals(professional_ids UUID[] DEFAULT NULL)
RETURNS TABLE (
  professional_id UUID,
  status TEXT,
  custom_message TEXT,
  available_until TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
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
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- 5. Fix log_dispute_event function
CREATE OR REPLACE FUNCTION log_dispute_event()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Fix get_auto_closeable_disputes function
CREATE OR REPLACE FUNCTION get_auto_closeable_disputes()
RETURNS TABLE(dispute_id uuid, days_open integer) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. Fix escalation_reasons_updater function
CREATE OR REPLACE FUNCTION public.escalation_reasons_updater(p_dispute_id uuid)
RETURNS void AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;