-- Comprehensive fix for Function Search Path Mutable warning
-- Add SET search_path = public to all SECURITY DEFINER functions that don't have it

-- Update update_updated_at_column if needed
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update handle_new_user if needed
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Update finalize_resolution_if_both_agree
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

-- Update set_ticket_sla
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

-- Update update_payment_schedules_updated_at
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

-- Update update_professional_availability_timestamp
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