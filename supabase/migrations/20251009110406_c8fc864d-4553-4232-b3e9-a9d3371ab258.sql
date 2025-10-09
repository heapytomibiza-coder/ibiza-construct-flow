
-- Phase 4 Security Hardening: Fix active_sessions policies and add search path to trigger functions

-- ===========================================
-- FIX 1: Lock down active_sessions table
-- ===========================================

-- Drop dangerous policies that allow anyone to INSERT/UPDATE
DROP POLICY IF EXISTS "System can manage sessions" ON public.active_sessions;
DROP POLICY IF EXISTS "System can update sessions" ON public.active_sessions;

-- Create secure policies for session management
-- Only service_role (backend) can insert sessions, not public users
CREATE POLICY "Backend can insert sessions"
ON public.active_sessions
FOR INSERT
TO service_role
WITH CHECK (true);

-- Only service_role can update sessions (for last_activity tracking)
CREATE POLICY "Backend can update sessions"
ON public.active_sessions
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- Users can still update their own sessions' last_activity
CREATE POLICY "Users can update their own session activity"
ON public.active_sessions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

COMMENT ON POLICY "Backend can insert sessions" ON public.active_sessions IS 
'Phase 4: Restricts session creation to backend/service_role only to prevent session injection attacks';

COMMENT ON POLICY "Backend can update sessions" ON public.active_sessions IS 
'Phase 4: Allows backend to update session tracking data securely';

COMMENT ON POLICY "Users can update their own session activity" ON public.active_sessions IS 
'Phase 4: Allows users to update their own session last_activity timestamp';

-- ===========================================
-- FIX 2: Add search path to remaining trigger functions (best practice)
-- ===========================================

-- 1. finalize_resolution_if_both_agree
CREATE OR REPLACE FUNCTION public.finalize_resolution_if_both_agree()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
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
$function$;

-- 2. prevent_approved_mutation
CREATE OR REPLACE FUNCTION public.prevent_approved_mutation()
 RETURNS trigger
 LANGUAGE plpgsql
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

-- 3. prevent_duplicate_reviews
CREATE OR REPLACE FUNCTION public.prevent_duplicate_reviews()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
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
$function$;

-- 4. set_auto_release_date
CREATE OR REPLACE FUNCTION public.set_auto_release_date()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  IF NEW.party_client_agreed = true AND NEW.party_professional_agreed = true THEN
    NEW.auto_execute_date := now() + interval '24 hours';
  END IF;
  RETURN NEW;
END;
$function$;

-- 5. set_message_response_time
CREATE OR REPLACE FUNCTION public.set_message_response_time()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
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
$function$;

-- 6. set_ticket_sla
CREATE OR REPLACE FUNCTION public.set_ticket_sla()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  IF NEW.sla_deadline IS NULL THEN
    NEW.sla_deadline := public.calculate_sla_deadline(NEW.priority, NEW.created_at);
  END IF;
  RETURN NEW;
END;
$function$;

-- 7. trigger_update_rating_summary
CREATE OR REPLACE FUNCTION public.trigger_update_rating_summary()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  PERFORM update_rating_summary(COALESCE(NEW.professional_id, OLD.professional_id));
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- 8-19. Simple timestamp update triggers
CREATE OR REPLACE FUNCTION public.update_analytics_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_applicant_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_dispute_last_activity()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  UPDATE public.disputes
  SET last_activity_at = now()
  WHERE id = NEW.dispute_id;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_micro_questions_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_notification_preferences_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_payment_analytics_summary_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_payment_schedules_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_professional_availability_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_realtime_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_review_helpful_counts()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.update_saved_searches_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_activation()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  IF (NEW.is_active = TRUE AND NEW.status != 'approved') THEN
    RAISE EXCEPTION 'Only approved packs can be active';
  END IF;
  RETURN NEW;
END;
$function$;

-- Add comments
COMMENT ON FUNCTION public.finalize_resolution_if_both_agree IS 'Phase 4: Protected against search path hijacking';
COMMENT ON FUNCTION public.prevent_approved_mutation IS 'Phase 4: Protected against search path hijacking';
COMMENT ON FUNCTION public.prevent_duplicate_reviews IS 'Phase 4: Protected against search path hijacking';
COMMENT ON FUNCTION public.set_auto_release_date IS 'Phase 4: Protected against search path hijacking';
COMMENT ON FUNCTION public.set_message_response_time IS 'Phase 4: Protected against search path hijacking';
COMMENT ON FUNCTION public.set_ticket_sla IS 'Phase 4: Protected against search path hijacking';
COMMENT ON FUNCTION public.trigger_update_rating_summary IS 'Phase 4: Protected against search path hijacking';
