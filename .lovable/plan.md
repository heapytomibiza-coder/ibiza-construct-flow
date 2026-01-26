

# Refined RLS Security Hardening Plan

## Summary of Findings

### Tables with RLS Enabled but No Policies (2)
- `message_attachment_metadata`
- `message_threads`

### System INSERT Tables with `{public}` Role (37 total)
These are the exact tables from the database query that have `WITH CHECK(true)` to `{public}`:

| Table | Current Policy Name |
|-------|---------------------|
| `activity_feed` | System can create activity feed entries |
| `admin_audit_log` | System can insert audit logs |
| `ai_recommendations` | System can create recommendations |
| `analytics_events` | System can insert analytics events |
| `analytics_snapshots` | System can insert analytics snapshots |
| `booking_conflicts` | System can create booking conflicts |
| `booking_risk_flags` | System can insert booking risk flags |
| `booking_workflow_executions` | System can create workflow executions |
| `business_insights` | System can insert insights |
| `calculator_share_events` | System can insert share events |
| `dispute_timeline` | System can insert timeline events |
| `document_edits` | System can insert edits |
| `early_warnings` | System can create warnings |
| `feature_flag_exposures` | System can insert exposures |
| `invoice_payments` | System can create invoice payments |
| `job_state_transitions` | System can insert state transitions |
| `notifications` | System can create notifications |
| `payment_receipts` | System can create receipts |
| `payment_reminders` | System can insert payment reminders |
| `payment_transactions` | System can insert transactions |
| `payments` | System can insert payments |
| `points_transactions` | System can create transactions |
| `profile_views` | System can track profile views |
| `query_performance_log` | System can insert query performance logs |
| `question_metrics` | System can insert metrics |
| `referrals` | System can create referrals |
| `resolution_enforcement_log` | enforcement_log_insert_system |
| `search_analytics` | System can insert search analytics |
| `security_audit_log` | System can insert audit logs |
| `service_views` | Anyone can log service views |
| `system_activity_log` | System can insert activity log |
| `system_health_metrics` | System can insert health metrics |
| `system_metrics` | System can insert metrics |
| `user_achievements` | System can create user achievements |
| `user_badges` | System can award badges |
| `user_feedback` | Users can create feedback |
| `ux_health_checks` | System can insert UX health checks |

### Client-Side Write Dependencies (CRITICAL)
Based on codebase search, these tables have **direct client writes** and must NOT be converted to service_role-only:

| Table | Client Usage | Required RLS Pattern |
|-------|--------------|---------------------|
| `notifications` | Updates `read_at` field | Owner can UPDATE own notifications |
| `notification_preferences` | Full CRUD via hooks | Owner can manage own preferences |
| `analytics_events` | Client inserts UI events | Authenticated can INSERT |
| `payment_transactions` | Admin bulk updates | Admin-only UPDATE (not service_role-only) |

---

## Phase 1: Fix Tables with No Policies

Using EXISTS for performance and proper NULL handling as recommended.

### message_attachment_metadata

```sql
-- Drop existing if re-running
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
```

### message_threads

```sql
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
```

---

## Phase 2: Triage System INSERT Policies

### Bucket A: Pure System Tables → service_role Only (29 tables)

These tables have NO client writes and should be backend-only:

```sql
-- Pattern: Revoke privileges first, then create service_role policy
-- This prevents accidental exposure even if policies are misconfigured later

DO $$
DECLARE
  system_tables text[] := ARRAY[
    'activity_feed',
    'admin_audit_log',
    'ai_recommendations',
    'analytics_snapshots',
    'booking_conflicts',
    'booking_risk_flags',
    'booking_workflow_executions',
    'business_insights',
    'calculator_share_events',
    'dispute_timeline',
    'document_edits',
    'early_warnings',
    'feature_flag_exposures',
    'invoice_payments',
    'job_state_transitions',
    'payment_receipts',
    'payment_reminders',
    'payments',
    'points_transactions',
    'profile_views',
    'query_performance_log',
    'question_metrics',
    'referrals',
    'resolution_enforcement_log',
    'search_analytics',
    'security_audit_log',
    'system_activity_log',
    'system_health_metrics',
    'system_metrics',
    'ux_health_checks'
  ];
  t text;
BEGIN
  FOREACH t IN ARRAY system_tables LOOP
    -- Revoke INSERT from public roles
    EXECUTE format('REVOKE INSERT ON public.%I FROM anon, authenticated', t);
  END LOOP;
END $$;
```

Then drop old policies and create service_role INSERT:

```sql
-- Drop old permissive policies and create service_role INSERT
DROP POLICY IF EXISTS "System can create activity feed entries" ON public.activity_feed;
CREATE POLICY "service_role_insert" ON public.activity_feed FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert audit logs" ON public.admin_audit_log;
CREATE POLICY "service_role_insert" ON public.admin_audit_log FOR INSERT TO service_role WITH CHECK (true);

-- ... (repeat for all 29 tables)
```

### Bucket B: Client-Writable Tables → Owner-Scoped Policies (4 tables)

#### notifications (client can UPDATE read_at)

```sql
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Users can read their own notifications
CREATE POLICY "Users read own notifications"
ON public.notifications
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users update own notifications"
ON public.notifications
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Backend creates notifications
CREATE POLICY "Service role inserts notifications"
ON public.notifications
FOR INSERT TO service_role
WITH CHECK (true);

-- Revoke INSERT from client roles
REVOKE INSERT ON public.notifications FROM anon, authenticated;
```

#### notification_preferences (client has full CRUD)

