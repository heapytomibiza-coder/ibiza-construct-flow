-- =============================================================================
-- RLS Security Hardening Migration
-- Phase 1: Fix tables with no policies (message_attachment_metadata, message_threads)
-- Phase 2: Triage system INSERT policies (37 tables across 4 buckets)
-- =============================================================================

-- =============================================================================
-- PHASE 1: Fix Tables with RLS Enabled but No Policies
-- =============================================================================

-- -----------------------------------------------------------------------------
-- message_attachment_metadata
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their message attachments" ON public.message_attachment_metadata;
DROP POLICY IF EXISTS "Users can insert their message attachments" ON public.message_attachment_metadata;
DROP POLICY IF EXISTS "Service role manages attachments" ON public.message_attachment_metadata;

-- SELECT: participants in the conversation can view
CREATE POLICY "Users can view their message attachments"
ON public.message_attachment_metadata
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.messages m
    JOIN public.conversations c ON c.id = m.conversation_id
    WHERE m.id = message_attachment_metadata.message_id
      AND (c.client_id = auth.uid() OR c.professional_id = auth.uid())
  )
);

-- INSERT: only if the authenticated user is the sender of that message
CREATE POLICY "Users can insert their message attachments"
ON public.message_attachment_metadata
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.messages m
    WHERE m.id = message_attachment_metadata.message_id
      AND m.sender_id = auth.uid()
  )
);

-- Service role for backend processing
CREATE POLICY "Service role manages attachments"
ON public.message_attachment_metadata
FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- message_threads
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view message threads" ON public.message_threads;
DROP POLICY IF EXISTS "Users can create message threads" ON public.message_threads;
DROP POLICY IF EXISTS "Service role manages threads" ON public.message_threads;

-- SELECT: user must be participant in either message's or parent's conversation
CREATE POLICY "Users can view message threads"
ON public.message_threads
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.messages m
    JOIN public.conversations c ON c.id = m.conversation_id
    WHERE m.id = message_threads.message_id
      AND (c.client_id = auth.uid() OR c.professional_id = auth.uid())
  )
  OR EXISTS (
    SELECT 1
    FROM public.messages pm
    JOIN public.conversations pc ON pc.id = pm.conversation_id
    WHERE pm.id = message_threads.parent_message_id
      AND (pc.client_id = auth.uid() OR pc.professional_id = auth.uid())
  )
);

-- INSERT: only for messages the user sent
CREATE POLICY "Users can create message threads"
ON public.message_threads
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.messages m
    WHERE m.id = message_threads.message_id
      AND m.sender_id = auth.uid()
  )
);

-- Service role for backend management
CREATE POLICY "Service role manages threads"
ON public.message_threads
FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- =============================================================================
-- PHASE 2: Triage System INSERT Policies
-- =============================================================================

-- -----------------------------------------------------------------------------
-- BUCKET A: Pure System Tables → service_role Only (29 tables)
-- Revoke INSERT from anon/authenticated, drop old policies, create service_role INSERT
-- -----------------------------------------------------------------------------

-- Revoke INSERT privileges from public roles for all system tables
REVOKE INSERT ON public.activity_feed FROM anon, authenticated;
REVOKE INSERT ON public.admin_audit_log FROM anon, authenticated;
REVOKE INSERT ON public.ai_recommendations FROM anon, authenticated;
REVOKE INSERT ON public.analytics_snapshots FROM anon, authenticated;
REVOKE INSERT ON public.booking_conflicts FROM anon, authenticated;
REVOKE INSERT ON public.booking_risk_flags FROM anon, authenticated;
REVOKE INSERT ON public.booking_workflow_executions FROM anon, authenticated;
REVOKE INSERT ON public.business_insights FROM anon, authenticated;
REVOKE INSERT ON public.calculator_share_events FROM anon, authenticated;
REVOKE INSERT ON public.dispute_timeline FROM anon, authenticated;
REVOKE INSERT ON public.document_edits FROM anon, authenticated;
REVOKE INSERT ON public.early_warnings FROM anon, authenticated;
REVOKE INSERT ON public.feature_flag_exposures FROM anon, authenticated;
REVOKE INSERT ON public.invoice_payments FROM anon, authenticated;
REVOKE INSERT ON public.job_state_transitions FROM anon, authenticated;
REVOKE INSERT ON public.payment_receipts FROM anon, authenticated;
REVOKE INSERT ON public.payment_reminders FROM anon, authenticated;
REVOKE INSERT ON public.payments FROM anon, authenticated;
REVOKE INSERT ON public.points_transactions FROM anon, authenticated;
REVOKE INSERT ON public.profile_views FROM anon, authenticated;
REVOKE INSERT ON public.query_performance_log FROM anon, authenticated;
REVOKE INSERT ON public.question_metrics FROM anon, authenticated;
REVOKE INSERT ON public.referrals FROM anon, authenticated;
REVOKE INSERT ON public.resolution_enforcement_log FROM anon, authenticated;
REVOKE INSERT ON public.search_analytics FROM anon, authenticated;
REVOKE INSERT ON public.security_audit_log FROM anon, authenticated;
REVOKE INSERT ON public.system_activity_log FROM anon, authenticated;
REVOKE INSERT ON public.system_health_metrics FROM anon, authenticated;
REVOKE INSERT ON public.system_metrics FROM anon, authenticated;
REVOKE INSERT ON public.ux_health_checks FROM anon, authenticated;

