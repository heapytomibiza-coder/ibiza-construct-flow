-- Fix SECURITY DEFINER functions missing SET search_path
-- This prevents search path manipulation attacks

-- Fix update_professional_stats function
CREATE OR REPLACE FUNCTION public.update_professional_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Fix update_webhook_subscriptions_updated_at function
CREATE OR REPLACE FUNCTION public.update_webhook_subscriptions_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix log_dispute_evidence_upload function
CREATE OR REPLACE FUNCTION public.log_dispute_evidence_upload()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Fix handle_verification_approval function
CREATE OR REPLACE FUNCTION public.handle_verification_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Fix log_job_view_attempt function
CREATE OR REPLACE FUNCTION public.log_job_view_attempt()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Fix auto_release_milestone_payment function
CREATE OR REPLACE FUNCTION public.auto_release_milestone_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Fix update_conversation_last_message function
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.conversations
  SET last_message_at = NEW.created_at,
      updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$function$;

-- Fix calculate_invoice_totals function
CREATE OR REPLACE FUNCTION public.calculate_invoice_totals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Fix prevent_approved_mutation function
CREATE OR REPLACE FUNCTION public.prevent_approved_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Fix track_job_lifecycle function
CREATE OR REPLACE FUNCTION public.track_job_lifecycle()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Fix create_booking_reminders function
CREATE OR REPLACE FUNCTION public.create_booking_reminders(p_booking_id uuid, p_user_id uuid, p_event_start timestamp with time zone)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Fix trigger_create_booking_reminders function
CREATE OR REPLACE FUNCTION public.trigger_create_booking_reminders()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NEW.event_type = 'booking' AND NEW.status = 'scheduled' THEN
    PERFORM public.create_booking_reminders(NEW.id, NEW.user_id, NEW.start_time);
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix update_user_points function
CREATE OR REPLACE FUNCTION public.update_user_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Fix update_user_tier function
CREATE OR REPLACE FUNCTION public.update_user_tier()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Fix log_job_state_transition function
CREATE OR REPLACE FUNCTION public.log_job_state_transition()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF OLD.workflow_state IS DISTINCT FROM NEW.workflow_state THEN
    INSERT INTO public.job_state_transitions (job_id, from_state, to_state, triggered_by, metadata)
    VALUES (NEW.id, OLD.workflow_state, NEW.workflow_state, auth.uid(), 
            jsonb_build_object('status', NEW.status, 'updated_at', NEW.updated_at));
  END IF;
  RETURN NEW;
END;
$function$;