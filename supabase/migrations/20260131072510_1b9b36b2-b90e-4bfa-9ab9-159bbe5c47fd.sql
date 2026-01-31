-- Fix dangerous always-true policies for authenticated users on sensitive tables

-- automation_executions: restrict to service_role only
DROP POLICY IF EXISTS "System can insert automation executions" ON public.automation_executions;
CREATE POLICY "Service role can insert automation executions"
ON public.automation_executions
FOR INSERT
TO service_role
WITH CHECK (true);

-- financial_reports: restrict to service_role only  
DROP POLICY IF EXISTS "System can update reports" ON public.financial_reports;
CREATE POLICY "Service role can update reports"
ON public.financial_reports
FOR UPDATE
TO service_role
USING (true);

-- payment_alerts: restrict to service_role only
DROP POLICY IF EXISTS "System can manage alerts" ON public.payment_alerts;
CREATE POLICY "Service role can manage alerts"
ON public.payment_alerts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Revoke direct access from authenticated role on these tables
REVOKE INSERT ON public.automation_executions FROM authenticated;
REVOKE UPDATE ON public.financial_reports FROM authenticated;
REVOKE ALL ON public.payment_alerts FROM authenticated;