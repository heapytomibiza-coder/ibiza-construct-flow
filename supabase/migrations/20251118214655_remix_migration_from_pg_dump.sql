--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_onboarding_step; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_onboarding_step AS ENUM (
    'profile_basic',
    'verification',
    'services',
    'availability',
    'portfolio',
    'payment_setup'
);


--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'client',
    'professional'
);


--
-- Name: booking_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.booking_status AS ENUM (
    'draft',
    'posted',
    'matched',
    'in_progress',
    'completed',
    'cancelled'
);


--
-- Name: milestone_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.milestone_status AS ENUM (
    'pending',
    'completed',
    'disputed'
);


--
-- Name: pack_source; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.pack_source AS ENUM (
    'manual',
    'ai',
    'hybrid'
);


--
-- Name: pack_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.pack_status AS ENUM (
    'draft',
    'approved',
    'retired'
);


--
-- Name: payment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'completed',
    'refunded',
    'disputed'
);


--
-- Name: tasker_onboarding_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tasker_onboarding_status AS ENUM (
    'not_started',
    'in_progress',
    'complete'
);


--
-- Name: admin_assign_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_assign_role(p_target_user_id uuid, p_role public.app_role) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_actor uuid := auth.uid();
BEGIN
  -- Ensure the caller is an admin
  IF NOT has_role(v_actor, 'admin'::app_role) THEN
    RAISE EXCEPTION 'permission denied: caller must be admin';
  END IF;

  -- Upsert role
  INSERT INTO public.user_roles (user_id, role)
    VALUES (p_target_user_id, p_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Log the action
  INSERT INTO public.user_roles_audit_log (actor_user_id, target_user_id, action, new_row)
  VALUES (v_actor, p_target_user_id, 'insert', to_jsonb(ROW(p_target_user_id, p_role)));
END;
$$;


--
-- Name: admin_revoke_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_revoke_role(p_target_user_id uuid, p_role public.app_role) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_old jsonb;
BEGIN
  IF NOT has_role(v_actor, 'admin'::app_role) THEN
    RAISE EXCEPTION 'permission denied: caller must be admin';
  END IF;

  -- Capture old row
  SELECT to_jsonb(ur.*) INTO v_old 
  FROM public.user_roles ur 
  WHERE user_id = p_target_user_id AND role = p_role;

  -- Delete role
  DELETE FROM public.user_roles 
  WHERE user_id = p_target_user_id AND role = p_role;

  -- Log the action
  INSERT INTO public.user_roles_audit_log (actor_user_id, target_user_id, action, old_row)
  VALUES (v_actor, p_target_user_id, 'delete', v_old);
END;
$$;


--
-- Name: aggregate_platform_metrics(date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.aggregate_platform_metrics(p_metric_date date) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_total_users INTEGER;
  v_active_users INTEGER;
  v_new_users INTEGER;
  v_total_bookings INTEGER;
  v_completed_bookings INTEGER;
  v_cancelled_bookings INTEGER;
BEGIN
  -- Calculate metrics
  SELECT COUNT(*) INTO v_total_users FROM profiles WHERE created_at::date <= p_metric_date;
  SELECT COUNT(DISTINCT user_id) INTO v_active_users FROM user_activity_metrics WHERE metric_date = p_metric_date;
  SELECT COUNT(*) INTO v_new_users FROM profiles WHERE created_at::date = p_metric_date;
  SELECT COUNT(*) INTO v_total_bookings FROM bookings WHERE created_at::date = p_metric_date;
  SELECT COUNT(*) INTO v_completed_bookings FROM bookings WHERE created_at::date = p_metric_date AND status = 'completed';
  SELECT COUNT(*) INTO v_cancelled_bookings FROM bookings WHERE created_at::date = p_metric_date AND status = 'cancelled';

  -- Insert or update platform metrics
  INSERT INTO platform_metrics (
    metric_date,
    total_users,
    active_users,
    new_users,
    total_bookings,
    completed_bookings,
    cancelled_bookings
  ) VALUES (
    p_metric_date,
    v_total_users,
    v_active_users,
    v_new_users,
    v_total_bookings,
    v_completed_bookings,
    v_cancelled_bookings
  )
  ON CONFLICT (metric_date, metric_hour) DO UPDATE SET
    total_users = EXCLUDED.total_users,
    active_users = EXCLUDED.active_users,
    new_users = EXCLUDED.new_users,
    total_bookings = EXCLUDED.total_bookings,
    completed_bookings = EXCLUDED.completed_bookings,
    cancelled_bookings = EXCLUDED.cancelled_bookings,
    updated_at = now();
END;
$$;


--
-- Name: audit_pack_changes(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.audit_pack_changes() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
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


--
-- Name: auto_release_milestone_payment(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.auto_release_milestone_payment() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- If milestone is marked as completed, create a release transaction
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO public.escrow_transactions (
      milestone_id,
      transaction_type,
      amount,
      status,
      initiated_by,
      metadata
    ) VALUES (
      NEW.id,
      'release',
      NEW.amount,
      'pending',
      COALESCE(NEW.approved_by, auth.uid()),
      jsonb_build_object(
        'auto_release', true,
        'completion_date', NEW.completed_date
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: bulk_user_suspend(uuid[], text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.bulk_user_suspend(user_ids uuid[], reason text, suspended_by uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  UPDATE public.profiles
  SET updated_at = now()
  WHERE id = ANY(user_ids);
  
  INSERT INTO public.admin_audit_log (
    admin_id, action, entity_type, changes
  ) VALUES (
    suspended_by, 'bulk_suspend', 'user',
    jsonb_build_object('user_ids', user_ids, 'count', array_length(user_ids, 1), 'reason', reason)
  );
END;
$$;


--
-- Name: bulk_verification_action(uuid[], text, text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.bulk_verification_action(verification_ids uuid[], action text, reason text, actioned_by uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  UPDATE public.professional_verifications
  SET status = CASE 
    WHEN action = 'approve' THEN 'approved'
    WHEN action = 'reject' THEN 'rejected'
    ELSE status
  END,
  reviewed_by = actioned_by,
  reviewed_at = now()
  WHERE id = ANY(verification_ids);
  
  INSERT INTO public.admin_audit_log (
    admin_id, action, entity_type, changes
  ) VALUES (
    actioned_by, 'bulk_verification_' || action, 'verification',
    jsonb_build_object('verification_ids', verification_ids, 'count', array_length(verification_ids, 1), 'reason', reason)
  );
END;
$$;


--
-- Name: calculate_invoice_totals(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_invoice_totals() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_subtotal NUMERIC := 0;
  v_vat_amount NUMERIC := 0;
  v_total NUMERIC := 0;
  v_discount NUMERIC := 0;
BEGIN
  -- Calculate from line items if they exist
  SELECT 
    COALESCE(SUM(amount), 0),
    COALESCE(SUM(tax_amount), 0)
  INTO v_subtotal, v_vat_amount
  FROM invoice_items
  WHERE invoice_id = NEW.id;

  -- If no items, use the invoice's line_items JSONB (for backward compatibility)
  IF v_subtotal = 0 THEN
    v_subtotal := NEW.subtotal;
    v_vat_amount := NEW.vat_amount;
  END IF;

  -- Apply discount
  IF NEW.discount_percentage > 0 THEN
    v_discount := v_subtotal * (NEW.discount_percentage / 100);
  ELSIF NEW.discount_amount > 0 THEN
    v_discount := NEW.discount_amount;
  END IF;

  -- Calculate total
  v_total := v_subtotal - v_discount + v_vat_amount;

  -- Update invoice
  UPDATE invoices
  SET
    subtotal = v_subtotal,
    vat_amount = v_vat_amount,
    total_amount = v_total,
    updated_at = now()
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$;


--
-- Name: calculate_professional_earnings(uuid, timestamp with time zone, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_professional_earnings(p_professional_id uuid, p_start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, p_end_date timestamp with time zone DEFAULT now()) RETURNS TABLE(total_earnings numeric, completed_jobs integer, average_per_job numeric, currency text)
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(pt.amount), 0) as total_earnings,
    COUNT(DISTINCT c.id)::integer as completed_jobs,
    CASE 
      WHEN COUNT(DISTINCT c.id) > 0 
      THEN COALESCE(SUM(pt.amount), 0) / COUNT(DISTINCT c.id)
      ELSE 0
    END as average_per_job,
    COALESCE(pt.currency, 'EUR') as currency
  FROM public.contracts c
  LEFT JOIN public.payment_transactions pt ON pt.user_id = p_professional_id
    AND pt.status IN ('completed', 'succeeded')
    AND pt.created_at BETWEEN COALESCE(p_start_date, '1970-01-01'::timestamptz) AND p_end_date
  WHERE c.tasker_id = p_professional_id
    AND c.created_at BETWEEN COALESCE(p_start_date, '1970-01-01'::timestamptz) AND p_end_date
  GROUP BY pt.currency;
END;
$$;


--
-- Name: calculate_professional_score(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_professional_score(p_professional_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: calculate_sla_deadline(text, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_sla_deadline(p_priority text, p_created_at timestamp with time zone DEFAULT now()) RETURNS timestamp with time zone
    LANGUAGE plpgsql IMMUTABLE
    SET search_path TO 'public'
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


--
-- Name: calculate_user_payment_analytics(uuid, timestamp with time zone, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_user_payment_analytics(p_user_id uuid, p_start_date timestamp with time zone, p_end_date timestamp with time zone) RETURNS TABLE(total_revenue numeric, total_payments bigint, successful_payments bigint, failed_payments bigint, average_transaction_value numeric, conversion_rate numeric, refund_rate numeric)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_total_revenue NUMERIC;
  v_total_payments BIGINT;
  v_successful_payments BIGINT;
  v_failed_payments BIGINT;
  v_total_refunds BIGINT;
BEGIN
  -- Calculate metrics
  SELECT 
    COALESCE(SUM(CASE WHEN status IN ('completed', 'succeeded') THEN amount ELSE 0 END), 0),
    COUNT(*),
    COUNT(*) FILTER (WHERE status IN ('completed', 'succeeded')),
    COUNT(*) FILTER (WHERE status IN ('failed', 'cancelled')),
    COUNT(*) FILTER (WHERE transaction_type = 'refund' AND status = 'completed')
  INTO v_total_revenue, v_total_payments, v_successful_payments, v_failed_payments, v_total_refunds
  FROM payment_transactions
  WHERE user_id = p_user_id
    AND created_at BETWEEN p_start_date AND p_end_date;

  RETURN QUERY SELECT
    v_total_revenue,
    v_total_payments,
    v_successful_payments,
    v_failed_payments,
    CASE WHEN v_successful_payments > 0 THEN v_total_revenue / v_successful_payments ELSE 0 END,
    CASE WHEN v_total_payments > 0 THEN (v_successful_payments::NUMERIC / v_total_payments) * 100 ELSE 0 END,
    CASE WHEN v_successful_payments > 0 THEN (v_total_refunds::NUMERIC / v_successful_payments) * 100 ELSE 0 END;
END;
$$;


--
-- Name: calculate_user_retention(date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_user_retention(p_cohort_date date) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_cohort_size INTEGER;
  v_retention_1 INTEGER;
  v_retention_7 INTEGER;
  v_retention_30 INTEGER;
  v_retention_60 INTEGER;
  v_retention_90 INTEGER;
BEGIN
  -- Get cohort size (users who signed up on this date)
  SELECT COUNT(*) INTO v_cohort_size
  FROM profiles
  WHERE created_at::date = p_cohort_date;

  IF v_cohort_size = 0 THEN
    RETURN;
  END IF;

  -- Calculate retention for day 1
  SELECT COUNT(DISTINCT p.id) INTO v_retention_1
  FROM profiles p
  JOIN user_activity_metrics uam ON uam.user_id = p.id
  WHERE p.created_at::date = p_cohort_date
    AND uam.metric_date = p_cohort_date + INTERVAL '1 day';

  -- Calculate retention for day 7
  SELECT COUNT(DISTINCT p.id) INTO v_retention_7
  FROM profiles p
  JOIN user_activity_metrics uam ON uam.user_id = p.id
  WHERE p.created_at::date = p_cohort_date
    AND uam.metric_date = p_cohort_date + INTERVAL '7 days';

  -- Calculate retention for day 30
  SELECT COUNT(DISTINCT p.id) INTO v_retention_30
  FROM profiles p
  JOIN user_activity_metrics uam ON uam.user_id = p.id
  WHERE p.created_at::date = p_cohort_date
    AND uam.metric_date = p_cohort_date + INTERVAL '30 days';

  -- Calculate retention for day 60
  SELECT COUNT(DISTINCT p.id) INTO v_retention_60
  FROM profiles p
  JOIN user_activity_metrics uam ON uam.user_id = p.id
  WHERE p.created_at::date = p_cohort_date
    AND uam.metric_date = p_cohort_date + INTERVAL '60 days';

  -- Calculate retention for day 90
  SELECT COUNT(DISTINCT p.id) INTO v_retention_90
  FROM profiles p
  JOIN user_activity_metrics uam ON uam.user_id = p.id
  WHERE p.created_at::date = p_cohort_date
    AND uam.metric_date = p_cohort_date + INTERVAL '90 days';

  -- Insert or update cohort data
  INSERT INTO user_cohorts (
    cohort_date,
    cohort_size,
    retention_day_1,
    retention_day_7,
    retention_day_30,
    retention_day_60,
    retention_day_90
  ) VALUES (
    p_cohort_date,
    v_cohort_size,
    v_retention_1,
    v_retention_7,
    v_retention_30,
    v_retention_60,
    v_retention_90
  )
  ON CONFLICT (cohort_date) DO UPDATE SET
    retention_day_1 = EXCLUDED.retention_day_1,
    retention_day_7 = EXCLUDED.retention_day_7,
    retention_day_30 = EXCLUDED.retention_day_30,
    retention_day_60 = EXCLUDED.retention_day_60,
    retention_day_90 = EXCLUDED.retention_day_90,
    updated_at = now();
END;
$$;


--
-- Name: can_access_document(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.can_access_document(doc_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM document_collaborators
    WHERE document_id = doc_id AND user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM shared_documents
    WHERE id = doc_id AND created_by = auth.uid()
  )
$$;


--
-- Name: can_professional_view_job(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.can_professional_view_job(_user_id uuid, _job_id uuid) RETURNS boolean
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  job_record RECORD;
BEGIN
  -- Get job details
  SELECT micro_id, client_id, status INTO job_record
  FROM public.jobs 
  WHERE id = _job_id;
  
  -- If job doesn't exist or is not open, deny access
  IF job_record IS NULL OR job_record.status != 'open' THEN
    RETURN false;
  END IF;
  
  -- Check if user has professional role using has_role security definer function
  IF NOT has_role(_user_id, 'professional'::app_role) THEN
    RETURN false;
  END IF;
  
  -- Check if professional has relevant services that match the job's micro service
  IF EXISTS (
    SELECT 1 FROM public.professional_services ps
    WHERE ps.professional_id = _user_id 
    AND ps.micro_service_id = job_record.micro_id
    AND ps.is_active = true
  ) THEN
    RETURN true;
  END IF;
  
  -- If no professional_services table exists or no direct match, 
  -- allow verified professionals as fallback
  IF EXISTS (
    SELECT 1 FROM public.professional_profiles pp
    WHERE pp.user_id = _user_id 
    AND pp.verification_status = 'verified'
    AND pp.is_active = true
  ) THEN
    RETURN true;
  END IF;
  
  -- Default deny - restrict access to unverified professionals
  RETURN false;
END;
$$;


--
-- Name: check_availability(uuid, timestamp with time zone, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_availability(p_professional_id uuid, p_start_time timestamp with time zone, p_end_time timestamp with time zone) RETURNS boolean
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_day_of_week text;
  v_working_hours jsonb;
  v_is_available boolean := false;
  v_conflicting_events integer;
BEGIN
  -- Get day of week
  v_day_of_week := lower(to_char(p_start_time, 'Day'));
  v_day_of_week := trim(v_day_of_week);
  
  -- Get working hours for professional
  SELECT working_hours INTO v_working_hours
  FROM professional_availability
  WHERE professional_id = p_professional_id;
  
  -- Check if day is enabled and time is within working hours
  IF v_working_hours IS NOT NULL AND 
     (v_working_hours->v_day_of_week->>'enabled')::boolean = true THEN
    v_is_available := true;
  END IF;
  
  -- Check for conflicting events
  IF v_is_available THEN
    SELECT COUNT(*) INTO v_conflicting_events
    FROM calendar_events
    WHERE user_id = p_professional_id
      AND status NOT IN ('cancelled', 'no_show')
      AND (
        (start_time, end_time) OVERLAPS (p_start_time, p_end_time)
      );
    
    IF v_conflicting_events > 0 THEN
      v_is_available := false;
    END IF;
  END IF;
  
  RETURN v_is_available;
END;
$$;


--
-- Name: check_compliance_status(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_compliance_status(p_user_id uuid, p_framework_id uuid) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: check_milestone_auto_release(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_milestone_auto_release() RETURNS TABLE(milestone_id uuid, contract_id uuid, amount numeric, auto_release_date timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    em.id,
    em.contract_id,
    em.amount,
    em.auto_release_date
  FROM escrow_milestones em
  WHERE em.status = 'completed'
    AND em.auto_release_date IS NOT NULL
    AND em.auto_release_date <= now()
    AND NOT EXISTS (
      SELECT 1 FROM escrow_releases er
      WHERE er.milestone_id = em.id
        AND er.status IN ('pending', 'completed')
    );
END;
$$;


--
-- Name: check_rate_limit(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_rate_limit(p_user_id uuid) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_limit RECORD;
  v_max_per_hour INTEGER := 50;
  v_max_per_day INTEGER := 200;
BEGIN
  SELECT * INTO v_limit FROM public.message_rate_limits WHERE user_id = p_user_id;
  
  IF v_limit IS NULL THEN
    INSERT INTO public.message_rate_limits (user_id, messages_sent, window_start)
    VALUES (p_user_id, 0, now())
    RETURNING * INTO v_limit;
  END IF;
  
  IF v_limit.window_start < now() - interval '1 hour' THEN
    UPDATE public.message_rate_limits 
    SET messages_sent = 0, window_start = now(), is_throttled = false, throttled_until = NULL
    WHERE user_id = p_user_id;
    RETURN jsonb_build_object('allowed', true, 'remaining', v_max_per_hour);
  END IF;
  
  IF v_limit.is_throttled AND v_limit.throttled_until > now() THEN
    RETURN jsonb_build_object(
      'allowed', false, 
      'reason', 'throttled',
      'retry_after', extract(epoch from (v_limit.throttled_until - now()))
    );
  END IF;
  
  IF v_limit.messages_sent >= v_max_per_hour THEN
    UPDATE public.message_rate_limits
    SET is_throttled = true, throttled_until = window_start + interval '1 hour'
    WHERE user_id = p_user_id;
    RETURN jsonb_build_object('allowed', false, 'reason', 'rate_limit_exceeded');
  END IF;
  
  RETURN jsonb_build_object(
    'allowed', true, 
    'remaining', v_max_per_hour - v_limit.messages_sent
  );
END;
$$;


--
-- Name: check_spam_content(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_spam_content(p_content text) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_keyword RECORD;
  v_matches TEXT[] := '{}';
  v_max_severity TEXT := 'low';
BEGIN
  FOR v_keyword IN 
    SELECT keyword, severity 
    FROM public.spam_keywords 
    WHERE is_active = true
  LOOP
    IF p_content ~* v_keyword.keyword THEN
      v_matches := array_append(v_matches, v_keyword.keyword);
      IF v_keyword.severity = 'high' THEN 
        v_max_severity := 'high';
      ELSIF v_keyword.severity = 'medium' AND v_max_severity != 'high' THEN 
        v_max_severity := 'medium';
      END IF;
    END IF;
  END LOOP;
  
  RETURN jsonb_build_object(
    'is_spam', array_length(v_matches, 1) > 0,
    'matched_keywords', v_matches,
    'severity', v_max_severity
  );
END;
$$;


--
-- Name: check_user_blocked(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_user_blocked(p_sender_id uuid, p_recipient_id uuid) RETURNS boolean
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_blocks
    WHERE blocker_id = p_recipient_id 
      AND blocked_id = p_sender_id
  );
END;
$$;


--
-- Name: cleanup_expired_typing_indicators(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_expired_typing_indicators() RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM typing_indicators WHERE expires_at < now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;


--
-- Name: convert_currency(numeric, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.convert_currency(p_amount numeric, p_from_currency text, p_to_currency text) RETURNS numeric
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_rate NUMERIC;
BEGIN
  v_rate := get_exchange_rate(p_from_currency, p_to_currency);
  
  IF v_rate IS NULL THEN
    RAISE EXCEPTION 'Exchange rate not found for % to %', p_from_currency, p_to_currency;
  END IF;

  RETURN ROUND(p_amount * v_rate, 2);
END;
$$;


--
-- Name: create_booking_reminders(uuid, uuid, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_booking_reminders(p_booking_id uuid, p_user_id uuid, p_event_start timestamp with time zone) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- 24 hour reminder
  INSERT INTO public.booking_reminders (booking_id, user_id, reminder_type, scheduled_for, delivery_method)
  VALUES (p_booking_id, p_user_id, '24h', p_event_start - interval '24 hours', 'email')
  ON CONFLICT (booking_id, reminder_type, delivery_method) DO NOTHING;
  
  -- 2 hour reminder
  INSERT INTO public.booking_reminders (booking_id, user_id, reminder_type, scheduled_for, delivery_method)
  VALUES (p_booking_id, p_user_id, '2h', p_event_start - interval '2 hours', 'email')
  ON CONFLICT (booking_id, reminder_type, delivery_method) DO NOTHING;
  
  -- 30 minute in-app reminder
  INSERT INTO public.booking_reminders (booking_id, user_id, reminder_type, scheduled_for, delivery_method)
  VALUES (p_booking_id, p_user_id, '30m', p_event_start - interval '30 minutes', 'in_app')
  ON CONFLICT (booking_id, reminder_type, delivery_method) DO NOTHING;
END;
$$;


--
-- Name: create_contract_from_quote(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_contract_from_quote() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_job RECORD;
  v_contract_id UUID;
BEGIN
  -- Only proceed if status changed to 'accepted'
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    -- Get job details
    SELECT * INTO v_job FROM public.jobs WHERE id = NEW.job_id;
    
    IF v_job IS NULL THEN
      RAISE EXCEPTION 'Job not found';
    END IF;
    
    -- Create contract using correct field names
    INSERT INTO public.contracts (
      job_id,
      tasker_id,
      client_id,
      agreed_amount,
      type,
      escrow_status
    ) VALUES (
      NEW.job_id,
      NEW.professional_id,
      v_job.client_id,
      NEW.quote_amount,
      'fixed',
      'pending'
    ) RETURNING id INTO v_contract_id;
    
    -- Create default milestone (full amount)
    INSERT INTO public.escrow_milestones (
      contract_id,
      milestone_number,
      description,
      amount,
      currency,
      status
    ) VALUES (
      v_contract_id,
      1,
      'Project completion',
      NEW.quote_amount,
      NEW.currency,
      'pending'
    );
    
    -- Update job status to in_progress
    UPDATE public.jobs
    SET status = 'in_progress'
    WHERE id = NEW.job_id;
    
    -- Notify professional
    INSERT INTO public.activity_feed (
      user_id,
      event_type,
      entity_type,
      entity_id,
      title,
      description,
      action_url,
      notification_type,
      priority
    ) VALUES (
      NEW.professional_id,
      'quote_accepted',
      'contract',
      v_contract_id,
      'Your Quote Was Accepted!',
      'Congratulations! The client accepted your quote for "' || v_job.title || '"',
      '/contracts/' || v_contract_id,
      'contract',
      'high'
    );
    
    -- Notify client about next steps (fund escrow)
    INSERT INTO public.activity_feed (
      user_id,
      event_type,
      entity_type,
      entity_id,
      title,
      description,
      action_url,
      notification_type,
      priority
    ) VALUES (
      v_job.client_id,
      'contract_created',
      'contract',
      v_contract_id,
      'Contract Created - Fund Escrow',
      'Your contract for "' || v_job.title || '" is ready. Please fund the escrow to begin work.',
      '/job/' || NEW.job_id,
      'payment',
      'high'
    );
    
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: create_job_version(uuid, uuid, text, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_job_version(p_job_id uuid, p_changed_by uuid, p_change_reason text, p_new_data jsonb) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_current_data JSONB;
  v_version_number INTEGER;
  v_version_id UUID;
  v_diff JSONB;
BEGIN
  -- Get current job data
  SELECT to_jsonb(j.*) INTO v_current_data
  FROM public.jobs j
  WHERE id = p_job_id;

  -- Get next version number
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_version_number
  FROM public.job_versions
  WHERE job_id = p_job_id;

  -- Calculate diff (simplified - just store both)
  v_diff := jsonb_build_object(
    'before', v_current_data,
    'after', p_new_data
  );

  -- Create version record
  INSERT INTO public.job_versions (
    job_id,
    version_number,
    snapshot_data,
    changed_by,
    change_reason,
    diff
  ) VALUES (
    p_job_id,
    v_version_number,
    v_current_data,
    p_changed_by,
    p_change_reason,
    v_diff
  ) RETURNING id INTO v_version_id;

  RETURN v_version_id;
END;
$$;


--
-- Name: create_payment_schedule(uuid, numeric, text, integer, text, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_payment_schedule(p_job_id uuid, p_total_amount numeric, p_currency text, p_installment_count integer, p_frequency text, p_start_date timestamp with time zone DEFAULT now()) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_schedule_id UUID;
  v_installment_amount NUMERIC;
  v_current_date TIMESTAMPTZ;
  v_interval INTERVAL;
  v_i INTEGER;
BEGIN
  -- Validate user owns the job
  IF NOT EXISTS (
    SELECT 1 FROM jobs WHERE id = p_job_id AND client_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Not the job owner';
  END IF;

  -- Calculate installment amount
  v_installment_amount := p_total_amount / p_installment_count;
  
  -- Determine interval based on frequency
  v_interval := CASE p_frequency
    WHEN 'weekly' THEN INTERVAL '1 week'
    WHEN 'biweekly' THEN INTERVAL '2 weeks'
    WHEN 'monthly' THEN INTERVAL '1 month'
  END;

  -- Create payment schedule
  INSERT INTO payment_schedules (
    job_id,
    user_id,
    total_amount,
    currency,
    installment_count,
    frequency,
    next_payment_date,
    status
  ) VALUES (
    p_job_id,
    auth.uid(),
    p_total_amount,
    p_currency,
    p_installment_count,
    p_frequency,
    p_start_date,
    'active'
  ) RETURNING id INTO v_schedule_id;

  -- Create scheduled payment records
  v_current_date := p_start_date;
  FOR v_i IN 1..p_installment_count LOOP
    INSERT INTO scheduled_payments (
      schedule_id,
      installment_number,
      amount,
      currency,
      due_date,
      status
    ) VALUES (
      v_schedule_id,
      v_i,
      v_installment_amount,
      p_currency,
      v_current_date,
      'pending'
    );
    
    v_current_date := v_current_date + v_interval;
  END LOOP;

  RETURN v_schedule_id;
END;
$$;


--
-- Name: detect_fraud_pattern(uuid, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.detect_fraud_pattern(p_user_id uuid, p_pattern_type text, p_severity text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: escalation_reasons_updater(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.escalation_reasons_updater(p_dispute_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
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
$$;


--
-- Name: execute_resolution(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.execute_resolution(p_resolution_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  r record;
  d record;
BEGIN
  SELECT * INTO r FROM public.dispute_resolutions WHERE id = p_resolution_id;
  IF r IS NULL THEN RETURN; END IF;
  
  SELECT * INTO d FROM public.disputes WHERE id = r.dispute_id;
  IF d IS NULL THEN RETURN; END IF;
  
  -- Log execution start
  INSERT INTO public.resolution_enforcement_log(dispute_id, resolution_id, action, details)
  VALUES (r.dispute_id, r.id, 'execute_begin', jsonb_build_object('at', now()));
  
  -- Update resolution status
  UPDATE public.dispute_resolutions SET status = 'executed' WHERE id = p_resolution_id;
  
  -- Update dispute status
  UPDATE public.disputes SET status = 'resolved', resolved_at = now() WHERE id = r.dispute_id;
  
  -- Log execution end
  INSERT INTO public.resolution_enforcement_log(dispute_id, resolution_id, action, details)
  VALUES (r.dispute_id, r.id, 'execute_end', jsonb_build_object('at', now()));
  
  -- Add timeline event
  INSERT INTO public.dispute_timeline (dispute_id, event_type, description, metadata)
  VALUES (r.dispute_id, 'resolution_executed', 'Resolution automatically executed', jsonb_build_object('resolution_id', p_resolution_id));
END;
$$;


--
-- Name: finalize_resolution_if_both_agree(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.finalize_resolution_if_both_agree() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  IF NEW.party_client_agreed = true AND NEW.party_professional_agreed = true AND NEW.agreement_finalized_at IS NULL THEN
    NEW.agreement_finalized_at := now();
    NEW.status := 'agreed';
    IF NEW.auto_execute_date IS NULL THEN
      NEW.auto_execute_date := now() + interval '24 hours';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: generate_payment_receipt(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_payment_receipt(p_payment_id uuid) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_transaction record;
  v_receipt jsonb;
  v_receipt_number text;
BEGIN
  -- Get transaction details
  SELECT 
    pt.*,
    p.full_name as user_name,
    au.email as user_email
  INTO v_transaction
  FROM payment_transactions pt
  LEFT JOIN auth.users au ON au.id = pt.user_id
  LEFT JOIN profiles p ON p.id = pt.user_id
  WHERE pt.id = p_payment_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment transaction not found';
  END IF;

  -- Generate receipt number
  v_receipt_number := 'RCP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 99999)::TEXT, 5, '0');

  -- Build receipt JSON
  v_receipt := jsonb_build_object(
    'receipt_number', v_receipt_number,
    'payment_id', v_transaction.id,
    'transaction_id', v_transaction.transaction_id,
    'date', v_transaction.created_at,
    'amount', v_transaction.amount,
    'currency', v_transaction.currency,
    'status', v_transaction.status,
    'payment_method', v_transaction.payment_method,
    'customer_name', v_transaction.user_name,
    'customer_email', v_transaction.user_email
  );

  -- Insert into payment_receipts
  INSERT INTO payment_receipts (
    payment_id,
    user_id,
    receipt_number,
    amount,
    currency,
    receipt_data,
    issued_at
  )
  VALUES (
    p_payment_id,
    v_transaction.user_id,
    v_receipt_number,
    v_transaction.amount,
    v_transaction.currency,
    v_receipt,
    NOW()
  )
  ON CONFLICT (payment_id) DO UPDATE SET
    receipt_data = EXCLUDED.receipt_data,
    issued_at = EXCLUDED.issued_at;

  RETURN v_receipt;
END;
$$;


--
-- Name: generate_receipt_number(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_receipt_number() RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  receipt_num TEXT;
BEGIN
  receipt_num := 'RCP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 99999)::TEXT, 5, '0');
  RETURN receipt_num;
END;
$$;


--
-- Name: get_active_impersonation_session(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_active_impersonation_session() RETURNS TABLE(id uuid, admin_id uuid, target_user_id uuid, reason text, expires_at timestamp with time zone, actions_taken integer)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Only admins can check impersonation sessions
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    i.id,
    i.admin_id,
    i.target_user_id,
    i.reason,
    i.expires_at,
    i.actions_taken
  FROM impersonation_sessions i
  WHERE i.admin_id = auth.uid()
    AND i.ended_at IS NULL
    AND i.expires_at > NOW()
  ORDER BY i.created_at DESC
  LIMIT 1;
END;
$$;


--
-- Name: get_admin_dashboard_stats(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_admin_dashboard_stats() RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  stats JSONB;
BEGIN
  -- Check admin permission
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'total_professionals', (SELECT COUNT(*) FROM professional_profiles),
    'total_jobs', (SELECT COUNT(*) FROM jobs),
    'active_jobs', (SELECT COUNT(*) FROM jobs WHERE status = 'open'),
    'total_bookings', (SELECT COUNT(*) FROM bookings),
    'total_reviews', (SELECT COUNT(*) FROM reviews),
    'pending_disputes', (SELECT COUNT(*) FROM disputes WHERE status IN ('open', 'in_progress')),
    'total_revenue', (SELECT COALESCE(SUM(amount), 0) FROM payment_transactions WHERE status IN ('completed', 'succeeded')),
    'pending_payments', (SELECT COALESCE(SUM(amount), 0) FROM payment_transactions WHERE status = 'pending')
  ) INTO stats;

  RETURN stats;
END;
$$;


--
-- Name: get_auto_closeable_disputes(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_auto_closeable_disputes() RETURNS TABLE(dispute_id uuid, days_open integer)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
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
$$;


--
-- Name: get_available_slots(uuid, date, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_available_slots(p_professional_id uuid, p_date date, p_duration_minutes integer DEFAULT 60) RETURNS TABLE(slot_start timestamp with time zone, slot_end timestamp with time zone)
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_day_of_week text;
  v_working_hours jsonb;
  v_start_time time;
  v_end_time time;
  v_buffer_minutes integer;
  v_current_slot timestamp with time zone;
  v_slot_end timestamp with time zone;
BEGIN
  -- Get day of week
  v_day_of_week := lower(to_char(p_date, 'Day'));
  v_day_of_week := trim(v_day_of_week);
  
  -- Get professional availability settings
  SELECT 
    pa.working_hours,
    COALESCE(pa.buffer_time_minutes, 15)
  INTO v_working_hours, v_buffer_minutes
  FROM professional_availability pa
  WHERE pa.professional_id = p_professional_id;
  
  -- Check if professional works this day
  IF v_working_hours IS NULL OR 
     (v_working_hours->v_day_of_week->>'enabled')::boolean = false THEN
    RETURN;
  END IF;
  
  -- Get working hours for the day
  v_start_time := (v_working_hours->v_day_of_week->>'start')::time;
  v_end_time := (v_working_hours->v_day_of_week->>'end')::time;
  
  -- Generate time slots
  v_current_slot := p_date + v_start_time;
  
  WHILE v_current_slot + (p_duration_minutes || ' minutes')::interval <= p_date + v_end_time LOOP
    v_slot_end := v_current_slot + (p_duration_minutes || ' minutes')::interval;
    
    -- Check if slot is available
    IF check_availability(p_professional_id, v_current_slot, v_slot_end) THEN
      slot_start := v_current_slot;
      slot_end := v_slot_end;
      RETURN NEXT;
    END IF;
    
    -- Move to next slot (duration + buffer)
    v_current_slot := v_current_slot + ((p_duration_minutes + v_buffer_minutes) || ' minutes')::interval;
  END LOOP;
  
  RETURN;
END;
$$;


--
-- Name: get_cached_kpi(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_cached_kpi(p_cache_key text) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_data JSONB;
BEGIN
  SELECT data INTO v_data
  FROM public.kpi_cache
  WHERE cache_key = p_cache_key
    AND expires_at > now();
  
  RETURN v_data;
END;
$$;


--
-- Name: get_dashboard_kpis(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_dashboard_kpis() RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
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
$$;


--
-- Name: get_dashboard_kpis(date, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_dashboard_kpis(p_start_date date DEFAULT NULL::date, p_end_date date DEFAULT CURRENT_DATE) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_result JSONB;
  v_start DATE := COALESCE(p_start_date, CURRENT_DATE - INTERVAL '30 days');
BEGIN
  -- Check if user is admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'active_users', (
      SELECT COUNT(DISTINCT user_id) 
      FROM user_activity_metrics 
      WHERE metric_date BETWEEN v_start AND p_end_date
    ),
    'new_users', (
      SELECT COUNT(*) 
      FROM profiles 
      WHERE created_at::date BETWEEN v_start AND p_end_date
    ),
    'total_bookings', (
      SELECT SUM(total_bookings) 
      FROM platform_metrics 
      WHERE metric_date BETWEEN v_start AND p_end_date
    ),
    'completed_bookings', (
      SELECT SUM(completed_bookings) 
      FROM platform_metrics 
      WHERE metric_date BETWEEN v_start AND p_end_date
    ),
    'total_revenue', (
      SELECT SUM(net_revenue) 
      FROM revenue_analytics 
      WHERE analysis_date BETWEEN v_start AND p_end_date
    ),
    'average_rating', (
      SELECT AVG(average_rating) 
      FROM platform_metrics 
      WHERE metric_date BETWEEN v_start AND p_end_date
    ),
    'active_disputes', (
      SELECT COUNT(*) 
      FROM disputes 
      WHERE status IN ('open', 'in_progress')
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;


--
-- Name: get_exchange_rate(text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_exchange_rate(p_from_currency text, p_to_currency text) RETURNS numeric
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_rate NUMERIC;
BEGIN
  -- If same currency, return 1
  IF p_from_currency = p_to_currency THEN
    RETURN 1.0;
  END IF;

  -- Try direct conversion
  SELECT rate INTO v_rate
  FROM exchange_rates
  WHERE from_currency = p_from_currency
    AND to_currency = p_to_currency
  ORDER BY updated_at DESC
  LIMIT 1;

  IF v_rate IS NOT NULL THEN
    RETURN v_rate;
  END IF;

  -- Try inverse conversion
  SELECT 1.0 / rate INTO v_rate
  FROM exchange_rates
  WHERE from_currency = p_to_currency
    AND to_currency = p_from_currency
  ORDER BY updated_at DESC
  LIMIT 1;

  IF v_rate IS NOT NULL THEN
    RETURN v_rate;
  END IF;

  -- If no rate found, return NULL
  RETURN NULL;
END;
$$;


--
-- Name: get_milestone_progress(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_milestone_progress(p_contract_id uuid) RETURNS TABLE(total_milestones integer, completed_milestones integer, pending_milestones integer, total_amount numeric, released_amount numeric, pending_amount numeric, progress_percentage numeric)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_total_milestones integer;
  v_completed_milestones integer;
  v_pending_milestones integer;
  v_total_amount numeric;
  v_released_amount numeric;
  v_pending_amount numeric;
BEGIN
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'completed'),
    COUNT(*) FILTER (WHERE status IN ('pending', 'in_progress')),
    COALESCE(SUM(amount), 0),
    COALESCE(SUM(CASE WHEN status = 'released' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN status IN ('pending', 'in_progress', 'completed') THEN amount ELSE 0 END), 0)
  INTO 
    v_total_milestones,
    v_completed_milestones,
    v_pending_milestones,
    v_total_amount,
    v_released_amount,
    v_pending_amount
  FROM escrow_milestones
  WHERE contract_id = p_contract_id;

  RETURN QUERY SELECT
    v_total_milestones,
    v_completed_milestones,
    v_pending_milestones,
    v_total_amount,
    v_released_amount,
    v_pending_amount,
    CASE WHEN v_total_milestones > 0 
      THEN (v_completed_milestones::numeric / v_total_milestones) * 100 
      ELSE 0 
    END;
END;
$$;


--
-- Name: get_online_professionals(uuid[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_online_professionals(professional_ids uuid[] DEFAULT NULL::uuid[]) RETURNS TABLE(professional_id uuid, status text, custom_message text, available_until timestamp with time zone, updated_at timestamp with time zone)
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
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
$$;


--
-- Name: get_online_users_count(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_online_users_count() RETURNS integer
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM user_presence 
    WHERE status = 'online' 
      AND last_seen > now() - interval '5 minutes'
  );
END;
$$;


--
-- Name: get_payment_method_distribution(uuid, timestamp with time zone, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_payment_method_distribution(p_user_id uuid, p_start_date timestamp with time zone, p_end_date timestamp with time zone) RETURNS TABLE(payment_method text, count bigint, total_amount numeric, percentage numeric)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_total_count BIGINT;
BEGIN
  -- Get total count
  SELECT COUNT(*) INTO v_total_count
  FROM payment_transactions
  WHERE user_id = p_user_id
    AND created_at BETWEEN p_start_date AND p_end_date
    AND status IN ('completed', 'succeeded');

  RETURN QUERY
  SELECT 
    COALESCE(pt.payment_method, 'Unknown') as payment_method,
    COUNT(*) as count,
    SUM(pt.amount) as total_amount,
    CASE WHEN v_total_count > 0 THEN (COUNT(*)::NUMERIC / v_total_count) * 100 ELSE 0 END as percentage
  FROM payment_transactions pt
  WHERE pt.user_id = p_user_id
    AND pt.created_at BETWEEN p_start_date AND p_end_date
    AND pt.status IN ('completed', 'succeeded')
  GROUP BY pt.payment_method
  ORDER BY count DESC;
END;
$$;


--
-- Name: get_payment_statistics(timestamp with time zone, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_payment_statistics(p_start_date timestamp with time zone DEFAULT (now() - '30 days'::interval), p_end_date timestamp with time zone DEFAULT now()) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  result jsonb;
BEGIN
  -- Only allow admins to run this
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT jsonb_build_object(
    'total_transactions', (
      SELECT COUNT(*) FROM payment_transactions 
      WHERE created_at BETWEEN p_start_date AND p_end_date
    ),
    'total_amount', (
      SELECT COALESCE(SUM(amount), 0) FROM payment_transactions 
      WHERE created_at BETWEEN p_start_date AND p_end_date AND status IN ('completed', 'succeeded')
    ),
    'pending_refunds', (
      SELECT COUNT(*) FROM refund_requests WHERE status = 'pending'
    ),
    'active_disputes', (
      SELECT COUNT(*) FROM disputes WHERE status IN ('open', 'in_progress')
    ),
    'failed_transactions', (
      SELECT COUNT(*) FROM payment_transactions 
      WHERE created_at BETWEEN p_start_date AND p_end_date AND status IN ('failed', 'cancelled')
    )
  ) INTO result;

  RETURN result;
END;
$$;


--
-- Name: get_payments_needing_reminders(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_payments_needing_reminders() RETURNS TABLE(payment_id uuid, user_id uuid, schedule_id uuid, job_id uuid, amount numeric, currency text, due_date timestamp with time zone, installment_number integer, reminder_days integer)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.id as payment_id,
    ps.user_id,
    sp.schedule_id,
    ps.job_id,
    sp.amount,
    sp.currency,
    sp.due_date,
    sp.installment_number,
    COALESCE(np.payment_reminder_days, 3) as reminder_days
  FROM scheduled_payments sp
  JOIN payment_schedules ps ON ps.id = sp.schedule_id
  LEFT JOIN notification_preferences np ON np.user_id = ps.user_id
  WHERE sp.status = 'pending'
    AND sp.due_date <= NOW() + (COALESCE(np.payment_reminder_days, 3) || ' days')::INTERVAL
    AND sp.due_date > NOW()
    AND NOT EXISTS (
      SELECT 1 FROM payment_reminders pr
      WHERE pr.scheduled_payment_id = sp.id
        AND pr.reminder_type = 'upcoming'
        AND pr.sent_at > NOW() - INTERVAL '1 day'
    );
END;
$$;


--
-- Name: get_pending_reminders(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_pending_reminders() RETURNS TABLE(reminder_id uuid, booking_id uuid, user_id uuid, user_email text, user_name text, event_title text, event_start timestamp with time zone, event_location jsonb, reminder_type text, delivery_method text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    br.id,
    br.booking_id,
    br.user_id,
    au.email,
    p.full_name,
    ce.title,
    ce.start_time,
    ce.location,
    br.reminder_type,
    br.delivery_method
  FROM public.booking_reminders br
  JOIN public.calendar_events ce ON ce.id = br.booking_id
  JOIN public.profiles p ON p.id = br.user_id
  JOIN auth.users au ON au.id = br.user_id
  WHERE br.status = 'pending'
    AND br.scheduled_for <= now()
    AND ce.status NOT IN ('cancelled', 'no_show')
  ORDER BY br.scheduled_for ASC
  LIMIT 100;
END;
$$;


--
-- Name: get_popular_searches(text, text, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_popular_searches(p_search_type text DEFAULT NULL::text, p_period text DEFAULT 'weekly'::text, p_limit integer DEFAULT 10) RETURNS TABLE(search_term text, search_type text, popularity_score integer)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ps.search_term,
    ps.search_type,
    ps.popularity_score
  FROM popular_searches ps
  WHERE 
    ps.period = p_period
    AND ps.period_start = CASE 
      WHEN p_period = 'daily' THEN CURRENT_DATE
      WHEN p_period = 'weekly' THEN date_trunc('week', CURRENT_DATE)::DATE
      WHEN p_period = 'monthly' THEN date_trunc('month', CURRENT_DATE)::DATE
    END
    AND (p_search_type IS NULL OR ps.search_type = p_search_type)
  ORDER BY ps.popularity_score DESC
  LIMIT p_limit;
END;
$$;


--
-- Name: get_professional_earnings_summary(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_professional_earnings_summary(p_professional_id uuid) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_summary jsonb;
BEGIN
  -- Only allow professionals to view their own earnings
  IF auth.uid() != p_professional_id AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT jsonb_build_object(
    'total_earnings', COALESCE(SUM(CASE WHEN status IN ('completed', 'succeeded') THEN amount ELSE 0 END), 0),
    'pending_earnings', COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0),
    'total_transactions', COUNT(*),
    'completed_transactions', COUNT(*) FILTER (WHERE status IN ('completed', 'succeeded')),
    'average_transaction', COALESCE(AVG(CASE WHEN status IN ('completed', 'succeeded') THEN amount ELSE NULL END), 0),
    'last_payment_date', MAX(CASE WHEN status IN ('completed', 'succeeded') THEN created_at ELSE NULL END)
  )
  INTO v_summary
  FROM payment_transactions
  WHERE user_id = p_professional_id;

  RETURN v_summary;
END;
$$;


--
-- Name: get_profile_view_count(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_profile_view_count(p_professional_id uuid) RETURNS integer
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN (
    SELECT COUNT(DISTINCT session_id)::INTEGER
    FROM public.profile_views
    WHERE professional_id = p_professional_id
  );
END;
$$;


--
-- Name: get_recent_profile_views(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_recent_profile_views(p_professional_id uuid) RETURNS integer
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN (
    SELECT COUNT(DISTINCT session_id)::INTEGER
    FROM public.profile_views
    WHERE professional_id = p_professional_id
      AND viewed_at >= NOW() - INTERVAL '30 days'
  );
END;
$$;


--
-- Name: get_revenue_trend(uuid, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_revenue_trend(p_user_id uuid, p_days integer DEFAULT 30) RETURNS TABLE(date date, revenue numeric, payment_count bigint)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(pt.created_at) as date,
    COALESCE(SUM(pt.amount), 0) as revenue,
    COUNT(*) as payment_count
  FROM payment_transactions pt
  WHERE pt.user_id = p_user_id
    AND pt.status IN ('completed', 'succeeded')
    AND pt.created_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY DATE(pt.created_at)
  ORDER BY date DESC;
END;
$$;


--
-- Name: get_reviews_for_user(uuid, integer, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_reviews_for_user(p_user_id uuid, p_min_rating integer DEFAULT NULL::integer, p_limit integer DEFAULT 20, p_offset integer DEFAULT 0) RETURNS TABLE(id uuid, job_id uuid, reviewer_id uuid, reviewer_name text, reviewer_avatar text, rating integer, title text, comment text, category_ratings jsonb, is_verified boolean, helpful_count integer, response_text text, response_at timestamp with time zone, created_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.job_id,
    r.reviewer_id,
    p.full_name as reviewer_name,
    p.avatar_url as reviewer_avatar,
    r.rating,
    r.title,
    r.comment,
    r.category_ratings,
    r.is_verified,
    r.helpful_count,
    r.response_text,
    r.response_at,
    r.created_at
  FROM reviews r
  LEFT JOIN profiles p ON p.id = r.reviewer_id
  WHERE r.reviewee_id = p_user_id
    AND r.moderation_status = 'approved'
    AND (p_min_rating IS NULL OR r.rating >= p_min_rating)
  ORDER BY r.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;


--
-- Name: get_sla_breach_tickets(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_sla_breach_tickets() RETURNS TABLE(ticket_id uuid, ticket_number integer, subject text, priority text, user_id uuid, assigned_to uuid, sla_deadline timestamp with time zone, minutes_until_breach integer)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    st.id,
    st.ticket_number,
    st.subject,
    st.priority,
    st.user_id,
    st.assigned_to,
    st.sla_deadline,
    EXTRACT(EPOCH FROM (st.sla_deadline - now()))::INTEGER / 60 as minutes_until_breach
  FROM public.support_tickets st
  WHERE st.status IN ('open', 'in_progress', 'waiting_response')
    AND st.sla_deadline IS NOT NULL
    AND st.sla_deadline <= now() + INTERVAL '2 hours'
  ORDER BY st.sla_deadline ASC;
END;
$$;


--
-- Name: get_top_performing_professionals(integer, timestamp with time zone, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_top_performing_professionals(p_limit integer DEFAULT 10, p_start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, p_end_date timestamp with time zone DEFAULT now()) RETURNS TABLE(professional_id uuid, professional_name text, total_earnings numeric, jobs_completed integer, average_rating numeric, success_rate numeric)
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pp.user_id as professional_id,
    COALESCE(p.full_name, p.display_name, 'Unknown') as professional_name,
    COALESCE(SUM(pt.amount), 0) as total_earnings,
    COUNT(DISTINCT c.id)::integer as jobs_completed,
    COALESCE(AVG(r.rating), 0) as average_rating,
    CASE 
      WHEN COUNT(DISTINCT c.id) > 0 
      THEN (COUNT(DISTINCT c.id) FILTER (WHERE c.escrow_status = 'released'))::numeric / COUNT(DISTINCT c.id)::numeric * 100
      ELSE 0
    END as success_rate
  FROM public.professional_profiles pp
  LEFT JOIN public.profiles p ON p.id = pp.user_id
  LEFT JOIN public.contracts c ON c.tasker_id = pp.user_id
    AND c.created_at BETWEEN COALESCE(p_start_date, '1970-01-01'::timestamptz) AND p_end_date
  LEFT JOIN public.payment_transactions pt ON pt.user_id = pp.user_id
    AND pt.status IN ('completed', 'succeeded')
    AND pt.created_at BETWEEN COALESCE(p_start_date, '1970-01-01'::timestamptz) AND p_end_date
  LEFT JOIN public.reviews r ON r.professional_id = pp.user_id
    AND r.created_at BETWEEN COALESCE(p_start_date, '1970-01-01'::timestamptz) AND p_end_date
  WHERE pp.verification_status = 'verified'
  GROUP BY pp.user_id, p.full_name, p.display_name
  ORDER BY total_earnings DESC, jobs_completed DESC
  LIMIT p_limit;
END;
$$;


--
-- Name: get_top_revenue_sources(uuid, timestamp with time zone, timestamp with time zone, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_top_revenue_sources(p_user_id uuid, p_start_date timestamp with time zone, p_end_date timestamp with time zone, p_limit integer DEFAULT 10) RETURNS TABLE(job_id uuid, job_title text, total_revenue numeric, payment_count bigint)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pt.job_id,
    j.title as job_title,
    SUM(pt.amount) as total_revenue,
    COUNT(*) as payment_count
  FROM payment_transactions pt
  LEFT JOIN jobs j ON j.id = pt.job_id
  WHERE pt.user_id = p_user_id
    AND pt.created_at BETWEEN p_start_date AND p_end_date
    AND pt.status IN ('completed', 'succeeded')
    AND pt.job_id IS NOT NULL
  GROUP BY pt.job_id, j.title
  ORDER BY total_revenue DESC
  LIMIT p_limit;
END;
$$;


--
-- Name: get_unread_message_count(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_unread_message_count(p_user_id uuid) RETURNS integer
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT COUNT(*)::integer
  FROM messages
  WHERE recipient_id = p_user_id
    AND read_at IS NULL;
$$;


--
-- Name: get_upcoming_payments(uuid, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_upcoming_payments(p_user_id uuid DEFAULT auth.uid(), p_days_ahead integer DEFAULT 7) RETURNS TABLE(payment_id uuid, schedule_id uuid, job_id uuid, installment_number integer, amount numeric, currency text, due_date timestamp with time zone, status text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.id as payment_id,
    sp.schedule_id,
    ps.job_id,
    sp.installment_number,
    sp.amount,
    sp.currency,
    sp.due_date,
    sp.status
  FROM scheduled_payments sp
  JOIN payment_schedules ps ON ps.id = sp.schedule_id
  WHERE ps.user_id = p_user_id
    AND sp.status = 'pending'
    AND sp.due_date <= NOW() + (p_days_ahead || ' days')::INTERVAL
  ORDER BY sp.due_date ASC;
END;
$$;


--
-- Name: get_user_role(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_role(user_id uuid) RETURNS text
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT active_role FROM public.profiles WHERE id = user_id;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, roles)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(
      CASE 
        WHEN NEW.raw_user_meta_data->>'intent_role' = 'professional' THEN '["professional"]'::jsonb
        WHEN NEW.raw_user_meta_data->>'intent_role' = 'client' THEN '["client"]'::jsonb
        ELSE '["client"]'::jsonb
      END
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;


--
-- Name: handle_verification_approval(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_verification_approval() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: has_admin_scope(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_admin_scope(p_user_id uuid, p_scope text) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_permissions
    WHERE admin_id = p_user_id
      AND (scope = p_scope OR scope = 'global')
  );
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(p_user uuid, p_role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = p_user AND role = p_role
  );
$$;


--
-- Name: increment_message_count(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.increment_message_count(p_user_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.message_rate_limits (user_id, messages_sent, window_start)
  VALUES (p_user_id, 1, now())
  ON CONFLICT (user_id) 
  DO UPDATE SET messages_sent = message_rate_limits.messages_sent + 1;
END;
$$;


--
-- Name: is_admin_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_admin_user() RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Check if the current user has admin role in their JWT claims
  -- This avoids querying the profiles table within a profiles policy
  RETURN COALESCE(
    (current_setting('request.jwt.claims', true)::json->>'user_metadata')::json->>'is_admin',
    'false'
  )::boolean;
END;
$$;


--
-- Name: is_feature_on(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_feature_on(p_key text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_flag RECORD;
  v_user_id UUID;
BEGIN
  -- Get current user ID (may be null for anonymous users)
  v_user_id := auth.uid();
  
  -- Get the feature flag
  SELECT * INTO v_flag
  FROM public.feature_flags
  WHERE key = p_key;
  
  -- If flag doesn't exist, return false
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- If kill switch is active, return false
  IF v_flag.kill_switch_active THEN
    RETURN FALSE;
  END IF;
  
  -- If flag is not enabled, return false
  IF NOT v_flag.enabled THEN
    RETURN FALSE;
  END IF;
  
  -- Check rollout percentage
  IF v_flag.rollout_percentage >= 100 THEN
    RETURN TRUE;
  END IF;
  
  -- For partial rollout, return true if rollout > 0
  -- In production, you might want more sophisticated rollout logic
  -- (e.g., based on user ID hash for consistent assignment)
  RETURN v_flag.rollout_percentage > 0;
END;
$$;


--
-- Name: log_activity(text, text, uuid, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_activity(p_action text, p_entity_type text DEFAULT NULL::text, p_entity_id uuid DEFAULT NULL::uuid, p_changes jsonb DEFAULT NULL::jsonb) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
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
$$;


--
-- Name: log_admin_action(text, text, text, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_admin_action(p_action text, p_entity_type text, p_entity_id text, p_meta jsonb DEFAULT '{}'::jsonb) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE v_id uuid;
BEGIN
  INSERT INTO admin_audit_log(
    id, admin_id, action, entity_type, entity_id, changes,
    ip_address, user_agent, created_at
  ) VALUES (
    gen_random_uuid(), 
    auth.uid(), 
    p_action, 
    p_entity_type, 
    p_entity_id, 
    p_meta,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent',
    now()
  ) RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;


--
-- Name: log_admin_action(text, text, uuid, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_admin_action(p_action text, p_entity_type text DEFAULT NULL::text, p_entity_id uuid DEFAULT NULL::uuid, p_changes jsonb DEFAULT NULL::jsonb) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.admin_audit_log (
    admin_id,
    action,
    entity_type,
    entity_id,
    changes
  ) VALUES (
    auth.uid(),
    p_action,
    p_entity_type,
    p_entity_id,
    p_changes
  ) RETURNING id INTO log_id;

  RETURN log_id;
END;
$$;


--
-- Name: log_dispute_event(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_dispute_event() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
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
$$;


--
-- Name: log_dispute_evidence_upload(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_dispute_evidence_upload() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO dispute_timeline (dispute_id, event_type, description, metadata)
  VALUES (
    NEW.dispute_id,
    'evidence_uploaded',
    'New evidence uploaded: ' || COALESCE(NEW.evidence_category, 'other'),
    jsonb_build_object(
      'evidence_id', NEW.id,
      'category', NEW.evidence_category,
      'file_name', NEW.file_name
    )
  );
  RETURN NEW;
END;
$$;


--
-- Name: log_job_state_transition(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_job_state_transition() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: log_job_view_attempt(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_job_view_attempt() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Only log when non-owners view jobs for security monitoring
  IF auth.uid() IS NOT NULL AND auth.uid() != NEW.client_id THEN
    PERFORM public.log_activity(
      'job_viewed',
      'job', 
      NEW.id,
      jsonb_build_object(
        'viewer_id', auth.uid(),
        'job_title', NEW.title,
        'job_status', NEW.status
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: log_milestone_approval(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_milestone_approval() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
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
$$;


--
-- Name: log_security_event(uuid, text, text, text, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_security_event(p_user_id uuid, p_event_type text, p_event_category text, p_severity text DEFAULT 'low'::text, p_event_data jsonb DEFAULT '{}'::jsonb) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
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
$$;


--
-- Name: log_user_roles_change(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_user_roles_change() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.user_roles_audit_log(actor_user_id, target_user_id, action, new_row)
    VALUES (auth.uid(), NEW.user_id, 'insert', to_jsonb(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.user_roles_audit_log(actor_user_id, target_user_id, action, old_row, new_row)
    VALUES (auth.uid(), NEW.user_id, 'update', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO public.user_roles_audit_log(actor_user_id, target_user_id, action, old_row)
    VALUES (auth.uid(), OLD.user_id, 'delete', to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;


--
-- Name: mark_overdue_invoices(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.mark_overdue_invoices() RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  UPDATE invoices
  SET status = 'overdue'
  WHERE status = 'sent'
    AND due_date < now()
    AND due_date IS NOT NULL;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;


--
-- Name: mark_party_agreement(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.mark_party_agreement(p_dispute_id uuid, p_field text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  r record;
BEGIN
  SELECT * INTO r FROM public.dispute_resolutions 
  WHERE dispute_id = p_dispute_id 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  IF r IS NULL THEN RETURN; END IF;
  
  IF p_field = 'party_client_agreed' THEN
    UPDATE public.dispute_resolutions SET party_client_agreed = true WHERE id = r.id;
  ELSIF p_field = 'party_professional_agreed' THEN
    UPDATE public.dispute_resolutions SET party_professional_agreed = true WHERE id = r.id;
  END IF;
  
  -- Add timeline event
  INSERT INTO public.dispute_timeline (dispute_id, event_type, description, metadata)
  VALUES (p_dispute_id, 'resolution_agreement', 'Party agreed to resolution', jsonb_build_object('field', p_field));
END;
$$;


--
-- Name: mark_reminder_sent(uuid, boolean, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.mark_reminder_sent(p_reminder_id uuid, p_success boolean, p_error_message text DEFAULT NULL::text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  UPDATE public.booking_reminders
  SET 
    status = CASE WHEN p_success THEN 'sent' ELSE 'failed' END,
    sent_at = CASE WHEN p_success THEN now() ELSE NULL END,
    error_message = p_error_message
  WHERE id = p_reminder_id;
END;
$$;


--
-- Name: mark_user_online(uuid, text, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.mark_user_online(p_user_id uuid, p_custom_status text DEFAULT NULL::text, p_device_info jsonb DEFAULT '{}'::jsonb) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO user_presence (user_id, status, custom_status, device_info, last_seen)
  VALUES (p_user_id, 'online', p_custom_status, p_device_info, now())
  ON CONFLICT (user_id) DO UPDATE SET
    status = 'online',
    custom_status = EXCLUDED.custom_status,
    device_info = EXCLUDED.device_info,
    last_seen = now(),
    updated_at = now();
END;
$$;


--
-- Name: notify_client_new_quote(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.notify_client_new_quote() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_client_id UUID;
  v_job_title TEXT;
  v_professional_name TEXT;
BEGIN
  -- Get job details
  SELECT client_id, title INTO v_client_id, v_job_title
  FROM public.jobs
  WHERE id = NEW.job_id;
  
  -- Get professional name
  SELECT COALESCE(full_name, display_name, 'A professional') INTO v_professional_name
  FROM public.profiles
  WHERE id = NEW.professional_id;
  
  -- Create activity feed notification with correct route
  INSERT INTO public.activity_feed (
    user_id,
    event_type,
    entity_type,
    entity_id,
    title,
    description,
    action_url,
    notification_type,
    priority
  ) VALUES (
    v_client_id,
    'quote_received',
    'job_quote',
    NEW.id,
    'New Quote Received',
    v_professional_name || ' submitted a quote for "' || v_job_title || '"',
    '/jobs/' || NEW.job_id,
    'quote',
    'high'
  );
  
  RETURN NEW;
END;
$$;


--
-- Name: notify_escrow_funded(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.notify_escrow_funded() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_job RECORD;
BEGIN
  -- Only trigger when escrow status changes to 'funded'
  IF NEW.escrow_status = 'funded' AND OLD.escrow_status != 'funded' THEN
    -- Get job details
    SELECT j.title, j.client_id INTO v_job
    FROM public.jobs j
    WHERE j.id = NEW.job_id;
    
    IF v_job IS NOT NULL THEN
      -- Notify professional that escrow is funded and they can start work
      INSERT INTO public.activity_feed (
        user_id,
        event_type,
        entity_type,
        entity_id,
        title,
        description,
        action_url,
        notification_type,
        priority
      ) VALUES (
        NEW.tasker_id,
        'escrow_funded',
        'contract',
        NEW.id,
        'Escrow Funded - Start Work!',
        'The client has funded escrow for "' || v_job.title || '". You can now begin work.',
        '/contracts/' || NEW.id,
        'payment',
        'high'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: notify_milestone_completed(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.notify_milestone_completed() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_contract RECORD;
  v_job RECORD;
BEGIN
  -- Only trigger when milestone status changes to 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Get contract and job details
    SELECT c.client_id, c.tasker_id, c.job_id, j.title
    INTO v_contract
    FROM public.contracts c
    LEFT JOIN public.jobs j ON j.id = c.job_id
    WHERE c.id = NEW.contract_id;
    
    IF v_contract IS NOT NULL THEN
      -- Notify client that milestone is completed and needs verification
      INSERT INTO public.activity_feed (
        user_id,
        event_type,
        entity_type,
        entity_id,
        title,
        description,
        action_url,
        notification_type,
        priority
      ) VALUES (
        v_contract.client_id,
        'milestone_completed',
        'milestone',
        NEW.id,
        'Work Completed - Review Needed',
        'Professional completed milestone #' || NEW.milestone_number || ' for "' || COALESCE(v_contract.title, 'your project') || '". Please review and verify.',
        '/contracts/' || NEW.contract_id,
        'work',
        'high'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: notify_payment_released(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.notify_payment_released() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_milestone RECORD;
  v_contract RECORD;
BEGIN
  -- Only trigger when transaction type is 'release' and status changes to 'completed'
  IF NEW.transaction_type = 'release' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Get milestone and contract details
    SELECT 
      em.milestone_number,
      em.amount,
      c.tasker_id,
      c.job_id,
      j.title
    INTO v_milestone
    FROM public.escrow_milestones em
    LEFT JOIN public.contracts c ON c.id = em.contract_id
    LEFT JOIN public.jobs j ON j.id = c.job_id
    WHERE em.id = NEW.milestone_id;
    
    IF v_milestone IS NOT NULL THEN
      -- Notify professional that payment was released
      INSERT INTO public.activity_feed (
        user_id,
        event_type,
        entity_type,
        entity_id,
        title,
        description,
        action_url,
        notification_type,
        priority
      ) VALUES (
        v_milestone.tasker_id,
        'payment_released',
        'transaction',
        NEW.id,
        'Payment Released!',
        'Payment of €' || v_milestone.amount || ' for milestone #' || v_milestone.milestone_number || ' has been released to you.',
        '/earnings',
        'payment',
        'high'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: notify_review_request(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.notify_review_request() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_contract RECORD;
  v_all_milestones_complete BOOLEAN;
  v_review_exists BOOLEAN;
BEGIN
  -- Only trigger when contract status changes to 'completed'
  IF NEW.escrow_status = 'released' AND OLD.escrow_status != 'released' THEN
    -- Get contract details
    SELECT c.client_id, c.tasker_id, c.job_id, j.title
    INTO v_contract
    FROM public.contracts c
    LEFT JOIN public.jobs j ON j.id = c.job_id
    WHERE c.id = NEW.id;
    
    IF v_contract IS NOT NULL THEN
      -- Check if review already exists
      SELECT EXISTS (
        SELECT 1 FROM public.reviews
        WHERE job_id = v_contract.job_id
        AND client_id = v_contract.client_id
        AND professional_id = v_contract.tasker_id
      ) INTO v_review_exists;
      
      -- Only notify if no review exists yet
      IF NOT v_review_exists THEN
        -- Notify client to leave a review
        INSERT INTO public.activity_feed (
          user_id,
          event_type,
          entity_type,
          entity_id,
          title,
          description,
          action_url,
          notification_type,
          priority
        ) VALUES (
          v_contract.client_id,
          'review_request',
          'job',
          v_contract.job_id,
          'Leave a Review',
          'How was your experience with "' || COALESCE(v_contract.title, 'your project') || '"? Share your feedback.',
          '/jobs/' || v_contract.job_id,
          'review',
          'medium'
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: notify_work_verified(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.notify_work_verified() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_contract RECORD;
  v_job RECORD;
BEGIN
  -- Trigger when milestone is approved (has approved_by and approved_date)
  IF NEW.approved_by IS NOT NULL AND OLD.approved_by IS NULL THEN
    -- Get contract and job details
    SELECT c.client_id, c.tasker_id, c.job_id, j.title
    INTO v_contract
    FROM public.contracts c
    LEFT JOIN public.jobs j ON j.id = c.job_id
    WHERE c.id = NEW.contract_id;
    
    IF v_contract IS NOT NULL THEN
      -- Notify professional that work was verified
      INSERT INTO public.activity_feed (
        user_id,
        event_type,
        entity_type,
        entity_id,
        title,
        description,
        action_url,
        notification_type,
        priority
      ) VALUES (
        v_contract.tasker_id,
        'work_verified',
        'milestone',
        NEW.id,
        'Work Approved!',
        'Client approved milestone #' || NEW.milestone_number || ' for "' || COALESCE(v_contract.title, 'your project') || '". Payment will be released.',
        '/contracts/' || NEW.contract_id,
        'payment',
        'high'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: prevent_approved_mutation(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.prevent_approved_mutation() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF (OLD.status = 'approved' AND (
    OLD.content IS DISTINCT FROM NEW.content OR
    OLD.source IS DISTINCT FROM NEW.source OR
    OLD.prompt_hash IS DISTINCT FROM NEW.prompt_hash
  )) THEN
    RAISE EXCEPTION 'Approved packs are immutable. Create a new version instead.';
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: prevent_duplicate_reviews(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.prevent_duplicate_reviews() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM reviews
    WHERE professional_id = NEW.professional_id
      AND client_id = NEW.client_id
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) THEN
    RAISE EXCEPTION 'You have already reviewed this professional';
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: set_auto_release_date(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_auto_release_date() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  IF NEW.party_client_agreed = true AND NEW.party_professional_agreed = true THEN
    NEW.auto_execute_date := now() + interval '24 hours';
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: set_message_response_time(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_message_response_time() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
DECLARE
  prev_msg record;
BEGIN
  SELECT created_at INTO prev_msg
  FROM public.dispute_messages
  WHERE dispute_id = NEW.dispute_id
    AND sender_id != NEW.sender_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF prev_msg IS NOT NULL THEN
    NEW.response_time_seconds := EXTRACT(EPOCH FROM (NEW.created_at - prev_msg.created_at))::integer;
  ELSE
    NEW.response_time_seconds := NULL;
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: set_ticket_sla(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_ticket_sla() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  IF NEW.sla_deadline IS NULL THEN
    NEW.sla_deadline := public.calculate_sla_deadline(NEW.priority, NEW.created_at);
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: should_expose_feature(text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.should_expose_feature(p_flag_key text, p_user_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_flag RECORD;
  v_user_hash INTEGER;
  v_exposure_threshold INTEGER;
BEGIN
  -- Get flag settings
  SELECT * INTO v_flag
  FROM public.feature_flags
  WHERE key = p_flag_key AND is_enabled = true;

  -- If flag doesn't exist or is disabled, return false
  IF v_flag IS NULL THEN
    RETURN false;
  END IF;

  -- Check kill switch
  IF v_flag.kill_switch_active THEN
    RETURN false;
  END IF;

  -- If 100% rollout, expose to everyone
  IF v_flag.rollout_percentage = 100 THEN
    -- Log exposure
    INSERT INTO public.feature_flag_exposures (flag_key, user_id)
    VALUES (p_flag_key, p_user_id)
    ON CONFLICT DO NOTHING;
    
    RETURN true;
  END IF;

  -- Calculate user hash (deterministic based on user_id)
  v_user_hash := ABS(HASHTEXT(p_user_id::TEXT)) % 100;
  v_exposure_threshold := v_flag.rollout_percentage;

  -- Expose if user hash is within threshold
  IF v_user_hash < v_exposure_threshold THEN
    -- Log exposure
    INSERT INTO public.feature_flag_exposures (flag_key, user_id)
    VALUES (p_flag_key, p_user_id)
    ON CONFLICT DO NOTHING;
    
    RETURN true;
  END IF;

  RETURN false;
END;
$$;


--
-- Name: split_milestone_into_phases(uuid, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.split_milestone_into_phases(p_contract_id uuid, p_phases jsonb) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_contract RECORD;
  v_phase JSONB;
  v_phase_num INT := 1;
  v_total_allocated NUMERIC := 0;
BEGIN
  -- Get contract
  SELECT * INTO v_contract FROM public.contracts WHERE id = p_contract_id;
  
  IF v_contract IS NULL THEN
    RAISE EXCEPTION 'Contract not found';
  END IF;
  
  -- Verify caller is client
  IF auth.uid() != v_contract.client_id THEN
    RAISE EXCEPTION 'Only the client can split milestones';
  END IF;
  
  -- Delete existing milestones
  DELETE FROM public.escrow_milestones WHERE contract_id = p_contract_id;
  
  -- Create new milestones from phases
  FOR v_phase IN SELECT * FROM jsonb_array_elements(p_phases)
  LOOP
    INSERT INTO public.escrow_milestones (
      contract_id,
      milestone_number,
      description,
      amount,
      currency,
      status,
      due_date
    ) VALUES (
      p_contract_id,
      v_phase_num,
      v_phase->>'description',
      (v_phase->>'amount')::NUMERIC,
      'EUR',
      'pending',
      CASE 
        WHEN v_phase->>'due_date' IS NOT NULL 
        THEN (v_phase->>'due_date')::DATE 
        ELSE NULL 
      END
    );
    
    v_total_allocated := v_total_allocated + (v_phase->>'amount')::NUMERIC;
    v_phase_num := v_phase_num + 1;
  END LOOP;
  
  -- Verify total matches contract amount
  IF v_total_allocated != v_contract.agreed_amount THEN
    RAISE EXCEPTION 'Phase amounts (%) do not match contract total (%)', v_total_allocated, v_contract.agreed_amount;
  END IF;
  
  -- Log event
  INSERT INTO public.activity_feed (
    user_id,
    event_type,
    entity_type,
    entity_id,
    title,
    description
  ) VALUES (
    v_contract.client_id,
    'milestones_split',
    'contract',
    p_contract_id,
    'Payment Milestones Created',
    'Contract split into ' || (v_phase_num - 1) || ' payment milestones'
  );
END;
$$;


--
-- Name: track_analytics_event(uuid, text, text, text, jsonb, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.track_analytics_event(p_user_id uuid DEFAULT NULL::uuid, p_session_id text DEFAULT NULL::text, p_event_name text DEFAULT NULL::text, p_event_category text DEFAULT NULL::text, p_event_properties jsonb DEFAULT '{}'::jsonb, p_page_url text DEFAULT NULL::text, p_referrer text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO analytics_events (
    user_id,
    session_id,
    event_name,
    event_category,
    event_properties,
    page_url,
    referrer
  ) VALUES (
    p_user_id,
    COALESCE(p_session_id, gen_random_uuid()::text),
    p_event_name,
    p_event_category,
    p_event_properties,
    p_page_url,
    p_referrer
  ) RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$;


--
-- Name: track_document_edit(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.track_document_edit() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
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
$$;


--
-- Name: track_job_lifecycle(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.track_job_lifecycle() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
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
$$;


--
-- Name: track_search_analytics(text, text, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.track_search_analytics(p_search_term text, p_search_type text, p_results_count integer) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO search_analytics (
    date,
    search_term,
    search_type,
    search_count,
    zero_results_count,
    avg_results
  ) VALUES (
    CURRENT_DATE,
    p_search_term,
    p_search_type,
    1,
    CASE WHEN p_results_count = 0 THEN 1 ELSE 0 END,
    p_results_count
  )
  ON CONFLICT (date, search_term, search_type) DO UPDATE SET
    search_count = search_analytics.search_count + 1,
    zero_results_count = search_analytics.zero_results_count + CASE WHEN p_results_count = 0 THEN 1 ELSE 0 END,
    avg_results = ((search_analytics.avg_results * search_analytics.search_count) + p_results_count) / (search_analytics.search_count + 1);
END;
$$;


--
-- Name: trigger_create_booking_reminders(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trigger_create_booking_reminders() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF NEW.event_type = 'booking' AND NEW.status = 'scheduled' THEN
    PERFORM public.create_booking_reminders(NEW.id, NEW.user_id, NEW.start_time);
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: trigger_update_rating_summary(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trigger_update_rating_summary() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  PERFORM update_rating_summary(COALESCE(NEW.professional_id, OLD.professional_id));
  RETURN COALESCE(NEW, OLD);
END;
$$;


--
-- Name: update_analytics_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_analytics_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_applicant_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_applicant_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_conversation_last_message(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_conversation_last_message() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  UPDATE public.conversations
  SET last_message_at = NEW.created_at,
      updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;


--
-- Name: update_dispute_last_activity(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_dispute_last_activity() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  UPDATE public.disputes
  SET last_activity_at = now()
  WHERE id = NEW.dispute_id;
  RETURN NEW;
END;
$$;


--
-- Name: update_micro_questions_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_micro_questions_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_notification_preferences_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_notification_preferences_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_payment_analytics_summary_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_payment_analytics_summary_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_payment_schedules_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_payment_schedules_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_professional_availability_timestamp(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_professional_availability_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_professional_stats(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_professional_stats() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Update stats when bookings change status
  IF TG_TABLE_NAME = 'booking_requests' THEN
    INSERT INTO professional_stats (professional_id)
    VALUES (COALESCE(NEW.professional_id, OLD.professional_id))
    ON CONFLICT (professional_id) DO UPDATE SET
      total_bookings = (
        SELECT COUNT(*) FROM booking_requests 
        WHERE professional_id = EXCLUDED.professional_id
      ),
      completed_bookings = (
        SELECT COUNT(*) FROM booking_requests 
        WHERE professional_id = EXCLUDED.professional_id AND status = 'completed'
      ),
      completion_rate = (
        SELECT CASE 
          WHEN COUNT(*) = 0 THEN 0 
          ELSE (COUNT(*) FILTER (WHERE status = 'completed'))::numeric / COUNT(*) * 100 
        END
        FROM booking_requests 
        WHERE professional_id = EXCLUDED.professional_id
      ),
      updated_at = now();
  END IF;

  -- Update stats when reviews are added
  IF TG_TABLE_NAME = 'professional_reviews' THEN
    INSERT INTO professional_stats (professional_id)
    VALUES (NEW.professional_id)
    ON CONFLICT (professional_id) DO UPDATE SET
      total_reviews = (
        SELECT COUNT(*) FROM professional_reviews 
        WHERE professional_id = EXCLUDED.professional_id
      ),
      average_rating = (
        SELECT COALESCE(AVG(rating), 0) FROM professional_reviews 
        WHERE professional_id = EXCLUDED.professional_id
      ),
      updated_at = now();
  END IF;

  -- Update stats when earnings are recorded
  IF TG_TABLE_NAME = 'professional_earnings' THEN
    INSERT INTO professional_stats (professional_id)
    VALUES (NEW.professional_id)
    ON CONFLICT (professional_id) DO UPDATE SET
      total_earnings = (
        SELECT COALESCE(SUM(net_amount), 0) FROM professional_earnings 
        WHERE professional_id = EXCLUDED.professional_id AND status = 'paid'
      ),
      updated_at = now();
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;


--
-- Name: update_rating_summary(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_rating_summary(p_user_id uuid, p_role text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_total_reviews integer;
  v_avg_rating numeric;
  v_distribution jsonb;
  v_category_avgs jsonb;
  v_total_with_response integer;
  v_response_rate numeric;
BEGIN
  -- Get basic stats
  SELECT 
    COUNT(*),
    COALESCE(AVG(rating), 0)
  INTO v_total_reviews, v_avg_rating
  FROM reviews
  WHERE reviewee_id = p_user_id
    AND moderation_status = 'approved';

  -- Calculate rating distribution
  SELECT jsonb_object_agg(rating::text, count)
  INTO v_distribution
  FROM (
    SELECT rating, COUNT(*) as count
    FROM reviews
    WHERE reviewee_id = p_user_id
      AND moderation_status = 'approved'
    GROUP BY rating
  ) dist;

  -- Calculate category averages
  SELECT jsonb_object_agg(key, avg_value)
  INTO v_category_avgs
  FROM (
    SELECT 
      key,
      AVG((value)::numeric) as avg_value
    FROM reviews,
    LATERAL jsonb_each_text(category_ratings)
    WHERE reviewee_id = p_user_id
      AND moderation_status = 'approved'
    GROUP BY key
  ) cats;

  -- Calculate response rate
  SELECT 
    COUNT(*) FILTER (WHERE response_text IS NOT NULL),
    COUNT(*)
  INTO v_total_with_response, v_total_reviews
  FROM reviews
  WHERE reviewee_id = p_user_id
    AND moderation_status = 'approved';

  v_response_rate := CASE 
    WHEN v_total_reviews > 0 THEN (v_total_with_response::numeric / v_total_reviews) * 100 
    ELSE 0 
  END;

  -- Upsert rating summary
  INSERT INTO rating_summary (
    user_id,
    role,
    total_reviews,
    average_rating,
    rating_distribution,
    category_averages,
    response_rate,
    updated_at
  ) VALUES (
    p_user_id,
    p_role,
    v_total_reviews,
    v_avg_rating,
    COALESCE(v_distribution, '{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}'::jsonb),
    COALESCE(v_category_avgs, '{}'::jsonb),
    v_response_rate,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_reviews = EXCLUDED.total_reviews,
    average_rating = EXCLUDED.average_rating,
    rating_distribution = EXCLUDED.rating_distribution,
    category_averages = EXCLUDED.category_averages,
    response_rate = EXCLUDED.response_rate,
    updated_at = now();
END;
$$;


--
-- Name: update_realtime_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_realtime_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_review_helpful_counts(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_review_helpful_counts() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.helpful != NEW.helpful) THEN
    UPDATE reviews
    SET 
      helpful_count = (
        SELECT COUNT(*) FROM review_votes 
        WHERE review_id = NEW.review_id AND helpful = true
      ),
      not_helpful_count = (
        SELECT COUNT(*) FROM review_votes 
        WHERE review_id = NEW.review_id AND helpful = false
      )
    WHERE id = NEW.review_id;
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: update_saved_searches_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_saved_searches_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_user_points(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_user_points() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.user_points (user_id, total_points, current_balance)
  VALUES (NEW.user_id, NEW.points, NEW.points)
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = user_points.total_points + NEW.points,
    current_balance = CASE
      WHEN NEW.transaction_type = 'spend' THEN user_points.current_balance - ABS(NEW.points)
      ELSE user_points.current_balance + NEW.points
    END,
    updated_at = now();
  
  RETURN NEW;
END;
$$;


--
-- Name: update_user_tier(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_user_tier() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_tier_id UUID;
BEGIN
  SELECT id INTO v_tier_id
  FROM public.loyalty_tiers
  WHERE points_required <= NEW.total_points
  ORDER BY points_required DESC
  LIMIT 1;
  
  IF v_tier_id IS NOT NULL THEN
    UPDATE public.user_points
    SET tier_id = v_tier_id
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: update_webhook_subscriptions_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_webhook_subscriptions_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: user_has_role(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.user_has_role(user_id uuid, role_name text) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND roles ? role_name::text
  );
$$;


--
-- Name: validate_activation(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_activation() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  IF (NEW.is_active = TRUE AND NEW.status != 'approved') THEN
    RAISE EXCEPTION 'Only approved packs can be active';
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: validate_impersonation_session(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_impersonation_session(p_session_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_valid BOOLEAN := false;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM impersonation_sessions
    WHERE id = p_session_id
      AND admin_id = auth.uid()
      AND ended_at IS NULL
      AND expires_at > NOW()
  ) INTO v_valid;
  
  RETURN v_valid;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: achievements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.achievements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    icon text,
    category text NOT NULL,
    points_reward integer DEFAULT 0 NOT NULL,
    requirement_type text NOT NULL,
    requirement_value integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb
);


--
-- Name: active_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.active_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    session_token text NOT NULL,
    ip_address inet,
    user_agent text,
    device_info jsonb DEFAULT '{}'::jsonb,
    location jsonb DEFAULT '{}'::jsonb,
    last_activity_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: activity_feed; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_feed (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    actor_id uuid,
    event_type text NOT NULL,
    entity_type text,
    entity_id uuid,
    title text NOT NULL,
    description text,
    action_url text,
    metadata jsonb DEFAULT '{}'::jsonb,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    notification_type text,
    priority text DEFAULT 'normal'::text,
    dismissed_at timestamp with time zone,
    CONSTRAINT activity_feed_notification_type_check CHECK ((notification_type = ANY (ARRAY['message'::text, 'job_update'::text, 'offer'::text, 'payment'::text, 'system'::text]))),
    CONSTRAINT activity_feed_priority_check CHECK ((priority = ANY (ARRAY['low'::text, 'normal'::text, 'high'::text, 'urgent'::text])))
);

ALTER TABLE ONLY public.activity_feed REPLICA IDENTITY FULL;


--
-- Name: admin_alerts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_alerts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    alert_type text NOT NULL,
    severity text NOT NULL,
    message text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    is_resolved boolean DEFAULT false,
    resolved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT admin_alerts_severity_check CHECK ((severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])))
);


--
-- Name: admin_audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_audit_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    admin_id uuid NOT NULL,
    action text NOT NULL,
    entity_type text,
    entity_id uuid,
    changes jsonb,
    ip_address text,
    user_agent text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: admin_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_type text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    admin_id uuid NOT NULL,
    description text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: admin_ip_whitelist; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_ip_whitelist (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ip_address text NOT NULL,
    description text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone,
    is_active boolean DEFAULT true
);


--
-- Name: admin_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    admin_id uuid NOT NULL,
    permission text NOT NULL,
    granted_by uuid,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    scope text,
    CONSTRAINT admin_permissions_scope_check CHECK ((scope = ANY (ARRAY['global'::text, 'ops'::text, 'finance'::text, 'moderation'::text, 'support'::text, 'analytics'::text])))
);


--
-- Name: ai_alerts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_alerts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    alert_type text NOT NULL,
    severity text NOT NULL,
    title text NOT NULL,
    description text,
    entity_type text,
    entity_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    status text DEFAULT 'active'::text NOT NULL,
    acknowledged_by uuid,
    acknowledged_at timestamp with time zone,
    resolved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ai_alerts_severity_check CHECK ((severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text]))),
    CONSTRAINT ai_alerts_status_check CHECK ((status = ANY (ARRAY['active'::text, 'acknowledged'::text, 'resolved'::text, 'dismissed'::text])))
);


--
-- Name: ai_automation_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_automation_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    rule_type text NOT NULL,
    trigger_conditions jsonb DEFAULT '{}'::jsonb NOT NULL,
    actions jsonb DEFAULT '[]'::jsonb NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    execution_count integer DEFAULT 0,
    success_rate numeric DEFAULT 0,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ai_chat_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_chat_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conversation_id uuid NOT NULL,
    role text NOT NULL,
    content text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ai_conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_conversations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    session_id text NOT NULL,
    conversation_type text DEFAULT 'support'::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    context jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ai_prompts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_prompts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    category text NOT NULL,
    template text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    parameters jsonb DEFAULT '{}'::jsonb,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ai_recommendations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_recommendations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid,
    recommendation_type text NOT NULL,
    title text NOT NULL,
    description text,
    confidence_score numeric DEFAULT 0 NOT NULL,
    priority text DEFAULT 'medium'::text NOT NULL,
    data jsonb DEFAULT '{}'::jsonb,
    status text DEFAULT 'pending'::text NOT NULL,
    viewed_at timestamp with time zone,
    actioned_at timestamp with time zone,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ai_risk_flags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_risk_flags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL,
    flag_type text NOT NULL,
    severity text NOT NULL,
    message text NOT NULL,
    suggested_action text,
    resolved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ai_risk_flags_severity_check CHECK ((severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])))
);


--
-- Name: ai_runs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_runs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    operation_type text NOT NULL,
    prompt_template_id uuid,
    input_data jsonb DEFAULT '{}'::jsonb NOT NULL,
    output_data jsonb,
    status text DEFAULT 'pending'::text NOT NULL,
    execution_time_ms integer,
    tokens_used integer,
    confidence_score numeric(5,4),
    error_message text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    CONSTRAINT ai_runs_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'running'::text, 'completed'::text, 'failed'::text, 'cancelled'::text])))
);


--
-- Name: alert_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alert_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    metric_name text NOT NULL,
    condition_type text NOT NULL,
    threshold_value numeric NOT NULL,
    comparison_operator text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    notification_channels jsonb DEFAULT '[]'::jsonb,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: analytics_dashboards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics_dashboards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    dashboard_type text NOT NULL,
    layout_config jsonb DEFAULT '{}'::jsonb NOT NULL,
    widget_configs jsonb DEFAULT '[]'::jsonb NOT NULL,
    user_id uuid,
    is_public boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: analytics_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    session_id text NOT NULL,
    event_name text NOT NULL,
    event_category text,
    event_properties jsonb DEFAULT '{}'::jsonb,
    page_url text,
    referrer text,
    user_agent text,
    ip_address inet,
    country text,
    city text,
    device_type text,
    browser text,
    os text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: analytics_live_kpis; Type: MATERIALIZED VIEW; Schema: public; Owner: -
--

CREATE MATERIALIZED VIEW public.analytics_live_kpis AS
 SELECT count(*) FILTER (WHERE (event_name = 'wizard_step_viewed'::text)) AS wizard_starts,
    count(*) FILTER (WHERE (event_name = 'wizard_abandoned'::text)) AS abandonments,
    count(*) FILTER (WHERE (event_name = 'form_validation_error'::text)) AS validation_errors,
    count(*) FILTER (WHERE (event_name = 'form_field_focused'::text)) AS field_focuses,
    count(DISTINCT session_id) AS active_sessions,
    count(*) FILTER (WHERE (created_at > (now() - '00:05:00'::interval))) AS events_last_5min,
    count(*) FILTER (WHERE (created_at > (now() - '01:00:00'::interval))) AS events_last_hour
   FROM public.analytics_events
  WHERE (created_at > (now() - '01:00:00'::interval))
  WITH NO DATA;


--
-- Name: analytics_snapshots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics_snapshots (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    snapshot_date date NOT NULL,
    metric_type text NOT NULL,
    metric_name text NOT NULL,
    metric_value numeric DEFAULT 0 NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT analytics_snapshots_metric_type_check CHECK ((metric_type = ANY (ARRAY['revenue'::text, 'payments'::text, 'invoices'::text, 'disputes'::text, 'users'::text])))
);


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    action text NOT NULL,
    resource_type text NOT NULL,
    resource_id text,
    metadata jsonb DEFAULT '{}'::jsonb,
    ip_address text,
    user_agent text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: automation_executions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.automation_executions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workflow_id uuid NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    executed_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    error_message text,
    execution_data jsonb DEFAULT '{}'::jsonb,
    result_data jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT automation_executions_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'running'::text, 'completed'::text, 'failed'::text])))
);


--
-- Name: automation_workflows; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.automation_workflows (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    trigger_type text NOT NULL,
    conditions jsonb DEFAULT '[]'::jsonb NOT NULL,
    actions jsonb DEFAULT '[]'::jsonb NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    execution_count integer DEFAULT 0 NOT NULL,
    success_rate numeric(5,2) DEFAULT 0,
    last_executed_at timestamp with time zone,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT automation_workflows_success_rate_check CHECK (((success_rate >= (0)::numeric) AND (success_rate <= (100)::numeric))),
    CONSTRAINT automation_workflows_trigger_type_check CHECK ((trigger_type = ANY (ARRAY['job_created'::text, 'job_completed'::text, 'monthly_schedule'::text, 'daily_schedule'::text, 'hourly_schedule'::text])))
);


--
-- Name: availability_presets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.availability_presets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    working_hours jsonb NOT NULL,
    is_system boolean DEFAULT false,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: background_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.background_jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_type text NOT NULL,
    payload jsonb DEFAULT '{}'::jsonb,
    status text DEFAULT 'pending'::text,
    priority integer DEFAULT 0,
    max_retries integer DEFAULT 3,
    retry_count integer DEFAULT 0,
    error_message text,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT background_jobs_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text, 'retrying'::text])))
);


--
-- Name: badges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.badges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    icon text,
    rarity text DEFAULT 'common'::text NOT NULL,
    requirement_type text NOT NULL,
    requirement_value integer,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: blocked_dates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blocked_dates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    professional_id uuid NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    reason text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT blocked_dates_check CHECK ((end_date >= start_date))
);


--
-- Name: booking_reminders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.booking_reminders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    booking_id uuid NOT NULL,
    user_id uuid NOT NULL,
    reminder_type text NOT NULL,
    scheduled_for timestamp with time zone NOT NULL,
    sent_at timestamp with time zone,
    delivery_method text DEFAULT 'email'::text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    error_message text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: booking_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.booking_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid NOT NULL,
    professional_id uuid,
    service_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    selected_items jsonb DEFAULT '[]'::jsonb,
    total_estimated_price numeric DEFAULT 0,
    preferred_dates jsonb DEFAULT '[]'::jsonb,
    location_details text,
    special_requirements text,
    status text DEFAULT 'pending'::text,
    professional_quote numeric,
    professional_notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deprecated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE ONLY public.booking_requests REPLICA IDENTITY FULL;


--
-- Name: booking_risk_flags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.booking_risk_flags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    booking_id uuid NOT NULL,
    risk_type text NOT NULL,
    severity text NOT NULL,
    message text NOT NULL,
    detected_at timestamp with time zone DEFAULT now(),
    resolved_at timestamp with time zone,
    resolved_by uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT booking_risk_flags_risk_type_check CHECK ((risk_type = ANY (ARRAY['escrow_missing'::text, 'start_soon_unconfirmed'::text, 'availability_conflict'::text, 'no_checkin'::text, 'delayed_completion'::text]))),
    CONSTRAINT booking_risk_flags_severity_check CHECK ((severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])))
);


--
-- Name: bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid,
    service_id uuid,
    title text NOT NULL,
    description text,
    status public.booking_status DEFAULT 'draft'::public.booking_status,
    micro_q_answers jsonb DEFAULT '{}'::jsonb,
    general_answers jsonb DEFAULT '{}'::jsonb,
    budget_range text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    micro_slug text,
    catalogue_version_used integer DEFAULT 1,
    locale text DEFAULT 'en'::text,
    origin text DEFAULT 'web'::text,
    escrow_funded_at timestamp with time zone,
    checkin_window_start timestamp with time zone,
    checkin_window_end timestamp with time zone,
    auto_complete_eligible_at timestamp with time zone
);


--
-- Name: business_insights; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.business_insights (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    insight_type text NOT NULL,
    insight_title text NOT NULL,
    insight_description text,
    priority text DEFAULT 'medium'::text NOT NULL,
    action_items jsonb DEFAULT '[]'::jsonb,
    impact_score numeric,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    priority_weight smallint GENERATED ALWAYS AS (
CASE priority
    WHEN 'high'::text THEN 3
    WHEN 'medium'::text THEN 2
    ELSE 1
END) STORED,
    CONSTRAINT business_insights_priority_check CHECK ((priority = ANY (ARRAY['high'::text, 'medium'::text, 'low'::text])))
);


--
-- Name: business_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.business_metrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    metric_category text NOT NULL,
    metric_name text NOT NULL,
    metric_value numeric DEFAULT 0 NOT NULL,
    previous_value numeric,
    change_percentage numeric,
    period_start timestamp with time zone NOT NULL,
    period_end timestamp with time zone NOT NULL,
    dimensions jsonb DEFAULT '{}'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: calculator_saved_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calculator_saved_configs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    session_id text,
    config_name text,
    project_type text NOT NULL,
    selections jsonb NOT NULL,
    pricing_snapshot jsonb,
    is_public boolean DEFAULT false,
    share_token text,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: calculator_share_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calculator_share_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    config_id uuid,
    share_method text NOT NULL,
    recipient_email text,
    accessed_at timestamp with time zone,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: calendar_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calendar_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    job_id uuid,
    title text NOT NULL,
    description text,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    event_type text DEFAULT 'booking'::text,
    location jsonb,
    attendees uuid[],
    recurrence_rule text,
    external_calendar_id text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    status text DEFAULT 'scheduled'::text,
    color text,
    notes text,
    CONSTRAINT calendar_events_event_type_check CHECK ((event_type = ANY (ARRAY['booking'::text, 'availability'::text, 'meeting'::text, 'deadline'::text]))),
    CONSTRAINT calendar_events_status_check CHECK ((status = ANY (ARRAY['scheduled'::text, 'confirmed'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text, 'no_show'::text])))
);


--
-- Name: calendar_sync; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calendar_sync (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    provider text NOT NULL,
    calendar_id text NOT NULL,
    sync_token text,
    last_sync_at timestamp with time zone,
    sync_status text DEFAULT 'active'::text,
    error_message text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT calendar_sync_provider_check CHECK ((provider = ANY (ARRAY['google'::text, 'outlook'::text, 'apple'::text]))),
    CONSTRAINT calendar_sync_sync_status_check CHECK ((sync_status = ANY (ARRAY['active'::text, 'paused'::text, 'error'::text])))
);


--
-- Name: category_suggestions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.category_suggestions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    suggestion_type text NOT NULL,
    parent_id uuid,
    suggested_name text NOT NULL,
    description text,
    status text DEFAULT 'pending'::text NOT NULL,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    rejection_reason text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT category_suggestions_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]))),
    CONSTRAINT category_suggestions_suggestion_type_check CHECK ((suggestion_type = ANY (ARRAY['category'::text, 'subcategory'::text, 'micro_category'::text])))
);


--
-- Name: change_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.change_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL,
    proposer_id uuid NOT NULL,
    delta_amount numeric,
    description text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    approved_by uuid,
    approved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: churn_predictions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.churn_predictions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    churn_probability numeric(5,2) NOT NULL,
    risk_factors jsonb DEFAULT '[]'::jsonb,
    predicted_churn_date date,
    prevention_actions jsonb DEFAULT '[]'::jsonb,
    is_prevented boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: client_favorites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_favorites (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid NOT NULL,
    professional_id uuid NOT NULL,
    tags text[],
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: client_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_files (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid,
    client_id uuid NOT NULL,
    file_name text NOT NULL,
    file_url text NOT NULL,
    file_type text,
    file_size integer,
    tags text[],
    uploaded_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: client_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    level text NOT NULL,
    message text NOT NULL,
    context jsonb DEFAULT '{}'::jsonb,
    stack text,
    user_agent text,
    url text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT client_logs_level_check CHECK ((level = ANY (ARRAY['debug'::text, 'info'::text, 'warn'::text, 'error'::text])))
);


--
-- Name: client_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    default_property_id uuid,
    preferences jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: collaborative_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.collaborative_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_type text NOT NULL,
    room_id text NOT NULL,
    host_id uuid NOT NULL,
    participants uuid[] DEFAULT '{}'::uuid[] NOT NULL,
    job_id uuid,
    status text DEFAULT 'active'::text NOT NULL,
    session_data jsonb DEFAULT '{}'::jsonb,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    ended_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: compliance_frameworks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.compliance_frameworks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    framework_name text NOT NULL,
    framework_code text NOT NULL,
    description text,
    version text,
    requirements jsonb DEFAULT '[]'::jsonb NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: compliance_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.compliance_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    report_type text NOT NULL,
    framework_id uuid,
    generated_by uuid,
    report_period_start timestamp with time zone NOT NULL,
    report_period_end timestamp with time zone NOT NULL,
    overall_score numeric,
    findings jsonb DEFAULT '[]'::jsonb NOT NULL,
    recommendations jsonb DEFAULT '[]'::jsonb,
    status text DEFAULT 'draft'::text NOT NULL,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: contracts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contracts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL,
    tasker_id uuid NOT NULL,
    client_id uuid NOT NULL,
    type text DEFAULT 'fixed'::text NOT NULL,
    agreed_amount numeric NOT NULL,
    escrow_status text DEFAULT 'none'::text NOT NULL,
    start_at timestamp with time zone,
    end_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    escrow_hold_period integer DEFAULT 7,
    CONSTRAINT contracts_escrow_status_check CHECK ((escrow_status = ANY (ARRAY['none'::text, 'funded'::text, 'released'::text, 'refunded'::text]))),
    CONSTRAINT contracts_type_check CHECK ((type = ANY (ARRAY['fixed'::text, 'hourly'::text])))
);


--
-- Name: conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid,
    contract_id uuid,
    participant_1_id uuid NOT NULL,
    participant_2_id uuid NOT NULL,
    last_message_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: conversion_analytics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversion_analytics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    session_id text NOT NULL,
    event_type text NOT NULL,
    step_number integer,
    variant text,
    metadata jsonb DEFAULT '{}'::jsonb,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: exchange_rates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exchange_rates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    from_currency text NOT NULL,
    to_currency text NOT NULL,
    rate numeric(20,10) NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT exchange_rates_from_currency_check CHECK ((from_currency ~ '^[A-Z]{3}$'::text)),
    CONSTRAINT exchange_rates_rate_check CHECK ((rate > (0)::numeric)),
    CONSTRAINT exchange_rates_to_currency_check CHECK ((to_currency ~ '^[A-Z]{3}$'::text))
);


--
-- Name: currency_exchange_pairs; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.currency_exchange_pairs WITH (security_invoker='on') AS
 SELECT exchange_rates.from_currency,
    exchange_rates.to_currency,
    exchange_rates.rate,
    exchange_rates.updated_at
   FROM public.exchange_rates
UNION ALL
 SELECT exchange_rates.to_currency AS from_currency,
    exchange_rates.from_currency AS to_currency,
    (1.0 / exchange_rates.rate) AS rate,
    exchange_rates.updated_at
   FROM public.exchange_rates;


--
-- Name: data_breach_incidents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.data_breach_incidents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    incident_type text NOT NULL,
    severity text NOT NULL,
    affected_users integer DEFAULT 0 NOT NULL,
    affected_data_types jsonb DEFAULT '[]'::jsonb,
    description text NOT NULL,
    detected_at timestamp with time zone DEFAULT now() NOT NULL,
    reported_at timestamp with time zone,
    resolved_at timestamp with time zone,
    status text DEFAULT 'investigating'::text NOT NULL,
    remediation_steps jsonb DEFAULT '[]'::jsonb,
    impact_assessment text,
    reported_by uuid,
    assigned_to uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: data_deletion_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.data_deletion_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    status text NOT NULL,
    requested_at timestamp with time zone DEFAULT now(),
    processed_at timestamp with time zone,
    notes text,
    CONSTRAINT data_deletion_requests_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'cancelled'::text])))
);


--
-- Name: data_export_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.data_export_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    request_type text NOT NULL,
    status text DEFAULT 'pending'::text,
    file_url text,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT data_export_requests_request_type_check CHECK ((request_type = ANY (ARRAY['export'::text, 'deletion'::text]))),
    CONSTRAINT data_export_requests_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text])))
);


--
-- Name: data_exports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.data_exports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    export_type text NOT NULL,
    export_format text NOT NULL,
    filters jsonb DEFAULT '{}'::jsonb,
    status text DEFAULT 'pending'::text,
    file_url text,
    file_size_bytes bigint,
    row_count integer,
    error_message text,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone
);


--
-- Name: data_privacy_controls; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.data_privacy_controls (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    data_retention_days integer DEFAULT 365,
    allow_analytics boolean DEFAULT true,
    allow_marketing boolean DEFAULT true,
    allow_third_party_sharing boolean DEFAULT false,
    encryption_enabled boolean DEFAULT true,
    two_factor_enabled boolean DEFAULT false,
    session_timeout_minutes integer DEFAULT 60,
    ip_whitelist jsonb DEFAULT '[]'::jsonb,
    consent_given_at timestamp with time zone,
    consent_version text,
    preferences jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: dispute_counter_proposals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dispute_counter_proposals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    dispute_id uuid NOT NULL,
    parent_resolution_id uuid,
    proposer_id uuid NOT NULL,
    terms jsonb DEFAULT '{}'::jsonb NOT NULL,
    note text,
    status text DEFAULT 'open'::text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT dispute_counter_proposals_status_check CHECK ((status = ANY (ARRAY['open'::text, 'accepted'::text, 'rejected'::text, 'withdrawn'::text])))
);


--
-- Name: dispute_evidence; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dispute_evidence (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    dispute_id uuid NOT NULL,
    uploaded_by uuid NOT NULL,
    file_name text NOT NULL,
    file_url text NOT NULL,
    file_type text NOT NULL,
    file_size integer,
    description text,
    evidence_type text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    evidence_category text,
    CONSTRAINT dispute_evidence_evidence_category_check CHECK ((evidence_category = ANY (ARRAY['photos'::text, 'documents'::text, 'messages'::text, 'receipts'::text, 'work_logs'::text, 'contracts'::text, 'invoices'::text, 'other'::text])))
);


--
-- Name: dispute_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dispute_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    dispute_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    message text NOT NULL,
    is_internal boolean DEFAULT false,
    attachments jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    read_at timestamp with time zone,
    response_time_seconds integer,
    template_used text,
    is_admin_note boolean DEFAULT false
);


--
-- Name: dispute_resolutions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dispute_resolutions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    dispute_id uuid NOT NULL,
    resolution_type text NOT NULL,
    awarded_to uuid,
    amount numeric(10,2) DEFAULT 0,
    details text,
    party_client_agreed boolean DEFAULT false,
    party_professional_agreed boolean DEFAULT false,
    finalized_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    status text DEFAULT 'proposed'::text,
    mediator_decision_reasoning text,
    fault_percentage_client integer,
    fault_percentage_professional integer,
    auto_execute_date timestamp with time zone,
    appeal_deadline timestamp with time zone,
    agreement_finalized_at timestamp with time zone,
    terms jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT dispute_resolutions_fault_percentage_client_check CHECK (((fault_percentage_client >= 0) AND (fault_percentage_client <= 100))),
    CONSTRAINT dispute_resolutions_fault_percentage_professional_check CHECK (((fault_percentage_professional >= 0) AND (fault_percentage_professional <= 100))),
    CONSTRAINT dispute_resolutions_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'proposed'::text, 'agreed'::text, 'executed'::text, 'rejected'::text])))
);


--
-- Name: dispute_timeline; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dispute_timeline (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    dispute_id uuid NOT NULL,
    event_type text NOT NULL,
    actor_id uuid,
    description text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: disputes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.disputes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    dispute_number text NOT NULL,
    job_id uuid NOT NULL,
    contract_id uuid,
    invoice_id uuid,
    created_by uuid NOT NULL,
    disputed_against uuid NOT NULL,
    type text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    priority text DEFAULT 'medium'::text NOT NULL,
    amount_disputed numeric DEFAULT 0,
    title text NOT NULL,
    description text NOT NULL,
    resolution_notes text,
    resolution_amount numeric DEFAULT 0,
    resolved_by uuid,
    resolved_at timestamp with time zone,
    escalated_at timestamp with time zone,
    due_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    escalation_level integer DEFAULT 1,
    mediator_id uuid,
    mediator_notes text,
    auto_close_date timestamp with time zone,
    response_deadline timestamp with time zone,
    dispute_category text,
    required_evidence_types jsonb DEFAULT '[]'::jsonb,
    pre_dispute_contact_attempted boolean DEFAULT false,
    escalation_reasons jsonb DEFAULT '{}'::jsonb,
    last_activity_at timestamp with time zone DEFAULT now(),
    workflow_state text DEFAULT 'open'::text,
    CONSTRAINT disputes_dispute_category_check CHECK ((dispute_category = ANY (ARRAY['payment'::text, 'quality'::text, 'conduct'::text, 'timeline'::text]))),
    CONSTRAINT disputes_workflow_state_check CHECK ((workflow_state = ANY (ARRAY['open'::text, 'evidence_gathering'::text, 'mediation'::text, 'decision_pending'::text, 'appeal_window'::text, 'resolved'::text])))
);


--
-- Name: document_collaborators; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_collaborators (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    document_id uuid NOT NULL,
    user_id uuid NOT NULL,
    permission text NOT NULL,
    last_viewed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT document_collaborators_permission_check CHECK ((permission = ANY (ARRAY['view'::text, 'edit'::text, 'admin'::text])))
);


--
-- Name: document_edits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_edits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    document_id uuid NOT NULL,
    user_id uuid NOT NULL,
    change_type text NOT NULL,
    change_data jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: dual_control_approvals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dual_control_approvals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    action_type text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    requested_by uuid NOT NULL,
    approved_by uuid,
    status text DEFAULT 'pending'::text,
    reason text NOT NULL,
    payload jsonb NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '24:00:00'::interval) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT dual_control_approvals_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'expired'::text])))
);


--
-- Name: escrow_milestones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.escrow_milestones (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    contract_id uuid NOT NULL,
    milestone_number integer NOT NULL,
    title text NOT NULL,
    description text,
    amount numeric DEFAULT 0 NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    completed_date timestamp with time zone,
    due_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    approved_by uuid,
    approved_at timestamp with time zone,
    rejected_by uuid,
    rejected_at timestamp with time zone,
    rejection_reason text,
    auto_release_date timestamp with time zone,
    approval_deadline timestamp with time zone,
    partial_release_enabled boolean DEFAULT false,
    released_amount numeric DEFAULT 0,
    submission_notes text,
    submitted_by uuid,
    submitted_at timestamp with time zone
);


--
-- Name: escrow_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.escrow_payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    booking_id uuid,
    milestone_id uuid,
    amount numeric NOT NULL,
    status public.payment_status DEFAULT 'pending'::public.payment_status,
    created_at timestamp with time zone DEFAULT now(),
    contract_id uuid,
    escrow_status text DEFAULT 'held'::text,
    released_at timestamp with time zone,
    released_by uuid
);


--
-- Name: escrow_release_overrides; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.escrow_release_overrides (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    milestone_id uuid NOT NULL,
    admin_id uuid NOT NULL,
    reason text NOT NULL,
    released_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: escrow_releases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.escrow_releases (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    milestone_id uuid NOT NULL,
    payment_id uuid NOT NULL,
    amount numeric(10,2) NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    released_by uuid NOT NULL,
    released_at timestamp with time zone,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: escrow_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.escrow_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    milestone_id uuid NOT NULL,
    payment_id uuid,
    transaction_type text NOT NULL,
    amount numeric DEFAULT 0 NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    initiated_by uuid NOT NULL,
    completed_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: escrow_transfer_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.escrow_transfer_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    milestone_id uuid NOT NULL,
    stripe_transfer_id text,
    amount numeric NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    failure_reason text,
    professional_account_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    CONSTRAINT escrow_transfer_logs_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'succeeded'::text, 'failed'::text, 'reversed'::text])))
);


--
-- Name: feature_flag_exposures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.feature_flag_exposures (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    flag_key text NOT NULL,
    user_id uuid NOT NULL,
    exposed_at timestamp with time zone DEFAULT now(),
    user_segment jsonb DEFAULT '{}'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb
);


--
-- Name: feature_flags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.feature_flags (
    key text NOT NULL,
    enabled boolean DEFAULT false,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    rollout_percentage integer DEFAULT 100,
    kill_switch_active boolean DEFAULT false,
    error_budget_threshold numeric DEFAULT 0.05,
    CONSTRAINT feature_flags_rollout_percentage_check CHECK (((rollout_percentage >= 0) AND (rollout_percentage <= 100)))
);


--
-- Name: financial_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.financial_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    report_type text NOT NULL,
    report_name text NOT NULL,
    period_start timestamp with time zone NOT NULL,
    period_end timestamp with time zone NOT NULL,
    report_data jsonb DEFAULT '{}'::jsonb NOT NULL,
    file_url text,
    status text DEFAULT 'generating'::text NOT NULL,
    generated_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT financial_reports_report_type_check CHECK ((report_type = ANY (ARRAY['income_statement'::text, 'balance_sheet'::text, 'cash_flow'::text, 'tax_summary'::text, 'payout_summary'::text]))),
    CONSTRAINT financial_reports_status_check CHECK ((status = ANY (ARRAY['generating'::text, 'completed'::text, 'failed'::text])))
);


--
-- Name: form_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.form_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    form_type text NOT NULL,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: fraud_patterns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fraud_patterns (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    pattern_type text NOT NULL,
    pattern_data jsonb NOT NULL,
    severity text NOT NULL,
    detection_count integer DEFAULT 0,
    last_detected_at timestamp with time zone,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT fraud_patterns_severity_check CHECK ((severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])))
);


--
-- Name: funnel_analytics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.funnel_analytics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    funnel_name text NOT NULL,
    analysis_date date NOT NULL,
    step_number integer NOT NULL,
    step_name text NOT NULL,
    users_entered integer DEFAULT 0,
    users_completed integer DEFAULT 0,
    conversion_rate numeric DEFAULT 0,
    average_time_seconds integer DEFAULT 0,
    drop_off_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: generated_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.generated_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_id uuid,
    report_name text NOT NULL,
    report_data jsonb DEFAULT '{}'::jsonb NOT NULL,
    file_url text,
    status text DEFAULT 'generating'::text NOT NULL,
    generated_by uuid,
    generated_at timestamp with time zone DEFAULT now() NOT NULL,
    period_start timestamp with time zone NOT NULL,
    period_end timestamp with time zone NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb
);


--
-- Name: integrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.integrations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    integration_type text NOT NULL,
    user_id uuid,
    config jsonb DEFAULT '{}'::jsonb,
    credentials jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    last_sync_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT integrations_integration_type_check CHECK ((integration_type = ANY (ARRAY['stripe'::text, 'calendar'::text, 'email'::text, 'sms'::text, 'webhook'::text])))
);


--
-- Name: invoice_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoice_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_id uuid NOT NULL,
    description text NOT NULL,
    quantity numeric DEFAULT 1 NOT NULL,
    unit_price numeric DEFAULT 0 NOT NULL,
    amount numeric DEFAULT 0 NOT NULL,
    tax_rate numeric DEFAULT 0,
    tax_amount numeric DEFAULT 0,
    item_order integer DEFAULT 0,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: invoice_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoice_payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_id uuid NOT NULL,
    payment_transaction_id uuid,
    amount numeric DEFAULT 0 NOT NULL,
    payment_method text,
    payment_date timestamp with time zone DEFAULT now() NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_number text NOT NULL,
    user_id uuid NOT NULL,
    job_id uuid,
    contract_id uuid,
    subtotal numeric DEFAULT 0 NOT NULL,
    vat_rate numeric DEFAULT 0,
    vat_amount numeric DEFAULT 0,
    total_amount numeric DEFAULT 0 NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    due_date timestamp with time zone,
    paid_date timestamp with time zone,
    payment_method_id uuid,
    split_payment jsonb DEFAULT '{}'::jsonb,
    line_items jsonb DEFAULT '[]'::jsonb NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    invoice_type text DEFAULT 'standard'::text,
    invoice_template text,
    client_name text,
    client_email text,
    client_address jsonb,
    professional_name text,
    professional_email text,
    professional_address jsonb,
    tax_id text,
    discount_amount numeric DEFAULT 0,
    discount_percentage numeric DEFAULT 0,
    terms text,
    footer_notes text,
    sent_at timestamp with time zone,
    viewed_at timestamp with time zone,
    reminder_sent_at timestamp with time zone
);


--
-- Name: job_applicants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_applicants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL,
    professional_id uuid NOT NULL,
    status text DEFAULT 'applied'::text,
    availability_status text DEFAULT 'available'::text,
    notes text,
    applied_at timestamp with time zone DEFAULT now(),
    viewed_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now(),
    interview_scheduled_at timestamp with time zone,
    interview_notes text,
    rating integer,
    tags text[],
    CONSTRAINT job_applicants_availability_status_check CHECK ((availability_status = ANY (ARRAY['available'::text, 'busy'::text, 'offline'::text]))),
    CONSTRAINT job_applicants_rating_check CHECK (((rating >= 1) AND (rating <= 5))),
    CONSTRAINT job_applicants_status_check CHECK ((status = ANY (ARRAY['applied'::text, 'viewed'::text, 'shortlisted'::text, 'invited'::text, 'withdrawn'::text, 'rejected'::text])))
);


--
-- Name: job_broadcasts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_broadcasts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL,
    broadcast_type text NOT NULL,
    target_criteria jsonb NOT NULL,
    professionals_notified integer DEFAULT 0,
    professionals_viewed integer DEFAULT 0,
    professionals_applied integer DEFAULT 0,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone
);


--
-- Name: job_lifecycle_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_lifecycle_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL,
    event_type text NOT NULL,
    from_status text,
    to_status text,
    triggered_by uuid,
    reason text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: job_matches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_matches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    booking_id uuid,
    professional_id uuid,
    status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: job_photos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_photos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL,
    uploaded_by uuid NOT NULL,
    photo_type text NOT NULL,
    image_url text NOT NULL,
    caption text,
    taken_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT job_photos_photo_type_check CHECK ((photo_type = ANY (ARRAY['before'::text, 'after'::text, 'progress'::text])))
);


--
-- Name: job_presets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_presets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    preset_type text NOT NULL,
    preset_data jsonb DEFAULT '{}'::jsonb,
    last_used_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: job_question_snapshot; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_question_snapshot (
    job_id uuid NOT NULL,
    pack_id uuid NOT NULL,
    snapshot jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: job_quotes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_quotes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL,
    professional_id uuid NOT NULL,
    quote_amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'EUR'::text NOT NULL,
    estimated_duration_hours integer,
    estimated_start_date date,
    proposal_message text NOT NULL,
    attachments jsonb DEFAULT '[]'::jsonb,
    status text DEFAULT 'pending'::text NOT NULL,
    accepted_at timestamp with time zone,
    rejected_at timestamp with time zone,
    rejection_reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT job_quotes_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'withdrawn'::text])))
);


--
-- Name: job_state_transitions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_state_transitions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL,
    from_state text NOT NULL,
    to_state text NOT NULL,
    triggered_by uuid,
    reason text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: job_status_updates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_status_updates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL,
    status text NOT NULL,
    location jsonb,
    notes text,
    professional_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: job_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    category text NOT NULL,
    subcategory text NOT NULL,
    micro_service text NOT NULL,
    template_data jsonb DEFAULT '{}'::jsonb NOT NULL,
    usage_count integer DEFAULT 0 NOT NULL,
    is_favorite boolean DEFAULT false NOT NULL,
    last_used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: job_versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_versions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL,
    version_number integer NOT NULL,
    changes jsonb NOT NULL,
    created_by uuid NOT NULL,
    change_reason text,
    invalidated_offers boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    client_id uuid NOT NULL,
    micro_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    answers jsonb DEFAULT '{}'::jsonb NOT NULL,
    budget_type text DEFAULT 'fixed'::text NOT NULL,
    budget_value numeric,
    location jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    scheduled_at timestamp with time zone,
    duration_minutes integer DEFAULT 60,
    workflow_state text DEFAULT 'draft'::text,
    CONSTRAINT jobs_budget_type_check CHECK ((budget_type = ANY (ARRAY['fixed'::text, 'hourly'::text]))),
    CONSTRAINT jobs_status_check CHECK ((status = ANY (ARRAY['open'::text, 'invited'::text, 'offered'::text, 'assigned'::text, 'in_progress'::text, 'complete_pending'::text, 'complete'::text, 'disputed'::text, 'cancelled'::text]))),
    CONSTRAINT jobs_workflow_state_check CHECK ((workflow_state = ANY (ARRAY['draft'::text, 'published'::text, 'matching'::text, 'offered'::text, 'withdrawn'::text, 'expired'::text, 'archived'::text])))
);


--
-- Name: kpi_cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kpi_cache (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cache_key text NOT NULL,
    data jsonb NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: leaderboard_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leaderboard_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    leaderboard_id uuid NOT NULL,
    user_id uuid NOT NULL,
    rank integer NOT NULL,
    score integer NOT NULL,
    period_start timestamp with time zone NOT NULL,
    period_end timestamp with time zone NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: leaderboards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leaderboards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    leaderboard_type text NOT NULL,
    period text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    full_name text,
    display_name text,
    preferred_language text DEFAULT 'en'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    active_role text DEFAULT 'client'::text,
    tasker_onboarding_status public.tasker_onboarding_status DEFAULT 'not_started'::public.tasker_onboarding_status,
    simple_mode boolean DEFAULT true,
    tour_completed boolean DEFAULT false,
    coverage_area text,
    service_radius integer,
    preferences jsonb DEFAULT '{}'::jsonb,
    avatar_url text,
    phone text,
    location text,
    bio text,
    notification_preferences jsonb DEFAULT '{"email_digest": "instant", "email_offers": true, "email_payments": true, "email_marketing": false, "email_job_matches": true, "email_announcements": true}'::jsonb,
    preferred_currency text DEFAULT 'EUR'::text,
    verification_status text DEFAULT 'pending'::text,
    verification_notes text,
    verified_at timestamp with time zone,
    verified_by uuid,
    CONSTRAINT profiles_preferred_currency_check CHECK ((preferred_currency ~ '^[A-Z]{3}$'::text)),
    CONSTRAINT profiles_verification_status_check CHECK ((verification_status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'under_review'::text])))
);


--
-- Name: legacy_booking_requests; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.legacy_booking_requests WITH (security_invoker='on') AS
 SELECT br.id,
    br.client_id,
    br.professional_id,
    br.service_id,
    br.title,
    br.description,
    br.status,
    br.total_estimated_price,
    br.professional_quote,
    br.created_at,
    br.updated_at,
    p.full_name AS client_name,
    pp.full_name AS professional_name
   FROM ((public.booking_requests br
     LEFT JOIN public.profiles p ON ((p.id = br.client_id)))
     LEFT JOIN public.profiles pp ON ((pp.id = br.professional_id)))
  ORDER BY br.created_at DESC;


--
-- Name: loyalty_tiers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loyalty_tiers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    level integer NOT NULL,
    points_required integer NOT NULL,
    perks jsonb DEFAULT '[]'::jsonb NOT NULL,
    color text,
    icon text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: message_attachment_metadata; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message_attachment_metadata (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    message_id uuid,
    file_name text NOT NULL,
    file_size integer NOT NULL,
    mime_type text NOT NULL,
    storage_path text NOT NULL,
    thumbnail_path text,
    virus_scan_status text DEFAULT 'pending'::text,
    virus_scan_date timestamp with time zone,
    expires_at timestamp with time zone DEFAULT (now() + '90 days'::interval),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: message_rate_limits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message_rate_limits (
    user_id uuid NOT NULL,
    messages_sent integer DEFAULT 0,
    window_start timestamp with time zone DEFAULT now(),
    is_throttled boolean DEFAULT false,
    throttled_until timestamp with time zone
);


--
-- Name: message_reactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message_reactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    message_id uuid NOT NULL,
    user_id uuid NOT NULL,
    reaction text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: message_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reporter_id uuid NOT NULL,
    message_id uuid NOT NULL,
    reason text NOT NULL,
    status text DEFAULT 'pending'::text,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    admin_notes text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: message_threads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message_threads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parent_message_id uuid NOT NULL,
    message_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conversation_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    recipient_id uuid NOT NULL,
    content text NOT NULL,
    attachments jsonb DEFAULT '[]'::jsonb,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: micro_questions_ai_runs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.micro_questions_ai_runs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    micro_category_id text NOT NULL,
    prompt_hash text NOT NULL,
    model text NOT NULL,
    raw_response jsonb,
    status text NOT NULL,
    error text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT micro_questions_ai_runs_status_check CHECK ((status = ANY (ARRAY['success'::text, 'failed'::text])))
);


--
-- Name: micro_questions_snapshot; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.micro_questions_snapshot (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    micro_category_id text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    questions_json jsonb NOT NULL,
    schema_rev integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: micro_service_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.micro_service_questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    micro_id uuid NOT NULL,
    micro_name text NOT NULL,
    category text NOT NULL,
    subcategory text NOT NULL,
    questions jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: milestone_approvals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.milestone_approvals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    milestone_id uuid NOT NULL,
    approver_id uuid NOT NULL,
    action text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT milestone_approvals_action_check CHECK ((action = ANY (ARRAY['approved'::text, 'rejected'::text, 'requested_changes'::text])))
);


--
-- Name: milestones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.milestones (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    booking_id uuid,
    title text NOT NULL,
    description text,
    amount numeric,
    status public.milestone_status DEFAULT 'pending'::public.milestone_status,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: notification_digest_queue; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_digest_queue (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    notification_id uuid NOT NULL,
    scheduled_for timestamp with time zone NOT NULL,
    sent_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: notification_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_preferences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    email_notifications boolean DEFAULT true,
    sms_notifications boolean DEFAULT false,
    push_notifications boolean DEFAULT true,
    notification_types jsonb DEFAULT '{"invoice_paid": true, "invoice_sent": true, "payment_sent": true, "escrow_funded": true, "refund_issued": true, "payment_failed": true, "escrow_released": true, "invoice_overdue": true, "payment_received": true, "payout_completed": true, "payout_requested": true, "milestone_approved": true, "milestone_rejected": true}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: notification_queue; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_queue (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    notification_type text NOT NULL,
    template_id text,
    data jsonb DEFAULT '{}'::jsonb,
    status text DEFAULT 'pending'::text,
    scheduled_for timestamp with time zone,
    sent_at timestamp with time zone,
    error_message text,
    retry_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT notification_queue_notification_type_check CHECK ((notification_type = ANY (ARRAY['email'::text, 'sms'::text, 'push'::text, 'in_app'::text]))),
    CONSTRAINT notification_queue_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'sent'::text, 'failed'::text, 'cancelled'::text])))
);


--
-- Name: notification_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_key text NOT NULL,
    template_name text NOT NULL,
    channel text NOT NULL,
    subject text,
    body_template text NOT NULL,
    variables jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT notification_templates_channel_check CHECK ((channel = ANY (ARRAY['email'::text, 'sms'::text, 'push'::text, 'in_app'::text])))
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'info'::text NOT NULL,
    read_at timestamp with time zone,
    action_url text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: offer_negotiations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.offer_negotiations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    offer_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    message text,
    proposed_amount numeric,
    proposed_terms jsonb DEFAULT '{}'::jsonb,
    status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone,
    counter_count integer DEFAULT 0,
    attachments jsonb DEFAULT '[]'::jsonb,
    CONSTRAINT offer_negotiations_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'declined'::text, 'countered'::text])))
);


--
-- Name: offers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.offers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL,
    tasker_id uuid NOT NULL,
    message text,
    amount numeric NOT NULL,
    type text DEFAULT 'fixed'::text NOT NULL,
    status text DEFAULT 'sent'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT offers_status_check CHECK ((status = ANY (ARRAY['sent'::text, 'accepted'::text, 'declined'::text, 'withdrawn'::text, 'expired'::text]))),
    CONSTRAINT offers_type_check CHECK ((type = ANY (ARRAY['fixed'::text, 'hourly'::text])))
);


--
-- Name: onboarding_checklist; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.onboarding_checklist (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    professional_id uuid NOT NULL,
    step public.app_onboarding_step NOT NULL,
    completed_at timestamp with time zone,
    skipped boolean DEFAULT false NOT NULL,
    started_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: onboarding_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.onboarding_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    professional_id uuid NOT NULL,
    event_type text NOT NULL,
    step public.app_onboarding_step,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: pack_performance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pack_performance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    pack_id uuid NOT NULL,
    completion_rate numeric(5,4) DEFAULT 0 NOT NULL,
    median_duration_s integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: payment_alerts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_alerts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    alert_type text NOT NULL,
    severity text DEFAULT 'info'::text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    affected_users uuid[],
    action_required boolean DEFAULT false,
    action_url text,
    resolved_at timestamp with time zone,
    resolved_by uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT payment_alerts_alert_type_check CHECK ((alert_type = ANY (ARRAY['payment_processing_delay'::text, 'suspicious_activity'::text, 'large_transaction'::text, 'escrow_expiring'::text, 'invoice_overdue'::text, 'payout_delayed'::text, 'system_maintenance'::text]))),
    CONSTRAINT payment_alerts_severity_check CHECK ((severity = ANY (ARRAY['info'::text, 'warning'::text, 'error'::text, 'critical'::text])))
);


--
-- Name: payment_analytics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_analytics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    period_start timestamp with time zone NOT NULL,
    period_end timestamp with time zone NOT NULL,
    period_type text NOT NULL,
    total_revenue numeric DEFAULT 0 NOT NULL,
    total_expenses numeric DEFAULT 0 NOT NULL,
    total_escrow numeric DEFAULT 0 NOT NULL,
    total_refunds numeric DEFAULT 0 NOT NULL,
    transaction_count integer DEFAULT 0 NOT NULL,
    unique_clients integer DEFAULT 0 NOT NULL,
    unique_professionals integer DEFAULT 0 NOT NULL,
    average_transaction numeric DEFAULT 0 NOT NULL,
    payment_method_breakdown jsonb DEFAULT '{}'::jsonb,
    status_breakdown jsonb DEFAULT '{}'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT payment_analytics_period_type_check CHECK ((period_type = ANY (ARRAY['daily'::text, 'weekly'::text, 'monthly'::text, 'yearly'::text])))
);


--
-- Name: payment_analytics_summary; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_analytics_summary (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    period_start timestamp with time zone NOT NULL,
    period_end timestamp with time zone NOT NULL,
    total_revenue numeric DEFAULT 0 NOT NULL,
    total_payments integer DEFAULT 0 NOT NULL,
    successful_payments integer DEFAULT 0 NOT NULL,
    failed_payments integer DEFAULT 0 NOT NULL,
    average_transaction_value numeric DEFAULT 0 NOT NULL,
    conversion_rate numeric DEFAULT 0 NOT NULL,
    refund_rate numeric DEFAULT 0 NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: payment_methods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_methods (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    stripe_payment_method_id text NOT NULL,
    type text DEFAULT 'card'::text NOT NULL,
    brand text,
    last_four text,
    expires_month integer,
    expires_year integer,
    is_default boolean DEFAULT false NOT NULL,
    billing_address jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: payment_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    notification_type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    channel text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    related_entity_type text,
    related_entity_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    sent_at timestamp with time zone,
    read_at timestamp with time zone,
    failed_reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT payment_notifications_channel_check CHECK ((channel = ANY (ARRAY['email'::text, 'sms'::text, 'push'::text, 'in_app'::text]))),
    CONSTRAINT payment_notifications_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'sent'::text, 'failed'::text, 'read'::text])))
);


--
-- Name: payment_receipts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_receipts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    payment_id uuid NOT NULL,
    user_id uuid NOT NULL,
    receipt_number text NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    receipt_url text,
    receipt_data jsonb DEFAULT '{}'::jsonb NOT NULL,
    issued_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: payment_reconciliations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_reconciliations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    reconciliation_date timestamp with time zone NOT NULL,
    expected_amount numeric NOT NULL,
    actual_amount numeric NOT NULL,
    difference numeric NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    notes text,
    reconciled_by uuid,
    reconciled_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT payment_reconciliations_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'reconciled'::text, 'discrepancy'::text])))
);


--
-- Name: payment_reminders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_reminders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    scheduled_payment_id uuid NOT NULL,
    user_id uuid NOT NULL,
    reminder_type text NOT NULL,
    sent_at timestamp with time zone DEFAULT now() NOT NULL,
    channel text NOT NULL,
    status text DEFAULT 'sent'::text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT payment_reminders_channel_check CHECK ((channel = ANY (ARRAY['email'::text, 'sms'::text, 'push'::text]))),
    CONSTRAINT payment_reminders_reminder_type_check CHECK ((reminder_type = ANY (ARRAY['upcoming'::text, 'overdue'::text, 'failed'::text]))),
    CONSTRAINT payment_reminders_status_check CHECK ((status = ANY (ARRAY['sent'::text, 'failed'::text, 'bounced'::text])))
);


--
-- Name: payment_schedules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_schedules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL,
    user_id uuid NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'EUR'::text NOT NULL,
    installment_count integer NOT NULL,
    frequency text NOT NULL,
    next_payment_date timestamp with time zone,
    status text DEFAULT 'active'::text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT payment_schedules_frequency_check CHECK ((frequency = ANY (ARRAY['weekly'::text, 'biweekly'::text, 'monthly'::text]))),
    CONSTRAINT payment_schedules_installment_count_check CHECK ((installment_count > 0)),
    CONSTRAINT payment_schedules_status_check CHECK ((status = ANY (ARRAY['active'::text, 'completed'::text, 'cancelled'::text, 'paused'::text]))),
    CONSTRAINT payment_schedules_total_amount_check CHECK ((total_amount > (0)::numeric))
);


--
-- Name: payment_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    stripe_payment_intent_id text,
    stripe_charge_id text,
    amount numeric DEFAULT 0 NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    payment_method_id uuid,
    job_id uuid,
    invoice_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid,
    client_id uuid NOT NULL,
    professional_id uuid,
    stripe_payment_intent_id text,
    stripe_charge_id text,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    platform_fee numeric(10,2) DEFAULT 0 NOT NULL,
    net_amount numeric(10,2) NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    payment_method text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: payout_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payout_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    payout_id uuid NOT NULL,
    payment_id uuid NOT NULL,
    amount numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: payouts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payouts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    professional_id uuid NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    stripe_payout_id text,
    stripe_account_id text,
    method text DEFAULT 'standard'::text NOT NULL,
    arrival_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: performance_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.performance_metrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    metric_name text NOT NULL,
    metric_value numeric,
    dimensions jsonb DEFAULT '{}'::jsonb,
    recorded_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: platform_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platform_metrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    metric_date date NOT NULL,
    metric_hour integer,
    total_users integer DEFAULT 0,
    active_users integer DEFAULT 0,
    new_users integer DEFAULT 0,
    total_bookings integer DEFAULT 0,
    completed_bookings integer DEFAULT 0,
    cancelled_bookings integer DEFAULT 0,
    total_revenue numeric DEFAULT 0,
    average_booking_value numeric DEFAULT 0,
    total_messages integer DEFAULT 0,
    total_reviews integer DEFAULT 0,
    average_rating numeric DEFAULT 0,
    disputes_opened integer DEFAULT 0,
    disputes_resolved integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: points_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.points_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    points integer NOT NULL,
    transaction_type text NOT NULL,
    source text NOT NULL,
    source_id uuid,
    description text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: popular_searches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.popular_searches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    search_term text NOT NULL,
    search_type text NOT NULL,
    popularity_score integer DEFAULT 1,
    period text NOT NULL,
    period_start date NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: portfolio_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.portfolio_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    professional_id uuid NOT NULL,
    image_url text NOT NULL,
    title text,
    description text,
    category text,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: predictive_insights; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.predictive_insights (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    insight_type text NOT NULL,
    entity_type text,
    entity_id uuid,
    prediction_title text NOT NULL,
    prediction_description text,
    predicted_value numeric,
    confidence_level numeric DEFAULT 0 NOT NULL,
    time_horizon text,
    factors jsonb DEFAULT '[]'::jsonb,
    recommendations jsonb DEFAULT '[]'::jsonb,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone
);


--
-- Name: pricing_hints; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pricing_hints (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    service_category text NOT NULL,
    service_subcategory text NOT NULL,
    micro_service text NOT NULL,
    location_type text DEFAULT 'general'::text NOT NULL,
    avg_price numeric NOT NULL,
    min_price numeric NOT NULL,
    max_price numeric NOT NULL,
    sample_size integer DEFAULT 1 NOT NULL,
    last_updated timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: project_completions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_completions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id text NOT NULL,
    user_id uuid,
    project_type text NOT NULL,
    estimated_cost numeric(10,2) NOT NULL,
    actual_cost numeric(10,2),
    variance_percentage numeric(5,2),
    completion_date date,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: pricing_variance_summary; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.pricing_variance_summary WITH (security_invoker='on') AS
 SELECT project_type,
    count(*) AS total_projects,
    avg(variance_percentage) AS avg_variance,
    avg(estimated_cost) AS avg_estimated,
    avg(actual_cost) AS avg_actual,
    min(completion_date) AS earliest_completion,
    max(completion_date) AS latest_completion
   FROM public.project_completions
  WHERE (actual_cost IS NOT NULL)
  GROUP BY project_type;


--
-- Name: pro_badges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pro_badges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    pro_id uuid NOT NULL,
    key text NOT NULL,
    awarded_at timestamp with time zone DEFAULT now() NOT NULL,
    meta jsonb DEFAULT '{}'::jsonb
);


--
-- Name: pro_targets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pro_targets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    pro_id uuid NOT NULL,
    period text NOT NULL,
    revenue_target numeric(10,2),
    jobs_target integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT pro_targets_period_check CHECK ((period = ANY (ARRAY['daily'::text, 'weekly'::text, 'monthly'::text])))
);


--
-- Name: professional_applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.professional_applications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    booking_id uuid,
    professional_id uuid,
    message text,
    proposed_price numeric,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: professional_availability; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.professional_availability (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    professional_id uuid NOT NULL,
    status text NOT NULL,
    custom_message text,
    available_until timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    working_hours jsonb DEFAULT '{"friday": {"end": "17:00", "start": "09:00", "enabled": true}, "monday": {"end": "17:00", "start": "09:00", "enabled": true}, "sunday": {"enabled": false}, "tuesday": {"end": "17:00", "start": "09:00", "enabled": true}, "saturday": {"enabled": false}, "thursday": {"end": "17:00", "start": "09:00", "enabled": true}, "wednesday": {"end": "17:00", "start": "09:00", "enabled": true}}'::jsonb,
    buffer_time_minutes integer DEFAULT 15,
    max_bookings_per_day integer DEFAULT 4,
    CONSTRAINT professional_availability_status_check CHECK ((status = ANY (ARRAY['available'::text, 'busy'::text, 'away'::text, 'offline'::text])))
);


--
-- Name: professional_badges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.professional_badges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    professional_user_id uuid NOT NULL,
    badge_type text NOT NULL,
    badge_name text NOT NULL,
    badge_icon text,
    earned_at timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: professional_deals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.professional_deals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    professional_id uuid NOT NULL,
    service_id uuid NOT NULL,
    deal_type text DEFAULT 'package'::text NOT NULL,
    title text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    duration_hours integer,
    includes jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: professional_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.professional_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    professional_id uuid NOT NULL,
    document_type text NOT NULL,
    file_url text NOT NULL,
    file_name text NOT NULL,
    file_size integer,
    verification_status text DEFAULT 'pending'::text NOT NULL,
    verification_notes text,
    verified_by uuid,
    verified_at timestamp with time zone,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT professional_documents_document_type_check CHECK ((document_type = ANY (ARRAY['insurance'::text, 'business_license'::text, 'tax_certificate'::text, 'certification'::text, 'portfolio'::text]))),
    CONSTRAINT professional_documents_verification_status_check CHECK ((verification_status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'expired'::text])))
);


--
-- Name: professional_earnings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.professional_earnings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    professional_id uuid NOT NULL,
    booking_id uuid,
    contract_id uuid,
    amount numeric DEFAULT 0 NOT NULL,
    fee_amount numeric DEFAULT 0 NOT NULL,
    net_amount numeric DEFAULT 0 NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    earned_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: professional_portfolio; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.professional_portfolio (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    professional_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    images text[] DEFAULT '{}'::text[],
    project_date date,
    category text,
    client_name text,
    skills_used text[] DEFAULT '{}'::text[],
    is_featured boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: professional_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.professional_profiles (
    user_id uuid NOT NULL,
    primary_trade text,
    zones jsonb DEFAULT '[]'::jsonb,
    languages jsonb DEFAULT '["en"]'::jsonb,
    verification_status text DEFAULT 'unverified'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    skills jsonb DEFAULT '[]'::jsonb,
    experience_years text,
    hourly_rate numeric,
    availability jsonb DEFAULT '[]'::jsonb,
    bio text,
    portfolio_images jsonb DEFAULT '[]'::jsonb,
    subscription_tier text DEFAULT 'basic'::text,
    business_name text,
    vat_number text,
    insurance_details jsonb DEFAULT '{}'::jsonb,
    bank_details jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    response_time_hours integer DEFAULT 24,
    cover_image_url text,
    tagline text,
    video_intro_url text,
    work_philosophy text,
    response_guarantee_hours integer DEFAULT 24,
    instant_booking_enabled boolean DEFAULT false,
    work_process_steps jsonb DEFAULT '[]'::jsonb,
    intro_categories jsonb DEFAULT '[]'::jsonb,
    service_regions jsonb DEFAULT '[]'::jsonb,
    onboarding_phase text DEFAULT 'not_started'::text,
    rejection_reason text,
    contact_email text,
    contact_phone text,
    CONSTRAINT professional_profiles_subscription_tier_check CHECK ((subscription_tier = ANY (ARRAY['basic'::text, 'pro'::text, 'premium'::text])))
);


--
-- Name: professional_profiles_public; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.professional_profiles_public WITH (security_invoker='on') AS
 SELECT user_id,
    business_name,
    primary_trade,
    bio,
    tagline,
    hourly_rate,
    zones,
    service_regions,
    is_active,
    verification_status,
    instant_booking_enabled,
    response_time_hours,
    skills,
    experience_years,
    work_philosophy,
    created_at
   FROM public.professional_profiles
  WHERE ((is_active = true) AND (verification_status = 'verified'::text));


--
-- Name: professional_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.professional_reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    professional_id uuid NOT NULL,
    client_id uuid NOT NULL,
    booking_id uuid,
    rating integer NOT NULL,
    title text,
    comment text,
    response text,
    responded_at timestamp with time zone,
    is_verified boolean DEFAULT false NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    job_id uuid,
    contract_id uuid,
    milestone_id uuid,
    CONSTRAINT professional_reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: professional_scores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.professional_scores (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    professional_id uuid NOT NULL,
    quality_score numeric(5,2) DEFAULT 0,
    reliability_score numeric(5,2) DEFAULT 0,
    communication_score numeric(5,2) DEFAULT 0,
    overall_score numeric(5,2) DEFAULT 0,
    rank_percentile numeric(5,2),
    calculated_at timestamp with time zone DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);


--
-- Name: professional_service_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.professional_service_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    professional_id uuid NOT NULL,
    service_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    base_price numeric DEFAULT 0 NOT NULL,
    pricing_type text DEFAULT 'flat_rate'::text NOT NULL,
    unit_type text DEFAULT 'item'::text,
    min_quantity integer DEFAULT 1,
    max_quantity integer,
    bulk_discount_threshold integer,
    bulk_discount_price numeric,
    category text DEFAULT 'labor'::text NOT NULL,
    estimated_duration_minutes integer,
    difficulty_level text DEFAULT 'standard'::text,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    primary_image_url text,
    gallery_images jsonb DEFAULT '[]'::jsonb,
    video_url text,
    image_alt_text text,
    subcategory text,
    micro text
);


--
-- Name: professional_services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.professional_services (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    professional_id uuid NOT NULL,
    micro_service_id uuid NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    service_areas jsonb DEFAULT '[]'::jsonb,
    pricing_structure jsonb DEFAULT '{}'::jsonb,
    portfolio_urls text[],
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: professional_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.professional_stats (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    professional_id uuid NOT NULL,
    total_bookings integer DEFAULT 0 NOT NULL,
    completed_bookings integer DEFAULT 0 NOT NULL,
    total_earnings numeric DEFAULT 0 NOT NULL,
    average_rating numeric DEFAULT 0 NOT NULL,
    total_reviews integer DEFAULT 0 NOT NULL,
    response_rate numeric DEFAULT 0 NOT NULL,
    completion_rate numeric DEFAULT 0 NOT NULL,
    repeat_client_rate numeric DEFAULT 0 NOT NULL,
    last_active_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: professional_stripe_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.professional_stripe_accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    professional_id uuid NOT NULL,
    stripe_account_id text NOT NULL,
    account_status text DEFAULT 'pending'::text NOT NULL,
    charges_enabled boolean DEFAULT false,
    payouts_enabled boolean DEFAULT false,
    details_submitted boolean DEFAULT false,
    country text,
    currency text DEFAULT 'USD'::text,
    balance_available numeric DEFAULT 0,
    balance_pending numeric DEFAULT 0,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT professional_stripe_accounts_account_status_check CHECK ((account_status = ANY (ARRAY['pending'::text, 'active'::text, 'restricted'::text, 'disabled'::text])))
);


--
-- Name: professional_verifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.professional_verifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    professional_id uuid NOT NULL,
    verification_method text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    notes text,
    reviewer_notes text,
    submitted_at timestamp with time zone DEFAULT now() NOT NULL,
    reviewed_at timestamp with time zone,
    reviewed_by uuid,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    document_urls text[] DEFAULT '{}'::text[],
    CONSTRAINT professional_verifications_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'expired'::text]))),
    CONSTRAINT professional_verifications_verification_method_check CHECK ((verification_method = ANY (ARRAY['id_document'::text, 'business_license'::text, 'certification'::text, 'insurance'::text])))
);


--
-- Name: profile_views; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profile_views (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    professional_id uuid NOT NULL,
    viewer_id uuid,
    session_id text NOT NULL,
    viewed_at timestamp with time zone DEFAULT now(),
    ip_address inet,
    user_agent text
);


--
-- Name: properties; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.properties (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid NOT NULL,
    name text NOT NULL,
    address text NOT NULL,
    access_notes text,
    parking_details jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: query_performance_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.query_performance_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    query_name text NOT NULL,
    execution_time_ms integer NOT NULL,
    table_name text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: question_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.question_metrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    pack_id uuid NOT NULL,
    question_key text NOT NULL,
    views integer DEFAULT 0 NOT NULL,
    answers integer DEFAULT 0 NOT NULL,
    dropoffs integer DEFAULT 0 NOT NULL,
    avg_time_ms integer DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: question_pack_audit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.question_pack_audit (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    pack_id uuid NOT NULL,
    actor uuid,
    event text NOT NULL,
    meta jsonb,
    at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: question_packs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.question_packs (
    pack_id uuid DEFAULT gen_random_uuid() NOT NULL,
    micro_slug text NOT NULL,
    version integer NOT NULL,
    status public.pack_status DEFAULT 'draft'::public.pack_status NOT NULL,
    source public.pack_source NOT NULL,
    prompt_hash text,
    content jsonb NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    approved_at timestamp with time zone,
    approved_by uuid,
    is_active boolean DEFAULT false NOT NULL,
    ab_test_id text,
    ui_config jsonb DEFAULT '{}'::jsonb
);


--
-- Name: quote_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quote_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL,
    professional_id uuid NOT NULL,
    status text DEFAULT 'sent'::text NOT NULL,
    message text,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: quotes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quotes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    quote_request_id uuid NOT NULL,
    amount numeric NOT NULL,
    breakdown jsonb DEFAULT '{}'::jsonb,
    inclusions text[],
    exclusions text[],
    warranty_info text,
    valid_until timestamp with time zone,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: rate_limit_tracking; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rate_limit_tracking (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    identifier text NOT NULL,
    action text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: rating_summary; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rating_summary (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role text NOT NULL,
    total_reviews integer DEFAULT 0,
    average_rating numeric(3,2) DEFAULT 0,
    rating_distribution jsonb DEFAULT '{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}'::jsonb,
    category_averages jsonb DEFAULT '{}'::jsonb,
    response_rate numeric(3,2) DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT rating_summary_role_check CHECK ((role = ANY (ARRAY['professional'::text, 'client'::text])))
);


--
-- Name: read_receipts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.read_receipts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    message_id uuid NOT NULL,
    user_id uuid NOT NULL,
    read_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: redirect_analytics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.redirect_analytics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    from_path text NOT NULL,
    to_path text NOT NULL,
    redirect_reason text,
    hit_count integer DEFAULT 0 NOT NULL,
    last_hit_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: referral_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.referral_codes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    code text NOT NULL,
    uses_count integer DEFAULT 0 NOT NULL,
    max_uses integer,
    expires_at timestamp with time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: referrals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.referrals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    referrer_id uuid NOT NULL,
    referred_id uuid NOT NULL,
    referral_code_id uuid NOT NULL,
    referrer_reward_points integer,
    referred_reward_points integer,
    status text DEFAULT 'pending'::text NOT NULL,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: refund_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refund_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    payment_id uuid NOT NULL,
    requested_by uuid NOT NULL,
    amount numeric(10,2) NOT NULL,
    reason text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    admin_notes text,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    processed_at timestamp with time zone,
    stripe_refund_id text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT refund_requests_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'processed'::text])))
);


--
-- Name: refunds; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refunds (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    payment_id uuid NOT NULL,
    amount numeric(10,2) NOT NULL,
    reason text,
    status text DEFAULT 'pending'::text NOT NULL,
    stripe_refund_id text,
    requested_by uuid NOT NULL,
    processed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: report_exports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.report_exports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    report_type text NOT NULL,
    export_format text NOT NULL,
    filters jsonb DEFAULT '{}'::jsonb,
    include_pii boolean DEFAULT false,
    file_path text,
    file_size integer,
    status text DEFAULT 'pending'::text,
    error_message text,
    requested_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    CONSTRAINT report_exports_export_format_check CHECK ((export_format = ANY (ARRAY['csv'::text, 'json'::text, 'pdf'::text]))),
    CONSTRAINT report_exports_report_type_check CHECK ((report_type = ANY (ARRAY['jobs'::text, 'bookings'::text, 'disputes'::text, 'payouts'::text, 'reviews'::text, 'users'::text, 'analytics'::text]))),
    CONSTRAINT report_exports_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text])))
);


--
-- Name: report_schedules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.report_schedules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    report_name text NOT NULL,
    report_type text NOT NULL,
    report_config jsonb DEFAULT '{}'::jsonb,
    schedule_frequency text NOT NULL,
    schedule_day integer,
    schedule_time time without time zone NOT NULL,
    recipients text[] NOT NULL,
    is_active boolean DEFAULT true,
    last_run_at timestamp with time zone,
    next_run_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: report_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.report_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    report_type text NOT NULL,
    frequency text DEFAULT 'daily'::text NOT NULL,
    template_config jsonb DEFAULT '{}'::jsonb NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: resolution_enforcement_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resolution_enforcement_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    dispute_id uuid NOT NULL,
    resolution_id uuid NOT NULL,
    action text NOT NULL,
    details jsonb DEFAULT '{}'::jsonb,
    executed_by uuid,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: revenue_analytics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.revenue_analytics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    analysis_date date NOT NULL,
    revenue_type text NOT NULL,
    total_amount numeric DEFAULT 0,
    transaction_count integer DEFAULT 0,
    average_transaction numeric DEFAULT 0,
    refund_amount numeric DEFAULT 0,
    net_revenue numeric DEFAULT 0,
    currency text DEFAULT 'USD'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: revenue_forecasts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.revenue_forecasts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    forecast_period text NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    predicted_revenue numeric(12,2) NOT NULL,
    confidence_level numeric(5,2) DEFAULT 0,
    actual_revenue numeric(12,2),
    variance numeric(12,2),
    model_version text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: review_flags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.review_flags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    review_id uuid NOT NULL,
    flagged_by uuid NOT NULL,
    flag_reason text NOT NULL,
    status text DEFAULT 'pending'::text,
    reviewed_by uuid,
    moderation_action text,
    admin_notes text,
    created_at timestamp with time zone DEFAULT now(),
    reviewed_at timestamp with time zone,
    CONSTRAINT review_flags_flag_reason_check CHECK ((flag_reason = ANY (ARRAY['abuse'::text, 'false_information'::text, 'doxxing'::text, 'off_platform_deal'::text, 'spam'::text, 'inappropriate'::text]))),
    CONSTRAINT review_flags_moderation_action_check CHECK ((moderation_action = ANY (ARRAY['redacted'::text, 'removed'::text, 'shadow_hidden'::text, 'request_proof'::text, 'dismissed'::text]))),
    CONSTRAINT review_flags_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'under_review'::text, 'resolved'::text, 'dismissed'::text])))
);


--
-- Name: review_helpful_votes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.review_helpful_votes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    review_id uuid NOT NULL,
    user_id uuid NOT NULL,
    is_helpful boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: review_helpfulness; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.review_helpfulness (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    review_id uuid NOT NULL,
    user_id uuid NOT NULL,
    is_helpful boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: review_media; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.review_media (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    review_id uuid NOT NULL,
    file_url text NOT NULL,
    file_type text NOT NULL,
    file_name text,
    file_size integer,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: review_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.review_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    review_id uuid NOT NULL,
    reported_by uuid NOT NULL,
    reason text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: review_responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.review_responses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    review_id uuid NOT NULL,
    responder_id uuid NOT NULL,
    response_text text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL,
    contract_id uuid,
    reviewer_id uuid NOT NULL,
    reviewee_id uuid NOT NULL,
    rating integer NOT NULL,
    title text,
    comment text,
    category_ratings jsonb DEFAULT '{}'::jsonb,
    is_verified boolean DEFAULT false,
    is_featured boolean DEFAULT false,
    helpful_count integer DEFAULT 0,
    unhelpful_count integer DEFAULT 0,
    response_text text,
    response_at timestamp with time zone,
    flagged_at timestamp with time zone,
    flag_reason text,
    moderation_status text DEFAULT 'approved'::text,
    moderation_notes text,
    moderated_by uuid,
    moderated_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT reviews_moderation_status_check CHECK ((moderation_status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'flagged'::text]))),
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: saved_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.saved_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    report_name text NOT NULL,
    report_type text NOT NULL,
    report_config jsonb NOT NULL,
    report_data jsonb,
    is_public boolean DEFAULT false,
    generated_at timestamp with time zone,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: saved_searches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.saved_searches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    search_query text,
    search_type text NOT NULL,
    filters jsonb DEFAULT '{}'::jsonb,
    notification_enabled boolean DEFAULT false,
    last_checked_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: scheduled_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.scheduled_payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    schedule_id uuid NOT NULL,
    installment_number integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'EUR'::text NOT NULL,
    due_date timestamp with time zone NOT NULL,
    paid_at timestamp with time zone,
    status text DEFAULT 'pending'::text NOT NULL,
    payment_transaction_id uuid,
    stripe_payment_intent_id text,
    failure_reason text,
    reminder_sent_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT scheduled_payments_amount_check CHECK ((amount > (0)::numeric)),
    CONSTRAINT scheduled_payments_installment_number_check CHECK ((installment_number > 0)),
    CONSTRAINT scheduled_payments_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'paid'::text, 'failed'::text, 'cancelled'::text])))
);


--
-- Name: search_analytics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.search_analytics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    date date NOT NULL,
    search_term text NOT NULL,
    search_type text NOT NULL,
    search_count integer DEFAULT 1,
    zero_results_count integer DEFAULT 0,
    avg_results integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: search_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.search_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    search_query text NOT NULL,
    search_type text NOT NULL,
    filters jsonb DEFAULT '{}'::jsonb,
    results_count integer DEFAULT 0,
    clicked_result_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: security_audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.security_audit_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    action text NOT NULL,
    resource_type text,
    resource_id uuid,
    ip_address inet,
    user_agent text,
    result text NOT NULL,
    failure_reason text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: security_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.security_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    event_type text NOT NULL,
    event_category text NOT NULL,
    severity text DEFAULT 'low'::text NOT NULL,
    ip_address inet,
    user_agent text,
    location jsonb,
    event_data jsonb DEFAULT '{}'::jsonb,
    detected_at timestamp with time zone DEFAULT now() NOT NULL,
    resolved_at timestamp with time zone,
    resolved_by uuid,
    status text DEFAULT 'open'::text NOT NULL,
    notes text
);


--
-- Name: service_addons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_addons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    service_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    is_popular boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: service_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    icon_emoji text,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    category_group text,
    is_featured boolean DEFAULT false,
    metadata jsonb DEFAULT '{}'::jsonb,
    icon_name text,
    examples text[]
);


--
-- Name: service_micro_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_micro_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    subcategory_id uuid NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: service_name_map; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_name_map (
    source text NOT NULL,
    raw_category text NOT NULL,
    norm_category text NOT NULL,
    CONSTRAINT service_name_map_source_check CHECK ((source = ANY (ARRAY['services'::text, 'services_micro'::text])))
);


--
-- Name: service_options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_options (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    service_id uuid NOT NULL,
    category text NOT NULL,
    name text NOT NULL,
    description text,
    base_price numeric(10,2) DEFAULT 0 NOT NULL,
    price_per_unit numeric(10,2),
    min_quantity integer DEFAULT 1,
    max_quantity integer,
    is_required boolean DEFAULT false,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: service_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    service_id uuid,
    version integer DEFAULT 1,
    questions jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: service_subcategories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_subcategories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category_id uuid NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.services (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category text NOT NULL,
    subcategory text NOT NULL,
    micro text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    is_featured boolean DEFAULT false
);


--
-- Name: services_unified_v1; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.services_unified_v1 (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category text NOT NULL,
    subcategory text NOT NULL,
    micro text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: services_catalog; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.services_catalog WITH (security_invoker='on') AS
 SELECT id,
    category,
    subcategory,
    micro,
    created_at,
    updated_at
   FROM public.services_unified_v1
  WHERE ((category IS NOT NULL) AND (subcategory IS NOT NULL) AND (micro IS NOT NULL))
  ORDER BY category, subcategory, micro;


--
-- Name: services_micro; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.services_micro (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category text NOT NULL,
    subcategory text NOT NULL,
    micro text NOT NULL,
    questions_micro jsonb DEFAULT '[]'::jsonb NOT NULL,
    questions_logistics jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    category_type text DEFAULT 'main'::text,
    question_source text DEFAULT 'ai'::text,
    priority_level text DEFAULT 'medium'::text,
    ibiza_specific boolean DEFAULT false,
    is_active boolean DEFAULT true,
    sort_index integer DEFAULT 0,
    updated_by uuid,
    name_es text,
    typical_duration_hours integer,
    icon_emoji text
);


--
-- Name: services_micro_versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.services_micro_versions (
    version_id bigint NOT NULL,
    services_micro_id uuid NOT NULL,
    snapshot jsonb NOT NULL,
    change_summary text,
    actor uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: services_micro_versions_version_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.services_micro_versions ALTER COLUMN version_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.services_micro_versions_version_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: services_unified; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.services_unified (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category text NOT NULL,
    subcategory text NOT NULL,
    micro text NOT NULL,
    description text,
    typical_duration text,
    price_range text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: shared_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shared_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid,
    title text NOT NULL,
    document_type text NOT NULL,
    content jsonb DEFAULT '{}'::jsonb,
    version integer DEFAULT 1,
    created_by uuid,
    last_edited_by uuid,
    last_edited_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    section text NOT NULL,
    key text NOT NULL,
    value jsonb NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: smart_matches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.smart_matches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL,
    professional_id uuid NOT NULL,
    match_score numeric DEFAULT 0 NOT NULL,
    match_reasons jsonb DEFAULT '[]'::jsonb,
    availability_score numeric DEFAULT 0,
    skill_score numeric DEFAULT 0,
    location_score numeric DEFAULT 0,
    price_score numeric DEFAULT 0,
    reputation_score numeric DEFAULT 0,
    status text DEFAULT 'suggested'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: spam_keywords; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.spam_keywords (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    keyword text NOT NULL,
    severity text DEFAULT 'medium'::text,
    is_active boolean DEFAULT true,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: stripe_customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stripe_customers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    stripe_customer_id text NOT NULL,
    email text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: support_tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_tickets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ticket_number integer NOT NULL,
    user_id uuid NOT NULL,
    assigned_to uuid,
    status text DEFAULT 'open'::text,
    priority text DEFAULT 'medium'::text,
    category text NOT NULL,
    subject text NOT NULL,
    description text,
    sla_deadline timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    resolved_at timestamp with time zone,
    closed_at timestamp with time zone,
    CONSTRAINT support_tickets_category_check CHECK ((category = ANY (ARRAY['billing'::text, 'technical'::text, 'account'::text, 'dispute'::text, 'verification'::text, 'other'::text]))),
    CONSTRAINT support_tickets_priority_check CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'urgent'::text]))),
    CONSTRAINT support_tickets_status_check CHECK ((status = ANY (ARRAY['open'::text, 'in_progress'::text, 'waiting_response'::text, 'resolved'::text, 'closed'::text])))
);


--
-- Name: support_tickets_ticket_number_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.support_tickets_ticket_number_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: support_tickets_ticket_number_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.support_tickets_ticket_number_seq OWNED BY public.support_tickets.ticket_number;


--
-- Name: system_activity_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_activity_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    action text NOT NULL,
    entity_type text,
    entity_id uuid,
    changes jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: system_health_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_health_metrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    service_name text NOT NULL,
    metric_type text NOT NULL,
    value numeric NOT NULL,
    status text DEFAULT 'healthy'::text NOT NULL,
    response_time_ms integer,
    error_rate numeric DEFAULT 0,
    recorded_at timestamp with time zone DEFAULT now() NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb
);


--
-- Name: system_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_metrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    metric_type text NOT NULL,
    metric_name text NOT NULL,
    metric_value numeric NOT NULL,
    metric_metadata jsonb,
    recorded_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ticket_attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ticket_attachments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ticket_id uuid NOT NULL,
    message_id uuid,
    file_name text NOT NULL,
    file_path text NOT NULL,
    file_size integer,
    mime_type text,
    uploaded_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: ticket_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ticket_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ticket_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    message text NOT NULL,
    is_internal_note boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: transaction_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transaction_notes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    transaction_id uuid NOT NULL,
    user_id uuid NOT NULL,
    note text NOT NULL,
    is_internal boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: two_factor_auth; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.two_factor_auth (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    secret text NOT NULL,
    backup_codes text[],
    is_enabled boolean DEFAULT false,
    verified_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: typing_indicators; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.typing_indicators (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conversation_id uuid NOT NULL,
    user_id uuid NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:00:10'::interval) NOT NULL
);


--
-- Name: user_achievements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_achievements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    achievement_id uuid NOT NULL,
    progress integer DEFAULT 0 NOT NULL,
    completed_at timestamp with time zone,
    claimed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_activity_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_activity_metrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    metric_date date NOT NULL,
    sessions_count integer DEFAULT 0,
    page_views integer DEFAULT 0,
    actions_count integer DEFAULT 0,
    time_spent_seconds integer DEFAULT 0,
    bookings_made integer DEFAULT 0,
    messages_sent integer DEFAULT 0,
    searches_performed integer DEFAULT 0,
    last_active_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_badges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_badges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    badge_id uuid NOT NULL,
    earned_at timestamp with time zone DEFAULT now() NOT NULL,
    is_displayed boolean DEFAULT false NOT NULL
);


--
-- Name: user_blocks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_blocks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    blocker_id uuid NOT NULL,
    blocked_id uuid NOT NULL,
    reason text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_cohorts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_cohorts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cohort_date date NOT NULL,
    cohort_size integer DEFAULT 0,
    retention_day_1 integer DEFAULT 0,
    retention_day_7 integer DEFAULT 0,
    retention_day_30 integer DEFAULT 0,
    retention_day_60 integer DEFAULT 0,
    retention_day_90 integer DEFAULT 0,
    total_bookings integer DEFAULT 0,
    total_revenue numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_compliance_status; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_compliance_status (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    framework_id uuid NOT NULL,
    compliance_score numeric DEFAULT 0 NOT NULL,
    last_checked_at timestamp with time zone DEFAULT now() NOT NULL,
    requirements_met jsonb DEFAULT '[]'::jsonb,
    requirements_pending jsonb DEFAULT '[]'::jsonb,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_devices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_devices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    endpoint text NOT NULL,
    p256dh text NOT NULL,
    auth text NOT NULL,
    user_agent text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    last_seen_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_feedback (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    feedback_type text,
    message text NOT NULL,
    page_url text,
    user_agent text,
    status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now(),
    reviewed_at timestamp with time zone,
    reviewed_by uuid,
    CONSTRAINT user_feedback_feedback_type_check CHECK ((feedback_type = ANY (ARRAY['positive'::text, 'negative'::text, 'bug'::text, 'feature'::text]))),
    CONSTRAINT user_feedback_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'reviewed'::text, 'resolved'::text, 'archived'::text])))
);


--
-- Name: user_points; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_points (
    user_id uuid NOT NULL,
    total_points integer DEFAULT 0 NOT NULL,
    current_balance integer DEFAULT 0 NOT NULL,
    tier_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_presence; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_presence (
    user_id uuid NOT NULL,
    status text DEFAULT 'offline'::text NOT NULL,
    last_seen timestamp with time zone DEFAULT now() NOT NULL,
    custom_status text,
    status_emoji text,
    device_info jsonb DEFAULT '{}'::jsonb,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_roles_audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles_audit_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    actor_user_id uuid,
    target_user_id uuid,
    action text NOT NULL,
    old_row jsonb,
    new_row jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    device_info jsonb DEFAULT '{}'::jsonb,
    ip_address text,
    user_agent text,
    location jsonb,
    is_active boolean DEFAULT true,
    last_activity_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: ux_health_checks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ux_health_checks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    check_type text NOT NULL,
    severity text NOT NULL,
    entity_type text,
    entity_id text,
    message text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    detected_at timestamp with time zone DEFAULT now() NOT NULL,
    resolved_at timestamp with time zone,
    resolved_by uuid,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    priority_weight integer GENERATED ALWAYS AS (
CASE severity
    WHEN 'critical'::text THEN 4
    WHEN 'high'::text THEN 3
    WHEN 'medium'::text THEN 2
    WHEN 'low'::text THEN 1
    ELSE NULL::integer
END) STORED,
    CONSTRAINT ux_health_checks_severity_check CHECK ((severity = ANY (ARRAY['critical'::text, 'high'::text, 'medium'::text, 'low'::text]))),
    CONSTRAINT ux_health_checks_status_check CHECK ((status = ANY (ARRAY['active'::text, 'resolved'::text, 'ignored'::text])))
);


--
-- Name: video_calls; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.video_calls (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conversation_id uuid,
    room_id text NOT NULL,
    initiated_by uuid NOT NULL,
    participants uuid[] DEFAULT '{}'::uuid[] NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    started_at timestamp with time zone,
    ended_at timestamp with time zone,
    duration_seconds integer,
    recording_url text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: webhook_deliveries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.webhook_deliveries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    subscription_id uuid,
    event_type text NOT NULL,
    payload jsonb,
    status_code integer,
    success boolean DEFAULT false,
    response_body text,
    error_message text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: webhook_endpoints; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.webhook_endpoints (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    url text NOT NULL,
    events text[] NOT NULL,
    secret text NOT NULL,
    is_active boolean DEFAULT true,
    last_triggered_at timestamp with time zone,
    failure_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: webhook_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.webhook_subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    event_type text NOT NULL,
    webhook_url text NOT NULL,
    secret_key text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: workflow_automations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workflow_automations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    trigger_type text NOT NULL,
    trigger_config jsonb DEFAULT '{}'::jsonb NOT NULL,
    workflow_steps jsonb DEFAULT '[]'::jsonb NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    execution_history jsonb DEFAULT '[]'::jsonb,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: support_tickets ticket_number; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets ALTER COLUMN ticket_number SET DEFAULT nextval('public.support_tickets_ticket_number_seq'::regclass);


--
-- Name: achievements achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_pkey PRIMARY KEY (id);


--
-- Name: active_sessions active_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_sessions
    ADD CONSTRAINT active_sessions_pkey PRIMARY KEY (id);


--
-- Name: active_sessions active_sessions_session_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_sessions
    ADD CONSTRAINT active_sessions_session_token_key UNIQUE (session_token);


--
-- Name: activity_feed activity_feed_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_feed
    ADD CONSTRAINT activity_feed_pkey PRIMARY KEY (id);


--
-- Name: admin_alerts admin_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_alerts
    ADD CONSTRAINT admin_alerts_pkey PRIMARY KEY (id);


--
-- Name: admin_audit_log admin_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_audit_log
    ADD CONSTRAINT admin_audit_log_pkey PRIMARY KEY (id);


--
-- Name: admin_events admin_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_events
    ADD CONSTRAINT admin_events_pkey PRIMARY KEY (id);


--
-- Name: admin_ip_whitelist admin_ip_whitelist_ip_address_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_ip_whitelist
    ADD CONSTRAINT admin_ip_whitelist_ip_address_key UNIQUE (ip_address);


--
-- Name: admin_ip_whitelist admin_ip_whitelist_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_ip_whitelist
    ADD CONSTRAINT admin_ip_whitelist_pkey PRIMARY KEY (id);


--
-- Name: admin_permissions admin_permissions_admin_id_permission_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_permissions
    ADD CONSTRAINT admin_permissions_admin_id_permission_key UNIQUE (admin_id, permission);


--
-- Name: admin_permissions admin_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_permissions
    ADD CONSTRAINT admin_permissions_pkey PRIMARY KEY (id);


--
-- Name: ai_alerts ai_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_alerts
    ADD CONSTRAINT ai_alerts_pkey PRIMARY KEY (id);


--
-- Name: ai_automation_rules ai_automation_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_automation_rules
    ADD CONSTRAINT ai_automation_rules_pkey PRIMARY KEY (id);


--
-- Name: ai_chat_messages ai_chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_chat_messages
    ADD CONSTRAINT ai_chat_messages_pkey PRIMARY KEY (id);


--
-- Name: ai_conversations ai_conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_conversations
    ADD CONSTRAINT ai_conversations_pkey PRIMARY KEY (id);


--
-- Name: ai_prompts ai_prompts_name_version_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_prompts
    ADD CONSTRAINT ai_prompts_name_version_key UNIQUE (name, version);


--
-- Name: ai_prompts ai_prompts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_prompts
    ADD CONSTRAINT ai_prompts_pkey PRIMARY KEY (id);


--
-- Name: ai_recommendations ai_recommendations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_recommendations
    ADD CONSTRAINT ai_recommendations_pkey PRIMARY KEY (id);


--
-- Name: ai_risk_flags ai_risk_flags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_risk_flags
    ADD CONSTRAINT ai_risk_flags_pkey PRIMARY KEY (id);


--
-- Name: ai_runs ai_runs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_runs
    ADD CONSTRAINT ai_runs_pkey PRIMARY KEY (id);


--
-- Name: alert_rules alert_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alert_rules
    ADD CONSTRAINT alert_rules_pkey PRIMARY KEY (id);


--
-- Name: analytics_dashboards analytics_dashboards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_dashboards
    ADD CONSTRAINT analytics_dashboards_pkey PRIMARY KEY (id);


--
-- Name: analytics_events analytics_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_pkey PRIMARY KEY (id);


--
-- Name: analytics_snapshots analytics_snapshots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_snapshots
    ADD CONSTRAINT analytics_snapshots_pkey PRIMARY KEY (id);


--
-- Name: analytics_snapshots analytics_snapshots_snapshot_date_metric_type_metric_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_snapshots
    ADD CONSTRAINT analytics_snapshots_snapshot_date_metric_type_metric_name_key UNIQUE (snapshot_date, metric_type, metric_name);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: automation_executions automation_executions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automation_executions
    ADD CONSTRAINT automation_executions_pkey PRIMARY KEY (id);


--
-- Name: automation_workflows automation_workflows_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automation_workflows
    ADD CONSTRAINT automation_workflows_pkey PRIMARY KEY (id);


--
-- Name: availability_presets availability_presets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_presets
    ADD CONSTRAINT availability_presets_pkey PRIMARY KEY (id);


--
-- Name: background_jobs background_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.background_jobs
    ADD CONSTRAINT background_jobs_pkey PRIMARY KEY (id);


--
-- Name: badges badges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.badges
    ADD CONSTRAINT badges_pkey PRIMARY KEY (id);


--
-- Name: blocked_dates blocked_dates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blocked_dates
    ADD CONSTRAINT blocked_dates_pkey PRIMARY KEY (id);


--
-- Name: booking_reminders booking_reminders_booking_id_reminder_type_delivery_method_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_reminders
    ADD CONSTRAINT booking_reminders_booking_id_reminder_type_delivery_method_key UNIQUE (booking_id, reminder_type, delivery_method);


--
-- Name: booking_reminders booking_reminders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_reminders
    ADD CONSTRAINT booking_reminders_pkey PRIMARY KEY (id);


--
-- Name: booking_requests booking_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_requests
    ADD CONSTRAINT booking_requests_pkey PRIMARY KEY (id);


--
-- Name: booking_risk_flags booking_risk_flags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_risk_flags
    ADD CONSTRAINT booking_risk_flags_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: business_insights business_insights_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_insights
    ADD CONSTRAINT business_insights_pkey PRIMARY KEY (id);


--
-- Name: business_metrics business_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_metrics
    ADD CONSTRAINT business_metrics_pkey PRIMARY KEY (id);


--
-- Name: calculator_saved_configs calculator_saved_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calculator_saved_configs
    ADD CONSTRAINT calculator_saved_configs_pkey PRIMARY KEY (id);


--
-- Name: calculator_saved_configs calculator_saved_configs_share_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calculator_saved_configs
    ADD CONSTRAINT calculator_saved_configs_share_token_key UNIQUE (share_token);


--
-- Name: calculator_share_events calculator_share_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calculator_share_events
    ADD CONSTRAINT calculator_share_events_pkey PRIMARY KEY (id);


--
-- Name: calendar_events calendar_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_events
    ADD CONSTRAINT calendar_events_pkey PRIMARY KEY (id);


--
-- Name: calendar_sync calendar_sync_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_sync
    ADD CONSTRAINT calendar_sync_pkey PRIMARY KEY (id);


--
-- Name: category_suggestions category_suggestions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.category_suggestions
    ADD CONSTRAINT category_suggestions_pkey PRIMARY KEY (id);


--
-- Name: change_orders change_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.change_orders
    ADD CONSTRAINT change_orders_pkey PRIMARY KEY (id);


--
-- Name: churn_predictions churn_predictions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.churn_predictions
    ADD CONSTRAINT churn_predictions_pkey PRIMARY KEY (id);


--
-- Name: client_favorites client_favorites_client_id_professional_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_favorites
    ADD CONSTRAINT client_favorites_client_id_professional_id_key UNIQUE (client_id, professional_id);


--
-- Name: client_favorites client_favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_favorites
    ADD CONSTRAINT client_favorites_pkey PRIMARY KEY (id);


--
-- Name: client_files client_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_files
    ADD CONSTRAINT client_files_pkey PRIMARY KEY (id);


--
-- Name: client_logs client_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_logs
    ADD CONSTRAINT client_logs_pkey PRIMARY KEY (id);


--
-- Name: client_profiles client_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_profiles
    ADD CONSTRAINT client_profiles_pkey PRIMARY KEY (id);


--
-- Name: collaborative_sessions collaborative_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collaborative_sessions
    ADD CONSTRAINT collaborative_sessions_pkey PRIMARY KEY (id);


--
-- Name: collaborative_sessions collaborative_sessions_room_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collaborative_sessions
    ADD CONSTRAINT collaborative_sessions_room_id_key UNIQUE (room_id);


--
-- Name: compliance_frameworks compliance_frameworks_framework_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compliance_frameworks
    ADD CONSTRAINT compliance_frameworks_framework_code_key UNIQUE (framework_code);


--
-- Name: compliance_frameworks compliance_frameworks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compliance_frameworks
    ADD CONSTRAINT compliance_frameworks_pkey PRIMARY KEY (id);


--
-- Name: compliance_reports compliance_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compliance_reports
    ADD CONSTRAINT compliance_reports_pkey PRIMARY KEY (id);


--
-- Name: contracts contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_participant_1_id_participant_2_id_job_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_participant_1_id_participant_2_id_job_id_key UNIQUE (participant_1_id, participant_2_id, job_id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: conversion_analytics conversion_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversion_analytics
    ADD CONSTRAINT conversion_analytics_pkey PRIMARY KEY (id);


--
-- Name: data_breach_incidents data_breach_incidents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_breach_incidents
    ADD CONSTRAINT data_breach_incidents_pkey PRIMARY KEY (id);


--
-- Name: data_deletion_requests data_deletion_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_deletion_requests
    ADD CONSTRAINT data_deletion_requests_pkey PRIMARY KEY (id);


--
-- Name: data_export_requests data_export_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_export_requests
    ADD CONSTRAINT data_export_requests_pkey PRIMARY KEY (id);


--
-- Name: data_exports data_exports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_exports
    ADD CONSTRAINT data_exports_pkey PRIMARY KEY (id);


--
-- Name: data_privacy_controls data_privacy_controls_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_privacy_controls
    ADD CONSTRAINT data_privacy_controls_pkey PRIMARY KEY (id);


--
-- Name: data_privacy_controls data_privacy_controls_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_privacy_controls
    ADD CONSTRAINT data_privacy_controls_user_id_key UNIQUE (user_id);


--
-- Name: dispute_counter_proposals dispute_counter_proposals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dispute_counter_proposals
    ADD CONSTRAINT dispute_counter_proposals_pkey PRIMARY KEY (id);


--
-- Name: dispute_evidence dispute_evidence_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dispute_evidence
    ADD CONSTRAINT dispute_evidence_pkey PRIMARY KEY (id);


--
-- Name: dispute_messages dispute_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dispute_messages
    ADD CONSTRAINT dispute_messages_pkey PRIMARY KEY (id);


--
-- Name: dispute_resolutions dispute_resolutions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dispute_resolutions
    ADD CONSTRAINT dispute_resolutions_pkey PRIMARY KEY (id);


--
-- Name: dispute_timeline dispute_timeline_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dispute_timeline
    ADD CONSTRAINT dispute_timeline_pkey PRIMARY KEY (id);


--
-- Name: disputes disputes_dispute_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_dispute_number_key UNIQUE (dispute_number);


--
-- Name: disputes disputes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_pkey PRIMARY KEY (id);


--
-- Name: document_collaborators document_collaborators_document_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_collaborators
    ADD CONSTRAINT document_collaborators_document_id_user_id_key UNIQUE (document_id, user_id);


--
-- Name: document_collaborators document_collaborators_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_collaborators
    ADD CONSTRAINT document_collaborators_pkey PRIMARY KEY (id);


--
-- Name: document_edits document_edits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_edits
    ADD CONSTRAINT document_edits_pkey PRIMARY KEY (id);


--
-- Name: dual_control_approvals dual_control_approvals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dual_control_approvals
    ADD CONSTRAINT dual_control_approvals_pkey PRIMARY KEY (id);


--
-- Name: escrow_milestones escrow_milestones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escrow_milestones
    ADD CONSTRAINT escrow_milestones_pkey PRIMARY KEY (id);


--
-- Name: escrow_payments escrow_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escrow_payments
    ADD CONSTRAINT escrow_payments_pkey PRIMARY KEY (id);


--
-- Name: escrow_release_overrides escrow_release_overrides_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escrow_release_overrides
    ADD CONSTRAINT escrow_release_overrides_pkey PRIMARY KEY (id);


--
-- Name: escrow_releases escrow_releases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escrow_releases
    ADD CONSTRAINT escrow_releases_pkey PRIMARY KEY (id);


--
-- Name: escrow_transactions escrow_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escrow_transactions
    ADD CONSTRAINT escrow_transactions_pkey PRIMARY KEY (id);


--
-- Name: escrow_transfer_logs escrow_transfer_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escrow_transfer_logs
    ADD CONSTRAINT escrow_transfer_logs_pkey PRIMARY KEY (id);


--
-- Name: exchange_rates exchange_rates_from_currency_to_currency_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exchange_rates
    ADD CONSTRAINT exchange_rates_from_currency_to_currency_key UNIQUE (from_currency, to_currency);


--
-- Name: exchange_rates exchange_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exchange_rates
    ADD CONSTRAINT exchange_rates_pkey PRIMARY KEY (id);


--
-- Name: feature_flag_exposures feature_flag_exposures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feature_flag_exposures
    ADD CONSTRAINT feature_flag_exposures_pkey PRIMARY KEY (id);


--
-- Name: feature_flags feature_flags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feature_flags
    ADD CONSTRAINT feature_flags_pkey PRIMARY KEY (key);


--
-- Name: financial_reports financial_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_reports
    ADD CONSTRAINT financial_reports_pkey PRIMARY KEY (id);


--
-- Name: form_sessions form_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_sessions
    ADD CONSTRAINT form_sessions_pkey PRIMARY KEY (id);


--
-- Name: form_sessions form_sessions_user_id_form_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_sessions
    ADD CONSTRAINT form_sessions_user_id_form_type_key UNIQUE (user_id, form_type);


--
-- Name: fraud_patterns fraud_patterns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fraud_patterns
    ADD CONSTRAINT fraud_patterns_pkey PRIMARY KEY (id);


--
-- Name: funnel_analytics funnel_analytics_funnel_name_analysis_date_step_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funnel_analytics
    ADD CONSTRAINT funnel_analytics_funnel_name_analysis_date_step_number_key UNIQUE (funnel_name, analysis_date, step_number);


--
-- Name: funnel_analytics funnel_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funnel_analytics
    ADD CONSTRAINT funnel_analytics_pkey PRIMARY KEY (id);


--
-- Name: generated_reports generated_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generated_reports
    ADD CONSTRAINT generated_reports_pkey PRIMARY KEY (id);


--
-- Name: integrations integrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integrations
    ADD CONSTRAINT integrations_pkey PRIMARY KEY (id);


--
-- Name: invoice_items invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_pkey PRIMARY KEY (id);


--
-- Name: invoice_payments invoice_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_payments
    ADD CONSTRAINT invoice_payments_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: job_applicants job_applicants_job_id_professional_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_applicants
    ADD CONSTRAINT job_applicants_job_id_professional_id_key UNIQUE (job_id, professional_id);


--
-- Name: job_applicants job_applicants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_applicants
    ADD CONSTRAINT job_applicants_pkey PRIMARY KEY (id);


--
-- Name: job_broadcasts job_broadcasts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_broadcasts
    ADD CONSTRAINT job_broadcasts_pkey PRIMARY KEY (id);


--
-- Name: job_lifecycle_events job_lifecycle_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_lifecycle_events
    ADD CONSTRAINT job_lifecycle_events_pkey PRIMARY KEY (id);


--
-- Name: job_matches job_matches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_matches
    ADD CONSTRAINT job_matches_pkey PRIMARY KEY (id);


--
-- Name: job_photos job_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_photos
    ADD CONSTRAINT job_photos_pkey PRIMARY KEY (id);


--
-- Name: job_presets job_presets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_presets
    ADD CONSTRAINT job_presets_pkey PRIMARY KEY (id);


--
-- Name: job_question_snapshot job_question_snapshot_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_question_snapshot
    ADD CONSTRAINT job_question_snapshot_pkey PRIMARY KEY (job_id);


--
-- Name: job_quotes job_quotes_job_id_professional_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_quotes
    ADD CONSTRAINT job_quotes_job_id_professional_id_key UNIQUE (job_id, professional_id);


--
-- Name: job_quotes job_quotes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_quotes
    ADD CONSTRAINT job_quotes_pkey PRIMARY KEY (id);


--
-- Name: job_state_transitions job_state_transitions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_state_transitions
    ADD CONSTRAINT job_state_transitions_pkey PRIMARY KEY (id);


--
-- Name: job_status_updates job_status_updates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_status_updates
    ADD CONSTRAINT job_status_updates_pkey PRIMARY KEY (id);


--
-- Name: job_templates job_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_templates
    ADD CONSTRAINT job_templates_pkey PRIMARY KEY (id);


--
-- Name: job_versions job_versions_job_id_version_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_versions
    ADD CONSTRAINT job_versions_job_id_version_number_key UNIQUE (job_id, version_number);


--
-- Name: job_versions job_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_versions
    ADD CONSTRAINT job_versions_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: kpi_cache kpi_cache_cache_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kpi_cache
    ADD CONSTRAINT kpi_cache_cache_key_key UNIQUE (cache_key);


--
-- Name: kpi_cache kpi_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kpi_cache
    ADD CONSTRAINT kpi_cache_pkey PRIMARY KEY (id);


--
-- Name: leaderboard_entries leaderboard_entries_leaderboard_id_user_id_period_start_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leaderboard_entries
    ADD CONSTRAINT leaderboard_entries_leaderboard_id_user_id_period_start_key UNIQUE (leaderboard_id, user_id, period_start);


--
-- Name: leaderboard_entries leaderboard_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leaderboard_entries
    ADD CONSTRAINT leaderboard_entries_pkey PRIMARY KEY (id);


--
-- Name: leaderboards leaderboards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leaderboards
    ADD CONSTRAINT leaderboards_pkey PRIMARY KEY (id);


--
-- Name: loyalty_tiers loyalty_tiers_level_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_tiers
    ADD CONSTRAINT loyalty_tiers_level_key UNIQUE (level);


--
-- Name: loyalty_tiers loyalty_tiers_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_tiers
    ADD CONSTRAINT loyalty_tiers_name_key UNIQUE (name);


--
-- Name: loyalty_tiers loyalty_tiers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_tiers
    ADD CONSTRAINT loyalty_tiers_pkey PRIMARY KEY (id);


--
-- Name: message_attachment_metadata message_attachment_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_attachment_metadata
    ADD CONSTRAINT message_attachment_metadata_pkey PRIMARY KEY (id);


--
-- Name: message_rate_limits message_rate_limits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_rate_limits
    ADD CONSTRAINT message_rate_limits_pkey PRIMARY KEY (user_id);


--
-- Name: message_reactions message_reactions_message_id_user_id_reaction_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_reactions
    ADD CONSTRAINT message_reactions_message_id_user_id_reaction_key UNIQUE (message_id, user_id, reaction);


--
-- Name: message_reactions message_reactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_reactions
    ADD CONSTRAINT message_reactions_pkey PRIMARY KEY (id);


--
-- Name: message_reports message_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_reports
    ADD CONSTRAINT message_reports_pkey PRIMARY KEY (id);


--
-- Name: message_threads message_threads_parent_message_id_message_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_threads
    ADD CONSTRAINT message_threads_parent_message_id_message_id_key UNIQUE (parent_message_id, message_id);


--
-- Name: message_threads message_threads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_threads
    ADD CONSTRAINT message_threads_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: micro_questions_ai_runs micro_questions_ai_runs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.micro_questions_ai_runs
    ADD CONSTRAINT micro_questions_ai_runs_pkey PRIMARY KEY (id);


--
-- Name: micro_questions_snapshot micro_questions_snapshot_micro_category_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.micro_questions_snapshot
    ADD CONSTRAINT micro_questions_snapshot_micro_category_id_key UNIQUE (micro_category_id);


--
-- Name: micro_questions_snapshot micro_questions_snapshot_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.micro_questions_snapshot
    ADD CONSTRAINT micro_questions_snapshot_pkey PRIMARY KEY (id);


--
-- Name: micro_service_questions micro_service_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.micro_service_questions
    ADD CONSTRAINT micro_service_questions_pkey PRIMARY KEY (id);


--
-- Name: milestone_approvals milestone_approvals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.milestone_approvals
    ADD CONSTRAINT milestone_approvals_pkey PRIMARY KEY (id);


--
-- Name: milestones milestones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.milestones
    ADD CONSTRAINT milestones_pkey PRIMARY KEY (id);


--
-- Name: notification_digest_queue notification_digest_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_digest_queue
    ADD CONSTRAINT notification_digest_queue_pkey PRIMARY KEY (id);


--
-- Name: notification_digest_queue notification_digest_queue_user_id_notification_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_digest_queue
    ADD CONSTRAINT notification_digest_queue_user_id_notification_id_key UNIQUE (user_id, notification_id);


--
-- Name: notification_preferences notification_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_pkey PRIMARY KEY (id);


--
-- Name: notification_preferences notification_preferences_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_user_id_key UNIQUE (user_id);


--
-- Name: notification_queue notification_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_queue
    ADD CONSTRAINT notification_queue_pkey PRIMARY KEY (id);


--
-- Name: notification_templates notification_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_pkey PRIMARY KEY (id);


--
-- Name: notification_templates notification_templates_template_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_template_key_key UNIQUE (template_key);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: offer_negotiations offer_negotiations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offer_negotiations
    ADD CONSTRAINT offer_negotiations_pkey PRIMARY KEY (id);


--
-- Name: offers offers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT offers_pkey PRIMARY KEY (id);


--
-- Name: onboarding_checklist onboarding_checklist_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_checklist
    ADD CONSTRAINT onboarding_checklist_pkey PRIMARY KEY (id);


--
-- Name: onboarding_checklist onboarding_checklist_professional_id_step_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_checklist
    ADD CONSTRAINT onboarding_checklist_professional_id_step_key UNIQUE (professional_id, step);


--
-- Name: onboarding_events onboarding_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_events
    ADD CONSTRAINT onboarding_events_pkey PRIMARY KEY (id);


--
-- Name: pack_performance pack_performance_pack_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pack_performance
    ADD CONSTRAINT pack_performance_pack_id_key UNIQUE (pack_id);


--
-- Name: pack_performance pack_performance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pack_performance
    ADD CONSTRAINT pack_performance_pkey PRIMARY KEY (id);


--
-- Name: payment_alerts payment_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_alerts
    ADD CONSTRAINT payment_alerts_pkey PRIMARY KEY (id);


--
-- Name: payment_analytics payment_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_analytics
    ADD CONSTRAINT payment_analytics_pkey PRIMARY KEY (id);


--
-- Name: payment_analytics_summary payment_analytics_summary_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_analytics_summary
    ADD CONSTRAINT payment_analytics_summary_pkey PRIMARY KEY (id);


--
-- Name: payment_analytics payment_analytics_user_id_period_start_period_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_analytics
    ADD CONSTRAINT payment_analytics_user_id_period_start_period_type_key UNIQUE (user_id, period_start, period_type);


--
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);


--
-- Name: payment_notifications payment_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_notifications
    ADD CONSTRAINT payment_notifications_pkey PRIMARY KEY (id);


--
-- Name: payment_receipts payment_receipts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_receipts
    ADD CONSTRAINT payment_receipts_pkey PRIMARY KEY (id);


--
-- Name: payment_receipts payment_receipts_receipt_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_receipts
    ADD CONSTRAINT payment_receipts_receipt_number_key UNIQUE (receipt_number);


--
-- Name: payment_reconciliations payment_reconciliations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_reconciliations
    ADD CONSTRAINT payment_reconciliations_pkey PRIMARY KEY (id);


--
-- Name: payment_reminders payment_reminders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_reminders
    ADD CONSTRAINT payment_reminders_pkey PRIMARY KEY (id);


--
-- Name: payment_schedules payment_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_schedules
    ADD CONSTRAINT payment_schedules_pkey PRIMARY KEY (id);


--
-- Name: payment_transactions payment_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: payments payments_stripe_payment_intent_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_stripe_payment_intent_id_key UNIQUE (stripe_payment_intent_id);


--
-- Name: payout_items payout_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payout_items
    ADD CONSTRAINT payout_items_pkey PRIMARY KEY (id);


--
-- Name: payouts payouts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payouts
    ADD CONSTRAINT payouts_pkey PRIMARY KEY (id);


--
-- Name: performance_metrics performance_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.performance_metrics
    ADD CONSTRAINT performance_metrics_pkey PRIMARY KEY (id);


--
-- Name: platform_metrics platform_metrics_metric_date_metric_hour_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_metrics
    ADD CONSTRAINT platform_metrics_metric_date_metric_hour_key UNIQUE (metric_date, metric_hour);


--
-- Name: platform_metrics platform_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_metrics
    ADD CONSTRAINT platform_metrics_pkey PRIMARY KEY (id);


--
-- Name: points_transactions points_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.points_transactions
    ADD CONSTRAINT points_transactions_pkey PRIMARY KEY (id);


--
-- Name: popular_searches popular_searches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.popular_searches
    ADD CONSTRAINT popular_searches_pkey PRIMARY KEY (id);


--
-- Name: popular_searches popular_searches_search_term_search_type_period_period_star_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.popular_searches
    ADD CONSTRAINT popular_searches_search_term_search_type_period_period_star_key UNIQUE (search_term, search_type, period, period_start);


--
-- Name: portfolio_images portfolio_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolio_images
    ADD CONSTRAINT portfolio_images_pkey PRIMARY KEY (id);


--
-- Name: predictive_insights predictive_insights_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.predictive_insights
    ADD CONSTRAINT predictive_insights_pkey PRIMARY KEY (id);


--
-- Name: pricing_hints pricing_hints_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pricing_hints
    ADD CONSTRAINT pricing_hints_pkey PRIMARY KEY (id);


--
-- Name: pro_badges pro_badges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pro_badges
    ADD CONSTRAINT pro_badges_pkey PRIMARY KEY (id);


--
-- Name: pro_targets pro_targets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pro_targets
    ADD CONSTRAINT pro_targets_pkey PRIMARY KEY (id);


--
-- Name: professional_applications professional_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_applications
    ADD CONSTRAINT professional_applications_pkey PRIMARY KEY (id);


--
-- Name: professional_availability professional_availability_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_availability
    ADD CONSTRAINT professional_availability_pkey PRIMARY KEY (id);


--
-- Name: professional_badges professional_badges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_badges
    ADD CONSTRAINT professional_badges_pkey PRIMARY KEY (id);


--
-- Name: professional_deals professional_deals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_deals
    ADD CONSTRAINT professional_deals_pkey PRIMARY KEY (id);


--
-- Name: professional_documents professional_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_documents
    ADD CONSTRAINT professional_documents_pkey PRIMARY KEY (id);


--
-- Name: professional_earnings professional_earnings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_earnings
    ADD CONSTRAINT professional_earnings_pkey PRIMARY KEY (id);


--
-- Name: professional_portfolio professional_portfolio_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_portfolio
    ADD CONSTRAINT professional_portfolio_pkey PRIMARY KEY (id);


--
-- Name: professional_profiles professional_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_profiles
    ADD CONSTRAINT professional_profiles_pkey PRIMARY KEY (user_id);


--
-- Name: professional_reviews professional_reviews_client_id_booking_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_reviews
    ADD CONSTRAINT professional_reviews_client_id_booking_id_key UNIQUE (client_id, booking_id);


--
-- Name: professional_reviews professional_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_reviews
    ADD CONSTRAINT professional_reviews_pkey PRIMARY KEY (id);


--
-- Name: professional_scores professional_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_scores
    ADD CONSTRAINT professional_scores_pkey PRIMARY KEY (id);


--
-- Name: professional_scores professional_scores_professional_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_scores
    ADD CONSTRAINT professional_scores_professional_id_key UNIQUE (professional_id);


--
-- Name: professional_service_items professional_service_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_service_items
    ADD CONSTRAINT professional_service_items_pkey PRIMARY KEY (id);


--
-- Name: professional_services professional_services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_services
    ADD CONSTRAINT professional_services_pkey PRIMARY KEY (id);


--
-- Name: professional_stats professional_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_stats
    ADD CONSTRAINT professional_stats_pkey PRIMARY KEY (id);


--
-- Name: professional_stats professional_stats_professional_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_stats
    ADD CONSTRAINT professional_stats_professional_id_key UNIQUE (professional_id);


--
-- Name: professional_stripe_accounts professional_stripe_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_stripe_accounts
    ADD CONSTRAINT professional_stripe_accounts_pkey PRIMARY KEY (id);


--
-- Name: professional_stripe_accounts professional_stripe_accounts_professional_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_stripe_accounts
    ADD CONSTRAINT professional_stripe_accounts_professional_id_key UNIQUE (professional_id);


--
-- Name: professional_stripe_accounts professional_stripe_accounts_stripe_account_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_stripe_accounts
    ADD CONSTRAINT professional_stripe_accounts_stripe_account_id_key UNIQUE (stripe_account_id);


--
-- Name: professional_verifications professional_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_verifications
    ADD CONSTRAINT professional_verifications_pkey PRIMARY KEY (id);


--
-- Name: profile_views profile_views_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_views
    ADD CONSTRAINT profile_views_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: project_completions project_completions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_completions
    ADD CONSTRAINT project_completions_pkey PRIMARY KEY (id);


--
-- Name: properties properties_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_pkey PRIMARY KEY (id);


--
-- Name: query_performance_log query_performance_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.query_performance_log
    ADD CONSTRAINT query_performance_log_pkey PRIMARY KEY (id);


--
-- Name: question_metrics question_metrics_pack_id_question_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_metrics
    ADD CONSTRAINT question_metrics_pack_id_question_key_key UNIQUE (pack_id, question_key);


--
-- Name: question_metrics question_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_metrics
    ADD CONSTRAINT question_metrics_pkey PRIMARY KEY (id);


--
-- Name: question_pack_audit question_pack_audit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_pack_audit
    ADD CONSTRAINT question_pack_audit_pkey PRIMARY KEY (id);


--
-- Name: question_packs question_packs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_packs
    ADD CONSTRAINT question_packs_pkey PRIMARY KEY (pack_id);


--
-- Name: quote_requests quote_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_requests
    ADD CONSTRAINT quote_requests_pkey PRIMARY KEY (id);


--
-- Name: quotes quotes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_pkey PRIMARY KEY (id);


--
-- Name: rate_limit_tracking rate_limit_tracking_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rate_limit_tracking
    ADD CONSTRAINT rate_limit_tracking_pkey PRIMARY KEY (id);


--
-- Name: rating_summary rating_summary_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rating_summary
    ADD CONSTRAINT rating_summary_pkey PRIMARY KEY (id);


--
-- Name: rating_summary rating_summary_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rating_summary
    ADD CONSTRAINT rating_summary_user_id_key UNIQUE (user_id);


--
-- Name: read_receipts read_receipts_message_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.read_receipts
    ADD CONSTRAINT read_receipts_message_id_user_id_key UNIQUE (message_id, user_id);


--
-- Name: read_receipts read_receipts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.read_receipts
    ADD CONSTRAINT read_receipts_pkey PRIMARY KEY (id);


--
-- Name: redirect_analytics redirect_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.redirect_analytics
    ADD CONSTRAINT redirect_analytics_pkey PRIMARY KEY (id);


--
-- Name: referral_codes referral_codes_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referral_codes
    ADD CONSTRAINT referral_codes_code_key UNIQUE (code);


--
-- Name: referral_codes referral_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referral_codes
    ADD CONSTRAINT referral_codes_pkey PRIMARY KEY (id);


--
-- Name: referrals referrals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_pkey PRIMARY KEY (id);


--
-- Name: referrals referrals_referred_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_referred_id_key UNIQUE (referred_id);


--
-- Name: refund_requests refund_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refund_requests
    ADD CONSTRAINT refund_requests_pkey PRIMARY KEY (id);


--
-- Name: refunds refunds_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_pkey PRIMARY KEY (id);


--
-- Name: report_exports report_exports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_exports
    ADD CONSTRAINT report_exports_pkey PRIMARY KEY (id);


--
-- Name: report_schedules report_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_schedules
    ADD CONSTRAINT report_schedules_pkey PRIMARY KEY (id);


--
-- Name: report_templates report_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_templates
    ADD CONSTRAINT report_templates_pkey PRIMARY KEY (id);


--
-- Name: resolution_enforcement_log resolution_enforcement_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resolution_enforcement_log
    ADD CONSTRAINT resolution_enforcement_log_pkey PRIMARY KEY (id);


--
-- Name: revenue_analytics revenue_analytics_analysis_date_revenue_type_currency_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revenue_analytics
    ADD CONSTRAINT revenue_analytics_analysis_date_revenue_type_currency_key UNIQUE (analysis_date, revenue_type, currency);


--
-- Name: revenue_analytics revenue_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revenue_analytics
    ADD CONSTRAINT revenue_analytics_pkey PRIMARY KEY (id);


--
-- Name: revenue_forecasts revenue_forecasts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revenue_forecasts
    ADD CONSTRAINT revenue_forecasts_pkey PRIMARY KEY (id);


--
-- Name: review_flags review_flags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_flags
    ADD CONSTRAINT review_flags_pkey PRIMARY KEY (id);


--
-- Name: review_helpful_votes review_helpful_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_helpful_votes
    ADD CONSTRAINT review_helpful_votes_pkey PRIMARY KEY (id);


--
-- Name: review_helpful_votes review_helpful_votes_review_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_helpful_votes
    ADD CONSTRAINT review_helpful_votes_review_id_user_id_key UNIQUE (review_id, user_id);


--
-- Name: review_helpfulness review_helpfulness_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_helpfulness
    ADD CONSTRAINT review_helpfulness_pkey PRIMARY KEY (id);


--
-- Name: review_helpfulness review_helpfulness_review_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_helpfulness
    ADD CONSTRAINT review_helpfulness_review_id_user_id_key UNIQUE (review_id, user_id);


--
-- Name: review_media review_media_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_media
    ADD CONSTRAINT review_media_pkey PRIMARY KEY (id);


--
-- Name: review_reports review_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_reports
    ADD CONSTRAINT review_reports_pkey PRIMARY KEY (id);


--
-- Name: review_reports review_reports_review_id_reported_by_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_reports
    ADD CONSTRAINT review_reports_review_id_reported_by_key UNIQUE (review_id, reported_by);


--
-- Name: review_responses review_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_responses
    ADD CONSTRAINT review_responses_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: saved_reports saved_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_reports
    ADD CONSTRAINT saved_reports_pkey PRIMARY KEY (id);


--
-- Name: saved_searches saved_searches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_searches
    ADD CONSTRAINT saved_searches_pkey PRIMARY KEY (id);


--
-- Name: scheduled_payments scheduled_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scheduled_payments
    ADD CONSTRAINT scheduled_payments_pkey PRIMARY KEY (id);


--
-- Name: scheduled_payments scheduled_payments_schedule_id_installment_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scheduled_payments
    ADD CONSTRAINT scheduled_payments_schedule_id_installment_number_key UNIQUE (schedule_id, installment_number);


--
-- Name: search_analytics search_analytics_date_search_term_search_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.search_analytics
    ADD CONSTRAINT search_analytics_date_search_term_search_type_key UNIQUE (date, search_term, search_type);


--
-- Name: search_analytics search_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.search_analytics
    ADD CONSTRAINT search_analytics_pkey PRIMARY KEY (id);


--
-- Name: search_history search_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.search_history
    ADD CONSTRAINT search_history_pkey PRIMARY KEY (id);


--
-- Name: security_audit_log security_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.security_audit_log
    ADD CONSTRAINT security_audit_log_pkey PRIMARY KEY (id);


--
-- Name: security_events security_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.security_events
    ADD CONSTRAINT security_events_pkey PRIMARY KEY (id);


--
-- Name: service_addons service_addons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_addons
    ADD CONSTRAINT service_addons_pkey PRIMARY KEY (id);


--
-- Name: service_categories service_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_pkey PRIMARY KEY (id);


--
-- Name: service_categories service_categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_slug_key UNIQUE (slug);


--
-- Name: service_micro_categories service_micro_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_micro_categories
    ADD CONSTRAINT service_micro_categories_pkey PRIMARY KEY (id);


--
-- Name: service_micro_categories service_micro_categories_subcategory_id_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_micro_categories
    ADD CONSTRAINT service_micro_categories_subcategory_id_slug_key UNIQUE (subcategory_id, slug);


--
-- Name: service_name_map service_name_map_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_name_map
    ADD CONSTRAINT service_name_map_pkey PRIMARY KEY (source, raw_category);


--
-- Name: service_options service_options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_options
    ADD CONSTRAINT service_options_pkey PRIMARY KEY (id);


--
-- Name: service_questions service_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_questions
    ADD CONSTRAINT service_questions_pkey PRIMARY KEY (id);


--
-- Name: service_subcategories service_subcategories_category_id_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_subcategories
    ADD CONSTRAINT service_subcategories_category_id_slug_key UNIQUE (category_id, slug);


--
-- Name: service_subcategories service_subcategories_category_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_subcategories
    ADD CONSTRAINT service_subcategories_category_name_key UNIQUE (category_id, name);


--
-- Name: service_subcategories service_subcategories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_subcategories
    ADD CONSTRAINT service_subcategories_pkey PRIMARY KEY (id);


--
-- Name: services services_category_subcategory_micro_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_category_subcategory_micro_key UNIQUE (category, subcategory, micro);


--
-- Name: services_micro services_micro_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services_micro
    ADD CONSTRAINT services_micro_pkey PRIMARY KEY (id);


--
-- Name: services_micro_versions services_micro_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services_micro_versions
    ADD CONSTRAINT services_micro_versions_pkey PRIMARY KEY (version_id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: services_unified services_unified_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services_unified
    ADD CONSTRAINT services_unified_pkey PRIMARY KEY (id);


--
-- Name: services_unified_v1 services_unified_v1_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services_unified_v1
    ADD CONSTRAINT services_unified_v1_pkey PRIMARY KEY (id);


--
-- Name: shared_documents shared_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shared_documents
    ADD CONSTRAINT shared_documents_pkey PRIMARY KEY (id);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- Name: site_settings site_settings_section_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_section_key_key UNIQUE (section, key);


--
-- Name: smart_matches smart_matches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.smart_matches
    ADD CONSTRAINT smart_matches_pkey PRIMARY KEY (id);


--
-- Name: spam_keywords spam_keywords_keyword_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spam_keywords
    ADD CONSTRAINT spam_keywords_keyword_key UNIQUE (keyword);


--
-- Name: spam_keywords spam_keywords_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spam_keywords
    ADD CONSTRAINT spam_keywords_pkey PRIMARY KEY (id);


--
-- Name: stripe_customers stripe_customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stripe_customers
    ADD CONSTRAINT stripe_customers_pkey PRIMARY KEY (id);


--
-- Name: stripe_customers stripe_customers_stripe_customer_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stripe_customers
    ADD CONSTRAINT stripe_customers_stripe_customer_id_key UNIQUE (stripe_customer_id);


--
-- Name: stripe_customers stripe_customers_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stripe_customers
    ADD CONSTRAINT stripe_customers_user_id_key UNIQUE (user_id);


--
-- Name: support_tickets support_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_pkey PRIMARY KEY (id);


--
-- Name: support_tickets support_tickets_ticket_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_ticket_number_key UNIQUE (ticket_number);


--
-- Name: system_activity_log system_activity_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_activity_log
    ADD CONSTRAINT system_activity_log_pkey PRIMARY KEY (id);


--
-- Name: system_health_metrics system_health_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_health_metrics
    ADD CONSTRAINT system_health_metrics_pkey PRIMARY KEY (id);


--
-- Name: system_metrics system_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_metrics
    ADD CONSTRAINT system_metrics_pkey PRIMARY KEY (id);


--
-- Name: ticket_attachments ticket_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_attachments
    ADD CONSTRAINT ticket_attachments_pkey PRIMARY KEY (id);


--
-- Name: ticket_messages ticket_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_messages
    ADD CONSTRAINT ticket_messages_pkey PRIMARY KEY (id);


--
-- Name: transaction_notes transaction_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_notes
    ADD CONSTRAINT transaction_notes_pkey PRIMARY KEY (id);


--
-- Name: two_factor_auth two_factor_auth_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.two_factor_auth
    ADD CONSTRAINT two_factor_auth_pkey PRIMARY KEY (id);


--
-- Name: two_factor_auth two_factor_auth_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.two_factor_auth
    ADD CONSTRAINT two_factor_auth_user_id_key UNIQUE (user_id);


--
-- Name: typing_indicators typing_indicators_conversation_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.typing_indicators
    ADD CONSTRAINT typing_indicators_conversation_id_user_id_key UNIQUE (conversation_id, user_id);


--
-- Name: typing_indicators typing_indicators_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.typing_indicators
    ADD CONSTRAINT typing_indicators_pkey PRIMARY KEY (id);


--
-- Name: user_achievements user_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_pkey PRIMARY KEY (id);


--
-- Name: user_achievements user_achievements_user_id_achievement_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_user_id_achievement_id_key UNIQUE (user_id, achievement_id);


--
-- Name: user_activity_metrics user_activity_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_activity_metrics
    ADD CONSTRAINT user_activity_metrics_pkey PRIMARY KEY (id);


--
-- Name: user_activity_metrics user_activity_metrics_user_id_metric_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_activity_metrics
    ADD CONSTRAINT user_activity_metrics_user_id_metric_date_key UNIQUE (user_id, metric_date);


--
-- Name: user_badges user_badges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_pkey PRIMARY KEY (id);


--
-- Name: user_badges user_badges_user_id_badge_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_user_id_badge_id_key UNIQUE (user_id, badge_id);


--
-- Name: user_blocks user_blocks_blocker_id_blocked_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_blocks
    ADD CONSTRAINT user_blocks_blocker_id_blocked_id_key UNIQUE (blocker_id, blocked_id);


--
-- Name: user_blocks user_blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_blocks
    ADD CONSTRAINT user_blocks_pkey PRIMARY KEY (id);


--
-- Name: user_cohorts user_cohorts_cohort_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_cohorts
    ADD CONSTRAINT user_cohorts_cohort_date_key UNIQUE (cohort_date);


--
-- Name: user_cohorts user_cohorts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_cohorts
    ADD CONSTRAINT user_cohorts_pkey PRIMARY KEY (id);


--
-- Name: user_compliance_status user_compliance_status_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_compliance_status
    ADD CONSTRAINT user_compliance_status_pkey PRIMARY KEY (id);


--
-- Name: user_compliance_status user_compliance_status_user_id_framework_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_compliance_status
    ADD CONSTRAINT user_compliance_status_user_id_framework_id_key UNIQUE (user_id, framework_id);


--
-- Name: user_devices user_devices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_devices
    ADD CONSTRAINT user_devices_pkey PRIMARY KEY (id);


--
-- Name: user_devices user_devices_user_id_endpoint_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_devices
    ADD CONSTRAINT user_devices_user_id_endpoint_key UNIQUE (user_id, endpoint);


--
-- Name: user_feedback user_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_feedback
    ADD CONSTRAINT user_feedback_pkey PRIMARY KEY (id);


--
-- Name: user_points user_points_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_points
    ADD CONSTRAINT user_points_pkey PRIMARY KEY (user_id);


--
-- Name: user_presence user_presence_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_presence
    ADD CONSTRAINT user_presence_pkey PRIMARY KEY (user_id);


--
-- Name: user_roles_audit_log user_roles_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles_audit_log
    ADD CONSTRAINT user_roles_audit_log_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- Name: ux_health_checks ux_health_checks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ux_health_checks
    ADD CONSTRAINT ux_health_checks_pkey PRIMARY KEY (id);


--
-- Name: video_calls video_calls_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_calls
    ADD CONSTRAINT video_calls_pkey PRIMARY KEY (id);


--
-- Name: video_calls video_calls_room_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_calls
    ADD CONSTRAINT video_calls_room_id_key UNIQUE (room_id);


--
-- Name: webhook_deliveries webhook_deliveries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhook_deliveries
    ADD CONSTRAINT webhook_deliveries_pkey PRIMARY KEY (id);


--
-- Name: webhook_endpoints webhook_endpoints_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhook_endpoints
    ADD CONSTRAINT webhook_endpoints_pkey PRIMARY KEY (id);


--
-- Name: webhook_subscriptions webhook_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhook_subscriptions
    ADD CONSTRAINT webhook_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: workflow_automations workflow_automations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_automations
    ADD CONSTRAINT workflow_automations_pkey PRIMARY KEY (id);


--
-- Name: form_sessions_user_form_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX form_sessions_user_form_idx ON public.form_sessions USING btree (user_id, form_type);


--
-- Name: idx_active_sessions_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_active_sessions_expires_at ON public.active_sessions USING btree (expires_at);


--
-- Name: idx_active_sessions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_active_sessions_user_id ON public.active_sessions USING btree (user_id);


--
-- Name: idx_activity_feed_notification_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_feed_notification_type ON public.activity_feed USING btree (notification_type);


--
-- Name: idx_activity_feed_priority; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_feed_priority ON public.activity_feed USING btree (priority) WHERE (priority = ANY (ARRAY['high'::text, 'urgent'::text]));


--
-- Name: idx_activity_feed_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_feed_user_id ON public.activity_feed USING btree (user_id, created_at DESC);


--
-- Name: idx_activity_feed_user_priority; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_feed_user_priority ON public.activity_feed USING btree (user_id, priority, created_at DESC) WHERE (dismissed_at IS NULL);


--
-- Name: idx_activity_feed_user_unread; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_feed_user_unread ON public.activity_feed USING btree (user_id, read_at) WHERE (read_at IS NULL);


--
-- Name: idx_activity_log_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_log_action ON public.system_activity_log USING btree (action);


--
-- Name: idx_activity_log_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_log_created_at ON public.system_activity_log USING btree (created_at);


--
-- Name: idx_activity_log_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_log_user_id ON public.system_activity_log USING btree (user_id);


--
-- Name: idx_admin_alerts_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_alerts_created_at ON public.admin_alerts USING btree (created_at);


--
-- Name: idx_admin_alerts_is_resolved; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_alerts_is_resolved ON public.admin_alerts USING btree (is_resolved);


--
-- Name: idx_admin_alerts_severity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_alerts_severity ON public.admin_alerts USING btree (severity);


--
-- Name: idx_admin_audit_log_admin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_audit_log_admin ON public.admin_audit_log USING btree (admin_id);


--
-- Name: idx_admin_audit_log_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_audit_log_created ON public.admin_audit_log USING btree (created_at);


--
-- Name: idx_admin_audit_log_entity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_audit_log_entity ON public.admin_audit_log USING btree (entity_type, entity_id);


--
-- Name: idx_admin_permissions_admin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_permissions_admin ON public.admin_permissions USING btree (admin_id);


--
-- Name: idx_admin_permissions_permission; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_permissions_permission ON public.admin_permissions USING btree (permission);


--
-- Name: idx_ai_alerts_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_alerts_created_at ON public.ai_alerts USING btree (created_at);


--
-- Name: idx_ai_alerts_severity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_alerts_severity ON public.ai_alerts USING btree (severity);


--
-- Name: idx_ai_alerts_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_alerts_status ON public.ai_alerts USING btree (status);


--
-- Name: idx_ai_alerts_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_alerts_type ON public.ai_alerts USING btree (alert_type);


--
-- Name: idx_ai_conversations_user_session; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_conversations_user_session ON public.ai_conversations USING btree (user_id, session_id);


--
-- Name: idx_ai_prompts_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_prompts_active ON public.ai_prompts USING btree (is_active);


--
-- Name: idx_ai_prompts_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_prompts_category ON public.ai_prompts USING btree (category);


--
-- Name: idx_ai_prompts_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_prompts_name ON public.ai_prompts USING btree (name);


--
-- Name: idx_ai_recommendations_data; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_recommendations_data ON public.ai_recommendations USING gin (data);


--
-- Name: idx_ai_recommendations_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_recommendations_user_status ON public.ai_recommendations USING btree (user_id, status);


--
-- Name: idx_ai_runs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_runs_created_at ON public.ai_runs USING btree (created_at);


--
-- Name: idx_ai_runs_operation_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_runs_operation_type ON public.ai_runs USING btree (operation_type);


--
-- Name: idx_ai_runs_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_runs_status ON public.ai_runs USING btree (status);


--
-- Name: idx_ai_runs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_runs_user_id ON public.ai_runs USING btree (user_id);


--
-- Name: idx_ai_runs_user_id_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_runs_user_id_created_at ON public.ai_runs USING btree (user_id, created_at DESC);


--
-- Name: idx_analytics_events_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_events_created ON public.analytics_events USING btree (created_at DESC);


--
-- Name: idx_analytics_events_event_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_events_event_name ON public.analytics_events USING btree (event_name);


--
-- Name: idx_analytics_events_properties; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_events_properties ON public.analytics_events USING gin (event_properties);


--
-- Name: idx_analytics_events_realtime; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_events_realtime ON public.analytics_events USING btree (created_at DESC, event_name);


--
-- Name: idx_analytics_events_session; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_events_session ON public.analytics_events USING btree (session_id);


--
-- Name: idx_analytics_events_user_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_events_user_created ON public.analytics_events USING btree (user_id, created_at DESC);


--
-- Name: idx_analytics_events_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_events_user_date ON public.analytics_events USING btree (user_id, created_at DESC);


--
-- Name: idx_analytics_live_kpis_refresh; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_live_kpis_refresh ON public.analytics_events USING btree (created_at DESC);


--
-- Name: idx_analytics_snapshots_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_snapshots_date ON public.analytics_snapshots USING btree (snapshot_date);


--
-- Name: idx_analytics_snapshots_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_snapshots_type ON public.analytics_snapshots USING btree (metric_type);


--
-- Name: idx_audit_logs_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_action ON public.audit_logs USING btree (action);


--
-- Name: idx_audit_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at);


--
-- Name: idx_audit_logs_resource; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_resource ON public.audit_logs USING btree (resource_type, resource_id);


--
-- Name: idx_audit_logs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs USING btree (user_id);


--
-- Name: idx_automation_executions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_automation_executions_status ON public.automation_executions USING btree (status, executed_at DESC);


--
-- Name: idx_automation_executions_workflow; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_automation_executions_workflow ON public.automation_executions USING btree (workflow_id, executed_at DESC);


--
-- Name: idx_automation_workflows_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_automation_workflows_active ON public.automation_workflows USING btree (is_active) WHERE (is_active = true);


--
-- Name: idx_automation_workflows_trigger; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_automation_workflows_trigger ON public.automation_workflows USING btree (trigger_type);


--
-- Name: idx_background_jobs_status_priority; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_background_jobs_status_priority ON public.background_jobs USING btree (status, priority DESC, created_at);


--
-- Name: idx_blocked_dates_professional; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blocked_dates_professional ON public.blocked_dates USING btree (professional_id);


--
-- Name: idx_blocked_dates_range; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blocked_dates_range ON public.blocked_dates USING btree (start_date, end_date);


--
-- Name: idx_booking_reminders_booking; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_booking_reminders_booking ON public.booking_reminders USING btree (booking_id);


--
-- Name: idx_booking_reminders_scheduled; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_booking_reminders_scheduled ON public.booking_reminders USING btree (scheduled_for) WHERE (status = 'pending'::text);


--
-- Name: idx_booking_reminders_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_booking_reminders_user ON public.booking_reminders USING btree (user_id);


--
-- Name: idx_booking_requests_client; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_booking_requests_client ON public.booking_requests USING btree (client_id, status);


--
-- Name: idx_booking_requests_professional; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_booking_requests_professional ON public.booking_requests USING btree (professional_id, status);


--
-- Name: idx_booking_requests_professional_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_booking_requests_professional_status ON public.booking_requests USING btree (professional_id, status);


--
-- Name: idx_booking_risk_flags_booking_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_booking_risk_flags_booking_id ON public.booking_risk_flags USING btree (booking_id);


--
-- Name: idx_booking_risk_flags_unresolved; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_booking_risk_flags_unresolved ON public.booking_risk_flags USING btree (booking_id) WHERE (resolved_at IS NULL);


--
-- Name: idx_bookings_client_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_client_status ON public.bookings USING btree (client_id, status);


--
-- Name: idx_bookings_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_created ON public.bookings USING btree (created_at DESC);


--
-- Name: idx_bookings_micro_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_micro_slug ON public.bookings USING btree (micro_slug);


--
-- Name: idx_business_insights_user_read_priority_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_business_insights_user_read_priority_created ON public.business_insights USING btree (user_id, is_read, priority_weight DESC, created_at DESC);


--
-- Name: idx_business_insights_user_unread; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_business_insights_user_unread ON public.business_insights USING btree (user_id, is_read) WHERE (is_read = false);


--
-- Name: idx_business_metrics_category_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_business_metrics_category_name ON public.business_metrics USING btree (metric_category, metric_name);


--
-- Name: idx_business_metrics_category_period; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_business_metrics_category_period ON public.business_metrics USING btree (metric_category, period_start, period_end);


--
-- Name: idx_business_metrics_period; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_business_metrics_period ON public.business_metrics USING btree (period_start, period_end);


--
-- Name: idx_calculator_configs_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_calculator_configs_expires ON public.calculator_saved_configs USING btree (expires_at) WHERE (expires_at IS NOT NULL);


--
-- Name: idx_calculator_configs_share; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_calculator_configs_share ON public.calculator_saved_configs USING btree (share_token) WHERE (share_token IS NOT NULL);


--
-- Name: idx_calculator_configs_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_calculator_configs_user ON public.calculator_saved_configs USING btree (user_id);


--
-- Name: idx_calendar_events_start_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_calendar_events_start_time ON public.calendar_events USING btree (start_time);


--
-- Name: idx_calendar_events_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_calendar_events_status ON public.calendar_events USING btree (status, start_time);


--
-- Name: idx_calendar_events_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_calendar_events_user_id ON public.calendar_events USING btree (user_id);


--
-- Name: idx_calendar_events_user_start; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_calendar_events_user_start ON public.calendar_events USING btree (user_id, start_time);


--
-- Name: idx_calendar_events_user_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_calendar_events_user_time ON public.calendar_events USING btree (user_id, start_time, status);


--
-- Name: idx_category_suggestions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_category_suggestions_status ON public.category_suggestions USING btree (status);


--
-- Name: idx_category_suggestions_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_category_suggestions_user ON public.category_suggestions USING btree (user_id);


--
-- Name: idx_change_orders_job_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_change_orders_job_id ON public.change_orders USING btree (job_id);


--
-- Name: idx_client_favorites_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_client_favorites_client_id ON public.client_favorites USING btree (client_id);


--
-- Name: idx_client_files_job_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_client_files_job_id ON public.client_files USING btree (job_id);


--
-- Name: idx_client_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_client_logs_created_at ON public.client_logs USING btree (created_at);


--
-- Name: idx_client_logs_level; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_client_logs_level ON public.client_logs USING btree (level);


--
-- Name: idx_client_logs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_client_logs_user_id ON public.client_logs USING btree (user_id);


--
-- Name: idx_client_profiles_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_client_profiles_user_id ON public.client_profiles USING btree (user_id);


--
-- Name: idx_collaborative_sessions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_collaborative_sessions_status ON public.collaborative_sessions USING btree (status);


--
-- Name: idx_contracts_client_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contracts_client_created ON public.contracts USING btree (client_id, created_at DESC);


--
-- Name: idx_contracts_tasker_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contracts_tasker_created ON public.contracts USING btree (tasker_id, created_at DESC);


--
-- Name: idx_contracts_tasker_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contracts_tasker_status ON public.contracts USING btree (tasker_id, escrow_status, created_at DESC);


--
-- Name: idx_conversations_job; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversations_job ON public.conversations USING btree (job_id);


--
-- Name: idx_conversations_participants; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversations_participants ON public.conversations USING btree (participant_1_id, participant_2_id);


--
-- Name: idx_conversion_analytics_event; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversion_analytics_event ON public.conversion_analytics USING btree (event_type);


--
-- Name: idx_conversion_analytics_session; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversion_analytics_session ON public.conversion_analytics USING btree (session_id);


--
-- Name: idx_conversion_analytics_timestamp; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversion_analytics_timestamp ON public.conversion_analytics USING btree ("timestamp" DESC);


--
-- Name: idx_counter_proposals_dispute; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_counter_proposals_dispute ON public.dispute_counter_proposals USING btree (dispute_id);


--
-- Name: idx_counter_proposals_proposer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_counter_proposals_proposer ON public.dispute_counter_proposals USING btree (proposer_id);


--
-- Name: idx_data_exports_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_data_exports_user_status ON public.data_exports USING btree (user_id, status);


--
-- Name: idx_deletion_requests_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_deletion_requests_status ON public.data_deletion_requests USING btree (status);


--
-- Name: idx_deletion_requests_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_deletion_requests_user_id ON public.data_deletion_requests USING btree (user_id);


--
-- Name: idx_dispute_messages_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dispute_messages_created ON public.dispute_messages USING btree (dispute_id, created_at);


--
-- Name: idx_dispute_messages_dispute; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dispute_messages_dispute ON public.dispute_messages USING btree (dispute_id);


--
-- Name: idx_dispute_messages_sender; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dispute_messages_sender ON public.dispute_messages USING btree (sender_id);


--
-- Name: idx_dispute_resolutions_dispute; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dispute_resolutions_dispute ON public.dispute_resolutions USING btree (dispute_id);


--
-- Name: idx_dispute_timeline_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dispute_timeline_created ON public.dispute_timeline USING btree (dispute_id, created_at);


--
-- Name: idx_dispute_timeline_dispute; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dispute_timeline_dispute ON public.dispute_timeline USING btree (dispute_id);


--
-- Name: idx_disputes_last_activity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_disputes_last_activity ON public.disputes USING btree (last_activity_at);


--
-- Name: idx_document_collaborators_document_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_document_collaborators_document_id ON public.document_collaborators USING btree (document_id);


--
-- Name: idx_document_collaborators_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_document_collaborators_user_id ON public.document_collaborators USING btree (user_id);


--
-- Name: idx_document_edits_document_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_document_edits_document_id ON public.document_edits USING btree (document_id);


--
-- Name: idx_dual_control_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dual_control_status ON public.dual_control_approvals USING btree (status) WHERE (status = 'pending'::text);


--
-- Name: idx_enforcement_log_dispute; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_enforcement_log_dispute ON public.resolution_enforcement_log USING btree (dispute_id);


--
-- Name: idx_enforcement_log_resolution; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_enforcement_log_resolution ON public.resolution_enforcement_log USING btree (resolution_id);


--
-- Name: idx_escrow_milestones_auto_release; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_escrow_milestones_auto_release ON public.escrow_milestones USING btree (auto_release_date) WHERE (auto_release_date IS NOT NULL);


--
-- Name: idx_escrow_milestones_contract; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_escrow_milestones_contract ON public.escrow_milestones USING btree (contract_id);


--
-- Name: idx_escrow_milestones_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_escrow_milestones_status ON public.escrow_milestones USING btree (status);


--
-- Name: idx_escrow_payments_contract; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_escrow_payments_contract ON public.escrow_payments USING btree (contract_id);


--
-- Name: idx_escrow_releases_milestone_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_escrow_releases_milestone_id ON public.escrow_releases USING btree (milestone_id);


--
-- Name: idx_escrow_transactions_milestone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_escrow_transactions_milestone ON public.escrow_transactions USING btree (milestone_id);


--
-- Name: idx_escrow_transactions_payment; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_escrow_transactions_payment ON public.escrow_transactions USING btree (payment_id);


--
-- Name: idx_escrow_transfer_logs_milestone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_escrow_transfer_logs_milestone ON public.escrow_transfer_logs USING btree (milestone_id);


--
-- Name: idx_events_session_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_session_time ON public.analytics_events USING btree (session_id, created_at DESC);


--
-- Name: idx_events_user_category_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_user_category_time ON public.analytics_events USING btree (user_id, event_category, created_at DESC);


--
-- Name: idx_exchange_rates_from_currency; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_exchange_rates_from_currency ON public.exchange_rates USING btree (from_currency);


--
-- Name: idx_exchange_rates_pair; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_exchange_rates_pair ON public.exchange_rates USING btree (from_currency, to_currency);


--
-- Name: idx_exchange_rates_to_currency; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_exchange_rates_to_currency ON public.exchange_rates USING btree (to_currency);


--
-- Name: idx_financial_reports_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_financial_reports_type ON public.financial_reports USING btree (report_type);


--
-- Name: idx_financial_reports_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_financial_reports_user ON public.financial_reports USING btree (user_id);


--
-- Name: idx_flag_exposures_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_flag_exposures_date ON public.feature_flag_exposures USING btree (exposed_at);


--
-- Name: idx_flag_exposures_flag; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_flag_exposures_flag ON public.feature_flag_exposures USING btree (flag_key);


--
-- Name: idx_flag_exposures_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_flag_exposures_user ON public.feature_flag_exposures USING btree (user_id);


--
-- Name: idx_generated_reports_template_period; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_generated_reports_template_period ON public.generated_reports USING btree (template_id, period_start, period_end);


--
-- Name: idx_invoice_items_invoice; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoice_items_invoice ON public.invoice_items USING btree (invoice_id);


--
-- Name: idx_invoice_payments_invoice; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoice_payments_invoice ON public.invoice_payments USING btree (invoice_id);


--
-- Name: idx_invoices_due_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_due_date ON public.invoices USING btree (due_date);


--
-- Name: idx_invoices_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_status ON public.invoices USING btree (status);


--
-- Name: idx_invoices_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_user_status ON public.invoices USING btree (user_id, status);


--
-- Name: idx_job_applicants_interview_scheduled; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_applicants_interview_scheduled ON public.job_applicants USING btree (interview_scheduled_at) WHERE (interview_scheduled_at IS NOT NULL);


--
-- Name: idx_job_applicants_job_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_applicants_job_id ON public.job_applicants USING btree (job_id);


--
-- Name: idx_job_applicants_professional_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_applicants_professional_id ON public.job_applicants USING btree (professional_id);


--
-- Name: idx_job_broadcasts_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_broadcasts_created_at ON public.job_broadcasts USING btree (created_at);


--
-- Name: idx_job_broadcasts_job_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_broadcasts_job_id ON public.job_broadcasts USING btree (job_id);


--
-- Name: idx_job_lifecycle_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_lifecycle_created_at ON public.job_lifecycle_events USING btree (created_at);


--
-- Name: idx_job_lifecycle_event_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_lifecycle_event_type ON public.job_lifecycle_events USING btree (event_type);


--
-- Name: idx_job_lifecycle_job_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_lifecycle_job_id ON public.job_lifecycle_events USING btree (job_id);


--
-- Name: idx_job_photos_job; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_photos_job ON public.job_photos USING btree (job_id);


--
-- Name: idx_job_photos_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_photos_type ON public.job_photos USING btree (job_id, photo_type);


--
-- Name: idx_job_presets_last_used; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_presets_last_used ON public.job_presets USING btree (last_used_at DESC);


--
-- Name: idx_job_presets_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_presets_type ON public.job_presets USING btree (preset_type);


--
-- Name: idx_job_presets_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_presets_user_id ON public.job_presets USING btree (user_id);


--
-- Name: idx_job_quotes_job_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_quotes_job_id ON public.job_quotes USING btree (job_id);


--
-- Name: idx_job_quotes_professional_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_quotes_professional_id ON public.job_quotes USING btree (professional_id);


--
-- Name: idx_job_quotes_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_quotes_status ON public.job_quotes USING btree (status);


--
-- Name: idx_job_state_transitions_job_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_state_transitions_job_id ON public.job_state_transitions USING btree (job_id);


--
-- Name: idx_job_templates_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_templates_category ON public.job_templates USING btree (category);


--
-- Name: idx_job_templates_last_used; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_templates_last_used ON public.job_templates USING btree (last_used_at DESC);


--
-- Name: idx_job_templates_usage_count; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_templates_usage_count ON public.job_templates USING btree (usage_count DESC);


--
-- Name: idx_job_templates_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_templates_user_id ON public.job_templates USING btree (user_id);


--
-- Name: idx_job_versions_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_versions_created ON public.job_versions USING btree (created_at);


--
-- Name: idx_job_versions_job; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_versions_job ON public.job_versions USING btree (job_id);


--
-- Name: idx_job_versions_job_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_versions_job_id ON public.job_versions USING btree (job_id);


--
-- Name: idx_jobs_client_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_jobs_client_status ON public.jobs USING btree (client_id, status);


--
-- Name: idx_jobs_scheduled_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_jobs_scheduled_at ON public.jobs USING btree (scheduled_at);


--
-- Name: idx_jobs_status_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_jobs_status_created ON public.jobs USING btree (status, created_at DESC);


--
-- Name: idx_leaderboard_entries_leaderboard_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leaderboard_entries_leaderboard_id ON public.leaderboard_entries USING btree (leaderboard_id);


--
-- Name: idx_leaderboard_entries_rank; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leaderboard_entries_rank ON public.leaderboard_entries USING btree (rank);


--
-- Name: idx_message_reactions_message; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_message_reactions_message ON public.message_reactions USING btree (message_id);


--
-- Name: idx_message_threads_parent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_message_threads_parent ON public.message_threads USING btree (parent_message_id);


--
-- Name: idx_messages_conversation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_conversation ON public.messages USING btree (conversation_id);


--
-- Name: idx_messages_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_created_at ON public.messages USING btree (created_at DESC);


--
-- Name: idx_messages_recipient; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_recipient ON public.messages USING btree (recipient_id);


--
-- Name: idx_messages_sender; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_sender ON public.messages USING btree (sender_id);


--
-- Name: idx_messages_unread; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_unread ON public.messages USING btree (recipient_id, created_at DESC) WHERE (read_at IS NULL);


--
-- Name: idx_micro_categories_subcategory; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_micro_categories_subcategory ON public.service_micro_categories USING btree (subcategory_id);


--
-- Name: idx_micro_questions_ai_runs_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_micro_questions_ai_runs_category ON public.micro_questions_ai_runs USING btree (micro_category_id);


--
-- Name: idx_micro_questions_ai_runs_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_micro_questions_ai_runs_created ON public.micro_questions_ai_runs USING btree (created_at DESC);


--
-- Name: idx_micro_questions_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_micro_questions_category ON public.micro_service_questions USING btree (category, subcategory);


--
-- Name: idx_micro_questions_micro_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_micro_questions_micro_id ON public.micro_service_questions USING btree (micro_id);


--
-- Name: idx_micro_questions_snapshot_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_micro_questions_snapshot_category ON public.micro_questions_snapshot USING btree (micro_category_id);


--
-- Name: idx_milestone_approvals_approver; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_milestone_approvals_approver ON public.milestone_approvals USING btree (approver_id);


--
-- Name: idx_milestone_approvals_milestone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_milestone_approvals_milestone ON public.milestone_approvals USING btree (milestone_id);


--
-- Name: idx_notification_digest_queue_pending; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_digest_queue_pending ON public.notification_digest_queue USING btree (user_id, scheduled_for) WHERE (sent_at IS NULL);


--
-- Name: idx_notification_digest_queue_scheduled; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_digest_queue_scheduled ON public.notification_digest_queue USING btree (scheduled_for) WHERE (sent_at IS NULL);


--
-- Name: idx_notification_digest_queue_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_digest_queue_user ON public.notification_digest_queue USING btree (user_id);


--
-- Name: idx_notification_preferences_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_preferences_user ON public.notification_preferences USING btree (user_id);


--
-- Name: idx_notification_preferences_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_preferences_user_id ON public.notification_preferences USING btree (user_id);


--
-- Name: idx_notification_queue_status_scheduled; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_queue_status_scheduled ON public.notification_queue USING btree (status, scheduled_for) WHERE (status = 'pending'::text);


--
-- Name: idx_notification_templates_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_templates_key ON public.notification_templates USING btree (template_key);


--
-- Name: idx_notifications_unread; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_unread ON public.notifications USING btree (user_id, read_at) WHERE (read_at IS NULL);


--
-- Name: idx_notifications_user_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_created ON public.notifications USING btree (user_id, created_at DESC);


--
-- Name: idx_offer_negotiations_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_offer_negotiations_expires_at ON public.offer_negotiations USING btree (expires_at) WHERE (expires_at IS NOT NULL);


--
-- Name: idx_offer_negotiations_offer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_offer_negotiations_offer_id ON public.offer_negotiations USING btree (offer_id);


--
-- Name: idx_onboarding_checklist_professional; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_onboarding_checklist_professional ON public.onboarding_checklist USING btree (professional_id);


--
-- Name: idx_onboarding_checklist_step; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_onboarding_checklist_step ON public.onboarding_checklist USING btree (step);


--
-- Name: idx_onboarding_events_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_onboarding_events_created ON public.onboarding_events USING btree (created_at DESC);


--
-- Name: idx_onboarding_events_professional; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_onboarding_events_professional ON public.onboarding_events USING btree (professional_id);


--
-- Name: idx_payment_alerts_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_alerts_created ON public.payment_alerts USING btree (created_at);


--
-- Name: idx_payment_alerts_severity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_alerts_severity ON public.payment_alerts USING btree (severity);


--
-- Name: idx_payment_analytics_period; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_analytics_period ON public.payment_analytics USING btree (period_start, period_end);


--
-- Name: idx_payment_analytics_summary_period; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_analytics_summary_period ON public.payment_analytics_summary USING btree (period_start, period_end);


--
-- Name: idx_payment_analytics_summary_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_analytics_summary_user_id ON public.payment_analytics_summary USING btree (user_id);


--
-- Name: idx_payment_analytics_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_analytics_user ON public.payment_analytics USING btree (user_id);


--
-- Name: idx_payment_methods_stripe; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_methods_stripe ON public.payment_methods USING btree (stripe_payment_method_id);


--
-- Name: idx_payment_methods_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_methods_user ON public.payment_methods USING btree (user_id);


--
-- Name: idx_payment_notifications_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_notifications_status ON public.payment_notifications USING btree (status);


--
-- Name: idx_payment_notifications_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_notifications_type ON public.payment_notifications USING btree (notification_type);


--
-- Name: idx_payment_notifications_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_notifications_user ON public.payment_notifications USING btree (user_id);


--
-- Name: idx_payment_receipts_payment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_receipts_payment_id ON public.payment_receipts USING btree (payment_id);


--
-- Name: idx_payment_receipts_receipt_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_receipts_receipt_number ON public.payment_receipts USING btree (receipt_number);


--
-- Name: idx_payment_receipts_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_receipts_user_id ON public.payment_receipts USING btree (user_id);


--
-- Name: idx_payment_reconciliations_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_reconciliations_date ON public.payment_reconciliations USING btree (reconciliation_date);


--
-- Name: idx_payment_reconciliations_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_reconciliations_user ON public.payment_reconciliations USING btree (user_id);


--
-- Name: idx_payment_reminders_scheduled_payment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_reminders_scheduled_payment_id ON public.payment_reminders USING btree (scheduled_payment_id);


--
-- Name: idx_payment_reminders_sent_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_reminders_sent_at ON public.payment_reminders USING btree (sent_at);


--
-- Name: idx_payment_reminders_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_reminders_user_id ON public.payment_reminders USING btree (user_id);


--
-- Name: idx_payment_schedules_job_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_schedules_job_id ON public.payment_schedules USING btree (job_id);


--
-- Name: idx_payment_schedules_next_payment_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_schedules_next_payment_date ON public.payment_schedules USING btree (next_payment_date);


--
-- Name: idx_payment_schedules_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_schedules_status ON public.payment_schedules USING btree (status);


--
-- Name: idx_payment_schedules_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_schedules_user_id ON public.payment_schedules USING btree (user_id);


--
-- Name: idx_payment_transactions_job; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_transactions_job ON public.payment_transactions USING btree (job_id);


--
-- Name: idx_payment_transactions_pending; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_transactions_pending ON public.payment_transactions USING btree (user_id, status) WHERE (status = 'pending'::text);


--
-- Name: idx_payment_transactions_stripe_intent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_transactions_stripe_intent ON public.payment_transactions USING btree (stripe_payment_intent_id);


--
-- Name: idx_payment_transactions_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_transactions_user ON public.payment_transactions USING btree (user_id);


--
-- Name: idx_payments_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_client_id ON public.payments USING btree (client_id);


--
-- Name: idx_payments_job_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_job_id ON public.payments USING btree (job_id);


--
-- Name: idx_payments_professional_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_professional_id ON public.payments USING btree (professional_id);


--
-- Name: idx_payments_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_status ON public.payments USING btree (status);


--
-- Name: idx_payments_stripe_payment_intent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_stripe_payment_intent_id ON public.payments USING btree (stripe_payment_intent_id);


--
-- Name: idx_payout_items_payout_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payout_items_payout_id ON public.payout_items USING btree (payout_id);


--
-- Name: idx_payouts_professional_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payouts_professional_id ON public.payouts USING btree (professional_id);


--
-- Name: idx_payouts_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payouts_status ON public.payouts USING btree (status);


--
-- Name: idx_performance_metrics_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_performance_metrics_name ON public.performance_metrics USING btree (metric_name);


--
-- Name: idx_performance_metrics_recorded_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_performance_metrics_recorded_at ON public.performance_metrics USING btree (recorded_at);


--
-- Name: idx_platform_metrics_date_hour; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_platform_metrics_date_hour ON public.platform_metrics USING btree (metric_date DESC, metric_hour DESC);


--
-- Name: idx_points_transactions_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_points_transactions_created_at ON public.points_transactions USING btree (created_at DESC);


--
-- Name: idx_points_transactions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_points_transactions_user_id ON public.points_transactions USING btree (user_id);


--
-- Name: idx_popular_searches_period; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_popular_searches_period ON public.popular_searches USING btree (period, period_start DESC);


--
-- Name: idx_portfolio_images_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_portfolio_images_order ON public.portfolio_images USING btree (professional_id, display_order);


--
-- Name: idx_portfolio_images_professional; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_portfolio_images_professional ON public.portfolio_images USING btree (professional_id);


--
-- Name: idx_predictive_insights_entity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_predictive_insights_entity ON public.predictive_insights USING btree (entity_type, entity_id);


--
-- Name: idx_pricing_hints_location; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pricing_hints_location ON public.pricing_hints USING btree (location_type);


--
-- Name: idx_pricing_hints_service; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pricing_hints_service ON public.pricing_hints USING btree (service_category, service_subcategory, micro_service);


--
-- Name: idx_professional_availability_professional_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_professional_availability_professional_id ON public.professional_availability USING btree (professional_id);


--
-- Name: idx_professional_availability_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_professional_availability_status ON public.professional_availability USING btree (status) WHERE (status = ANY (ARRAY['available'::text, 'busy'::text]));


--
-- Name: idx_professional_badges_professional_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_professional_badges_professional_user_id ON public.professional_badges USING btree (professional_user_id) WHERE (is_active = true);


--
-- Name: idx_professional_earnings_professional_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_professional_earnings_professional_id ON public.professional_earnings USING btree (professional_id);


--
-- Name: idx_professional_earnings_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_professional_earnings_status ON public.professional_earnings USING btree (status);


--
-- Name: idx_professional_portfolio_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_professional_portfolio_category ON public.professional_portfolio USING btree (category);


--
-- Name: idx_professional_portfolio_featured; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_professional_portfolio_featured ON public.professional_portfolio USING btree (is_featured) WHERE (is_featured = true);


--
-- Name: idx_professional_portfolio_professional_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_professional_portfolio_professional_id ON public.professional_portfolio USING btree (professional_id);


--
-- Name: idx_professional_profiles_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_professional_profiles_active ON public.professional_profiles USING btree (is_active, verification_status) WHERE (is_active = true);


--
-- Name: idx_professional_profiles_subscription; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_professional_profiles_subscription ON public.professional_profiles USING btree (subscription_tier);


--
-- Name: idx_professional_profiles_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_professional_profiles_user_id ON public.professional_profiles USING btree (user_id);


--
-- Name: idx_professional_profiles_verified; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_professional_profiles_verified ON public.professional_profiles USING btree (verification_status, is_active) WHERE ((verification_status = 'verified'::text) AND (is_active = true));


--
-- Name: idx_professional_reviews_professional_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_professional_reviews_professional_id ON public.professional_reviews USING btree (professional_id);


--
-- Name: idx_professional_reviews_rating; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_professional_reviews_rating ON public.professional_reviews USING btree (rating);


--
-- Name: idx_professional_services_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_professional_services_active ON public.professional_services USING btree (is_active);


--
-- Name: idx_professional_services_micro_service_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_professional_services_micro_service_id ON public.professional_services USING btree (micro_service_id);


--
-- Name: idx_professional_services_professional_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_professional_services_professional_id ON public.professional_services USING btree (professional_id);


--
-- Name: idx_professional_stats_professional_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_professional_stats_professional_id ON public.professional_stats USING btree (professional_id);


--
-- Name: idx_professional_stripe_accounts_professional; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_professional_stripe_accounts_professional ON public.professional_stripe_accounts USING btree (professional_id);


--
-- Name: idx_professional_verifications_professional_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_professional_verifications_professional_id ON public.professional_verifications USING btree (professional_id);


--
-- Name: idx_professional_verifications_professional_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_professional_verifications_professional_status ON public.professional_verifications USING btree (professional_id, status);


--
-- Name: idx_professional_verifications_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_professional_verifications_status ON public.professional_verifications USING btree (status);


--
-- Name: idx_profile_views_professional; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profile_views_professional ON public.profile_views USING btree (professional_id);


--
-- Name: idx_profile_views_session; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profile_views_session ON public.profile_views USING btree (professional_id, session_id);


--
-- Name: idx_profile_views_viewed_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profile_views_viewed_at ON public.profile_views USING btree (viewed_at DESC);


--
-- Name: idx_profiles_active_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_active_role ON public.profiles USING btree (active_role);


--
-- Name: idx_project_completions_completion_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_project_completions_completion_date ON public.project_completions USING btree (completion_date);


--
-- Name: idx_project_completions_project_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_project_completions_project_type ON public.project_completions USING btree (project_type);


--
-- Name: idx_project_completions_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_project_completions_session_id ON public.project_completions USING btree (session_id);


--
-- Name: idx_properties_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_properties_client_id ON public.properties USING btree (client_id);


--
-- Name: idx_query_perf_query_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_query_perf_query_name ON public.query_performance_log USING btree (query_name, created_at DESC);


--
-- Name: idx_query_perf_slow; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_query_perf_slow ON public.query_performance_log USING btree (execution_time_ms DESC) WHERE (execution_time_ms > 1000);


--
-- Name: idx_question_packs_ui_config; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_question_packs_ui_config ON public.question_packs USING gin (ui_config);


--
-- Name: idx_quote_requests_job_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quote_requests_job_id ON public.quote_requests USING btree (job_id);


--
-- Name: idx_quote_requests_professional_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quote_requests_professional_id ON public.quote_requests USING btree (professional_id);


--
-- Name: idx_quotes_quote_request_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quotes_quote_request_id ON public.quotes USING btree (quote_request_id);


--
-- Name: idx_rate_limit_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rate_limit_created_at ON public.rate_limit_tracking USING btree (created_at);


--
-- Name: idx_rate_limit_identifier_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rate_limit_identifier_action ON public.rate_limit_tracking USING btree (identifier, action);


--
-- Name: idx_rating_summary_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rating_summary_user ON public.rating_summary USING btree (user_id);


--
-- Name: idx_read_receipts_message; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_read_receipts_message ON public.read_receipts USING btree (message_id);


--
-- Name: idx_redirect_analytics_last_hit; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_redirect_analytics_last_hit ON public.redirect_analytics USING btree (last_hit_at DESC);


--
-- Name: idx_redirect_analytics_paths; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_redirect_analytics_paths ON public.redirect_analytics USING btree (from_path, to_path);


--
-- Name: idx_referrals_referred_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_referrals_referred_id ON public.referrals USING btree (referred_id);


--
-- Name: idx_referrals_referrer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_referrals_referrer_id ON public.referrals USING btree (referrer_id);


--
-- Name: idx_refund_requests_payment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_refund_requests_payment_id ON public.refund_requests USING btree (payment_id);


--
-- Name: idx_refund_requests_requested_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_refund_requests_requested_by ON public.refund_requests USING btree (requested_by);


--
-- Name: idx_refund_requests_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_refund_requests_status ON public.refund_requests USING btree (status);


--
-- Name: idx_refund_requests_stripe_refund_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_refund_requests_stripe_refund_id ON public.refund_requests USING btree (stripe_refund_id);


--
-- Name: idx_refunds_payment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_refunds_payment_id ON public.refunds USING btree (payment_id);


--
-- Name: idx_report_exports_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_report_exports_created ON public.report_exports USING btree (created_at);


--
-- Name: idx_report_exports_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_report_exports_status ON public.report_exports USING btree (status);


--
-- Name: idx_report_exports_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_report_exports_user ON public.report_exports USING btree (requested_by);


--
-- Name: idx_revenue_analytics_date_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_revenue_analytics_date_type ON public.revenue_analytics USING btree (analysis_date DESC, revenue_type);


--
-- Name: idx_review_flags_review; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_review_flags_review ON public.review_flags USING btree (review_id);


--
-- Name: idx_review_flags_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_review_flags_status ON public.review_flags USING btree (status);


--
-- Name: idx_review_helpful_votes_review; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_review_helpful_votes_review ON public.review_helpful_votes USING btree (review_id);


--
-- Name: idx_review_helpfulness_review; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_review_helpfulness_review ON public.review_helpfulness USING btree (review_id);


--
-- Name: idx_review_helpfulness_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_review_helpfulness_user ON public.review_helpfulness USING btree (user_id);


--
-- Name: idx_review_reports_review; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_review_reports_review ON public.review_reports USING btree (review_id);


--
-- Name: idx_review_reports_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_review_reports_status ON public.review_reports USING btree (status);


--
-- Name: idx_reviews_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_created ON public.reviews USING btree (created_at DESC);


--
-- Name: idx_reviews_job; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_job ON public.reviews USING btree (job_id);


--
-- Name: idx_reviews_moderation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_moderation ON public.reviews USING btree (moderation_status);


--
-- Name: idx_reviews_rating; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_rating ON public.reviews USING btree (rating);


--
-- Name: idx_reviews_reviewee; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_reviewee ON public.reviews USING btree (reviewee_id);


--
-- Name: idx_reviews_reviewee_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_reviewee_created ON public.reviews USING btree (reviewee_id, created_at DESC);


--
-- Name: idx_reviews_reviewer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_reviewer ON public.reviews USING btree (reviewer_id);


--
-- Name: idx_saved_searches_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_saved_searches_user_id ON public.saved_searches USING btree (user_id);


--
-- Name: idx_scheduled_payments_due_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scheduled_payments_due_date ON public.scheduled_payments USING btree (due_date);


--
-- Name: idx_scheduled_payments_schedule_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scheduled_payments_schedule_id ON public.scheduled_payments USING btree (schedule_id);


--
-- Name: idx_scheduled_payments_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scheduled_payments_status ON public.scheduled_payments USING btree (status);


--
-- Name: idx_search_analytics_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_search_analytics_date ON public.search_analytics USING btree (date DESC);


--
-- Name: idx_search_history_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_search_history_created_at ON public.search_history USING btree (created_at DESC);


--
-- Name: idx_search_history_search_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_search_history_search_type ON public.search_history USING btree (search_type);


--
-- Name: idx_search_history_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_search_history_user_id ON public.search_history USING btree (user_id);


--
-- Name: idx_security_audit_log_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_security_audit_log_created_at ON public.security_audit_log USING btree (created_at);


--
-- Name: idx_security_audit_log_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_security_audit_log_user_id ON public.security_audit_log USING btree (user_id);


--
-- Name: idx_security_events_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_security_events_created_at ON public.security_events USING btree (detected_at);


--
-- Name: idx_security_events_severity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_security_events_severity ON public.security_events USING btree (severity);


--
-- Name: idx_security_events_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_security_events_user_id ON public.security_events USING btree (user_id);


--
-- Name: idx_service_categories_featured; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_service_categories_featured ON public.service_categories USING btree (is_featured);


--
-- Name: idx_service_categories_group; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_service_categories_group ON public.service_categories USING btree (category_group);


--
-- Name: idx_service_items_taxonomy; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_service_items_taxonomy ON public.professional_service_items USING btree (category, subcategory, micro);


--
-- Name: idx_services_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_services_category ON public.services_unified USING btree (category);


--
-- Name: idx_services_category_subcategory; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_services_category_subcategory ON public.services_unified USING btree (category, subcategory);


--
-- Name: idx_services_full_path; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_services_full_path ON public.services_unified USING btree (category, subcategory, micro);


--
-- Name: idx_services_micro_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_services_micro_category ON public.services_micro USING btree (category);


--
-- Name: idx_services_micro_ibiza_specific; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_services_micro_ibiza_specific ON public.services_micro USING btree (ibiza_specific) WHERE (ibiza_specific = true);


--
-- Name: idx_services_subcategory; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_services_subcategory ON public.services_unified_v1 USING btree (category, subcategory);


--
-- Name: idx_services_unified_v1_cat_sub; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_services_unified_v1_cat_sub ON public.services_unified_v1 USING btree (category, subcategory);


--
-- Name: idx_services_unified_v1_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_services_unified_v1_category ON public.services_unified_v1 USING btree (category);


--
-- Name: idx_share_events_config; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_share_events_config ON public.calculator_share_events USING btree (config_id);


--
-- Name: idx_shared_documents_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shared_documents_created_by ON public.shared_documents USING btree (created_by);


--
-- Name: idx_shared_documents_job_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shared_documents_job_id ON public.shared_documents USING btree (job_id);


--
-- Name: idx_smart_matches_job_score; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_smart_matches_job_score ON public.smart_matches USING btree (job_id, match_score DESC);


--
-- Name: idx_subcategories_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subcategories_category ON public.service_subcategories USING btree (category_id);


--
-- Name: idx_system_health_service_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_system_health_service_time ON public.system_health_metrics USING btree (service_name, recorded_at);


--
-- Name: idx_system_metrics_recorded; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_system_metrics_recorded ON public.system_metrics USING btree (recorded_at);


--
-- Name: idx_system_metrics_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_system_metrics_type ON public.system_metrics USING btree (metric_type);


--
-- Name: idx_ticket_messages_ticket; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ticket_messages_ticket ON public.ticket_messages USING btree (ticket_id);


--
-- Name: idx_tickets_assigned; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tickets_assigned ON public.support_tickets USING btree (assigned_to);


--
-- Name: idx_tickets_sla; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tickets_sla ON public.support_tickets USING btree (sla_deadline);


--
-- Name: idx_tickets_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tickets_status ON public.support_tickets USING btree (status);


--
-- Name: idx_tickets_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tickets_user ON public.support_tickets USING btree (user_id);


--
-- Name: idx_transaction_notes_transaction_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transaction_notes_transaction_id ON public.transaction_notes USING btree (transaction_id);


--
-- Name: idx_typing_indicators_conversation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_typing_indicators_conversation ON public.typing_indicators USING btree (conversation_id);


--
-- Name: idx_typing_indicators_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_typing_indicators_expires ON public.typing_indicators USING btree (expires_at);


--
-- Name: idx_user_achievements_achievement_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_achievements_achievement_id ON public.user_achievements USING btree (achievement_id);


--
-- Name: idx_user_achievements_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_achievements_user_id ON public.user_achievements USING btree (user_id);


--
-- Name: idx_user_activity_metrics_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_activity_metrics_date ON public.user_activity_metrics USING btree (metric_date DESC);


--
-- Name: idx_user_activity_metrics_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_activity_metrics_user_date ON public.user_activity_metrics USING btree (user_id, metric_date DESC);


--
-- Name: idx_user_badges_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_badges_user_id ON public.user_badges USING btree (user_id);


--
-- Name: idx_user_compliance_status_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_compliance_status_user_id ON public.user_compliance_status USING btree (user_id);


--
-- Name: idx_user_feedback_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_feedback_created_at ON public.user_feedback USING btree (created_at);


--
-- Name: idx_user_feedback_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_feedback_status ON public.user_feedback USING btree (status);


--
-- Name: idx_user_feedback_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_feedback_type ON public.user_feedback USING btree (feedback_type);


--
-- Name: idx_user_feedback_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_feedback_user_id ON public.user_feedback USING btree (user_id);


--
-- Name: idx_user_presence_last_seen; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_presence_last_seen ON public.user_presence USING btree (last_seen DESC);


--
-- Name: idx_user_presence_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_presence_status ON public.user_presence USING btree (status);


--
-- Name: idx_user_roles_lookup; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_roles_lookup ON public.user_roles USING btree (user_id, role);


--
-- Name: idx_ux_health_checks_check_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ux_health_checks_check_type ON public.ux_health_checks USING btree (check_type, detected_at DESC);


--
-- Name: idx_ux_health_checks_entity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ux_health_checks_entity ON public.ux_health_checks USING btree (entity_type, entity_id);


--
-- Name: idx_ux_health_checks_realtime; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ux_health_checks_realtime ON public.ux_health_checks USING btree (detected_at DESC, severity);


--
-- Name: idx_ux_health_checks_status_priority_detected; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ux_health_checks_status_priority_detected ON public.ux_health_checks USING btree (status, priority_weight DESC, detected_at DESC);


--
-- Name: idx_video_calls_conversation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_video_calls_conversation ON public.video_calls USING btree (conversation_id);


--
-- Name: idx_video_calls_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_video_calls_status ON public.video_calls USING btree (status);


--
-- Name: idx_webhook_deliveries_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_webhook_deliveries_created_at ON public.webhook_deliveries USING btree (created_at);


--
-- Name: idx_webhook_deliveries_subscription_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_webhook_deliveries_subscription_id ON public.webhook_deliveries USING btree (subscription_id);


--
-- Name: idx_webhook_subscriptions_event_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_webhook_subscriptions_event_type ON public.webhook_subscriptions USING btree (event_type);


--
-- Name: idx_webhook_subscriptions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_webhook_subscriptions_user_id ON public.webhook_subscriptions USING btree (user_id);


--
-- Name: ix_reviews_job; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_reviews_job ON public.professional_reviews USING btree (job_id);


--
-- Name: ix_reviews_milestone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_reviews_milestone ON public.professional_reviews USING btree (milestone_id);


--
-- Name: profiles_verification_queue_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX profiles_verification_queue_idx ON public.profiles USING btree (verification_status);


--
-- Name: services_micro_active_sort_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX services_micro_active_sort_idx ON public.services_micro USING btree (is_active, sort_index);


--
-- Name: services_micro_versions_lookup_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX services_micro_versions_lookup_idx ON public.services_micro_versions USING btree (services_micro_id, created_at DESC);


--
-- Name: uq_pack_active_per_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_pack_active_per_slug ON public.question_packs USING btree (micro_slug, is_active) WHERE ((is_active = true) AND (status = 'approved'::public.pack_status));


--
-- Name: uq_pack_slug_version; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_pack_slug_version ON public.question_packs USING btree (micro_slug, version);


--
-- Name: ux_reviews_client_milestone; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ux_reviews_client_milestone ON public.professional_reviews USING btree (client_id, milestone_id) WHERE (milestone_id IS NOT NULL);


--
-- Name: calendar_events auto_create_booking_reminders; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER auto_create_booking_reminders AFTER INSERT ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.trigger_create_booking_reminders();


--
-- Name: escrow_milestones auto_release_milestone_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER auto_release_milestone_trigger AFTER UPDATE ON public.escrow_milestones FOR EACH ROW EXECUTE FUNCTION public.auto_release_milestone_payment();


--
-- Name: invoice_items calculate_invoice_totals_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER calculate_invoice_totals_trigger AFTER INSERT OR DELETE OR UPDATE ON public.invoice_items FOR EACH ROW EXECUTE FUNCTION public.calculate_invoice_totals();


--
-- Name: jobs job_state_transition_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER job_state_transition_trigger AFTER UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.log_job_state_transition();


--
-- Name: escrow_milestones log_approval_actions; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER log_approval_actions AFTER UPDATE ON public.escrow_milestones FOR EACH ROW EXECUTE FUNCTION public.log_milestone_approval();


--
-- Name: job_applicants on_applicant_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_applicant_update BEFORE UPDATE ON public.job_applicants FOR EACH ROW EXECUTE FUNCTION public.update_applicant_updated_at();


--
-- Name: messages on_message_created; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_message_created AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.update_conversation_last_message();


--
-- Name: job_quotes on_quote_submitted; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_quote_submitted AFTER INSERT ON public.job_quotes FOR EACH ROW EXECUTE FUNCTION public.notify_client_new_quote();


--
-- Name: professional_verifications on_verification_approval; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_verification_approval AFTER UPDATE ON public.professional_verifications FOR EACH ROW EXECUTE FUNCTION public.handle_verification_approval();


--
-- Name: payment_schedules payment_schedules_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER payment_schedules_updated_at BEFORE UPDATE ON public.payment_schedules FOR EACH ROW EXECUTE FUNCTION public.update_payment_schedules_updated_at();


--
-- Name: platform_metrics platform_metrics_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER platform_metrics_updated_at BEFORE UPDATE ON public.platform_metrics FOR EACH ROW EXECUTE FUNCTION public.update_analytics_updated_at();


--
-- Name: reviews prevent_duplicate_review; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER prevent_duplicate_review BEFORE INSERT OR UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.prevent_duplicate_reviews();


--
-- Name: report_schedules report_schedules_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER report_schedules_updated_at BEFORE UPDATE ON public.report_schedules FOR EACH ROW EXECUTE FUNCTION public.update_analytics_updated_at();


--
-- Name: revenue_analytics revenue_analytics_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER revenue_analytics_updated_at BEFORE UPDATE ON public.revenue_analytics FOR EACH ROW EXECUTE FUNCTION public.update_analytics_updated_at();


--
-- Name: saved_reports saved_reports_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER saved_reports_updated_at BEFORE UPDATE ON public.saved_reports FOR EACH ROW EXECUTE FUNCTION public.update_analytics_updated_at();


--
-- Name: saved_searches saved_searches_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER saved_searches_updated_at BEFORE UPDATE ON public.saved_searches FOR EACH ROW EXECUTE FUNCTION public.update_saved_searches_updated_at();


--
-- Name: scheduled_payments scheduled_payments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER scheduled_payments_updated_at BEFORE UPDATE ON public.scheduled_payments FOR EACH ROW EXECUTE FUNCTION public.update_payment_schedules_updated_at();


--
-- Name: escrow_milestones set_milestone_auto_release_date; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_milestone_auto_release_date BEFORE UPDATE ON public.escrow_milestones FOR EACH ROW EXECUTE FUNCTION public.set_auto_release_date();


--
-- Name: jobs track_job_status_changes; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER track_job_status_changes AFTER UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.track_job_lifecycle();


--
-- Name: shared_documents track_shared_document_edits; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER track_shared_document_edits BEFORE UPDATE ON public.shared_documents FOR EACH ROW EXECUTE FUNCTION public.track_document_edit();


--
-- Name: question_packs trg_audit_pack_changes; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_audit_pack_changes AFTER INSERT OR UPDATE ON public.question_packs FOR EACH ROW EXECUTE FUNCTION public.audit_pack_changes();


--
-- Name: dispute_resolutions trg_finalize_resolution; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_finalize_resolution BEFORE UPDATE ON public.dispute_resolutions FOR EACH ROW EXECUTE FUNCTION public.finalize_resolution_if_both_agree();


--
-- Name: question_packs trg_lock_approved; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_lock_approved BEFORE UPDATE ON public.question_packs FOR EACH ROW EXECUTE FUNCTION public.prevent_approved_mutation();


--
-- Name: question_packs trg_lock_approved_pack; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_lock_approved_pack BEFORE UPDATE OF content, source, prompt_hash, version, micro_slug ON public.question_packs FOR EACH ROW EXECUTE FUNCTION public.prevent_approved_mutation();


--
-- Name: dispute_evidence trg_log_evidence_upload; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_log_evidence_upload AFTER INSERT ON public.dispute_evidence FOR EACH ROW EXECUTE FUNCTION public.log_dispute_evidence_upload();


--
-- Name: user_roles trg_log_user_roles_change; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_log_user_roles_change AFTER INSERT OR DELETE OR UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.log_user_roles_change();


--
-- Name: dispute_messages trg_set_msg_response_time; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_msg_response_time BEFORE INSERT ON public.dispute_messages FOR EACH ROW EXECUTE FUNCTION public.set_message_response_time();


--
-- Name: dispute_messages trg_update_dispute_activity_on_message; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_update_dispute_activity_on_message AFTER INSERT ON public.dispute_messages FOR EACH ROW EXECUTE FUNCTION public.update_dispute_last_activity();


--
-- Name: dispute_timeline trg_update_dispute_activity_on_timeline; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_update_dispute_activity_on_timeline AFTER INSERT ON public.dispute_timeline FOR EACH ROW EXECUTE FUNCTION public.update_dispute_last_activity();


--
-- Name: question_packs trg_validate_activation; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_activation BEFORE UPDATE OF is_active, status ON public.question_packs FOR EACH ROW EXECUTE FUNCTION public.validate_activation();


--
-- Name: disputes trigger_log_dispute_event; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_log_dispute_event AFTER INSERT OR UPDATE ON public.disputes FOR EACH ROW EXECUTE FUNCTION public.log_dispute_event();


--
-- Name: contracts trigger_notify_escrow_funded; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_notify_escrow_funded AFTER UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.notify_escrow_funded();


--
-- Name: escrow_milestones trigger_notify_milestone_completed; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_notify_milestone_completed AFTER UPDATE ON public.escrow_milestones FOR EACH ROW EXECUTE FUNCTION public.notify_milestone_completed();


--
-- Name: escrow_transactions trigger_notify_payment_released; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_notify_payment_released AFTER UPDATE ON public.escrow_transactions FOR EACH ROW EXECUTE FUNCTION public.notify_payment_released();


--
-- Name: contracts trigger_notify_review_request; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_notify_review_request AFTER UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.notify_review_request();


--
-- Name: escrow_milestones trigger_notify_work_verified; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_notify_work_verified AFTER UPDATE ON public.escrow_milestones FOR EACH ROW EXECUTE FUNCTION public.notify_work_verified();


--
-- Name: support_tickets trigger_set_ticket_sla; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_set_ticket_sla BEFORE INSERT ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.set_ticket_sla();


--
-- Name: notification_preferences trigger_update_notification_preferences_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences FOR EACH ROW EXECUTE FUNCTION public.update_notification_preferences_updated_at();


--
-- Name: payment_analytics_summary trigger_update_payment_analytics_summary_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_payment_analytics_summary_updated_at BEFORE UPDATE ON public.payment_analytics_summary FOR EACH ROW EXECUTE FUNCTION public.update_payment_analytics_summary_updated_at();


--
-- Name: booking_requests trigger_update_stats_on_booking; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_stats_on_booking AFTER INSERT OR DELETE OR UPDATE ON public.booking_requests FOR EACH ROW EXECUTE FUNCTION public.update_professional_stats();


--
-- Name: professional_earnings trigger_update_stats_on_earnings; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_stats_on_earnings AFTER INSERT OR DELETE OR UPDATE ON public.professional_earnings FOR EACH ROW EXECUTE FUNCTION public.update_professional_stats();


--
-- Name: professional_reviews trigger_update_stats_on_review; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_stats_on_review AFTER INSERT OR DELETE OR UPDATE ON public.professional_reviews FOR EACH ROW EXECUTE FUNCTION public.update_professional_stats();


--
-- Name: ai_automation_rules update_ai_automation_rules_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_ai_automation_rules_updated_at BEFORE UPDATE ON public.ai_automation_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ai_conversations update_ai_conversations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON public.ai_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ai_prompts update_ai_prompts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_ai_prompts_updated_at BEFORE UPDATE ON public.ai_prompts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: alert_rules update_alert_rules_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_alert_rules_updated_at BEFORE UPDATE ON public.alert_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: analytics_dashboards update_analytics_dashboards_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_analytics_dashboards_updated_at BEFORE UPDATE ON public.analytics_dashboards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: booking_requests update_booking_requests_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_booking_requests_updated_at BEFORE UPDATE ON public.booking_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: bookings update_bookings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: business_insights update_business_insights_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_business_insights_updated_at BEFORE UPDATE ON public.business_insights FOR EACH ROW EXECUTE FUNCTION public.update_realtime_updated_at();


--
-- Name: business_metrics update_business_metrics_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_business_metrics_updated_at BEFORE UPDATE ON public.business_metrics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: category_suggestions update_category_suggestions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_category_suggestions_updated_at BEFORE UPDATE ON public.category_suggestions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: change_orders update_change_orders_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_change_orders_updated_at BEFORE UPDATE ON public.change_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: client_profiles update_client_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_client_profiles_updated_at BEFORE UPDATE ON public.client_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: collaborative_sessions update_collaborative_sessions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_collaborative_sessions_updated_at BEFORE UPDATE ON public.collaborative_sessions FOR EACH ROW EXECUTE FUNCTION public.update_realtime_updated_at();


--
-- Name: contracts update_contracts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: disputes update_disputes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON public.disputes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: escrow_milestones update_escrow_milestones_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_escrow_milestones_updated_at BEFORE UPDATE ON public.escrow_milestones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: feature_flags update_feature_flags_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON public.feature_flags FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: financial_reports update_financial_reports_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_financial_reports_updated_at BEFORE UPDATE ON public.financial_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: form_sessions update_form_sessions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_form_sessions_updated_at BEFORE UPDATE ON public.form_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: review_helpful_votes update_helpful_counts; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_helpful_counts AFTER INSERT OR DELETE OR UPDATE ON public.review_helpful_votes FOR EACH ROW EXECUTE FUNCTION public.update_review_helpful_counts();


--
-- Name: invoices update_invoices_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: job_quotes update_job_quotes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_job_quotes_updated_at BEFORE UPDATE ON public.job_quotes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: job_templates update_job_templates_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_job_templates_updated_at BEFORE UPDATE ON public.job_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: jobs update_jobs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: micro_questions_snapshot update_micro_questions_snapshot_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_micro_questions_snapshot_updated_at BEFORE UPDATE ON public.micro_questions_snapshot FOR EACH ROW EXECUTE FUNCTION public.update_micro_questions_updated_at();


--
-- Name: micro_service_questions update_micro_questions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_micro_questions_updated_at BEFORE UPDATE ON public.micro_service_questions FOR EACH ROW EXECUTE FUNCTION public.update_micro_questions_updated_at();


--
-- Name: notification_preferences update_notification_preferences_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: notification_templates update_notification_templates_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON public.notification_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: offers update_offers_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON public.offers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: payment_alerts update_payment_alerts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_payment_alerts_updated_at BEFORE UPDATE ON public.payment_alerts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: payment_analytics update_payment_analytics_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_payment_analytics_updated_at BEFORE UPDATE ON public.payment_analytics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: payment_methods update_payment_methods_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON public.payment_methods FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: payment_notifications update_payment_notifications_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_payment_notifications_updated_at BEFORE UPDATE ON public.payment_notifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: payment_reconciliations update_payment_reconciliations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_payment_reconciliations_updated_at BEFORE UPDATE ON public.payment_reconciliations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: payments update_payments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: payouts update_payouts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_payouts_updated_at BEFORE UPDATE ON public.payouts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: professional_availability update_professional_availability_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_professional_availability_updated_at BEFORE UPDATE ON public.professional_availability FOR EACH ROW EXECUTE FUNCTION public.update_professional_availability_timestamp();


--
-- Name: professional_deals update_professional_deals_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_professional_deals_updated_at BEFORE UPDATE ON public.professional_deals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: professional_documents update_professional_documents_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_professional_documents_updated_at BEFORE UPDATE ON public.professional_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: professional_earnings update_professional_earnings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_professional_earnings_updated_at BEFORE UPDATE ON public.professional_earnings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: professional_portfolio update_professional_portfolio_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_professional_portfolio_updated_at BEFORE UPDATE ON public.professional_portfolio FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: professional_profiles update_professional_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_professional_profiles_updated_at BEFORE UPDATE ON public.professional_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: professional_reviews update_professional_reviews_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_professional_reviews_updated_at BEFORE UPDATE ON public.professional_reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: professional_service_items update_professional_service_items_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_professional_service_items_updated_at BEFORE UPDATE ON public.professional_service_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: professional_services update_professional_services_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_professional_services_updated_at BEFORE UPDATE ON public.professional_services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: professional_stats update_professional_stats_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_professional_stats_updated_at BEFORE UPDATE ON public.professional_stats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: professional_verifications update_professional_verifications_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_professional_verifications_updated_at BEFORE UPDATE ON public.professional_verifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: project_completions update_project_completions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_project_completions_updated_at BEFORE UPDATE ON public.project_completions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: properties update_properties_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: quote_requests update_quote_requests_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_quote_requests_updated_at BEFORE UPDATE ON public.quote_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: quotes update_quotes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: reviews update_rating_summary_on_review_change; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_rating_summary_on_review_change AFTER INSERT OR DELETE OR UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.trigger_update_rating_summary();


--
-- Name: refund_requests update_refund_requests_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_refund_requests_updated_at BEFORE UPDATE ON public.refund_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: report_templates update_report_templates_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_report_templates_updated_at BEFORE UPDATE ON public.report_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: service_categories update_service_categories_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_service_categories_updated_at BEFORE UPDATE ON public.service_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: service_micro_categories update_service_micro_categories_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_service_micro_categories_updated_at BEFORE UPDATE ON public.service_micro_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: service_options update_service_options_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_service_options_updated_at BEFORE UPDATE ON public.service_options FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: service_subcategories update_service_subcategories_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_service_subcategories_updated_at BEFORE UPDATE ON public.service_subcategories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: services_micro update_services_micro_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_services_micro_updated_at BEFORE UPDATE ON public.services_micro FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: site_settings update_site_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: smart_matches update_smart_matches_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_smart_matches_updated_at BEFORE UPDATE ON public.smart_matches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: points_transactions update_user_points_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_points_trigger AFTER INSERT ON public.points_transactions FOR EACH ROW EXECUTE FUNCTION public.update_user_points();


--
-- Name: user_presence update_user_presence_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_presence_updated_at BEFORE UPDATE ON public.user_presence FOR EACH ROW EXECUTE FUNCTION public.update_realtime_updated_at();


--
-- Name: user_points update_user_tier_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_tier_trigger AFTER UPDATE OF total_points ON public.user_points FOR EACH ROW EXECUTE FUNCTION public.update_user_tier();


--
-- Name: ux_health_checks update_ux_health_checks_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_ux_health_checks_updated_at BEFORE UPDATE ON public.ux_health_checks FOR EACH ROW EXECUTE FUNCTION public.update_realtime_updated_at();


--
-- Name: video_calls update_video_calls_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_video_calls_updated_at BEFORE UPDATE ON public.video_calls FOR EACH ROW EXECUTE FUNCTION public.update_realtime_updated_at();


--
-- Name: workflow_automations update_workflow_automations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_workflow_automations_updated_at BEFORE UPDATE ON public.workflow_automations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_activity_metrics user_activity_metrics_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER user_activity_metrics_updated_at BEFORE UPDATE ON public.user_activity_metrics FOR EACH ROW EXECUTE FUNCTION public.update_analytics_updated_at();


--
-- Name: webhook_subscriptions webhook_subscriptions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER webhook_subscriptions_updated_at BEFORE UPDATE ON public.webhook_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_webhook_subscriptions_updated_at();


--
-- Name: activity_feed activity_feed_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_feed
    ADD CONSTRAINT activity_feed_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.profiles(id);


--
-- Name: activity_feed activity_feed_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_feed
    ADD CONSTRAINT activity_feed_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: admin_audit_log admin_audit_log_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_audit_log
    ADD CONSTRAINT admin_audit_log_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES auth.users(id);


--
-- Name: admin_ip_whitelist admin_ip_whitelist_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_ip_whitelist
    ADD CONSTRAINT admin_ip_whitelist_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: admin_permissions admin_permissions_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_permissions
    ADD CONSTRAINT admin_permissions_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: admin_permissions admin_permissions_granted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_permissions
    ADD CONSTRAINT admin_permissions_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES auth.users(id);


--
-- Name: ai_alerts ai_alerts_acknowledged_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_alerts
    ADD CONSTRAINT ai_alerts_acknowledged_by_fkey FOREIGN KEY (acknowledged_by) REFERENCES auth.users(id);


--
-- Name: ai_chat_messages ai_chat_messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_chat_messages
    ADD CONSTRAINT ai_chat_messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.ai_conversations(id);


--
-- Name: ai_prompts ai_prompts_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_prompts
    ADD CONSTRAINT ai_prompts_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: ai_runs ai_runs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_runs
    ADD CONSTRAINT ai_runs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: analytics_events analytics_events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: automation_executions automation_executions_workflow_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automation_executions
    ADD CONSTRAINT automation_executions_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES public.automation_workflows(id) ON DELETE CASCADE;


--
-- Name: automation_workflows automation_workflows_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automation_workflows
    ADD CONSTRAINT automation_workflows_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: availability_presets availability_presets_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_presets
    ADD CONSTRAINT availability_presets_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- Name: blocked_dates blocked_dates_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blocked_dates
    ADD CONSTRAINT blocked_dates_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: booking_reminders booking_reminders_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_reminders
    ADD CONSTRAINT booking_reminders_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.calendar_events(id) ON DELETE CASCADE;


--
-- Name: booking_reminders booking_reminders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_reminders
    ADD CONSTRAINT booking_reminders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: booking_risk_flags booking_risk_flags_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_risk_flags
    ADD CONSTRAINT booking_risk_flags_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: booking_risk_flags booking_risk_flags_resolved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_risk_flags
    ADD CONSTRAINT booking_risk_flags_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES auth.users(id);


--
-- Name: bookings bookings_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: bookings bookings_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- Name: calculator_saved_configs calculator_saved_configs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calculator_saved_configs
    ADD CONSTRAINT calculator_saved_configs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: calculator_share_events calculator_share_events_config_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calculator_share_events
    ADD CONSTRAINT calculator_share_events_config_id_fkey FOREIGN KEY (config_id) REFERENCES public.calculator_saved_configs(id) ON DELETE CASCADE;


--
-- Name: calendar_events calendar_events_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_events
    ADD CONSTRAINT calendar_events_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: calendar_events calendar_events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_events
    ADD CONSTRAINT calendar_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: calendar_sync calendar_sync_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_sync
    ADD CONSTRAINT calendar_sync_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: category_suggestions category_suggestions_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.category_suggestions
    ADD CONSTRAINT category_suggestions_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id);


--
-- Name: category_suggestions category_suggestions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.category_suggestions
    ADD CONSTRAINT category_suggestions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: churn_predictions churn_predictions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.churn_predictions
    ADD CONSTRAINT churn_predictions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: client_logs client_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_logs
    ADD CONSTRAINT client_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: client_profiles client_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_profiles
    ADD CONSTRAINT client_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: collaborative_sessions collaborative_sessions_host_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collaborative_sessions
    ADD CONSTRAINT collaborative_sessions_host_id_fkey FOREIGN KEY (host_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: collaborative_sessions collaborative_sessions_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collaborative_sessions
    ADD CONSTRAINT collaborative_sessions_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE SET NULL;


--
-- Name: conversations conversations_contract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id) ON DELETE CASCADE;


--
-- Name: conversations conversations_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: data_deletion_requests data_deletion_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_deletion_requests
    ADD CONSTRAINT data_deletion_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: data_export_requests data_export_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_export_requests
    ADD CONSTRAINT data_export_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: data_exports data_exports_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_exports
    ADD CONSTRAINT data_exports_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: dispute_counter_proposals dispute_counter_proposals_dispute_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dispute_counter_proposals
    ADD CONSTRAINT dispute_counter_proposals_dispute_id_fkey FOREIGN KEY (dispute_id) REFERENCES public.disputes(id) ON DELETE CASCADE;


--
-- Name: dispute_counter_proposals dispute_counter_proposals_parent_resolution_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dispute_counter_proposals
    ADD CONSTRAINT dispute_counter_proposals_parent_resolution_id_fkey FOREIGN KEY (parent_resolution_id) REFERENCES public.dispute_resolutions(id) ON DELETE SET NULL;


--
-- Name: dispute_messages dispute_messages_dispute_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dispute_messages
    ADD CONSTRAINT dispute_messages_dispute_id_fkey FOREIGN KEY (dispute_id) REFERENCES public.disputes(id) ON DELETE CASCADE;


--
-- Name: dispute_messages dispute_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dispute_messages
    ADD CONSTRAINT dispute_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id);


--
-- Name: dispute_resolutions dispute_resolutions_awarded_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dispute_resolutions
    ADD CONSTRAINT dispute_resolutions_awarded_to_fkey FOREIGN KEY (awarded_to) REFERENCES auth.users(id);


--
-- Name: dispute_resolutions dispute_resolutions_dispute_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dispute_resolutions
    ADD CONSTRAINT dispute_resolutions_dispute_id_fkey FOREIGN KEY (dispute_id) REFERENCES public.disputes(id) ON DELETE CASCADE;


--
-- Name: dispute_timeline dispute_timeline_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dispute_timeline
    ADD CONSTRAINT dispute_timeline_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES auth.users(id);


--
-- Name: dispute_timeline dispute_timeline_dispute_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dispute_timeline
    ADD CONSTRAINT dispute_timeline_dispute_id_fkey FOREIGN KEY (dispute_id) REFERENCES public.disputes(id) ON DELETE CASCADE;


--
-- Name: disputes disputes_mediator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_mediator_id_fkey FOREIGN KEY (mediator_id) REFERENCES auth.users(id);


--
-- Name: document_collaborators document_collaborators_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_collaborators
    ADD CONSTRAINT document_collaborators_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.shared_documents(id) ON DELETE CASCADE;


--
-- Name: document_collaborators document_collaborators_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_collaborators
    ADD CONSTRAINT document_collaborators_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: document_edits document_edits_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_edits
    ADD CONSTRAINT document_edits_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.shared_documents(id) ON DELETE CASCADE;


--
-- Name: document_edits document_edits_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_edits
    ADD CONSTRAINT document_edits_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: dual_control_approvals dual_control_approvals_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dual_control_approvals
    ADD CONSTRAINT dual_control_approvals_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES auth.users(id);


--
-- Name: dual_control_approvals dual_control_approvals_requested_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dual_control_approvals
    ADD CONSTRAINT dual_control_approvals_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES auth.users(id);


--
-- Name: escrow_milestones escrow_milestones_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escrow_milestones
    ADD CONSTRAINT escrow_milestones_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES auth.users(id);


--
-- Name: escrow_milestones escrow_milestones_rejected_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escrow_milestones
    ADD CONSTRAINT escrow_milestones_rejected_by_fkey FOREIGN KEY (rejected_by) REFERENCES auth.users(id);


--
-- Name: escrow_milestones escrow_milestones_submitted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escrow_milestones
    ADD CONSTRAINT escrow_milestones_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES auth.users(id);


--
-- Name: escrow_payments escrow_payments_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escrow_payments
    ADD CONSTRAINT escrow_payments_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: escrow_payments escrow_payments_contract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escrow_payments
    ADD CONSTRAINT escrow_payments_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id);


--
-- Name: escrow_payments escrow_payments_milestone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escrow_payments
    ADD CONSTRAINT escrow_payments_milestone_id_fkey FOREIGN KEY (milestone_id) REFERENCES public.milestones(id);


--
-- Name: escrow_payments escrow_payments_released_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escrow_payments
    ADD CONSTRAINT escrow_payments_released_by_fkey FOREIGN KEY (released_by) REFERENCES auth.users(id);


--
-- Name: escrow_release_overrides escrow_release_overrides_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escrow_release_overrides
    ADD CONSTRAINT escrow_release_overrides_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.profiles(id);


--
-- Name: escrow_release_overrides escrow_release_overrides_milestone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escrow_release_overrides
    ADD CONSTRAINT escrow_release_overrides_milestone_id_fkey FOREIGN KEY (milestone_id) REFERENCES public.escrow_milestones(id) ON DELETE CASCADE;


--
-- Name: escrow_releases escrow_releases_milestone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escrow_releases
    ADD CONSTRAINT escrow_releases_milestone_id_fkey FOREIGN KEY (milestone_id) REFERENCES public.escrow_milestones(id) ON DELETE CASCADE;


--
-- Name: escrow_releases escrow_releases_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escrow_releases
    ADD CONSTRAINT escrow_releases_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON DELETE CASCADE;


--
-- Name: escrow_transactions escrow_transactions_initiated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escrow_transactions
    ADD CONSTRAINT escrow_transactions_initiated_by_fkey FOREIGN KEY (initiated_by) REFERENCES auth.users(id);


--
-- Name: escrow_transactions escrow_transactions_milestone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escrow_transactions
    ADD CONSTRAINT escrow_transactions_milestone_id_fkey FOREIGN KEY (milestone_id) REFERENCES public.escrow_milestones(id) ON DELETE CASCADE;


--
-- Name: escrow_transactions escrow_transactions_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escrow_transactions
    ADD CONSTRAINT escrow_transactions_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.escrow_payments(id);


--
-- Name: escrow_transfer_logs escrow_transfer_logs_milestone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escrow_transfer_logs
    ADD CONSTRAINT escrow_transfer_logs_milestone_id_fkey FOREIGN KEY (milestone_id) REFERENCES public.escrow_milestones(id);


--
-- Name: escrow_transfer_logs escrow_transfer_logs_professional_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escrow_transfer_logs
    ADD CONSTRAINT escrow_transfer_logs_professional_account_id_fkey FOREIGN KEY (professional_account_id) REFERENCES public.professional_stripe_accounts(id);


--
-- Name: feature_flag_exposures feature_flag_exposures_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feature_flag_exposures
    ADD CONSTRAINT feature_flag_exposures_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: financial_reports financial_reports_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_reports
    ADD CONSTRAINT financial_reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: form_sessions form_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_sessions
    ADD CONSTRAINT form_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: generated_reports generated_reports_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generated_reports
    ADD CONSTRAINT generated_reports_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.report_templates(id);


--
-- Name: integrations integrations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integrations
    ADD CONSTRAINT integrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: invoice_items invoice_items_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: invoice_payments invoice_payments_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_payments
    ADD CONSTRAINT invoice_payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: invoice_payments invoice_payments_payment_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_payments
    ADD CONSTRAINT invoice_payments_payment_transaction_id_fkey FOREIGN KEY (payment_transaction_id) REFERENCES public.payment_transactions(id);


--
-- Name: job_applicants job_applicants_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_applicants
    ADD CONSTRAINT job_applicants_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: job_applicants job_applicants_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_applicants
    ADD CONSTRAINT job_applicants_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: job_broadcasts job_broadcasts_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_broadcasts
    ADD CONSTRAINT job_broadcasts_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: job_lifecycle_events job_lifecycle_events_triggered_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_lifecycle_events
    ADD CONSTRAINT job_lifecycle_events_triggered_by_fkey FOREIGN KEY (triggered_by) REFERENCES auth.users(id);


--
-- Name: job_matches job_matches_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_matches
    ADD CONSTRAINT job_matches_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: job_matches job_matches_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_matches
    ADD CONSTRAINT job_matches_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: job_photos job_photos_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_photos
    ADD CONSTRAINT job_photos_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: job_presets job_presets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_presets
    ADD CONSTRAINT job_presets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: job_question_snapshot job_question_snapshot_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_question_snapshot
    ADD CONSTRAINT job_question_snapshot_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id);


--
-- Name: job_question_snapshot job_question_snapshot_pack_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_question_snapshot
    ADD CONSTRAINT job_question_snapshot_pack_id_fkey FOREIGN KEY (pack_id) REFERENCES public.question_packs(pack_id);


--
-- Name: job_quotes job_quotes_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_quotes
    ADD CONSTRAINT job_quotes_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: job_state_transitions job_state_transitions_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_state_transitions
    ADD CONSTRAINT job_state_transitions_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: job_state_transitions job_state_transitions_triggered_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_state_transitions
    ADD CONSTRAINT job_state_transitions_triggered_by_fkey FOREIGN KEY (triggered_by) REFERENCES auth.users(id);


--
-- Name: job_versions job_versions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_versions
    ADD CONSTRAINT job_versions_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: job_versions job_versions_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_versions
    ADD CONSTRAINT job_versions_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: leaderboard_entries leaderboard_entries_leaderboard_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leaderboard_entries
    ADD CONSTRAINT leaderboard_entries_leaderboard_id_fkey FOREIGN KEY (leaderboard_id) REFERENCES public.leaderboards(id) ON DELETE CASCADE;


--
-- Name: leaderboard_entries leaderboard_entries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leaderboard_entries
    ADD CONSTRAINT leaderboard_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: message_rate_limits message_rate_limits_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_rate_limits
    ADD CONSTRAINT message_rate_limits_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);


--
-- Name: message_reactions message_reactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_reactions
    ADD CONSTRAINT message_reactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: message_reports message_reports_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_reports
    ADD CONSTRAINT message_reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.profiles(id);


--
-- Name: message_reports message_reports_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_reports
    ADD CONSTRAINT message_reports_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id);


--
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: milestone_approvals milestone_approvals_approver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.milestone_approvals
    ADD CONSTRAINT milestone_approvals_approver_id_fkey FOREIGN KEY (approver_id) REFERENCES auth.users(id);


--
-- Name: milestone_approvals milestone_approvals_milestone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.milestone_approvals
    ADD CONSTRAINT milestone_approvals_milestone_id_fkey FOREIGN KEY (milestone_id) REFERENCES public.escrow_milestones(id) ON DELETE CASCADE;


--
-- Name: milestones milestones_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.milestones
    ADD CONSTRAINT milestones_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: notification_digest_queue notification_digest_queue_notification_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_digest_queue
    ADD CONSTRAINT notification_digest_queue_notification_id_fkey FOREIGN KEY (notification_id) REFERENCES public.activity_feed(id) ON DELETE CASCADE;


--
-- Name: notification_digest_queue notification_digest_queue_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_digest_queue
    ADD CONSTRAINT notification_digest_queue_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: notification_preferences notification_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: notification_queue notification_queue_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_queue
    ADD CONSTRAINT notification_queue_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: offer_negotiations offer_negotiations_offer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offer_negotiations
    ADD CONSTRAINT offer_negotiations_offer_id_fkey FOREIGN KEY (offer_id) REFERENCES public.offers(id) ON DELETE CASCADE;


--
-- Name: offer_negotiations offer_negotiations_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offer_negotiations
    ADD CONSTRAINT offer_negotiations_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id);


--
-- Name: onboarding_checklist onboarding_checklist_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_checklist
    ADD CONSTRAINT onboarding_checklist_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: onboarding_events onboarding_events_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_events
    ADD CONSTRAINT onboarding_events_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: pack_performance pack_performance_pack_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pack_performance
    ADD CONSTRAINT pack_performance_pack_id_fkey FOREIGN KEY (pack_id) REFERENCES public.question_packs(pack_id);


--
-- Name: payment_alerts payment_alerts_resolved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_alerts
    ADD CONSTRAINT payment_alerts_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES auth.users(id);


--
-- Name: payment_analytics_summary payment_analytics_summary_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_analytics_summary
    ADD CONSTRAINT payment_analytics_summary_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: payment_analytics payment_analytics_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_analytics
    ADD CONSTRAINT payment_analytics_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: payment_notifications payment_notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_notifications
    ADD CONSTRAINT payment_notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: payment_receipts payment_receipts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_receipts
    ADD CONSTRAINT payment_receipts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: payment_reconciliations payment_reconciliations_reconciled_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_reconciliations
    ADD CONSTRAINT payment_reconciliations_reconciled_by_fkey FOREIGN KEY (reconciled_by) REFERENCES auth.users(id);


--
-- Name: payment_reconciliations payment_reconciliations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_reconciliations
    ADD CONSTRAINT payment_reconciliations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: payment_reminders payment_reminders_scheduled_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_reminders
    ADD CONSTRAINT payment_reminders_scheduled_payment_id_fkey FOREIGN KEY (scheduled_payment_id) REFERENCES public.scheduled_payments(id) ON DELETE CASCADE;


--
-- Name: payment_reminders payment_reminders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_reminders
    ADD CONSTRAINT payment_reminders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: payment_schedules payment_schedules_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_schedules
    ADD CONSTRAINT payment_schedules_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: payment_schedules payment_schedules_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_schedules
    ADD CONSTRAINT payment_schedules_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: payment_transactions payment_transactions_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id);


--
-- Name: payment_transactions payment_transactions_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id);


--
-- Name: payment_transactions payment_transactions_payment_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id);


--
-- Name: payment_transactions payment_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: payments payments_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: payout_items payout_items_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payout_items
    ADD CONSTRAINT payout_items_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON DELETE CASCADE;


--
-- Name: payout_items payout_items_payout_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payout_items
    ADD CONSTRAINT payout_items_payout_id_fkey FOREIGN KEY (payout_id) REFERENCES public.payouts(id) ON DELETE CASCADE;


--
-- Name: points_transactions points_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.points_transactions
    ADD CONSTRAINT points_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: portfolio_images portfolio_images_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolio_images
    ADD CONSTRAINT portfolio_images_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: professional_applications professional_applications_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_applications
    ADD CONSTRAINT professional_applications_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: professional_applications professional_applications_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_applications
    ADD CONSTRAINT professional_applications_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: professional_availability professional_availability_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_availability
    ADD CONSTRAINT professional_availability_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: professional_badges professional_badges_professional_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_badges
    ADD CONSTRAINT professional_badges_professional_user_id_fkey FOREIGN KEY (professional_user_id) REFERENCES public.professional_profiles(user_id) ON DELETE CASCADE;


--
-- Name: professional_earnings professional_earnings_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_earnings
    ADD CONSTRAINT professional_earnings_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.booking_requests(id) ON DELETE CASCADE;


--
-- Name: professional_earnings professional_earnings_contract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_earnings
    ADD CONSTRAINT professional_earnings_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id) ON DELETE CASCADE;


--
-- Name: professional_earnings professional_earnings_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_earnings
    ADD CONSTRAINT professional_earnings_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: professional_portfolio professional_portfolio_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_portfolio
    ADD CONSTRAINT professional_portfolio_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: professional_profiles professional_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_profiles
    ADD CONSTRAINT professional_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: professional_reviews professional_reviews_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_reviews
    ADD CONSTRAINT professional_reviews_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.booking_requests(id) ON DELETE CASCADE;


--
-- Name: professional_reviews professional_reviews_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_reviews
    ADD CONSTRAINT professional_reviews_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: professional_reviews professional_reviews_contract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_reviews
    ADD CONSTRAINT professional_reviews_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id) ON DELETE SET NULL;


--
-- Name: professional_reviews professional_reviews_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_reviews
    ADD CONSTRAINT professional_reviews_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE SET NULL;


--
-- Name: professional_reviews professional_reviews_milestone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_reviews
    ADD CONSTRAINT professional_reviews_milestone_id_fkey FOREIGN KEY (milestone_id) REFERENCES public.escrow_milestones(id) ON DELETE CASCADE;


--
-- Name: professional_reviews professional_reviews_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_reviews
    ADD CONSTRAINT professional_reviews_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: professional_scores professional_scores_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_scores
    ADD CONSTRAINT professional_scores_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: professional_service_items professional_service_items_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_service_items
    ADD CONSTRAINT professional_service_items_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: professional_services professional_services_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_services
    ADD CONSTRAINT professional_services_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.professional_profiles(user_id) ON DELETE CASCADE;


--
-- Name: professional_stats professional_stats_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_stats
    ADD CONSTRAINT professional_stats_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: professional_stripe_accounts professional_stripe_accounts_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_stripe_accounts
    ADD CONSTRAINT professional_stripe_accounts_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: professional_verifications professional_verifications_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_verifications
    ADD CONSTRAINT professional_verifications_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.professional_profiles(user_id) ON DELETE CASCADE;


--
-- Name: professional_verifications professional_verifications_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_verifications
    ADD CONSTRAINT professional_verifications_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id);


--
-- Name: profile_views profile_views_viewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_views
    ADD CONSTRAINT profile_views_viewer_id_fkey FOREIGN KEY (viewer_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES auth.users(id);


--
-- Name: project_completions project_completions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_completions
    ADD CONSTRAINT project_completions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: question_metrics question_metrics_pack_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_metrics
    ADD CONSTRAINT question_metrics_pack_id_fkey FOREIGN KEY (pack_id) REFERENCES public.question_packs(pack_id);


--
-- Name: question_pack_audit question_pack_audit_actor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_pack_audit
    ADD CONSTRAINT question_pack_audit_actor_fkey FOREIGN KEY (actor) REFERENCES public.profiles(id);


--
-- Name: question_pack_audit question_pack_audit_pack_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_pack_audit
    ADD CONSTRAINT question_pack_audit_pack_id_fkey FOREIGN KEY (pack_id) REFERENCES public.question_packs(pack_id);


--
-- Name: question_packs question_packs_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_packs
    ADD CONSTRAINT question_packs_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.profiles(id);


--
-- Name: question_packs question_packs_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_packs
    ADD CONSTRAINT question_packs_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- Name: quotes quotes_quote_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_quote_request_id_fkey FOREIGN KEY (quote_request_id) REFERENCES public.quote_requests(id) ON DELETE CASCADE;


--
-- Name: rating_summary rating_summary_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rating_summary
    ADD CONSTRAINT rating_summary_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: read_receipts read_receipts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.read_receipts
    ADD CONSTRAINT read_receipts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: referral_codes referral_codes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referral_codes
    ADD CONSTRAINT referral_codes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: referrals referrals_referral_code_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_referral_code_id_fkey FOREIGN KEY (referral_code_id) REFERENCES public.referral_codes(id);


--
-- Name: referrals referrals_referred_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_referred_id_fkey FOREIGN KEY (referred_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: referrals referrals_referrer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_referrer_id_fkey FOREIGN KEY (referrer_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refund_requests refund_requests_requested_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refund_requests
    ADD CONSTRAINT refund_requests_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES auth.users(id);


--
-- Name: refund_requests refund_requests_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refund_requests
    ADD CONSTRAINT refund_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id);


--
-- Name: refunds refunds_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON DELETE CASCADE;


--
-- Name: report_exports report_exports_requested_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_exports
    ADD CONSTRAINT report_exports_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES auth.users(id);


--
-- Name: report_schedules report_schedules_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_schedules
    ADD CONSTRAINT report_schedules_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: resolution_enforcement_log resolution_enforcement_log_dispute_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resolution_enforcement_log
    ADD CONSTRAINT resolution_enforcement_log_dispute_id_fkey FOREIGN KEY (dispute_id) REFERENCES public.disputes(id) ON DELETE CASCADE;


--
-- Name: resolution_enforcement_log resolution_enforcement_log_resolution_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resolution_enforcement_log
    ADD CONSTRAINT resolution_enforcement_log_resolution_id_fkey FOREIGN KEY (resolution_id) REFERENCES public.dispute_resolutions(id) ON DELETE CASCADE;


--
-- Name: review_flags review_flags_flagged_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_flags
    ADD CONSTRAINT review_flags_flagged_by_fkey FOREIGN KEY (flagged_by) REFERENCES auth.users(id);


--
-- Name: review_flags review_flags_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_flags
    ADD CONSTRAINT review_flags_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id);


--
-- Name: review_helpful_votes review_helpful_votes_review_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_helpful_votes
    ADD CONSTRAINT review_helpful_votes_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.reviews(id) ON DELETE CASCADE;


--
-- Name: review_helpful_votes review_helpful_votes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_helpful_votes
    ADD CONSTRAINT review_helpful_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: review_helpfulness review_helpfulness_review_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_helpfulness
    ADD CONSTRAINT review_helpfulness_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.reviews(id) ON DELETE CASCADE;


--
-- Name: review_helpfulness review_helpfulness_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_helpfulness
    ADD CONSTRAINT review_helpfulness_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: review_media review_media_review_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_media
    ADD CONSTRAINT review_media_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.reviews(id) ON DELETE CASCADE;


--
-- Name: review_reports review_reports_reported_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_reports
    ADD CONSTRAINT review_reports_reported_by_fkey FOREIGN KEY (reported_by) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: review_reports review_reports_review_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_reports
    ADD CONSTRAINT review_reports_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.reviews(id) ON DELETE CASCADE;


--
-- Name: review_reports review_reports_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_reports
    ADD CONSTRAINT review_reports_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id);


--
-- Name: review_responses review_responses_responder_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_responses
    ADD CONSTRAINT review_responses_responder_id_fkey FOREIGN KEY (responder_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: review_responses review_responses_review_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_responses
    ADD CONSTRAINT review_responses_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.reviews(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_contract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id) ON DELETE SET NULL;


--
-- Name: reviews reviews_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_moderated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_moderated_by_fkey FOREIGN KEY (moderated_by) REFERENCES auth.users(id);


--
-- Name: reviews reviews_reviewee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_reviewee_id_fkey FOREIGN KEY (reviewee_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: saved_reports saved_reports_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_reports
    ADD CONSTRAINT saved_reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: saved_searches saved_searches_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_searches
    ADD CONSTRAINT saved_searches_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: scheduled_payments scheduled_payments_payment_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scheduled_payments
    ADD CONSTRAINT scheduled_payments_payment_transaction_id_fkey FOREIGN KEY (payment_transaction_id) REFERENCES public.payment_transactions(id);


--
-- Name: scheduled_payments scheduled_payments_schedule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scheduled_payments
    ADD CONSTRAINT scheduled_payments_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES public.payment_schedules(id) ON DELETE CASCADE;


--
-- Name: search_history search_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.search_history
    ADD CONSTRAINT search_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: service_micro_categories service_micro_categories_subcategory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_micro_categories
    ADD CONSTRAINT service_micro_categories_subcategory_id_fkey FOREIGN KEY (subcategory_id) REFERENCES public.service_subcategories(id) ON DELETE CASCADE;


--
-- Name: service_questions service_questions_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_questions
    ADD CONSTRAINT service_questions_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: service_subcategories service_subcategories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_subcategories
    ADD CONSTRAINT service_subcategories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.service_categories(id) ON DELETE CASCADE;


--
-- Name: services_micro services_micro_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services_micro
    ADD CONSTRAINT services_micro_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id);


--
-- Name: services_micro_versions services_micro_versions_actor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services_micro_versions
    ADD CONSTRAINT services_micro_versions_actor_fkey FOREIGN KEY (actor) REFERENCES auth.users(id);


--
-- Name: shared_documents shared_documents_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shared_documents
    ADD CONSTRAINT shared_documents_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- Name: shared_documents shared_documents_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shared_documents
    ADD CONSTRAINT shared_documents_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: shared_documents shared_documents_last_edited_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shared_documents
    ADD CONSTRAINT shared_documents_last_edited_by_fkey FOREIGN KEY (last_edited_by) REFERENCES public.profiles(id);


--
-- Name: site_settings site_settings_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id);


--
-- Name: spam_keywords spam_keywords_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spam_keywords
    ADD CONSTRAINT spam_keywords_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- Name: support_tickets support_tickets_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES auth.users(id);


--
-- Name: support_tickets support_tickets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: system_activity_log system_activity_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_activity_log
    ADD CONSTRAINT system_activity_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: ticket_attachments ticket_attachments_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_attachments
    ADD CONSTRAINT ticket_attachments_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.ticket_messages(id) ON DELETE CASCADE;


--
-- Name: ticket_attachments ticket_attachments_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_attachments
    ADD CONSTRAINT ticket_attachments_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.support_tickets(id) ON DELETE CASCADE;


--
-- Name: ticket_attachments ticket_attachments_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_attachments
    ADD CONSTRAINT ticket_attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES auth.users(id);


--
-- Name: ticket_messages ticket_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_messages
    ADD CONSTRAINT ticket_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id);


--
-- Name: ticket_messages ticket_messages_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_messages
    ADD CONSTRAINT ticket_messages_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.support_tickets(id) ON DELETE CASCADE;


--
-- Name: transaction_notes transaction_notes_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_notes
    ADD CONSTRAINT transaction_notes_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.payment_transactions(id);


--
-- Name: transaction_notes transaction_notes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_notes
    ADD CONSTRAINT transaction_notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: two_factor_auth two_factor_auth_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.two_factor_auth
    ADD CONSTRAINT two_factor_auth_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: typing_indicators typing_indicators_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.typing_indicators
    ADD CONSTRAINT typing_indicators_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_achievements user_achievements_achievement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_achievement_id_fkey FOREIGN KEY (achievement_id) REFERENCES public.achievements(id) ON DELETE CASCADE;


--
-- Name: user_achievements user_achievements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_activity_metrics user_activity_metrics_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_activity_metrics
    ADD CONSTRAINT user_activity_metrics_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_badges user_badges_badge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_badge_id_fkey FOREIGN KEY (badge_id) REFERENCES public.badges(id) ON DELETE CASCADE;


--
-- Name: user_badges user_badges_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_blocks user_blocks_blocked_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_blocks
    ADD CONSTRAINT user_blocks_blocked_id_fkey FOREIGN KEY (blocked_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: user_blocks user_blocks_blocker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_blocks
    ADD CONSTRAINT user_blocks_blocker_id_fkey FOREIGN KEY (blocker_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: user_devices user_devices_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_devices
    ADD CONSTRAINT user_devices_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_feedback user_feedback_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_feedback
    ADD CONSTRAINT user_feedback_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id);


--
-- Name: user_feedback user_feedback_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_feedback
    ADD CONSTRAINT user_feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: user_points user_points_tier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_points
    ADD CONSTRAINT user_points_tier_id_fkey FOREIGN KEY (tier_id) REFERENCES public.loyalty_tiers(id);


--
-- Name: user_points user_points_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_points
    ADD CONSTRAINT user_points_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_presence user_presence_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_presence
    ADD CONSTRAINT user_presence_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_sessions user_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: ux_health_checks ux_health_checks_resolved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ux_health_checks
    ADD CONSTRAINT ux_health_checks_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES auth.users(id);


--
-- Name: video_calls video_calls_initiated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_calls
    ADD CONSTRAINT video_calls_initiated_by_fkey FOREIGN KEY (initiated_by) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: webhook_deliveries webhook_deliveries_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhook_deliveries
    ADD CONSTRAINT webhook_deliveries_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.webhook_subscriptions(id) ON DELETE CASCADE;


--
-- Name: webhook_endpoints webhook_endpoints_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhook_endpoints
    ADD CONSTRAINT webhook_endpoints_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: webhook_subscriptions webhook_subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhook_subscriptions
    ADD CONSTRAINT webhook_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: ai_prompts AI prompts are readable by authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "AI prompts are readable by authenticated users" ON public.ai_prompts FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: dual_control_approvals Admins can approve dual control requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can approve dual control requests" ON public.dual_control_approvals FOR UPDATE USING ((public.has_role(auth.uid(), 'admin'::public.app_role) AND (auth.uid() <> requested_by)));


--
-- Name: dual_control_approvals Admins can create dual control requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can create dual control requests" ON public.dual_control_approvals FOR INSERT WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) AND (auth.uid() = requested_by)));


--
-- Name: job_versions Admins can create job versions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can create job versions" ON public.job_versions FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: job_versions Admins can create versions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can create versions" ON public.job_versions FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: shared_documents Admins can delete documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete documents" ON public.shared_documents FOR DELETE USING (((id IN ( SELECT document_collaborators.document_id
   FROM public.document_collaborators
  WHERE ((document_collaborators.user_id = auth.uid()) AND (document_collaborators.permission = 'admin'::text)))) OR (created_by = auth.uid())));


--
-- Name: admin_permissions Admins can grant permissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can grant permissions" ON public.admin_permissions FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: job_lifecycle_events Admins can insert job lifecycle events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert job lifecycle events" ON public.job_lifecycle_events FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: ai_alerts Admins can manage AI alerts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage AI alerts" ON public.ai_alerts USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: ai_prompts Admins can manage AI prompts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage AI prompts" ON public.ai_prompts USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: ai_runs Admins can manage AI runs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage AI runs" ON public.ai_runs USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: admin_ip_whitelist Admins can manage IP whitelist; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage IP whitelist" ON public.admin_ip_whitelist USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: achievements Admins can manage achievements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage achievements" ON public.achievements USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: alert_rules Admins can manage alert rules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage alert rules" ON public.alert_rules USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: payment_schedules Admins can manage all payment schedules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all payment schedules" ON public.payment_schedules USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: review_reports Admins can manage all reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all reports" ON public.review_reports USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: reviews Admins can manage all reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all reviews" ON public.reviews USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can manage all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all roles" ON public.user_roles TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: report_schedules Admins can manage all schedules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all schedules" ON public.report_schedules USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: ai_automation_rules Admins can manage automation rules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage automation rules" ON public.ai_automation_rules USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: automation_workflows Admins can manage automation workflows; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage automation workflows" ON public.automation_workflows TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: badges Admins can manage badges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage badges" ON public.badges USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: data_breach_incidents Admins can manage breach incidents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage breach incidents" ON public.data_breach_incidents USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: business_metrics Admins can manage business metrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage business metrics" ON public.business_metrics USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: compliance_reports Admins can manage compliance reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage compliance reports" ON public.compliance_reports USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: dispute_messages Admins can manage dispute messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage dispute messages" ON public.dispute_messages USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: admin_events Admins can manage events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage events" ON public.admin_events USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: report_exports Admins can manage exports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage exports" ON public.report_exports USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: compliance_frameworks Admins can manage frameworks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage frameworks" ON public.compliance_frameworks USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: generated_reports Admins can manage generated reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage generated reports" ON public.generated_reports USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: job_broadcasts Admins can manage job broadcasts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage job broadcasts" ON public.job_broadcasts USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: leaderboards Admins can manage leaderboards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage leaderboards" ON public.leaderboards USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: loyalty_tiers Admins can manage loyalty tiers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage loyalty tiers" ON public.loyalty_tiers USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: pack_performance Admins can manage pack performance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage pack performance" ON public.pack_performance TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: performance_metrics Admins can manage performance metrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage performance metrics" ON public.performance_metrics TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: predictive_insights Admins can manage predictive insights; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage predictive insights" ON public.predictive_insights TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: project_completions Admins can manage project completions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage project completions" ON public.project_completions USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));


--
-- Name: question_metrics Admins can manage question metrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage question metrics" ON public.question_metrics USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: question_pack_audit Admins can manage question pack audit; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage question pack audit" ON public.question_pack_audit TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: question_packs Admins can manage question packs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage question packs" ON public.question_packs TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: micro_service_questions Admins can manage questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage questions" ON public.micro_service_questions USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: escrow_release_overrides Admins can manage release overrides; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage release overrides" ON public.escrow_release_overrides USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: report_templates Admins can manage report templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage report templates" ON public.report_templates TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: message_reports Admins can manage reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage reports" ON public.message_reports USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: dispute_resolutions Admins can manage resolutions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage resolutions" ON public.dispute_resolutions USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: security_events Admins can manage security events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage security events" ON public.security_events USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: services_unified Admins can manage services; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage services" ON public.services_unified USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: site_settings Admins can manage site settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage site settings" ON public.site_settings USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: system_activity_log Admins can manage system activity log; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage system activity log" ON public.system_activity_log TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can manage user_roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage user_roles" ON public.user_roles USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: workflow_automations Admins can manage workflow automations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage workflow automations" ON public.workflow_automations USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: booking_risk_flags Admins can resolve booking risk flags; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can resolve booking risk flags" ON public.booking_risk_flags FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: admin_permissions Admins can revoke permissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can revoke permissions" ON public.admin_permissions FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: ux_health_checks Admins can update UX health checks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update UX health checks" ON public.ux_health_checks FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: profiles Admins can update all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (((auth.uid() = id) OR public.is_admin_user()));


--
-- Name: disputes Admins can update disputes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update disputes" ON public.disputes FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: review_flags Admins can update flags; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update flags" ON public.review_flags FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: refund_requests Admins can update refund requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update refund requests" ON public.refund_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: support_tickets Admins can update tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update tickets" ON public.support_tickets FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: payment_transactions Admins can update transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update transactions" ON public.payment_transactions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: professional_verifications Admins can update verifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update verifications" ON public.professional_verifications FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: ux_health_checks Admins can view all UX health checks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all UX health checks" ON public.ux_health_checks FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: analytics_events Admins can view all analytics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all analytics" ON public.analytics_events FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: analytics_snapshots Admins can view all analytics snapshots; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all analytics snapshots" ON public.analytics_snapshots FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_compliance_status Admins can view all compliance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all compliance" ON public.user_compliance_status FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: disputes Admins can view all disputes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all disputes" ON public.disputes FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: analytics_events Admins can view all events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all events" ON public.analytics_events FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: data_exports Admins can view all exports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all exports" ON public.data_exports FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: review_flags Admins can view all flags; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all flags" ON public.review_flags FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: job_lifecycle_events Admins can view all job lifecycle events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all job lifecycle events" ON public.job_lifecycle_events FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_activity_metrics Admins can view all metrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all metrics" ON public.user_activity_metrics USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: payment_notifications Admins can view all notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all notifications" ON public.payment_notifications FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: admin_permissions Admins can view all permissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all permissions" ON public.admin_permissions FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: profile_views Admins can view all profile views; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all profile views" ON public.profile_views FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: profiles Admins can view all profiles via function; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all profiles via function" ON public.profiles FOR SELECT USING (((auth.uid() = id) OR public.is_admin_user()));


--
-- Name: refund_requests Admins can view all refund requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all refund requests" ON public.refund_requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: saved_reports Admins can view all reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all reports" ON public.saved_reports FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: payment_transactions Admins can view all transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all transactions" ON public.payment_transactions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: points_transactions Admins can view all transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all transactions" ON public.points_transactions FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: professional_verifications Admins can view all verifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all verifications" ON public.professional_verifications FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles_audit_log Admins can view audit log; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view audit log" ON public.user_roles_audit_log FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: admin_audit_log Admins can view audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view audit logs" ON public.admin_audit_log FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: security_audit_log Admins can view audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view audit logs" ON public.security_audit_log FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: automation_executions Admins can view automation executions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view automation executions" ON public.automation_executions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: booking_risk_flags Admins can view booking risk flags; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view booking risk flags" ON public.booking_risk_flags FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: kpi_cache Admins can view cache; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view cache" ON public.kpi_cache FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: churn_predictions Admins can view churn predictions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view churn predictions" ON public.churn_predictions USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_cohorts Admins can view cohorts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view cohorts" ON public.user_cohorts FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: dual_control_approvals Admins can view dual control approvals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view dual control approvals" ON public.dual_control_approvals FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: feature_flag_exposures Admins can view flag exposures; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view flag exposures" ON public.feature_flag_exposures FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: revenue_forecasts Admins can view forecasts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view forecasts" ON public.revenue_forecasts USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: fraud_patterns Admins can view fraud patterns; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view fraud patterns" ON public.fraud_patterns FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: funnel_analytics Admins can view funnels; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view funnels" ON public.funnel_analytics FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: system_health_metrics Admins can view health metrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view health metrics" ON public.system_health_metrics FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: platform_metrics Admins can view platform metrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view platform metrics" ON public.platform_metrics FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: query_performance_log Admins can view query performance logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view query performance logs" ON public.query_performance_log FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: revenue_analytics Admins can view revenue analytics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view revenue analytics" ON public.revenue_analytics FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: search_analytics Admins can view search analytics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view search analytics" ON public.search_analytics FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: job_state_transitions Admins can view state transitions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view state transitions" ON public.job_state_transitions FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: system_metrics Admins can view system metrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view system metrics" ON public.system_metrics FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: spam_keywords Admins manage spam keywords; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage spam keywords" ON public.spam_keywords USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: redirect_analytics Allow authenticated read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow authenticated read" ON public.redirect_analytics FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: services_unified Allow public read access to services; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to services" ON public.services_unified FOR SELECT USING (true);


--
-- Name: achievements Anyone can view active achievements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active achievements" ON public.achievements FOR SELECT USING ((is_active = true));


--
-- Name: badges Anyone can view active badges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active badges" ON public.badges FOR SELECT USING ((is_active = true));


--
-- Name: professional_badges Anyone can view active badges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active badges" ON public.professional_badges FOR SELECT USING ((is_active = true));


--
-- Name: service_categories Anyone can view active categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active categories" ON public.service_categories FOR SELECT USING ((is_active = true));


--
-- Name: compliance_frameworks Anyone can view active frameworks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active frameworks" ON public.compliance_frameworks FOR SELECT USING ((is_active = true));


--
-- Name: leaderboards Anyone can view active leaderboards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active leaderboards" ON public.leaderboards FOR SELECT USING ((is_active = true));


--
-- Name: service_micro_categories Anyone can view active micro categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active micro categories" ON public.service_micro_categories FOR SELECT USING ((is_active = true));


--
-- Name: professional_profiles Anyone can view active professional profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active professional profiles" ON public.professional_profiles FOR SELECT USING ((is_active = true));


--
-- Name: professional_services Anyone can view active services; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active services" ON public.professional_services FOR SELECT USING ((is_active = true));


--
-- Name: service_subcategories Anyone can view active subcategories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active subcategories" ON public.service_subcategories FOR SELECT USING ((is_active = true));


--
-- Name: blocked_dates Anyone can view blocked dates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view blocked dates" ON public.blocked_dates FOR SELECT USING (true);


--
-- Name: review_helpfulness Anyone can view helpfulness counts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view helpfulness counts" ON public.review_helpfulness FOR SELECT USING (true);


--
-- Name: job_photos Anyone can view job photos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view job photos" ON public.job_photos FOR SELECT USING (true);


--
-- Name: leaderboard_entries Anyone can view leaderboard entries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view leaderboard entries" ON public.leaderboard_entries FOR SELECT USING (true);


--
-- Name: loyalty_tiers Anyone can view loyalty tiers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view loyalty tiers" ON public.loyalty_tiers FOR SELECT USING (true);


--
-- Name: micro_service_questions Anyone can view micro service questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view micro service questions" ON public.micro_service_questions FOR SELECT USING (true);


--
-- Name: jobs Anyone can view open jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view open jobs" ON public.jobs FOR SELECT TO authenticated USING (((status = 'open'::text) OR (auth.uid() = client_id)));


--
-- Name: popular_searches Anyone can view popular searches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view popular searches" ON public.popular_searches FOR SELECT USING (true);


--
-- Name: portfolio_images Anyone can view portfolio images; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view portfolio images" ON public.portfolio_images FOR SELECT USING (true);


--
-- Name: portfolio_images Anyone can view portfolios; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view portfolios" ON public.portfolio_images FOR SELECT USING (true);


--
-- Name: user_presence Anyone can view presence; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view presence" ON public.user_presence FOR SELECT TO authenticated USING (true);


--
-- Name: professional_stats Anyone can view professional stats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view professional stats" ON public.professional_stats FOR SELECT USING (true);


--
-- Name: saved_reports Anyone can view public reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view public reports" ON public.saved_reports FOR SELECT USING ((is_public = true));


--
-- Name: professional_reviews Anyone can view reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view reviews" ON public.professional_reviews FOR SELECT USING (true);


--
-- Name: ai_risk_flags Anyone can view risk flags; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view risk flags" ON public.ai_risk_flags FOR SELECT USING (true);


--
-- Name: services_unified Anyone can view services; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view services" ON public.services_unified FOR SELECT USING (true);


--
-- Name: availability_presets Anyone can view system presets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view system presets" ON public.availability_presets FOR SELECT USING ((is_system = true));


--
-- Name: calendar_events Attendees can view events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Attendees can view events" ON public.calendar_events FOR SELECT USING ((auth.uid() = ANY (attendees)));


--
-- Name: redirect_analytics Authenticated users can insert redirects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert redirects" ON public.redirect_analytics FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: redirect_analytics Authenticated users can update redirects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update redirects" ON public.redirect_analytics FOR UPDATE TO authenticated USING (true);


--
-- Name: question_packs Authenticated users can view active approved packs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view active approved packs" ON public.question_packs FOR SELECT USING (((auth.role() = 'authenticated'::text) AND (status = 'approved'::public.pack_status) AND (is_active = true)));


--
-- Name: admin_alerts Authenticated users can view alerts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view alerts" ON public.admin_alerts FOR SELECT USING ((auth.uid() IS NOT NULL));


--
-- Name: profiles Authenticated users can view own or active professional profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view own or active professional profile" ON public.profiles FOR SELECT TO authenticated USING (((auth.uid() = id) OR public.has_role(auth.uid(), 'admin'::public.app_role) OR (EXISTS ( SELECT 1
   FROM public.professional_profiles pp
  WHERE ((pp.user_id = profiles.id) AND (pp.is_active = true) AND (pp.verification_status = 'verified'::text))))));


--
-- Name: pricing_hints Authenticated users can view pricing hints; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view pricing hints" ON public.pricing_hints FOR SELECT TO authenticated USING (true);


--
-- Name: professional_service_items Authenticated users can view service items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view service items" ON public.professional_service_items FOR SELECT TO authenticated USING (true);


--
-- Name: services_micro Authenticated users can view services; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view services" ON public.services_micro FOR SELECT TO authenticated USING (true);


--
-- Name: active_sessions Backend can insert sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Backend can insert sessions" ON public.active_sessions FOR INSERT TO service_role WITH CHECK (true);


--
-- Name: active_sessions Backend can update sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Backend can update sessions" ON public.active_sessions FOR UPDATE TO service_role USING (true) WITH CHECK (true);


--
-- Name: booking_requests Clients can create booking requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients can create booking requests" ON public.booking_requests FOR INSERT WITH CHECK ((auth.uid() = client_id));


--
-- Name: jobs Clients can create jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients can create jobs" ON public.jobs FOR INSERT WITH CHECK ((auth.uid() = client_id));


--
-- Name: professional_reviews Clients can create reviews for their bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients can create reviews for their bookings" ON public.professional_reviews FOR INSERT WITH CHECK (((auth.uid() = client_id) AND (booking_id IN ( SELECT booking_requests.id
   FROM public.booking_requests
  WHERE (booking_requests.client_id = auth.uid())))));


--
-- Name: refunds Clients can request refunds; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients can request refunds" ON public.refunds FOR INSERT WITH CHECK (((auth.uid() = requested_by) AND (payment_id IN ( SELECT payments.id
   FROM public.payments
  WHERE (payments.client_id = auth.uid())))));


--
-- Name: job_quotes Clients can update quote status; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients can update quote status" ON public.job_quotes FOR UPDATE TO authenticated USING ((job_id IN ( SELECT jobs.id
   FROM public.jobs
  WHERE (jobs.client_id = auth.uid())))) WITH CHECK ((job_id IN ( SELECT jobs.id
   FROM public.jobs
  WHERE (jobs.client_id = auth.uid()))));


--
-- Name: jobs Clients can update their jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients can update their jobs" ON public.jobs FOR UPDATE USING ((auth.uid() = client_id));


--
-- Name: job_quotes Clients can view quotes for their jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients can view quotes for their jobs" ON public.job_quotes FOR SELECT TO authenticated USING ((job_id IN ( SELECT jobs.id
   FROM public.jobs
  WHERE (jobs.client_id = auth.uid()))));


--
-- Name: milestone_approvals Contract parties can create approvals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Contract parties can create approvals" ON public.milestone_approvals FOR INSERT WITH CHECK ((milestone_id IN ( SELECT em.id
   FROM (public.escrow_milestones em
     JOIN public.contracts c ON ((c.id = em.contract_id)))
  WHERE ((c.client_id = auth.uid()) OR (c.tasker_id = auth.uid())))));


--
-- Name: escrow_transactions Contract parties can create transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Contract parties can create transactions" ON public.escrow_transactions FOR INSERT WITH CHECK ((milestone_id IN ( SELECT em.id
   FROM (public.escrow_milestones em
     JOIN public.contracts c ON ((c.id = em.contract_id)))
  WHERE ((c.client_id = auth.uid()) OR (c.tasker_id = auth.uid())))));


--
-- Name: escrow_milestones Contract parties can update milestones; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Contract parties can update milestones" ON public.escrow_milestones FOR UPDATE USING ((contract_id IN ( SELECT contracts.id
   FROM public.contracts
  WHERE ((contracts.client_id = auth.uid()) OR (contracts.tasker_id = auth.uid())))));


--
-- Name: message_threads Conversation participants can manage threads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Conversation participants can manage threads" ON public.message_threads TO authenticated USING ((parent_message_id IN ( SELECT m.id
   FROM (public.messages m
     JOIN public.conversations c ON ((c.id = m.conversation_id)))
  WHERE ((auth.uid() = c.participant_1_id) OR (auth.uid() = c.participant_2_id))))) WITH CHECK ((parent_message_id IN ( SELECT m.id
   FROM (public.messages m
     JOIN public.conversations c ON ((c.id = m.conversation_id)))
  WHERE ((auth.uid() = c.participant_1_id) OR (auth.uid() = c.participant_2_id)))));


--
-- Name: dispute_messages Dispute parties can send messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Dispute parties can send messages" ON public.dispute_messages FOR INSERT WITH CHECK (((sender_id = auth.uid()) AND (dispute_id IN ( SELECT disputes.id
   FROM public.disputes
  WHERE ((disputes.created_by = auth.uid()) OR (disputes.disputed_against = auth.uid()))))));


--
-- Name: dispute_messages Dispute parties can view messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Dispute parties can view messages" ON public.dispute_messages FOR SELECT USING (((dispute_id IN ( SELECT disputes.id
   FROM public.disputes
  WHERE ((disputes.created_by = auth.uid()) OR (disputes.disputed_against = auth.uid())))) OR (is_internal = false)));


--
-- Name: dispute_resolutions Dispute parties can view resolutions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Dispute parties can view resolutions" ON public.dispute_resolutions FOR SELECT USING ((dispute_id IN ( SELECT disputes.id
   FROM public.disputes
  WHERE ((disputes.created_by = auth.uid()) OR (disputes.disputed_against = auth.uid())))));


--
-- Name: dispute_timeline Dispute parties can view timeline; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Dispute parties can view timeline" ON public.dispute_timeline FOR SELECT USING ((dispute_id IN ( SELECT disputes.id
   FROM public.disputes
  WHERE ((disputes.created_by = auth.uid()) OR (disputes.disputed_against = auth.uid()) OR (disputes.resolved_by = auth.uid())))));


--
-- Name: document_collaborators Document creators can manage collaborators; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Document creators can manage collaborators" ON public.document_collaborators USING ((document_id IN ( SELECT shared_documents.id
   FROM public.shared_documents
  WHERE (shared_documents.created_by = auth.uid()))));


--
-- Name: shared_documents Editors and admins can update documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Editors and admins can update documents" ON public.shared_documents FOR UPDATE USING (((id IN ( SELECT document_collaborators.document_id
   FROM public.document_collaborators
  WHERE ((document_collaborators.user_id = auth.uid()) AND (document_collaborators.permission = ANY (ARRAY['edit'::text, 'admin'::text]))))) OR (created_by = auth.uid())));


--
-- Name: exchange_rates Exchange rates are publicly readable; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Exchange rates are publicly readable" ON public.exchange_rates FOR SELECT USING (true);


--
-- Name: feature_flags Feature flags are publicly readable; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Feature flags are publicly readable" ON public.feature_flags FOR SELECT USING (true);


--
-- Name: collaborative_sessions Hosts can create sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Hosts can create sessions" ON public.collaborative_sessions FOR INSERT TO authenticated WITH CHECK ((auth.uid() = host_id));


--
-- Name: job_versions Job owners and admins can view versions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Job owners and admins can view versions" ON public.job_versions FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.jobs
  WHERE ((jobs.id = job_versions.job_id) AND (jobs.client_id = auth.uid())))) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: job_applicants Job owners and applicants can update status; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Job owners and applicants can update status" ON public.job_applicants FOR UPDATE USING (((auth.uid() = professional_id) OR (auth.uid() IN ( SELECT jobs.client_id
   FROM public.jobs
  WHERE (jobs.id = job_applicants.job_id)))));


--
-- Name: job_applicants Job owners and applicants can view applicants; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Job owners and applicants can view applicants" ON public.job_applicants FOR SELECT USING (((auth.uid() = professional_id) OR (auth.uid() IN ( SELECT jobs.client_id
   FROM public.jobs
  WHERE (jobs.id = job_applicants.job_id)))));


--
-- Name: job_photos Job participants can upload photos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Job participants can upload photos" ON public.job_photos FOR INSERT WITH CHECK ((auth.uid() = uploaded_by));


--
-- Name: job_photos Job participants can view job photos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Job participants can view job photos" ON public.job_photos FOR SELECT USING (((uploaded_by = auth.uid()) OR (job_id IN ( SELECT jobs.id
   FROM public.jobs
  WHERE (jobs.client_id = auth.uid())))));


--
-- Name: professional_profiles Limited professional profile access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Limited professional profile access" ON public.professional_profiles FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::public.app_role) OR ((is_active = true) AND (verification_status = 'verified'::text))));


--
-- Name: offer_negotiations Offer parties can create negotiations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Offer parties can create negotiations" ON public.offer_negotiations FOR INSERT WITH CHECK ((auth.uid() = sender_id));


--
-- Name: offer_negotiations Offer parties can view negotiations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Offer parties can view negotiations" ON public.offer_negotiations FOR SELECT USING (((auth.uid() IN ( SELECT jobs.client_id
   FROM public.jobs
  WHERE (jobs.id IN ( SELECT offers.job_id
           FROM public.offers
          WHERE (offers.id = offer_negotiations.offer_id))))) OR (auth.uid() IN ( SELECT offers.tasker_id
   FROM public.offers
  WHERE (offers.id = offer_negotiations.offer_id)))));


--
-- Name: professional_stats Only owner can insert stats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only owner can insert stats" ON public.professional_stats FOR INSERT TO authenticated WITH CHECK ((professional_id = auth.uid()));


--
-- Name: professional_stats Owner and admins only for professional stats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner and admins only for professional stats" ON public.professional_stats FOR SELECT TO authenticated USING (((professional_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: professional_stats Owner can update own stats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can update own stats" ON public.professional_stats FOR UPDATE TO authenticated USING ((professional_id = auth.uid())) WITH CHECK ((professional_id = auth.uid()));


--
-- Name: video_calls Participants can update calls; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Participants can update calls" ON public.video_calls FOR UPDATE TO authenticated USING (((auth.uid() = ANY (participants)) OR (auth.uid() = initiated_by)));


--
-- Name: collaborative_sessions Participants can update sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Participants can update sessions" ON public.collaborative_sessions FOR UPDATE TO authenticated USING (((auth.uid() = ANY (participants)) OR (auth.uid() = host_id)));


--
-- Name: collaborative_sessions Participants can view sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Participants can view sessions" ON public.collaborative_sessions FOR SELECT TO authenticated USING (((auth.uid() = ANY (participants)) OR (auth.uid() = host_id)));


--
-- Name: video_calls Participants can view their calls; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Participants can view their calls" ON public.video_calls FOR SELECT TO authenticated USING (((auth.uid() = ANY (participants)) OR (auth.uid() = initiated_by)));


--
-- Name: professional_deals Professional deals are publicly readable; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professional deals are publicly readable" ON public.professional_deals FOR SELECT USING (true);


--
-- Name: job_applicants Professionals can apply to jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals can apply to jobs" ON public.job_applicants FOR INSERT WITH CHECK ((auth.uid() = professional_id));


--
-- Name: quote_requests Professionals can create quote requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals can create quote requests" ON public.quote_requests FOR INSERT WITH CHECK ((auth.uid() = professional_id));


--
-- Name: professional_portfolio Professionals can create their own portfolio items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals can create their own portfolio items" ON public.professional_portfolio FOR INSERT WITH CHECK ((auth.uid() = professional_id));


--
-- Name: professional_profiles Professionals can create their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals can create their own profile" ON public.professional_profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: professional_portfolio Professionals can delete their own portfolio items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals can delete their own portfolio items" ON public.professional_portfolio FOR DELETE USING ((auth.uid() = professional_id));


--
-- Name: professional_applications Professionals can insert applications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals can insert applications" ON public.professional_applications FOR INSERT WITH CHECK ((auth.uid() = professional_id));


--
-- Name: professional_documents Professionals can insert their own documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals can insert their own documents" ON public.professional_documents FOR INSERT WITH CHECK ((auth.uid() = professional_id));


--
-- Name: blocked_dates Professionals can manage blocked dates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals can manage blocked dates" ON public.blocked_dates USING ((auth.uid() = professional_id));


--
-- Name: professional_badges Professionals can manage own badges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals can manage own badges" ON public.professional_badges USING ((professional_user_id = auth.uid()));


--
-- Name: professional_availability Professionals can manage their own availability; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals can manage their own availability" ON public.professional_availability USING ((auth.uid() = professional_id)) WITH CHECK ((auth.uid() = professional_id));


--
-- Name: professional_deals Professionals can manage their own deals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals can manage their own deals" ON public.professional_deals USING ((auth.uid() = professional_id));


--
-- Name: quotes Professionals can manage their own quotes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals can manage their own quotes" ON public.quotes USING ((auth.uid() IN ( SELECT quote_requests.professional_id
   FROM public.quote_requests
  WHERE (quote_requests.id = quotes.quote_request_id))));


--
-- Name: professional_service_items Professionals can manage their own service items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals can manage their own service items" ON public.professional_service_items USING ((auth.uid() = professional_id));


--
-- Name: professional_services Professionals can manage their own services; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals can manage their own services" ON public.professional_services USING ((professional_id = auth.uid()));


--
-- Name: portfolio_images Professionals can manage their portfolio; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals can manage their portfolio" ON public.portfolio_images USING ((auth.uid() = professional_id)) WITH CHECK ((auth.uid() = professional_id));


--
-- Name: job_quotes Professionals can submit quotes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals can submit quotes" ON public.job_quotes FOR INSERT TO authenticated WITH CHECK (((auth.uid() = professional_id) AND public.has_role(auth.uid(), 'professional'::public.app_role)));


--
-- Name: professional_verifications Professionals can submit verifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals can submit verifications" ON public.professional_verifications FOR INSERT TO authenticated WITH CHECK ((professional_id = auth.uid()));


--
-- Name: professional_stripe_accounts Professionals can update their own account; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals can update their own account" ON public.professional_stripe_accounts FOR UPDATE USING ((auth.uid() = professional_id));


--
-- Name: professional_documents Professionals can update their own documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals can update their own documents" ON public.professional_documents FOR UPDATE USING ((auth.uid() = professional_id));


--
-- Name: professional_portfolio Professionals can update their own portfolio items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals can update their own portfolio items" ON public.professional_portfolio FOR UPDATE USING ((auth.uid() = professional_id));


--
-- Name: professional_stats Professionals can update their own stats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals can update their own stats" ON public.professional_stats FOR UPDATE USING ((auth.uid() = professional_id));


--
-- Name: job_photos Professionals can upload job photos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals can upload job photos" ON public.job_photos FOR INSERT WITH CHECK ((auth.uid() = uploaded_by));


--
-- Name: job_quotes Professionals can view own quotes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals can view own quotes" ON public.job_quotes FOR SELECT TO authenticated USING ((auth.uid() = professional_id));


--
-- Name: professional_scores Professionals can view own scores; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals can view own scores" ON public.professional_scores FOR SELECT USING ((auth.uid() = professional_id));


--
-- Name: professional_verifications Professionals can view own verifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals can view own verifications" ON public.professional_verifications FOR SELECT TO authenticated USING ((professional_id = auth.uid()));


--
-- Name: professional_stripe_accounts Professionals can view their own account; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals can view their own account" ON public.professional_stripe_accounts FOR SELECT USING ((auth.uid() = professional_id));


--
-- Name: professional_documents Professionals can view their own documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals can view their own documents" ON public.professional_documents FOR SELECT USING ((auth.uid() = professional_id));


--
-- Name: professional_earnings Professionals can view their own earnings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals can view their own earnings" ON public.professional_earnings FOR SELECT USING ((auth.uid() = professional_id));


--
-- Name: payouts Professionals can view their own payouts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals can view their own payouts" ON public.payouts FOR SELECT USING ((auth.uid() = professional_id));


--
-- Name: professional_portfolio Professionals can view their own portfolio items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals can view their own portfolio items" ON public.professional_portfolio FOR SELECT USING ((auth.uid() = professional_id));


--
-- Name: profile_views Professionals can view their own profile views; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals can view their own profile views" ON public.profile_views FOR SELECT USING ((auth.uid() = professional_id));


--
-- Name: payment_transactions Professionals can view their own transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals can view their own transactions" ON public.payment_transactions FOR SELECT USING (((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: payout_items Professionals can view their payout items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals can view their payout items" ON public.payout_items FOR SELECT USING ((payout_id IN ( SELECT payouts.id
   FROM public.payouts
  WHERE (payouts.professional_id = auth.uid()))));


--
-- Name: job_quotes Professionals can withdraw quotes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals can withdraw quotes" ON public.job_quotes FOR UPDATE TO authenticated USING ((auth.uid() = professional_id)) WITH CHECK ((auth.uid() = professional_id));


--
-- Name: portfolio_images Professionals manage own portfolio; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professionals manage own portfolio" ON public.portfolio_images USING ((auth.uid() = professional_id));


--
-- Name: site_settings Public can read site settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can read site settings" ON public.site_settings FOR SELECT USING (true);


--
-- Name: professional_portfolio Public can view featured portfolio items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view featured portfolio items" ON public.professional_portfolio FOR SELECT USING ((is_featured = true));


--
-- Name: professional_scores Public can view scores; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view scores" ON public.professional_scores FOR SELECT USING (true);


--
-- Name: calculator_saved_configs Public configs viewable by share token; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public configs viewable by share token" ON public.calculator_saved_configs FOR SELECT USING (((is_public = true) AND (share_token IS NOT NULL) AND ((expires_at IS NULL) OR (expires_at > now()))));


--
-- Name: analytics_dashboards Public dashboards are viewable by authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public dashboards are viewable by authenticated users" ON public.analytics_dashboards FOR SELECT USING (((is_public = true) AND (auth.role() = 'authenticated'::text)));


--
-- Name: rating_summary Rating summaries are publicly readable; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Rating summaries are publicly readable" ON public.rating_summary FOR SELECT USING (true);


--
-- Name: review_media Review media is publicly readable; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Review media is publicly readable" ON public.review_media FOR SELECT USING (true);


--
-- Name: professional_reviews Review owners can update their reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Review owners can update their reviews" ON public.professional_reviews FOR UPDATE USING (((auth.uid() = client_id) OR (auth.uid() = professional_id)));


--
-- Name: review_responses Review responses are publicly readable; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Review responses are publicly readable" ON public.review_responses FOR SELECT USING (true);


--
-- Name: review_responses Reviewees can create responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Reviewees can create responses" ON public.review_responses FOR INSERT WITH CHECK (((auth.uid() = responder_id) AND (EXISTS ( SELECT 1
   FROM public.reviews r
  WHERE ((r.id = review_responses.review_id) AND (r.reviewee_id = auth.uid()))))));


--
-- Name: reviews Reviewees can respond to their reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Reviewees can respond to their reviews" ON public.reviews FOR UPDATE USING ((auth.uid() = reviewee_id)) WITH CHECK ((auth.uid() = reviewee_id));


--
-- Name: review_media Reviewers can add media to their reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Reviewers can add media to their reviews" ON public.review_media FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.reviews r
  WHERE ((r.id = review_media.review_id) AND (r.reviewer_id = auth.uid())))));


--
-- Name: reviews Reviewers can update their own reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Reviewers can update their own reviews" ON public.reviews FOR UPDATE USING ((auth.uid() = reviewer_id));


--
-- Name: reviews Reviews are publicly readable; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Reviews are publicly readable" ON public.reviews FOR SELECT USING ((moderation_status = 'approved'::text));


--
-- Name: service_addons Service addons are publicly readable; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service addons are publicly readable" ON public.service_addons FOR SELECT USING (true);


--
-- Name: service_name_map Service name mappings are readable by authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service name mappings are readable by authenticated users" ON public.service_name_map FOR SELECT TO authenticated USING (true);


--
-- Name: service_options Service options are publicly readable; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service options are publicly readable" ON public.service_options FOR SELECT USING (true);


--
-- Name: service_questions Service questions are publicly readable; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service questions are publicly readable" ON public.service_questions FOR SELECT USING (true);


--
-- Name: admin_alerts Service role can manage alerts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage alerts" ON public.admin_alerts USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text));


--
-- Name: audit_logs Service role can manage audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage audit logs" ON public.audit_logs USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text));


--
-- Name: client_logs Service role can manage client logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage client logs" ON public.client_logs USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text));


--
-- Name: data_deletion_requests Service role can manage deletion requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage deletion requests" ON public.data_deletion_requests USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text));


--
-- Name: user_feedback Service role can manage feedback; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage feedback" ON public.user_feedback USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text));


--
-- Name: rate_limit_tracking Service role can manage rate limits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage rate limits" ON public.rate_limit_tracking USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text));


--
-- Name: services Services are publicly readable; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Services are publicly readable" ON public.services FOR SELECT USING (true);


--
-- Name: services_unified_v1 Services are publicly readable; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Services are publicly readable" ON public.services_unified_v1 FOR SELECT TO authenticated, anon USING (true);


--
-- Name: micro_questions_snapshot Snapshots are readable by authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Snapshots are readable by authenticated users" ON public.micro_questions_snapshot FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: user_badges System can award badges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can award badges" ON public.user_badges FOR INSERT WITH CHECK (true);


--
-- Name: activity_feed System can create activity feed entries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can create activity feed entries" ON public.activity_feed FOR INSERT WITH CHECK (true);


--
-- Name: invoice_payments System can create invoice payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can create invoice payments" ON public.invoice_payments FOR INSERT WITH CHECK (true);


--
-- Name: notifications System can create notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);


--
-- Name: payment_notifications System can create notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can create notifications" ON public.payment_notifications FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: payment_receipts System can create receipts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can create receipts" ON public.payment_receipts FOR INSERT WITH CHECK (true);


--
-- Name: ai_recommendations System can create recommendations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can create recommendations" ON public.ai_recommendations FOR INSERT WITH CHECK (true);


--
-- Name: referrals System can create referrals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can create referrals" ON public.referrals FOR INSERT WITH CHECK (true);


--
-- Name: points_transactions System can create transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can create transactions" ON public.points_transactions FOR INSERT WITH CHECK (true);


--
-- Name: user_achievements System can create user achievements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can create user achievements" ON public.user_achievements FOR INSERT WITH CHECK (true);


--
-- Name: ux_health_checks System can insert UX health checks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert UX health checks" ON public.ux_health_checks FOR INSERT WITH CHECK (true);


--
-- Name: system_activity_log System can insert activity log; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert activity log" ON public.system_activity_log FOR INSERT WITH CHECK (true);


--
-- Name: analytics_events System can insert analytics events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert analytics events" ON public.analytics_events FOR INSERT WITH CHECK (true);


--
-- Name: analytics_snapshots System can insert analytics snapshots; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert analytics snapshots" ON public.analytics_snapshots FOR INSERT WITH CHECK (true);


--
-- Name: admin_audit_log System can insert audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert audit logs" ON public.admin_audit_log FOR INSERT WITH CHECK (true);


--
-- Name: security_audit_log System can insert audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert audit logs" ON public.security_audit_log FOR INSERT WITH CHECK (true);


--
-- Name: automation_executions System can insert automation executions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert automation executions" ON public.automation_executions FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: booking_risk_flags System can insert booking risk flags; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert booking risk flags" ON public.booking_risk_flags FOR INSERT WITH CHECK (true);


--
-- Name: document_edits System can insert edits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert edits" ON public.document_edits FOR INSERT WITH CHECK (true);


--
-- Name: feature_flag_exposures System can insert exposures; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert exposures" ON public.feature_flag_exposures FOR INSERT WITH CHECK (true);


--
-- Name: system_health_metrics System can insert health metrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert health metrics" ON public.system_health_metrics FOR INSERT WITH CHECK (true);


--
-- Name: business_insights System can insert insights; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert insights" ON public.business_insights FOR INSERT WITH CHECK (true);


--
-- Name: question_metrics System can insert metrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert metrics" ON public.question_metrics FOR INSERT WITH CHECK (true);


--
-- Name: system_metrics System can insert metrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert metrics" ON public.system_metrics FOR INSERT WITH CHECK (true);


--
-- Name: payment_reminders System can insert payment reminders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert payment reminders" ON public.payment_reminders FOR INSERT WITH CHECK (true);


--
-- Name: payments System can insert payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert payments" ON public.payments FOR INSERT WITH CHECK (true);


--
-- Name: query_performance_log System can insert query performance logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert query performance logs" ON public.query_performance_log FOR INSERT WITH CHECK (true);


--
-- Name: search_analytics System can insert search analytics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert search analytics" ON public.search_analytics FOR INSERT WITH CHECK (true);


--
-- Name: calculator_share_events System can insert share events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert share events" ON public.calculator_share_events FOR INSERT WITH CHECK (true);


--
-- Name: job_state_transitions System can insert state transitions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert state transitions" ON public.job_state_transitions FOR INSERT WITH CHECK (true);


--
-- Name: dispute_timeline System can insert timeline events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert timeline events" ON public.dispute_timeline FOR INSERT WITH CHECK (true);


--
-- Name: payment_transactions System can insert transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert transactions" ON public.payment_transactions FOR INSERT WITH CHECK (true);


--
-- Name: micro_questions_ai_runs System can manage AI runs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can manage AI runs" ON public.micro_questions_ai_runs USING (true);


--
-- Name: stripe_customers System can manage Stripe customers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can manage Stripe customers" ON public.stripe_customers USING (true);


--
-- Name: payment_alerts System can manage alerts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can manage alerts" ON public.payment_alerts TO authenticated USING (true);


--
-- Name: payment_analytics System can manage analytics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can manage analytics" ON public.payment_analytics TO authenticated USING (true);


--
-- Name: payment_analytics_summary System can manage analytics summaries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can manage analytics summaries" ON public.payment_analytics_summary USING (true);


--
-- Name: kpi_cache System can manage cache; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can manage cache" ON public.kpi_cache USING (true);


--
-- Name: user_cohorts System can manage cohorts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can manage cohorts" ON public.user_cohorts USING (true);


--
-- Name: notification_digest_queue System can manage digest queue; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can manage digest queue" ON public.notification_digest_queue USING (true);


--
-- Name: escrow_releases System can manage escrow releases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can manage escrow releases" ON public.escrow_releases USING (true);


--
-- Name: exchange_rates System can manage exchange rates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can manage exchange rates" ON public.exchange_rates USING (true);


--
-- Name: funnel_analytics System can manage funnels; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can manage funnels" ON public.funnel_analytics USING (true);


--
-- Name: invoices System can manage invoices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can manage invoices" ON public.invoices USING (((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: background_jobs System can manage jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can manage jobs" ON public.background_jobs USING (true);


--
-- Name: leaderboard_entries System can manage leaderboard entries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can manage leaderboard entries" ON public.leaderboard_entries WITH CHECK (true);


--
-- Name: user_activity_metrics System can manage metrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can manage metrics" ON public.user_activity_metrics USING (true);


--
-- Name: notification_queue System can manage notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can manage notifications" ON public.notification_queue USING (true);


--
-- Name: payout_items System can manage payout items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can manage payout items" ON public.payout_items USING (true);


--
-- Name: payouts System can manage payouts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can manage payouts" ON public.payouts USING (true);


--
-- Name: platform_metrics System can manage platform metrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can manage platform metrics" ON public.platform_metrics USING (true);


--
-- Name: popular_searches System can manage popular searches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can manage popular searches" ON public.popular_searches USING (true);


--
-- Name: booking_reminders System can manage reminders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can manage reminders" ON public.booking_reminders USING (true);


--
-- Name: revenue_analytics System can manage revenue analytics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can manage revenue analytics" ON public.revenue_analytics USING (true);


--
-- Name: scheduled_payments System can manage scheduled payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can manage scheduled payments" ON public.scheduled_payments USING (true);


--
-- Name: micro_questions_snapshot System can manage snapshots; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can manage snapshots" ON public.micro_questions_snapshot USING (true);


--
-- Name: user_points System can manage user points; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can manage user points" ON public.user_points WITH CHECK (true);


--
-- Name: profile_views System can track profile views; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can track profile views" ON public.profile_views FOR INSERT WITH CHECK (true);


--
-- Name: payments System can update payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can update payments" ON public.payments FOR UPDATE USING (true);


--
-- Name: refunds System can update refunds; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can update refunds" ON public.refunds FOR UPDATE USING (true);


--
-- Name: financial_reports System can update reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can update reports" ON public.financial_reports FOR UPDATE TO authenticated USING (true);


--
-- Name: offers Taskers can create offers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Taskers can create offers" ON public.offers FOR INSERT WITH CHECK ((auth.uid() = tasker_id));


--
-- Name: notification_templates Templates are readable by authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Templates are readable by authenticated users" ON public.notification_templates FOR SELECT TO authenticated USING (true);


--
-- Name: job_photos Uploaders can manage their photos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Uploaders can manage their photos" ON public.job_photos USING ((auth.uid() = uploaded_by));


--
-- Name: user_devices User can delete own device; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "User can delete own device" ON public.user_devices FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: user_devices User can insert own device; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "User can insert own device" ON public.user_devices FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_devices User can select own devices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "User can select own devices" ON public.user_devices FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: ticket_messages Users and admins can send messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users and admins can send messages" ON public.ticket_messages FOR INSERT WITH CHECK (((auth.uid() = sender_id) AND (EXISTS ( SELECT 1
   FROM public.support_tickets
  WHERE ((support_tickets.id = ticket_messages.ticket_id) AND ((support_tickets.user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::public.app_role)))))));


--
-- Name: ticket_attachments Users and admins can upload attachments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users and admins can upload attachments" ON public.ticket_attachments FOR INSERT WITH CHECK (((auth.uid() = uploaded_by) AND (EXISTS ( SELECT 1
   FROM public.support_tickets
  WHERE ((support_tickets.id = ticket_attachments.ticket_id) AND ((support_tickets.user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::public.app_role)))))));


--
-- Name: ticket_attachments Users and admins can view attachments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users and admins can view attachments" ON public.ticket_attachments FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.support_tickets
  WHERE ((support_tickets.id = ticket_attachments.ticket_id) AND ((support_tickets.user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::public.app_role))))));


--
-- Name: ticket_messages Users and admins can view messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users and admins can view messages" ON public.ticket_messages FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.support_tickets
  WHERE ((support_tickets.id = ticket_messages.ticket_id) AND ((support_tickets.user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::public.app_role))))) AND ((NOT is_internal_note) OR public.has_role(auth.uid(), 'admin'::public.app_role))));


--
-- Name: change_orders Users can create change orders for jobs they're involved in; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create change orders for jobs they're involved in" ON public.change_orders FOR INSERT WITH CHECK (((auth.uid() = proposer_id) AND (auth.uid() IN ( SELECT jobs.client_id
   FROM public.jobs
  WHERE (jobs.id = change_orders.job_id)))));


--
-- Name: conversations Users can create conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create conversations" ON public.conversations FOR INSERT WITH CHECK (((auth.uid() = participant_1_id) OR (auth.uid() = participant_2_id)));


--
-- Name: data_deletion_requests Users can create deletion requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create deletion requests" ON public.data_deletion_requests FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: disputes Users can create disputes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create disputes" ON public.disputes FOR INSERT WITH CHECK ((auth.uid() = created_by));


--
-- Name: shared_documents Users can create documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create documents" ON public.shared_documents FOR INSERT WITH CHECK ((auth.uid() = created_by));


--
-- Name: data_export_requests Users can create export requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create export requests" ON public.data_export_requests FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_feedback Users can create feedback; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create feedback" ON public.user_feedback FOR INSERT WITH CHECK (true);


--
-- Name: payment_reconciliations Users can create reconciliations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create reconciliations" ON public.payment_reconciliations FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: refund_requests Users can create refund requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create refund requests" ON public.refund_requests FOR INSERT WITH CHECK ((auth.uid() = requested_by));


--
-- Name: review_reports Users can create reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create reports" ON public.review_reports FOR INSERT WITH CHECK ((auth.uid() = reported_by));


--
-- Name: reviews Users can create reviews for completed jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create reviews for completed jobs" ON public.reviews FOR INSERT WITH CHECK (((auth.uid() = reviewer_id) AND (EXISTS ( SELECT 1
   FROM public.contracts c
  WHERE ((c.job_id = reviews.job_id) AND ((c.client_id = auth.uid()) OR (c.tasker_id = auth.uid())))))));


--
-- Name: category_suggestions Users can create suggestions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create suggestions" ON public.category_suggestions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: payment_schedules Users can create their own payment schedules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own payment schedules" ON public.payment_schedules FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: referral_codes Users can create their own referral codes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own referral codes" ON public.referral_codes FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: financial_reports Users can create their own reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own reports" ON public.financial_reports FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: job_templates Users can create their own templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own templates" ON public.job_templates FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: webhook_subscriptions Users can create their own webhook subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own webhook subscriptions" ON public.webhook_subscriptions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: read_receipts Users can create their read receipts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their read receipts" ON public.read_receipts FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: support_tickets Users can create tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create tickets" ON public.support_tickets FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: transaction_notes Users can create transaction notes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create transaction notes" ON public.transaction_notes FOR INSERT WITH CHECK (((auth.uid() = user_id) AND (transaction_id IN ( SELECT payment_transactions.id
   FROM public.payment_transactions
  WHERE (payment_transactions.user_id = auth.uid())))));


--
-- Name: user_sessions Users can delete own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own sessions" ON public.user_sessions FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: payment_methods Users can delete their own payment methods; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own payment methods" ON public.payment_methods FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: job_templates Users can delete their own templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own templates" ON public.job_templates FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: webhook_subscriptions Users can delete their own webhook subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own webhook subscriptions" ON public.webhook_subscriptions FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: search_history Users can delete their search history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their search history" ON public.search_history FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: active_sessions Users can delete their sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their sessions" ON public.active_sessions FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: review_flags Users can flag reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can flag reviews" ON public.review_flags FOR INSERT WITH CHECK ((auth.uid() = flagged_by));


--
-- Name: video_calls Users can initiate calls; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can initiate calls" ON public.video_calls FOR INSERT TO authenticated WITH CHECK ((auth.uid() = initiated_by));


--
-- Name: conversion_analytics Users can insert their own analytics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own analytics" ON public.conversion_analytics FOR INSERT WITH CHECK (((auth.uid() = user_id) OR (user_id IS NULL)));


--
-- Name: bookings Users can insert their own bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own bookings" ON public.bookings FOR INSERT WITH CHECK ((auth.uid() = client_id));


--
-- Name: onboarding_checklist Users can insert their own checklist; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own checklist" ON public.onboarding_checklist FOR INSERT WITH CHECK ((auth.uid() = professional_id));


--
-- Name: onboarding_events Users can insert their own events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own events" ON public.onboarding_events FOR INSERT WITH CHECK ((auth.uid() = professional_id));


--
-- Name: notification_preferences Users can insert their own notification preferences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own notification preferences" ON public.notification_preferences FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: payment_methods Users can insert their own payment methods; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own payment methods" ON public.payment_methods FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: notification_preferences Users can insert their own preferences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own preferences" ON public.notification_preferences FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: professional_profiles Users can insert their own professional profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own professional profile" ON public.professional_profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: search_history Users can insert their search history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their search history" ON public.search_history FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: client_files Users can manage files for their jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage files for their jobs" ON public.client_files USING (((auth.uid() = client_id) OR (auth.uid() IN ( SELECT jobs.client_id
   FROM public.jobs
  WHERE (jobs.id = client_files.job_id)))));


--
-- Name: invoice_items Users can manage items for their invoices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage items for their invoices" ON public.invoice_items USING ((invoice_id IN ( SELECT invoices.id
   FROM public.invoices
  WHERE (invoices.user_id = auth.uid()))));


--
-- Name: two_factor_auth Users can manage own 2FA; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage own 2FA" ON public.two_factor_auth USING ((auth.uid() = user_id));


--
-- Name: calendar_sync Users can manage own calendar sync; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage own calendar sync" ON public.calendar_sync USING ((auth.uid() = user_id));


--
-- Name: integrations Users can manage own integrations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage own integrations" ON public.integrations USING (((auth.uid() = user_id) OR (user_id IS NULL)));


--
-- Name: webhook_endpoints Users can manage own webhooks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage own webhooks" ON public.webhook_endpoints USING (((auth.uid() = user_id) OR (user_id IS NULL)));


--
-- Name: two_factor_auth Users can manage their 2FA settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their 2FA settings" ON public.two_factor_auth USING ((auth.uid() = user_id));


--
-- Name: user_blocks Users can manage their blocks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their blocks" ON public.user_blocks USING ((auth.uid() = blocker_id));


--
-- Name: calendar_events Users can manage their calendar events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their calendar events" ON public.calendar_events USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: ai_conversations Users can manage their conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their conversations" ON public.ai_conversations USING (((auth.uid() = user_id) OR (user_id IS NULL)));


--
-- Name: data_exports Users can manage their exports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their exports" ON public.data_exports USING ((auth.uid() = user_id));


--
-- Name: client_profiles Users can manage their own client profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own client profile" ON public.client_profiles USING ((auth.uid() = user_id));


--
-- Name: calculator_saved_configs Users can manage their own configs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own configs" ON public.calculator_saved_configs USING (((auth.uid() = user_id) OR ((is_public = true) AND (share_token IS NOT NULL))));


--
-- Name: analytics_dashboards Users can manage their own dashboards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own dashboards" ON public.analytics_dashboards USING ((auth.uid() = user_id));


--
-- Name: client_favorites Users can manage their own favorites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own favorites" ON public.client_favorites USING ((auth.uid() IN ( SELECT client_profiles.user_id
   FROM public.client_profiles
  WHERE (client_profiles.id = client_favorites.client_id))));


--
-- Name: form_sessions Users can manage their own form sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own form sessions" ON public.form_sessions USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: review_helpful_votes Users can manage their own helpful votes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own helpful votes" ON public.review_helpful_votes USING ((auth.uid() = user_id));


--
-- Name: review_helpfulness Users can manage their own helpfulness votes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own helpfulness votes" ON public.review_helpfulness USING ((auth.uid() = user_id));


--
-- Name: payment_methods Users can manage their own payment methods; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own payment methods" ON public.payment_methods USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: job_presets Users can manage their own presets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own presets" ON public.job_presets USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: properties Users can manage their own properties; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own properties" ON public.properties USING ((auth.uid() IN ( SELECT client_profiles.user_id
   FROM public.client_profiles
  WHERE (client_profiles.id = properties.client_id))));


--
-- Name: pro_targets Users can manage their own targets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own targets" ON public.pro_targets USING ((auth.uid() = pro_id));


--
-- Name: availability_presets Users can manage their presets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their presets" ON public.availability_presets USING ((created_by = auth.uid()));


--
-- Name: data_privacy_controls Users can manage their privacy controls; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their privacy controls" ON public.data_privacy_controls USING ((auth.uid() = user_id));


--
-- Name: message_reactions Users can manage their reactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their reactions" ON public.message_reactions TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: saved_reports Users can manage their reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their reports" ON public.saved_reports USING ((auth.uid() = user_id));


--
-- Name: saved_searches Users can manage their saved searches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their saved searches" ON public.saved_searches USING ((auth.uid() = user_id));


--
-- Name: report_schedules Users can manage their schedules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their schedules" ON public.report_schedules USING ((auth.uid() = user_id));


--
-- Name: typing_indicators Users can manage their typing indicators; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their typing indicators" ON public.typing_indicators TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: activity_feed Users can mark activities as read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can mark activities as read" ON public.activity_feed FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: message_reports Users can report messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can report messages" ON public.message_reports FOR INSERT WITH CHECK ((auth.uid() = reporter_id));


--
-- Name: messages Users can send messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK ((auth.uid() = sender_id));


--
-- Name: ai_chat_messages Users can send messages in their conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can send messages in their conversations" ON public.ai_chat_messages FOR INSERT WITH CHECK ((conversation_id IN ( SELECT ai_conversations.id
   FROM public.ai_conversations
  WHERE ((ai_conversations.user_id = auth.uid()) OR (ai_conversations.user_id IS NULL)))));


--
-- Name: user_badges Users can update badge display; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update badge display" ON public.user_badges FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: change_orders Users can update change orders they proposed; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update change orders they proposed" ON public.change_orders FOR UPDATE USING (((auth.uid() = proposer_id) OR (auth.uid() IN ( SELECT jobs.client_id
   FROM public.jobs
  WHERE (jobs.id = change_orders.job_id)))));


--
-- Name: notifications Users can update own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: contracts Users can update their contracts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their contracts" ON public.contracts FOR UPDATE USING (((auth.uid() = client_id) OR (auth.uid() = tasker_id)));


--
-- Name: conversations Users can update their conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their conversations" ON public.conversations FOR UPDATE USING (((auth.uid() = participant_1_id) OR (auth.uid() = participant_2_id)));


--
-- Name: payment_notifications Users can update their notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their notifications" ON public.payment_notifications FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: offers Users can update their offers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their offers" ON public.offers FOR UPDATE USING ((auth.uid() = tasker_id));


--
-- Name: user_achievements Users can update their own achievement progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own achievement progress" ON public.user_achievements FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own active_role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own active_role" ON public.profiles FOR UPDATE USING ((auth.uid() = id)) WITH CHECK ((auth.uid() = id));


--
-- Name: booking_requests Users can update their own booking requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own booking requests" ON public.booking_requests FOR UPDATE USING (((auth.uid() = client_id) OR (auth.uid() = professional_id)));


--
-- Name: bookings Users can update their own bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own bookings" ON public.bookings FOR UPDATE USING ((auth.uid() = client_id));


--
-- Name: onboarding_checklist Users can update their own checklist; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own checklist" ON public.onboarding_checklist FOR UPDATE USING ((auth.uid() = professional_id));


--
-- Name: business_insights Users can update their own insights; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own insights" ON public.business_insights FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: notification_preferences Users can update their own notification preferences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own notification preferences" ON public.notification_preferences FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: notifications Users can update their own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: payment_methods Users can update their own payment methods; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own payment methods" ON public.payment_methods FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: payment_schedules Users can update their own payment schedules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own payment schedules" ON public.payment_schedules FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: notification_preferences Users can update their own preferences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own preferences" ON public.notification_preferences FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: user_presence Users can update their own presence; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own presence" ON public.user_presence TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: professional_profiles Users can update their own professional profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own professional profile" ON public.professional_profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: quote_requests Users can update their own quote requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own quote requests" ON public.quote_requests FOR UPDATE USING (((auth.uid() = professional_id) OR (auth.uid() IN ( SELECT jobs.client_id
   FROM public.jobs
  WHERE (jobs.id = quote_requests.job_id)))));


--
-- Name: active_sessions Users can update their own session activity; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own session activity" ON public.active_sessions FOR UPDATE TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: job_templates Users can update their own templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own templates" ON public.job_templates FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: webhook_subscriptions Users can update their own webhook subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own webhook subscriptions" ON public.webhook_subscriptions FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: category_suggestions Users can update their pending suggestions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their pending suggestions" ON public.category_suggestions FOR UPDATE USING (((auth.uid() = user_id) AND (status = 'pending'::text)));


--
-- Name: ai_recommendations Users can update their recommendations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their recommendations" ON public.ai_recommendations FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: payment_reconciliations Users can update their reconciliations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their reconciliations" ON public.payment_reconciliations FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: messages Users can update their sent messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their sent messages" ON public.messages FOR UPDATE USING (((auth.uid() = sender_id) OR (auth.uid() = recipient_id)));


--
-- Name: dispute_evidence Users can upload evidence for their disputes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can upload evidence for their disputes" ON public.dispute_evidence FOR INSERT WITH CHECK (((auth.uid() = uploaded_by) AND (dispute_id IN ( SELECT disputes.id
   FROM public.disputes
  WHERE ((disputes.created_by = auth.uid()) OR (disputes.disputed_against = auth.uid()))))));


--
-- Name: shared_documents Users can view accessible documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view accessible documents" ON public.shared_documents FOR SELECT USING (public.can_access_document(id));


--
-- Name: payment_alerts Users can view alerts affecting them; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view alerts affecting them" ON public.payment_alerts FOR SELECT TO authenticated USING (((auth.uid() = ANY (affected_users)) OR (affected_users IS NULL)));


--
-- Name: professional_applications Users can view applications for their bookings or their own app; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view applications for their bookings or their own app" ON public.professional_applications FOR SELECT USING (((auth.uid() = professional_id) OR (auth.uid() IN ( SELECT bookings.client_id
   FROM public.bookings
  WHERE (bookings.id = professional_applications.booking_id)))));


--
-- Name: milestone_approvals Users can view approvals for their milestones; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view approvals for their milestones" ON public.milestone_approvals FOR SELECT USING ((milestone_id IN ( SELECT em.id
   FROM (public.escrow_milestones em
     JOIN public.contracts c ON ((c.id = em.contract_id)))
  WHERE ((c.client_id = auth.uid()) OR (c.tasker_id = auth.uid())))));


--
-- Name: professional_availability Users can view availability of any professional; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view availability of any professional" ON public.professional_availability FOR SELECT USING (true);


--
-- Name: user_blocks Users can view blocks against them; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view blocks against them" ON public.user_blocks FOR SELECT USING ((auth.uid() = blocked_id));


--
-- Name: change_orders Users can view change orders for their jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view change orders for their jobs" ON public.change_orders FOR SELECT USING (((auth.uid() = proposer_id) OR (auth.uid() IN ( SELECT jobs.client_id
   FROM public.jobs
  WHERE (jobs.id = change_orders.job_id)))));


--
-- Name: document_collaborators Users can view collaborators on accessible documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view collaborators on accessible documents" ON public.document_collaborators FOR SELECT USING (public.can_access_document(document_id));


--
-- Name: disputes Users can view disputes they're involved in; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view disputes they're involved in" ON public.disputes FOR SELECT USING (((auth.uid() = created_by) OR (auth.uid() = disputed_against) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: document_edits Users can view edits on documents they can access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view edits on documents they can access" ON public.document_edits FOR SELECT USING (((document_id IN ( SELECT document_collaborators.document_id
   FROM public.document_collaborators
  WHERE (document_collaborators.user_id = auth.uid()))) OR (document_id IN ( SELECT shared_documents.id
   FROM public.shared_documents
  WHERE (shared_documents.created_by = auth.uid())))));


--
-- Name: dispute_evidence Users can view evidence for their disputes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view evidence for their disputes" ON public.dispute_evidence FOR SELECT USING ((dispute_id IN ( SELECT disputes.id
   FROM public.disputes
  WHERE ((disputes.created_by = auth.uid()) OR (disputes.disputed_against = auth.uid())))));


--
-- Name: review_helpful_votes Users can view helpful votes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view helpful votes" ON public.review_helpful_votes FOR SELECT USING (true);


--
-- Name: invoice_items Users can view items for their invoices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view items for their invoices" ON public.invoice_items FOR SELECT USING ((invoice_id IN ( SELECT invoices.id
   FROM public.invoices
  WHERE (invoices.user_id = auth.uid()))));


--
-- Name: job_status_updates Users can view job status for their jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view job status for their jobs" ON public.job_status_updates FOR SELECT USING (((auth.uid() = professional_id) OR (auth.uid() IN ( SELECT jobs.client_id
   FROM public.jobs
  WHERE (jobs.id = job_status_updates.job_id)))));


--
-- Name: job_matches Users can view matches for their bookings or applications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view matches for their bookings or applications" ON public.job_matches FOR SELECT USING ((auth.uid() IN ( SELECT bookings.client_id
   FROM public.bookings
  WHERE (bookings.id = job_matches.booking_id)
UNION
 SELECT job_matches.professional_id)));


--
-- Name: smart_matches Users can view matches for their jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view matches for their jobs" ON public.smart_matches FOR SELECT USING ((auth.uid() IN ( SELECT jobs.client_id
   FROM public.jobs
  WHERE (jobs.id = smart_matches.job_id)
UNION
 SELECT smart_matches.professional_id)));


--
-- Name: ai_chat_messages Users can view messages in their conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view messages in their conversations" ON public.ai_chat_messages FOR SELECT USING ((conversation_id IN ( SELECT ai_conversations.id
   FROM public.ai_conversations
  WHERE ((ai_conversations.user_id = auth.uid()) OR (ai_conversations.user_id IS NULL)))));


--
-- Name: milestones Users can view milestones for their bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view milestones for their bookings" ON public.milestones FOR SELECT USING ((auth.uid() IN ( SELECT bookings.client_id
   FROM public.bookings
  WHERE (bookings.id = milestones.booking_id))));


--
-- Name: escrow_milestones Users can view milestones for their contracts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view milestones for their contracts" ON public.escrow_milestones FOR SELECT USING ((contract_id IN ( SELECT contracts.id
   FROM public.contracts
  WHERE ((contracts.client_id = auth.uid()) OR (contracts.tasker_id = auth.uid())))));


--
-- Name: offers Users can view offers for their jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view offers for their jobs" ON public.offers FOR SELECT USING (((auth.uid() = tasker_id) OR (auth.uid() IN ( SELECT jobs.client_id
   FROM public.jobs
  WHERE (jobs.id = offers.job_id)))));


--
-- Name: user_badges Users can view others' displayed badges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view others' displayed badges" ON public.user_badges FOR SELECT USING ((is_displayed = true));


--
-- Name: user_points Users can view others' points; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view others' points" ON public.user_points FOR SELECT USING (true);


--
-- Name: two_factor_auth Users can view own 2FA; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own 2FA" ON public.two_factor_auth FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: data_export_requests Users can view own export requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own export requests" ON public.data_export_requests FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: notification_queue Users can view own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own notifications" ON public.notification_queue FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: notifications Users can view own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_sessions Users can view own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own sessions" ON public.user_sessions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: support_tickets Users can view own tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own tickets" ON public.support_tickets FOR SELECT USING (((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: escrow_payments Users can view payments for their bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view payments for their bookings" ON public.escrow_payments FOR SELECT USING ((auth.uid() IN ( SELECT bookings.client_id
   FROM public.bookings
  WHERE (bookings.id = escrow_payments.booking_id))));


--
-- Name: invoice_payments Users can view payments for their invoices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view payments for their invoices" ON public.invoice_payments FOR SELECT USING ((invoice_id IN ( SELECT invoices.id
   FROM public.invoices
  WHERE (invoices.user_id = auth.uid()))));


--
-- Name: quote_requests Users can view quote requests for their jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view quote requests for their jobs" ON public.quote_requests FOR SELECT USING (((auth.uid() IN ( SELECT jobs.client_id
   FROM public.jobs
  WHERE (jobs.id = quote_requests.job_id))) OR (auth.uid() = professional_id)));


--
-- Name: quotes Users can view quotes for their requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view quotes for their requests" ON public.quotes FOR SELECT USING (((auth.uid() IN ( SELECT quote_requests.professional_id
   FROM public.quote_requests
  WHERE (quote_requests.id = quotes.quote_request_id))) OR (auth.uid() IN ( SELECT j.client_id
   FROM (public.jobs j
     JOIN public.quote_requests qr ON ((j.id = qr.job_id)))
  WHERE (qr.id = quotes.quote_request_id)))));


--
-- Name: referrals Users can view referrals they're involved in; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view referrals they're involved in" ON public.referrals FOR SELECT USING (((auth.uid() = referrer_id) OR (auth.uid() = referred_id)));


--
-- Name: refunds Users can view refunds for their payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view refunds for their payments" ON public.refunds FOR SELECT USING ((payment_id IN ( SELECT payments.id
   FROM public.payments
  WHERE ((payments.client_id = auth.uid()) OR (payments.professional_id = auth.uid())))));


--
-- Name: escrow_releases Users can view releases for their contracts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view releases for their contracts" ON public.escrow_releases FOR SELECT USING ((milestone_id IN ( SELECT em.id
   FROM (public.escrow_milestones em
     JOIN public.contracts c ON ((c.id = em.contract_id)))
  WHERE ((c.client_id = auth.uid()) OR (c.tasker_id = auth.uid())))));


--
-- Name: generated_reports Users can view reports generated for them; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view reports generated for them" ON public.generated_reports FOR SELECT USING ((auth.uid() = generated_by));


--
-- Name: calculator_share_events Users can view share events for their configs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view share events for their configs" ON public.calculator_share_events FOR SELECT USING ((config_id IN ( SELECT calculator_saved_configs.id
   FROM public.calculator_saved_configs
  WHERE (calculator_saved_configs.user_id = auth.uid()))));


--
-- Name: job_question_snapshot Users can view snapshots for their jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view snapshots for their jobs" ON public.job_question_snapshot FOR SELECT USING ((auth.uid() IN ( SELECT jobs.client_id
   FROM public.jobs
  WHERE (jobs.id = job_question_snapshot.job_id))));


--
-- Name: active_sessions Users can view their active sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their active sessions" ON public.active_sessions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: activity_feed Users can view their activity feed; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their activity feed" ON public.activity_feed FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_compliance_status Users can view their compliance status; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their compliance status" ON public.user_compliance_status FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: contracts Users can view their contracts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their contracts" ON public.contracts FOR SELECT USING (((auth.uid() = client_id) OR (auth.uid() = tasker_id)));


--
-- Name: conversations Users can view their conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their conversations" ON public.conversations FOR SELECT USING (((auth.uid() = participant_1_id) OR (auth.uid() = participant_2_id)));


--
-- Name: notification_digest_queue Users can view their digest queue; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their digest queue" ON public.notification_digest_queue FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: invoices Users can view their invoices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their invoices" ON public.invoices FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: messages Users can view their messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their messages" ON public.messages FOR SELECT USING (((auth.uid() = sender_id) OR (auth.uid() = recipient_id)));


--
-- Name: ai_runs Users can view their own AI runs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own AI runs" ON public.ai_runs FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: stripe_customers Users can view their own Stripe customer; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own Stripe customer" ON public.stripe_customers FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_achievements Users can view their own achievements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own achievements" ON public.user_achievements FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: analytics_events Users can view their own analytics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own analytics" ON public.analytics_events FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: payment_analytics Users can view their own analytics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own analytics" ON public.payment_analytics FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: payment_analytics_summary Users can view their own analytics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own analytics" ON public.payment_analytics_summary FOR SELECT USING (((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: audit_logs Users can view their own audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own audit logs" ON public.audit_logs FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: pro_badges Users can view their own badges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own badges" ON public.pro_badges FOR SELECT USING ((auth.uid() = pro_id));


--
-- Name: user_badges Users can view their own badges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own badges" ON public.user_badges FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: booking_requests Users can view their own booking requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own booking requests" ON public.booking_requests FOR SELECT USING (((auth.uid() = client_id) OR (auth.uid() = professional_id)));


--
-- Name: bookings Users can view their own bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own bookings" ON public.bookings FOR SELECT USING ((auth.uid() = client_id));


--
-- Name: onboarding_checklist Users can view their own checklist; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own checklist" ON public.onboarding_checklist FOR SELECT USING ((auth.uid() = professional_id));


--
-- Name: project_completions Users can view their own completions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own completions" ON public.project_completions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: data_deletion_requests Users can view their own deletion requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own deletion requests" ON public.data_deletion_requests FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: onboarding_events Users can view their own events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own events" ON public.onboarding_events FOR SELECT USING ((auth.uid() = professional_id));


--
-- Name: user_feedback Users can view their own feedback; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own feedback" ON public.user_feedback FOR SELECT USING (((auth.uid() = user_id) OR (auth.uid() IS NULL)));


--
-- Name: business_insights Users can view their own insights; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own insights" ON public.business_insights FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: client_logs Users can view their own logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own logs" ON public.client_logs FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_activity_metrics Users can view their own metrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own metrics" ON public.user_activity_metrics FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: notification_preferences Users can view their own notification preferences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own notification preferences" ON public.notification_preferences FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: notifications Users can view their own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: payment_notifications Users can view their own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own notifications" ON public.payment_notifications FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: payment_methods Users can view their own payment methods; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own payment methods" ON public.payment_methods FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: payment_reminders Users can view their own payment reminders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own payment reminders" ON public.payment_reminders FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: payment_schedules Users can view their own payment schedules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own payment schedules" ON public.payment_schedules FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: payments Users can view their own payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own payments" ON public.payments FOR SELECT USING (((auth.uid() = client_id) OR (auth.uid() = professional_id)));


--
-- Name: user_points Users can view their own points; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own points" ON public.user_points FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: notification_preferences Users can view their own preferences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own preferences" ON public.notification_preferences FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: professional_profiles Users can view their own professional profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own professional profile" ON public.professional_profiles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: payment_receipts Users can view their own receipts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own receipts" ON public.payment_receipts FOR SELECT USING (((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: payment_reconciliations Users can view their own reconciliations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own reconciliations" ON public.payment_reconciliations FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: referral_codes Users can view their own referral codes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own referral codes" ON public.referral_codes FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: financial_reports Users can view their own reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own reports" ON public.financial_reports FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: review_reports Users can view their own reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own reports" ON public.review_reports FOR SELECT USING ((auth.uid() = reported_by));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: security_events Users can view their own security events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own security events" ON public.security_events FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: category_suggestions Users can view their own suggestions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own suggestions" ON public.category_suggestions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: job_templates Users can view their own templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own templates" ON public.job_templates FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: payment_transactions Users can view their own transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own transactions" ON public.payment_transactions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: points_transactions Users can view their own transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own transactions" ON public.points_transactions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: webhook_subscriptions Users can view their own webhook subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own webhook subscriptions" ON public.webhook_subscriptions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: availability_presets Users can view their presets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their presets" ON public.availability_presets FOR SELECT USING ((created_by = auth.uid()));


--
-- Name: message_rate_limits Users can view their rate limits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their rate limits" ON public.message_rate_limits FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: payment_receipts Users can view their receipts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their receipts" ON public.payment_receipts FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: ai_recommendations Users can view their recommendations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their recommendations" ON public.ai_recommendations FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: refund_requests Users can view their refund requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their refund requests" ON public.refund_requests FOR SELECT USING ((auth.uid() = requested_by));


--
-- Name: booking_reminders Users can view their reminders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their reminders" ON public.booking_reminders FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: scheduled_payments Users can view their scheduled payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their scheduled payments" ON public.scheduled_payments FOR SELECT USING ((schedule_id IN ( SELECT payment_schedules.id
   FROM public.payment_schedules
  WHERE (payment_schedules.user_id = auth.uid()))));


--
-- Name: search_history Users can view their search history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their search history" ON public.search_history FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: transaction_notes Users can view their transaction notes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their transaction notes" ON public.transaction_notes FOR SELECT USING ((transaction_id IN ( SELECT payment_transactions.id
   FROM public.payment_transactions
  WHERE (payment_transactions.user_id = auth.uid()))));


--
-- Name: escrow_transactions Users can view transactions for their contracts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view transactions for their contracts" ON public.escrow_transactions FOR SELECT USING ((milestone_id IN ( SELECT em.id
   FROM (public.escrow_milestones em
     JOIN public.contracts c ON ((c.id = em.contract_id)))
  WHERE ((c.client_id = auth.uid()) OR (c.tasker_id = auth.uid())))));


--
-- Name: escrow_transfer_logs Users can view transfer logs for their contracts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view transfer logs for their contracts" ON public.escrow_transfer_logs FOR SELECT USING ((milestone_id IN ( SELECT em.id
   FROM (public.escrow_milestones em
     JOIN public.contracts c ON ((c.id = em.contract_id)))
  WHERE ((c.client_id = auth.uid()) OR (c.tasker_id = auth.uid())))));


--
-- Name: job_versions Users can view versions of their jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view versions of their jobs" ON public.job_versions FOR SELECT USING (((job_id IN ( SELECT jobs.id
   FROM public.jobs
  WHERE (jobs.client_id = auth.uid()))) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: webhook_deliveries Users can view webhook deliveries for their subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view webhook deliveries for their subscriptions" ON public.webhook_deliveries FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.webhook_subscriptions
  WHERE ((webhook_subscriptions.id = webhook_deliveries.subscription_id) AND (webhook_subscriptions.user_id = auth.uid())))));


--
-- Name: message_attachment_metadata Users insert attachment metadata; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users insert attachment metadata" ON public.message_attachment_metadata FOR INSERT TO authenticated WITH CHECK ((message_id IN ( SELECT messages.id
   FROM public.messages
  WHERE (messages.sender_id = auth.uid()))));


--
-- Name: user_compliance_status Users read only their compliance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users read only their compliance" ON public.user_compliance_status FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: message_attachment_metadata Users view attachment metadata; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users view attachment metadata" ON public.message_attachment_metadata FOR SELECT TO authenticated USING ((message_id IN ( SELECT messages.id
   FROM public.messages
  WHERE ((messages.sender_id = auth.uid()) OR (messages.recipient_id = auth.uid())))));


--
-- Name: achievements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

--
-- Name: active_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: activity_feed; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

--
-- Name: admin_alerts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_alerts ENABLE ROW LEVEL SECURITY;

--
-- Name: admin_audit_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

--
-- Name: admin_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_events ENABLE ROW LEVEL SECURITY;

--
-- Name: services_micro_versions admin_insert_versions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admin_insert_versions ON public.services_micro_versions FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: admin_ip_whitelist; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_ip_whitelist ENABLE ROW LEVEL SECURITY;

--
-- Name: services_micro admin_manage_services_micro; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admin_manage_services_micro ON public.services_micro USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: admin_permissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

--
-- Name: services_micro_versions admin_view_versions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admin_view_versions ON public.services_micro_versions FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: ai_alerts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_alerts ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_automation_rules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_automation_rules ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_chat_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_conversations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_prompts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_prompts ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_recommendations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_risk_flags; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_risk_flags ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_runs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_runs ENABLE ROW LEVEL SECURITY;

--
-- Name: alert_rules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.alert_rules ENABLE ROW LEVEL SECURITY;

--
-- Name: analytics_dashboards; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.analytics_dashboards ENABLE ROW LEVEL SECURITY;

--
-- Name: analytics_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

--
-- Name: analytics_snapshots; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;

--
-- Name: audit_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: automation_executions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.automation_executions ENABLE ROW LEVEL SECURITY;

--
-- Name: automation_workflows; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.automation_workflows ENABLE ROW LEVEL SECURITY;

--
-- Name: availability_presets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.availability_presets ENABLE ROW LEVEL SECURITY;

--
-- Name: background_jobs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.background_jobs ENABLE ROW LEVEL SECURITY;

--
-- Name: badges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

--
-- Name: blocked_dates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;

--
-- Name: booking_reminders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.booking_reminders ENABLE ROW LEVEL SECURITY;

--
-- Name: booking_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: booking_risk_flags; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.booking_risk_flags ENABLE ROW LEVEL SECURITY;

--
-- Name: bookings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

--
-- Name: business_insights; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.business_insights ENABLE ROW LEVEL SECURITY;

--
-- Name: business_metrics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.business_metrics ENABLE ROW LEVEL SECURITY;

--
-- Name: calculator_saved_configs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.calculator_saved_configs ENABLE ROW LEVEL SECURITY;

--
-- Name: calculator_share_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.calculator_share_events ENABLE ROW LEVEL SECURITY;

--
-- Name: calendar_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

--
-- Name: calendar_sync; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.calendar_sync ENABLE ROW LEVEL SECURITY;

--
-- Name: category_suggestions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.category_suggestions ENABLE ROW LEVEL SECURITY;

--
-- Name: change_orders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.change_orders ENABLE ROW LEVEL SECURITY;

--
-- Name: churn_predictions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.churn_predictions ENABLE ROW LEVEL SECURITY;

--
-- Name: client_favorites; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.client_favorites ENABLE ROW LEVEL SECURITY;

--
-- Name: client_files; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.client_files ENABLE ROW LEVEL SECURITY;

--
-- Name: client_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.client_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: client_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: collaborative_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.collaborative_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: compliance_frameworks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.compliance_frameworks ENABLE ROW LEVEL SECURITY;

--
-- Name: compliance_reports; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.compliance_reports ENABLE ROW LEVEL SECURITY;

--
-- Name: contracts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

--
-- Name: conversations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

--
-- Name: conversion_analytics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.conversion_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: dispute_counter_proposals counter_proposals_insert_parties; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY counter_proposals_insert_parties ON public.dispute_counter_proposals FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.disputes d
  WHERE ((d.id = dispute_counter_proposals.dispute_id) AND ((auth.uid() = d.created_by) OR (auth.uid() = d.disputed_against) OR public.has_role(auth.uid(), 'admin'::public.app_role))))));


--
-- Name: dispute_counter_proposals counter_proposals_read_parties; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY counter_proposals_read_parties ON public.dispute_counter_proposals FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.disputes d
  WHERE ((d.id = dispute_counter_proposals.dispute_id) AND ((auth.uid() = d.created_by) OR (auth.uid() = d.disputed_against) OR public.has_role(auth.uid(), 'admin'::public.app_role))))));


--
-- Name: dispute_counter_proposals counter_proposals_update_proposer; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY counter_proposals_update_proposer ON public.dispute_counter_proposals FOR UPDATE USING (((proposer_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: data_breach_incidents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.data_breach_incidents ENABLE ROW LEVEL SECURITY;

--
-- Name: data_deletion_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.data_deletion_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: data_export_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: data_exports; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.data_exports ENABLE ROW LEVEL SECURITY;

--
-- Name: data_privacy_controls; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.data_privacy_controls ENABLE ROW LEVEL SECURITY;

--
-- Name: dispute_counter_proposals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.dispute_counter_proposals ENABLE ROW LEVEL SECURITY;

--
-- Name: dispute_evidence; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.dispute_evidence ENABLE ROW LEVEL SECURITY;

--
-- Name: dispute_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.dispute_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: dispute_resolutions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.dispute_resolutions ENABLE ROW LEVEL SECURITY;

--
-- Name: dispute_timeline; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.dispute_timeline ENABLE ROW LEVEL SECURITY;

--
-- Name: disputes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

--
-- Name: document_collaborators; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.document_collaborators ENABLE ROW LEVEL SECURITY;

--
-- Name: document_edits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.document_edits ENABLE ROW LEVEL SECURITY;

--
-- Name: dual_control_approvals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.dual_control_approvals ENABLE ROW LEVEL SECURITY;

--
-- Name: resolution_enforcement_log enforcement_log_insert_system; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY enforcement_log_insert_system ON public.resolution_enforcement_log FOR INSERT WITH CHECK (true);


--
-- Name: resolution_enforcement_log enforcement_log_read_parties; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY enforcement_log_read_parties ON public.resolution_enforcement_log FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.disputes d
  WHERE ((d.id = resolution_enforcement_log.dispute_id) AND ((auth.uid() = d.created_by) OR (auth.uid() = d.disputed_against) OR public.has_role(auth.uid(), 'admin'::public.app_role))))));


--
-- Name: escrow_milestones; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.escrow_milestones ENABLE ROW LEVEL SECURITY;

--
-- Name: escrow_payments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.escrow_payments ENABLE ROW LEVEL SECURITY;

--
-- Name: escrow_release_overrides; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.escrow_release_overrides ENABLE ROW LEVEL SECURITY;

--
-- Name: escrow_releases; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.escrow_releases ENABLE ROW LEVEL SECURITY;

--
-- Name: escrow_transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: escrow_transfer_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.escrow_transfer_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: exchange_rates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

--
-- Name: feature_flag_exposures; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.feature_flag_exposures ENABLE ROW LEVEL SECURITY;

--
-- Name: feature_flags; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

--
-- Name: financial_reports; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.financial_reports ENABLE ROW LEVEL SECURITY;

--
-- Name: form_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.form_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: fraud_patterns; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.fraud_patterns ENABLE ROW LEVEL SECURITY;

--
-- Name: funnel_analytics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.funnel_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: generated_reports; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.generated_reports ENABLE ROW LEVEL SECURITY;

--
-- Name: integrations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

--
-- Name: invoice_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

--
-- Name: invoice_payments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.invoice_payments ENABLE ROW LEVEL SECURITY;

--
-- Name: invoices; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

--
-- Name: job_applicants; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.job_applicants ENABLE ROW LEVEL SECURITY;

--
-- Name: job_broadcasts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.job_broadcasts ENABLE ROW LEVEL SECURITY;

--
-- Name: job_lifecycle_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.job_lifecycle_events ENABLE ROW LEVEL SECURITY;

--
-- Name: job_matches; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.job_matches ENABLE ROW LEVEL SECURITY;

--
-- Name: job_photos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.job_photos ENABLE ROW LEVEL SECURITY;

--
-- Name: job_presets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.job_presets ENABLE ROW LEVEL SECURITY;

--
-- Name: job_question_snapshot; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.job_question_snapshot ENABLE ROW LEVEL SECURITY;

--
-- Name: job_quotes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.job_quotes ENABLE ROW LEVEL SECURITY;

--
-- Name: job_state_transitions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.job_state_transitions ENABLE ROW LEVEL SECURITY;

--
-- Name: job_status_updates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.job_status_updates ENABLE ROW LEVEL SECURITY;

--
-- Name: job_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.job_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: job_versions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.job_versions ENABLE ROW LEVEL SECURITY;

--
-- Name: jobs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

--
-- Name: kpi_cache; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.kpi_cache ENABLE ROW LEVEL SECURITY;

--
-- Name: leaderboard_entries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: leaderboards; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;

--
-- Name: loyalty_tiers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.loyalty_tiers ENABLE ROW LEVEL SECURITY;

--
-- Name: message_attachment_metadata; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.message_attachment_metadata ENABLE ROW LEVEL SECURITY;

--
-- Name: message_rate_limits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.message_rate_limits ENABLE ROW LEVEL SECURITY;

--
-- Name: message_reactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

--
-- Name: message_reports; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.message_reports ENABLE ROW LEVEL SECURITY;

--
-- Name: message_threads; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: micro_questions_ai_runs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.micro_questions_ai_runs ENABLE ROW LEVEL SECURITY;

--
-- Name: micro_questions_snapshot; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.micro_questions_snapshot ENABLE ROW LEVEL SECURITY;

--
-- Name: micro_service_questions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.micro_service_questions ENABLE ROW LEVEL SECURITY;

--
-- Name: milestone_approvals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.milestone_approvals ENABLE ROW LEVEL SECURITY;

--
-- Name: milestones; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

--
-- Name: notification_digest_queue; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notification_digest_queue ENABLE ROW LEVEL SECURITY;

--
-- Name: notification_preferences; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

--
-- Name: notification_queue; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

--
-- Name: notification_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: offer_negotiations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.offer_negotiations ENABLE ROW LEVEL SECURITY;

--
-- Name: offers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

--
-- Name: onboarding_checklist; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.onboarding_checklist ENABLE ROW LEVEL SECURITY;

--
-- Name: onboarding_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.onboarding_events ENABLE ROW LEVEL SECURITY;

--
-- Name: pack_performance; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pack_performance ENABLE ROW LEVEL SECURITY;

--
-- Name: payment_alerts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payment_alerts ENABLE ROW LEVEL SECURITY;

--
-- Name: payment_analytics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payment_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: payment_analytics_summary; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payment_analytics_summary ENABLE ROW LEVEL SECURITY;

--
-- Name: payment_methods; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

--
-- Name: payment_notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payment_notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: payment_receipts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;

--
-- Name: payment_reconciliations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payment_reconciliations ENABLE ROW LEVEL SECURITY;

--
-- Name: payment_reminders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payment_reminders ENABLE ROW LEVEL SECURITY;

--
-- Name: payment_schedules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payment_schedules ENABLE ROW LEVEL SECURITY;

--
-- Name: payment_transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: payments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

--
-- Name: payout_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payout_items ENABLE ROW LEVEL SECURITY;

--
-- Name: payouts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

--
-- Name: performance_metrics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

--
-- Name: platform_metrics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.platform_metrics ENABLE ROW LEVEL SECURITY;

--
-- Name: points_transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: popular_searches; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.popular_searches ENABLE ROW LEVEL SECURITY;

--
-- Name: portfolio_images; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.portfolio_images ENABLE ROW LEVEL SECURITY;

--
-- Name: predictive_insights; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.predictive_insights ENABLE ROW LEVEL SECURITY;

--
-- Name: pricing_hints; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pricing_hints ENABLE ROW LEVEL SECURITY;

--
-- Name: pro_badges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pro_badges ENABLE ROW LEVEL SECURITY;

--
-- Name: pro_targets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pro_targets ENABLE ROW LEVEL SECURITY;

--
-- Name: professional_applications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.professional_applications ENABLE ROW LEVEL SECURITY;

--
-- Name: professional_availability; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.professional_availability ENABLE ROW LEVEL SECURITY;

--
-- Name: professional_badges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.professional_badges ENABLE ROW LEVEL SECURITY;

--
-- Name: professional_deals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.professional_deals ENABLE ROW LEVEL SECURITY;

--
-- Name: professional_documents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.professional_documents ENABLE ROW LEVEL SECURITY;

--
-- Name: professional_earnings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.professional_earnings ENABLE ROW LEVEL SECURITY;

--
-- Name: professional_portfolio; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.professional_portfolio ENABLE ROW LEVEL SECURITY;

--
-- Name: professional_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: professional_reviews; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.professional_reviews ENABLE ROW LEVEL SECURITY;

--
-- Name: professional_scores; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.professional_scores ENABLE ROW LEVEL SECURITY;

--
-- Name: professional_service_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.professional_service_items ENABLE ROW LEVEL SECURITY;

--
-- Name: professional_services; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.professional_services ENABLE ROW LEVEL SECURITY;

--
-- Name: professional_stats; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.professional_stats ENABLE ROW LEVEL SECURITY;

--
-- Name: professional_stripe_accounts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.professional_stripe_accounts ENABLE ROW LEVEL SECURITY;

--
-- Name: professional_verifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.professional_verifications ENABLE ROW LEVEL SECURITY;

--
-- Name: profile_views; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: project_completions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.project_completions ENABLE ROW LEVEL SECURITY;

--
-- Name: properties; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

--
-- Name: services_micro public_read_active_services; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY public_read_active_services ON public.services_micro FOR SELECT USING (((is_active = true) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: query_performance_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.query_performance_log ENABLE ROW LEVEL SECURITY;

--
-- Name: question_metrics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.question_metrics ENABLE ROW LEVEL SECURITY;

--
-- Name: question_pack_audit; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.question_pack_audit ENABLE ROW LEVEL SECURITY;

--
-- Name: question_packs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.question_packs ENABLE ROW LEVEL SECURITY;

--
-- Name: quote_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: quotes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

--
-- Name: rate_limit_tracking; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.rate_limit_tracking ENABLE ROW LEVEL SECURITY;

--
-- Name: rating_summary; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.rating_summary ENABLE ROW LEVEL SECURITY;

--
-- Name: read_receipts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.read_receipts ENABLE ROW LEVEL SECURITY;

--
-- Name: redirect_analytics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.redirect_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: referral_codes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

--
-- Name: referrals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

--
-- Name: refund_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: refunds; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

--
-- Name: report_exports; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.report_exports ENABLE ROW LEVEL SECURITY;

--
-- Name: report_schedules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.report_schedules ENABLE ROW LEVEL SECURITY;

--
-- Name: report_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: resolution_enforcement_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.resolution_enforcement_log ENABLE ROW LEVEL SECURITY;

--
-- Name: dispute_resolutions resolutions_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY resolutions_admin_all ON public.dispute_resolutions USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: revenue_analytics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.revenue_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: revenue_forecasts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.revenue_forecasts ENABLE ROW LEVEL SECURITY;

--
-- Name: review_flags; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.review_flags ENABLE ROW LEVEL SECURITY;

--
-- Name: review_helpful_votes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.review_helpful_votes ENABLE ROW LEVEL SECURITY;

--
-- Name: review_helpfulness; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.review_helpfulness ENABLE ROW LEVEL SECURITY;

--
-- Name: review_media; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.review_media ENABLE ROW LEVEL SECURITY;

--
-- Name: review_reports; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;

--
-- Name: review_responses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.review_responses ENABLE ROW LEVEL SECURITY;

--
-- Name: reviews; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

--
-- Name: saved_reports; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.saved_reports ENABLE ROW LEVEL SECURITY;

--
-- Name: saved_searches; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

--
-- Name: scheduled_payments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.scheduled_payments ENABLE ROW LEVEL SECURITY;

--
-- Name: search_analytics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: search_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

--
-- Name: security_audit_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

--
-- Name: security_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

--
-- Name: service_addons; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.service_addons ENABLE ROW LEVEL SECURITY;

--
-- Name: service_categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: service_micro_categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.service_micro_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: service_name_map; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.service_name_map ENABLE ROW LEVEL SECURITY;

--
-- Name: service_options; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.service_options ENABLE ROW LEVEL SECURITY;

--
-- Name: service_questions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.service_questions ENABLE ROW LEVEL SECURITY;

--
-- Name: service_subcategories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.service_subcategories ENABLE ROW LEVEL SECURITY;

--
-- Name: services; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

--
-- Name: services_micro; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.services_micro ENABLE ROW LEVEL SECURITY;

--
-- Name: services_micro_versions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.services_micro_versions ENABLE ROW LEVEL SECURITY;

--
-- Name: services_unified; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.services_unified ENABLE ROW LEVEL SECURITY;

--
-- Name: services_unified_v1; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.services_unified_v1 ENABLE ROW LEVEL SECURITY;

--
-- Name: shared_documents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.shared_documents ENABLE ROW LEVEL SECURITY;

--
-- Name: site_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: smart_matches; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.smart_matches ENABLE ROW LEVEL SECURITY;

--
-- Name: spam_keywords; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.spam_keywords ENABLE ROW LEVEL SECURITY;

--
-- Name: stripe_customers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;

--
-- Name: support_tickets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

--
-- Name: system_activity_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.system_activity_log ENABLE ROW LEVEL SECURITY;

--
-- Name: system_health_metrics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.system_health_metrics ENABLE ROW LEVEL SECURITY;

--
-- Name: system_metrics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;

--
-- Name: ticket_attachments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;

--
-- Name: ticket_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: transaction_notes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.transaction_notes ENABLE ROW LEVEL SECURITY;

--
-- Name: two_factor_auth; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.two_factor_auth ENABLE ROW LEVEL SECURITY;

--
-- Name: typing_indicators; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;

--
-- Name: user_achievements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

--
-- Name: user_activity_metrics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_activity_metrics ENABLE ROW LEVEL SECURITY;

--
-- Name: user_badges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

--
-- Name: user_blocks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

--
-- Name: user_cohorts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_cohorts ENABLE ROW LEVEL SECURITY;

--
-- Name: user_compliance_status; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_compliance_status ENABLE ROW LEVEL SECURITY;

--
-- Name: user_devices; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;

--
-- Name: user_feedback; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

--
-- Name: user_points; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

--
-- Name: user_presence; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles_audit_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles_audit_log ENABLE ROW LEVEL SECURITY;

--
-- Name: user_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: ux_health_checks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ux_health_checks ENABLE ROW LEVEL SECURITY;

--
-- Name: video_calls; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.video_calls ENABLE ROW LEVEL SECURITY;

--
-- Name: webhook_deliveries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

--
-- Name: webhook_endpoints; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;

--
-- Name: webhook_subscriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.webhook_subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: workflow_automations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.workflow_automations ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


