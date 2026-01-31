-- ============================================
-- CRITICAL SECURITY FIX: Double-Spend + RLS Hardening
-- ============================================

-- 1) ESCROW DOUBLE-SPEND PREVENTION
-- Add unique partial index to prevent multiple active escrows per job
CREATE UNIQUE INDEX IF NOT EXISTS escrow_one_active_per_job
ON public.escrow_payments(job_id)
WHERE escrow_status IN ('pending', 'funded', 'processing');

-- 2) FIX DANGEROUS RLS POLICIES - Replace public ALL with service_role only

-- notification_digest_queue
DROP POLICY IF EXISTS "System can manage digest queue" ON public.notification_digest_queue;
CREATE POLICY "Service role manages digest queue"
ON public.notification_digest_queue FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- notification_preferences
DROP POLICY IF EXISTS "System can manage all preferences" ON public.notification_preferences;
CREATE POLICY "Users manage own preferences"
ON public.notification_preferences FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- notification_queue
DROP POLICY IF EXISTS "System can manage notifications" ON public.notification_queue;
CREATE POLICY "Service role manages notifications"
ON public.notification_queue FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- payment_analytics_summary
DROP POLICY IF EXISTS "System can manage analytics summaries" ON public.payment_analytics_summary;
CREATE POLICY "Service role manages analytics"
ON public.payment_analytics_summary FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- payment_idempotency_keys (CRITICAL - was allowing public write!)
DROP POLICY IF EXISTS "Service role full access to payment_idempotency_keys" ON public.payment_idempotency_keys;
CREATE POLICY "Service role manages idempotency"
ON public.payment_idempotency_keys FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- payments (was allowing public UPDATE!)
DROP POLICY IF EXISTS "System can update payments" ON public.payments;
CREATE POLICY "Service role updates payments"
ON public.payments FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- payout_items
DROP POLICY IF EXISTS "System can manage payout items" ON public.payout_items;
CREATE POLICY "Service role manages payout items"
ON public.payout_items FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- payouts
DROP POLICY IF EXISTS "System can manage payouts" ON public.payouts;
CREATE POLICY "Service role manages payouts"
ON public.payouts FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- refunds (was allowing public UPDATE!)
DROP POLICY IF EXISTS "System can update refunds" ON public.refunds;
CREATE POLICY "Service role updates refunds"
ON public.refunds FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- revenue_analytics
DROP POLICY IF EXISTS "System can manage revenue analytics" ON public.revenue_analytics;
CREATE POLICY "Service role manages revenue analytics"
ON public.revenue_analytics FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- popular_searches (keep SELECT public, but restrict write)
DROP POLICY IF EXISTS "System can manage popular searches" ON public.popular_searches;
CREATE POLICY "Service role manages popular searches"
ON public.popular_searches FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- review_reminder_dismissals
DROP POLICY IF EXISTS "System can manage all dismissals" ON public.review_reminder_dismissals;
CREATE POLICY "Users manage own dismissals"
ON public.review_reminder_dismissals FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3) Revoke direct table access from public/anon on sensitive tables
REVOKE ALL ON public.payments FROM anon, public;
REVOKE ALL ON public.payouts FROM anon, public;
REVOKE ALL ON public.payout_items FROM anon, public;
REVOKE ALL ON public.refunds FROM anon, public;
REVOKE ALL ON public.payment_idempotency_keys FROM anon, public;
REVOKE ALL ON public.payment_analytics_summary FROM anon, public;
REVOKE ALL ON public.revenue_analytics FROM anon, public;
REVOKE ALL ON public.notification_queue FROM anon, public;
REVOKE ALL ON public.notification_digest_queue FROM anon, public;

-- Grant authenticated minimal access where needed
GRANT SELECT ON public.payments TO authenticated;
GRANT SELECT ON public.payouts TO authenticated;
GRANT SELECT ON public.refunds TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_preferences TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.review_reminder_dismissals TO authenticated;