```sql
-- Keep user ownership for all operations
CREATE POLICY "Users manage own notification preferences"
ON public.notification_preferences
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Service role for backend
CREATE POLICY "Service role manages notification preferences"
ON public.notification_preferences
FOR ALL TO service_role
USING (true) WITH CHECK (true);
```

#### analytics_events (client INSERTs only)

```sql
DROP POLICY IF EXISTS "System can insert analytics events" ON public.analytics_events;

-- Authenticated can INSERT (required for client-side analytics)
CREATE POLICY "Authenticated insert analytics"
ON public.analytics_events
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Service role for reads/management
CREATE POLICY "Service role manages analytics"
ON public.analytics_events
FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- Revoke SELECT/UPDATE/DELETE from client (privacy)
REVOKE SELECT, UPDATE, DELETE ON public.analytics_events FROM anon, authenticated;
```

#### payment_transactions (admin UPDATE only)

```sql
DROP POLICY IF EXISTS "System can insert transactions" ON public.payment_transactions;

-- Service role for INSERT (all inserts via edge functions)
REVOKE INSERT ON public.payment_transactions FROM anon, authenticated;
CREATE POLICY "Service role inserts transactions"
ON public.payment_transactions
FOR INSERT TO service_role
WITH CHECK (true);

-- Admin can UPDATE (for bulk refunds)
CREATE POLICY "Admins update transactions"
ON public.payment_transactions
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Users can read own transactions
CREATE POLICY "Users read own transactions"
ON public.payment_transactions
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
```

### Bucket C: User-Owned Tables (3 tables)

#### user_feedback

```sql
DROP POLICY IF EXISTS "Users can create feedback" ON public.user_feedback;

-- Users can create their own feedback
CREATE POLICY "Users create own feedback"
ON public.user_feedback
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can read their own feedback
CREATE POLICY "Users read own feedback"
ON public.user_feedback
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Service role for admin reads
CREATE POLICY "Service role manages feedback"
ON public.user_feedback
FOR ALL TO service_role
USING (true) WITH CHECK (true);
```

#### user_achievements / user_badges

```sql
-- These should be service_role INSERT (gamification via backend)
-- Users can read their own
DROP POLICY IF EXISTS "System can create user achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "System can award badges" ON public.user_badges;

REVOKE INSERT ON public.user_achievements FROM anon, authenticated;
REVOKE INSERT ON public.user_badges FROM anon, authenticated;

CREATE POLICY "Service role awards achievements"
ON public.user_achievements FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role awards badges"
ON public.user_badges FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Users read own achievements"
ON public.user_achievements FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users read own badges"
ON public.user_badges FOR SELECT TO authenticated
USING (user_id = auth.uid());
```

### Bucket D: Public Analytics (1 table)

#### service_views

```sql
-- This tracks page views - likely intentionally public
-- Option 1: Keep as-is if you want anonymous tracking
-- Option 2: Require authentication
DROP POLICY IF EXISTS "Anyone can log service views" ON public.service_views;

-- Recommended: authenticated only to prevent spam
CREATE POLICY "Authenticated can log service views"
ON public.service_views
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

REVOKE INSERT ON public.service_views FROM anon;
```

---

## Phase 3: Lighthouse Performance Audit

### Steps to Execute

1. **Desktop Audit**
   ```bash
   lighthouse https://ibiza-construct-flow.lovable.app --preset=desktop --output=html --output-path=./docs/perf/lighthouse-desktop.html
   ```

2. **Mobile Audit**
   ```bash
   lighthouse https://ibiza-construct-flow.lovable.app --preset=mobile --output=html --output-path=./docs/perf/lighthouse-mobile.html
   ```

3. **Bundle Analysis**
   - Add `rollup-plugin-visualizer` to vite config
   - Run `npm run build` and analyze output

### Known Heavy Libraries to Check
- `pdfjs-dist` - PDF rendering (very large)
- `react-big-calendar` - Calendar component
- `recharts` - Charting library
- `moment` - Date library (should be replaced with date-fns)

### Verification Points
- Ensure heavy libs are NOT in shared layout/shell components
- Confirm route-level lazy loading with `lazy(() => import(...))`
- Check for inadvertent imports in `App.tsx` or `main.tsx`

---

## Files to Create/Modify

| File | Purpose |
|------|---------|
| Database Migration | All RLS policy changes |
| `docs/RLS_TRIAGE.md` | Document policy changes and rationale |
| `docs/perf/lighthouse-mobile.html` | Mobile performance report |
| `docs/perf/lighthouse-desktop.html` | Desktop performance report |

---

## Security Impact Summary

| Category | Before | After |
|----------|--------|-------|
| Tables with no policies | 2 | 0 |
| System tables open to `{public}` | 37 | 0 |
| Anonymous INSERT access | 37 tables | 0 tables |
| Client-writable with proper RLS | 0 | 4 (owner-scoped) |
| Service-role only inserts | ~10 | ~33 |

---

## Testing Checklist

After implementation:

1. **Message attachments/threads**
   - [ ] User A cannot see attachments from User B's conversation
   - [ ] User can insert attachment metadata only for messages they sent

2. **Notifications**
   - [ ] User can mark own notifications as read
   - [ ] User cannot see other users' notifications

3. **Analytics**
   - [ ] Frontend analytics still logs events (no permission denied)
   - [ ] Users cannot read analytics_events table

4. **Payment transactions**
   - [ ] Admin can bulk update transaction status
   - [ ] Regular users cannot update transactions

5. **System tables**
   - [ ] No "permission denied" errors in console for normal flows
   - [ ] Edge functions can still write to system tables

