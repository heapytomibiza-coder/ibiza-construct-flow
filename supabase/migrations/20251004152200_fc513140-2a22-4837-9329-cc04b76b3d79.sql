-- Phase 1: Fix Critical Data Exposure - Restrict competitive business intelligence tables
DROP POLICY IF EXISTS "Professional service items are publicly readable" ON professional_service_items;
CREATE POLICY "Authenticated users can view service items" 
ON professional_service_items FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Pricing hints are publicly readable" ON pricing_hints;
CREATE POLICY "Authenticated users can view pricing hints" 
ON pricing_hints FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Services micro are publicly readable" ON services_micro;
CREATE POLICY "Authenticated users can view services" 
ON services_micro FOR SELECT 
TO authenticated 
USING (true);

-- Phase 3: Harden Security Definer Functions - Add search_path protection
CREATE OR REPLACE FUNCTION public.log_activity(p_action text, p_entity_type text DEFAULT NULL::text, p_entity_id uuid DEFAULT NULL::uuid, p_changes jsonb DEFAULT NULL::jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

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

-- Phase 5: Add RLS Policies to Internal Tables - Admin-only access
CREATE POLICY "Admins can manage pack performance" 
ON pack_performance FOR ALL 
TO authenticated 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage performance metrics" 
ON performance_metrics FOR ALL 
TO authenticated 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage predictive insights" 
ON predictive_insights FOR ALL 
TO authenticated 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage question pack audit" 
ON question_pack_audit FOR ALL 
TO authenticated 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage question packs" 
ON question_packs FOR ALL 
TO authenticated 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage report templates" 
ON report_templates FOR ALL 
TO authenticated 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage system activity log" 
ON system_activity_log FOR ALL 
TO authenticated 
USING (has_role(auth.uid(), 'admin'::app_role));