-- Drop old permissive policies and create service_role INSERT policies
DROP POLICY IF EXISTS "System can create activity feed entries" ON public.activity_feed;
CREATE POLICY "service_role_insert" ON public.activity_feed FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert audit logs" ON public.admin_audit_log;
CREATE POLICY "service_role_insert" ON public.admin_audit_log FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can create recommendations" ON public.ai_recommendations;
CREATE POLICY "service_role_insert" ON public.ai_recommendations FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert analytics snapshots" ON public.analytics_snapshots;
CREATE POLICY "service_role_insert" ON public.analytics_snapshots FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can create booking conflicts" ON public.booking_conflicts;
CREATE POLICY "service_role_insert" ON public.booking_conflicts FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert booking risk flags" ON public.booking_risk_flags;
CREATE POLICY "service_role_insert" ON public.booking_risk_flags FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can create workflow executions" ON public.booking_workflow_executions;
CREATE POLICY "service_role_insert" ON public.booking_workflow_executions FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert insights" ON public.business_insights;
CREATE POLICY "service_role_insert" ON public.business_insights FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert share events" ON public.calculator_share_events;
CREATE POLICY "service_role_insert" ON public.calculator_share_events FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert timeline events" ON public.dispute_timeline;
CREATE POLICY "service_role_insert" ON public.dispute_timeline FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert edits" ON public.document_edits;
CREATE POLICY "service_role_insert" ON public.document_edits FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can create warnings" ON public.early_warnings;
CREATE POLICY "service_role_insert" ON public.early_warnings FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert exposures" ON public.feature_flag_exposures;
CREATE POLICY "service_role_insert" ON public.feature_flag_exposures FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can create invoice payments" ON public.invoice_payments;
CREATE POLICY "service_role_insert" ON public.invoice_payments FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert state transitions" ON public.job_state_transitions;
CREATE POLICY "service_role_insert" ON public.job_state_transitions FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can create receipts" ON public.payment_receipts;
CREATE POLICY "service_role_insert" ON public.payment_receipts FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert payment reminders" ON public.payment_reminders;
CREATE POLICY "service_role_insert" ON public.payment_reminders FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert payments" ON public.payments;
CREATE POLICY "service_role_insert" ON public.payments FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can create transactions" ON public.points_transactions;
CREATE POLICY "service_role_insert" ON public.points_transactions FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can track profile views" ON public.profile_views;
CREATE POLICY "service_role_insert" ON public.profile_views FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert query performance logs" ON public.query_performance_log;
CREATE POLICY "service_role_insert" ON public.query_performance_log FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert metrics" ON public.question_metrics;
CREATE POLICY "service_role_insert" ON public.question_metrics FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can create referrals" ON public.referrals;
CREATE POLICY "service_role_insert" ON public.referrals FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "enforcement_log_insert_system" ON public.resolution_enforcement_log;
CREATE POLICY "service_role_insert" ON public.resolution_enforcement_log FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert search analytics" ON public.search_analytics;
CREATE POLICY "service_role_insert" ON public.search_analytics FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert audit logs" ON public.security_audit_log;
CREATE POLICY "service_role_insert" ON public.security_audit_log FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert activity log" ON public.system_activity_log;
CREATE POLICY "service_role_insert" ON public.system_activity_log FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert health metrics" ON public.system_health_metrics;
CREATE POLICY "service_role_insert" ON public.system_health_metrics FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert metrics" ON public.system_metrics;
CREATE POLICY "service_role_insert" ON public.system_metrics FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert UX health checks" ON public.ux_health_checks;
CREATE POLICY "service_role_insert" ON public.ux_health_checks FOR INSERT TO service_role WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- BUCKET B: Client-Writable Tables → Owner-Scoped Policies (4 tables)
-- -----------------------------------------------------------------------------

