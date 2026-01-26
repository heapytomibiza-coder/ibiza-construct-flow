-- Sprint 1: RLS Tightening + SECURITY DEFINER Hygiene (Fixed)
-- =============================================================

-- 1. Fix SECURITY DEFINER functions missing search_path
-- -----------------------------------------------------

-- Fix get_service_view_count
CREATE OR REPLACE FUNCTION public.get_service_view_count(p_service_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COUNT(DISTINCT session_id)::INTEGER
  FROM public.service_views
  WHERE service_id = p_service_id;
$$;

-- Fix update_conversation_timestamp
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.conversations
  SET 
    last_message_at = NEW.created_at,
    updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

-- 2. Tighten RLS on CRITICAL financial tables
-- -------------------------------------------

-- Drop overly permissive policies on escrow_releases
DROP POLICY IF EXISTS "System can manage escrow releases" ON public.escrow_releases;

-- Service role only (for webhook/backend)
CREATE POLICY "Service role manages escrow releases"
ON public.escrow_releases
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users can view their own releases
CREATE POLICY "Users can view own escrow releases"
ON public.escrow_releases
FOR SELECT
TO authenticated
USING (
  released_by = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.escrow_payments ep 
    WHERE ep.id = escrow_releases.payment_id 
    AND ep.client_id = auth.uid()
  )
);

-- Drop overly permissive policies on exchange_rates
DROP POLICY IF EXISTS "System can manage exchange rates" ON public.exchange_rates;

-- Only service role can manage exchange rates
CREATE POLICY "Service role manages exchange rates"
ON public.exchange_rates
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Everyone can read exchange rates (public data)
CREATE POLICY "Anyone can read exchange rates"
ON public.exchange_rates
FOR SELECT
TO public
USING (true);

-- 3. Tighten RLS on background_jobs
-- ---------------------------------
DROP POLICY IF EXISTS "System can manage jobs" ON public.background_jobs;

CREATE POLICY "Service role manages background jobs"
ON public.background_jobs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 4. Tighten RLS on kpi_cache
-- ---------------------------
DROP POLICY IF EXISTS "System can manage cache" ON public.kpi_cache;

CREATE POLICY "Service role manages kpi cache"
ON public.kpi_cache
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Admins can read cache
CREATE POLICY "Admins can view kpi cache"
ON public.kpi_cache
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- 5. Tighten RLS on funnel_analytics
-- ----------------------------------
DROP POLICY IF EXISTS "System can manage funnels" ON public.funnel_analytics;

CREATE POLICY "Service role manages funnel analytics"
ON public.funnel_analytics
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Admins can read funnel analytics
CREATE POLICY "Admins can view funnel analytics"
ON public.funnel_analytics
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- 6. Tighten RLS on micro_questions_ai_runs
-- -----------------------------------------
DROP POLICY IF EXISTS "System can manage AI runs" ON public.micro_questions_ai_runs;

CREATE POLICY "Service role manages AI runs"
ON public.micro_questions_ai_runs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 7. Tighten RLS on micro_questions_snapshot
-- ------------------------------------------
DROP POLICY IF EXISTS "System can manage snapshots" ON public.micro_questions_snapshot;

CREATE POLICY "Service role manages snapshots"
ON public.micro_questions_snapshot
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 8. Tighten RLS on booking_reminders
-- -----------------------------------
DROP POLICY IF EXISTS "System can manage reminders" ON public.booking_reminders;

CREATE POLICY "Service role manages booking reminders"
ON public.booking_reminders
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users can view their own reminders
CREATE POLICY "Users can view own booking reminders"
ON public.booking_reminders
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 9. Tighten RLS on leaderboard_entries
-- -------------------------------------
DROP POLICY IF EXISTS "System can manage leaderboard entries" ON public.leaderboard_entries;

CREATE POLICY "Service role manages leaderboard"
ON public.leaderboard_entries
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Everyone can read leaderboard (public)
CREATE POLICY "Anyone can view leaderboard"
ON public.leaderboard_entries
FOR SELECT
TO public
USING (true);