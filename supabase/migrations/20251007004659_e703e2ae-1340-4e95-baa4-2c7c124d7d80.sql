-- ============================================
-- Phase 25-26: RLS Hardening & Performance (Minimal)
-- ============================================

-- 1) Restrict analytics_events (users see own, admins see all)
DROP POLICY IF EXISTS "Users can view their own events" ON public.analytics_events;

CREATE POLICY "Users can view their own analytics"
  ON public.analytics_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all analytics"
  ON public.analytics_events FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 2) Lock down user_compliance_status (users read-only)
DROP POLICY IF EXISTS "System can update compliance status" ON public.user_compliance_status;
DROP POLICY IF EXISTS "System can update compliance status records" ON public.user_compliance_status;

CREATE POLICY "Users read only their compliance"
  ON public.user_compliance_status FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all compliance"
  ON public.user_compliance_status FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 3) Performance indexes for frequently queried tables
CREATE INDEX IF NOT EXISTS idx_events_user_category_time 
  ON public.analytics_events(user_id, event_category, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_events_session_time
  ON public.analytics_events(session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_jobs_client_status 
  ON public.jobs(client_id, status);

CREATE INDEX IF NOT EXISTS idx_jobs_status_created 
  ON public.jobs(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_roles_lookup
  ON public.user_roles(user_id, role);

CREATE INDEX IF NOT EXISTS idx_booking_requests_client
  ON public.booking_requests(client_id, status);

CREATE INDEX IF NOT EXISTS idx_booking_requests_professional
  ON public.booking_requests(professional_id, status);