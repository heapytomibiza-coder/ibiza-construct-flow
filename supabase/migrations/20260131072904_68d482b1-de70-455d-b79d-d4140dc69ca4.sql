-- Add retention cleanup function for security/audit tables
CREATE OR REPLACE FUNCTION public.cleanup_old_security_records()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- stripe_processed_events: keep 180 days
  DELETE FROM public.stripe_processed_events
  WHERE processed_at < now() - interval '180 days';
  
  -- payment_idempotency_keys: keep 90 days  
  DELETE FROM public.payment_idempotency_keys
  WHERE created_at < now() - interval '90 days';
  
  -- rate_limits: keep 30 days
  DELETE FROM public.rate_limits
  WHERE window_start < now() - interval '30 days';
  
  -- automation_executions: keep 90 days
  DELETE FROM public.automation_executions
  WHERE executed_at < now() - interval '90 days';
  
  -- security_events: keep 90 days
  DELETE FROM public.security_events
  WHERE created_at < now() - interval '90 days';
END;
$$;

-- Revoke from public roles (service_role only)
REVOKE ALL ON FUNCTION public.cleanup_old_security_records() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_security_records() TO service_role;

COMMENT ON FUNCTION public.cleanup_old_security_records IS 
'Retention cleanup for security tables. Run via pg_cron or edge function cron job.';