-- notifications (client can UPDATE read_at)
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users read own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Service role inserts notifications" ON public.notifications;

CREATE POLICY "Users read own notifications"
ON public.notifications
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users update own notifications"
ON public.notifications
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role inserts notifications"
ON public.notifications
FOR INSERT TO service_role
WITH CHECK (true);

REVOKE INSERT ON public.notifications FROM anon, authenticated;

-- notification_preferences (client has full CRUD)
DROP POLICY IF EXISTS "Users manage own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Service role manages notification preferences" ON public.notification_preferences;

CREATE POLICY "Users manage own notification preferences"
ON public.notification_preferences
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role manages notification preferences"
ON public.notification_preferences
FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- analytics_events (client INSERTs only)
DROP POLICY IF EXISTS "System can insert analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Authenticated insert analytics" ON public.analytics_events;
DROP POLICY IF EXISTS "Service role manages analytics" ON public.analytics_events;

CREATE POLICY "Authenticated insert analytics"
ON public.analytics_events
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Service role manages analytics"
ON public.analytics_events
FOR ALL TO service_role
USING (true) WITH CHECK (true);

REVOKE SELECT, UPDATE, DELETE ON public.analytics_events FROM anon, authenticated;

-- payment_transactions (admin UPDATE only)
DROP POLICY IF EXISTS "System can insert transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "Service role inserts transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "Admins update transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "Users read own transactions" ON public.payment_transactions;

REVOKE INSERT ON public.payment_transactions FROM anon, authenticated;

CREATE POLICY "Service role inserts transactions"
ON public.payment_transactions
FOR INSERT TO service_role
WITH CHECK (true);

CREATE POLICY "Admins update transactions"
ON public.payment_transactions
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users read own transactions"
ON public.payment_transactions
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- -----------------------------------------------------------------------------
-- BUCKET C: User-Owned Tables (3 tables)
-- -----------------------------------------------------------------------------

-- user_feedback
DROP POLICY IF EXISTS "Users can create feedback" ON public.user_feedback;
DROP POLICY IF EXISTS "Users create own feedback" ON public.user_feedback;
DROP POLICY IF EXISTS "Users read own feedback" ON public.user_feedback;
DROP POLICY IF EXISTS "Service role manages feedback" ON public.user_feedback;

CREATE POLICY "Users create own feedback"
ON public.user_feedback
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users read own feedback"
ON public.user_feedback
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role manages feedback"
ON public.user_feedback
FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- user_achievements
DROP POLICY IF EXISTS "System can create user achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Service role awards achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users read own achievements" ON public.user_achievements;

REVOKE INSERT ON public.user_achievements FROM anon, authenticated;

CREATE POLICY "Service role awards achievements"
ON public.user_achievements FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Users read own achievements"
ON public.user_achievements FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- user_badges
DROP POLICY IF EXISTS "System can award badges" ON public.user_badges;
DROP POLICY IF EXISTS "Service role awards badges" ON public.user_badges;
DROP POLICY IF EXISTS "Users read own badges" ON public.user_badges;

REVOKE INSERT ON public.user_badges FROM anon, authenticated;

CREATE POLICY "Service role awards badges"
ON public.user_badges FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Users read own badges"
ON public.user_badges FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- BUCKET D: Public Analytics (1 table)
-- -----------------------------------------------------------------------------

-- service_views (require authentication to prevent spam)
DROP POLICY IF EXISTS "Anyone can log service views" ON public.service_views;
DROP POLICY IF EXISTS "Authenticated can log service views" ON public.service_views;

CREATE POLICY "Authenticated can log service views"
ON public.service_views
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

REVOKE INSERT ON public.service_views FROM anon;