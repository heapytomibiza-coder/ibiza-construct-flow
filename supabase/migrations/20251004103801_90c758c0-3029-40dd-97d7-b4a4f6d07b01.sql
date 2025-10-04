-- Phase 0: Critical Security Fix - User Roles Table

-- 1) Create role enum
DO $$ BEGIN
  CREATE TYPE app_role AS ENUM ('admin', 'client', 'professional');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3) Create SECURITY DEFINER function (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(p_user uuid, p_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = p_user AND role = p_role
  );
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated, service_role;

-- 4) Backfill user_roles from profiles.roles (jsonb array → enum rows)
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 
  CASE 
    WHEN elem::text = '"admin"' THEN 'admin'::app_role
    WHEN elem::text = '"client"' THEN 'client'::app_role
    WHEN elem::text = '"professional"' THEN 'professional'::app_role
  END as role
FROM profiles p
CROSS JOIN LATERAL jsonb_array_elements(p.roles) as elem
WHERE elem::text IN ('"admin"', '"client"', '"professional"')
ON CONFLICT (user_id, role) DO NOTHING;

-- 5) Update RLS policies to use has_role()
-- Admin events
DROP POLICY IF EXISTS "Admins can manage events" ON public.admin_events;
CREATE POLICY "Admins can manage events" ON public.admin_events FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- AI alerts
DROP POLICY IF EXISTS "Admins can manage AI alerts" ON public.ai_alerts;
CREATE POLICY "Admins can manage AI alerts" ON public.ai_alerts FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- AI automation rules
DROP POLICY IF EXISTS "Admins can manage automation rules" ON public.ai_automation_rules;
CREATE POLICY "Admins can manage automation rules" ON public.ai_automation_rules FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- AI prompts
DROP POLICY IF EXISTS "Admins can manage AI prompts" ON public.ai_prompts;
CREATE POLICY "Admins can manage AI prompts" ON public.ai_prompts FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- AI runs
DROP POLICY IF EXISTS "Admins can manage AI runs" ON public.ai_runs;
CREATE POLICY "Admins can manage AI runs" ON public.ai_runs FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Alert rules
DROP POLICY IF EXISTS "Admins can manage alert rules" ON public.alert_rules;
CREATE POLICY "Admins can manage alert rules" ON public.alert_rules FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Analytics dashboards (keep public dashboards policy, update owner policy)
DROP POLICY IF EXISTS "Users can manage their own dashboards" ON public.analytics_dashboards;
CREATE POLICY "Users can manage their own dashboards" ON public.analytics_dashboards FOR ALL
USING (auth.uid() = user_id);

-- Business metrics
DROP POLICY IF EXISTS "Admins can manage business metrics" ON public.business_metrics;
CREATE POLICY "Admins can manage business metrics" ON public.business_metrics FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Disputes (admins can view/update)
DROP POLICY IF EXISTS "Admins can update disputes" ON public.disputes;
CREATE POLICY "Admins can update disputes" ON public.disputes FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can view disputes they're involved in" ON public.disputes;
CREATE POLICY "Users can view disputes they're involved in" ON public.disputes FOR SELECT
USING (
  auth.uid() = created_by OR 
  auth.uid() = disputed_against OR 
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Generated reports
DROP POLICY IF EXISTS "Admins can manage generated reports" ON public.generated_reports;
CREATE POLICY "Admins can manage generated reports" ON public.generated_reports FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Job broadcasts
DROP POLICY IF EXISTS "Admins can manage job broadcasts" ON public.job_broadcasts;
CREATE POLICY "Admins can manage job broadcasts" ON public.job_broadcasts FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Job lifecycle events
DROP POLICY IF EXISTS "Admins can insert job lifecycle events" ON public.job_lifecycle_events;
CREATE POLICY "Admins can insert job lifecycle events" ON public.job_lifecycle_events FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can view all job lifecycle events" ON public.job_lifecycle_events;
CREATE POLICY "Admins can view all job lifecycle events" ON public.job_lifecycle_events FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Invoices (system/admin can manage)
DROP POLICY IF EXISTS "System can manage invoices" ON public.invoices;
CREATE POLICY "System can manage invoices" ON public.invoices FOR ALL
USING (
  auth.uid() = user_id OR 
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- 6) Remove roles column from profiles (prevent drift)
-- Commenting out for safety - can be run manually after verification
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS roles;