
# RLS Refinement Plan: Policy Corrections

## Summary

Based on schema verification, 4 additional tables need tightening, and 2 policies need schema-accurate corrections.

---

## Phase 1: Fix 4 Missed Permissive Policies

These tables were not in the original 37 but still have `{authenticated}` WITH CHECK `true`:

### Tables to Fix

| Table | Current Policy | Action |
|-------|----------------|--------|
| `automation_executions` | System can insert automation executions | → service_role only |
| `payment_notifications` | System can create notifications | → service_role only |
| `quote_request_items` | Authenticated users can create quote items | → owner-scoped |
| `redirect_analytics` | Authenticated users can insert redirects | → authenticated with session check |

### SQL Implementation

```sql
-- 1) automation_executions - should be backend-only
REVOKE INSERT ON public.automation_executions FROM anon, authenticated;
DROP POLICY IF EXISTS "System can insert automation executions" ON public.automation_executions;
CREATE POLICY "service_role_insert" ON public.automation_executions 
  FOR INSERT TO service_role WITH CHECK (true);

-- 2) payment_notifications - should be backend-only
REVOKE INSERT ON public.payment_notifications FROM anon, authenticated;
DROP POLICY IF EXISTS "System can create notifications" ON public.payment_notifications;
CREATE POLICY "service_role_insert" ON public.payment_notifications 
  FOR INSERT TO service_role WITH CHECK (true);

-- 3) quote_request_items - needs schema check for owner column
-- (will verify if user_id or quote_request_id exists)

-- 4) redirect_analytics - likely needs auth + session tracking
-- (will verify schema before finalizing)
```

---

## Phase 2: Fix analytics_events Policy

### Current Problem
```sql
WITH CHECK (auth.uid() IS NOT NULL)  -- Too weak!
```

### Schema Confirmed
- `user_id` column exists and is **nullable** (allows both anon and auth tracking)

### Corrected Policy
Since `user_id` is nullable, we need a mixed approach:
- Authenticated users MUST set `user_id = auth.uid()` (prevents impersonation)
- Anonymous tracking would need separate handling (currently revoked)

```sql
DROP POLICY IF EXISTS "Authenticated insert analytics" ON public.analytics_events;

CREATE POLICY "Authenticated insert analytics"
ON public.analytics_events
FOR INSERT TO authenticated
WITH CHECK (
  -- If user_id is provided, it must match the authenticated user
  -- This prevents impersonation while allowing NULL user_id for session-only events
  (user_id IS NULL) OR (user_id = auth.uid())
);
```

---

## Phase 3: Fix service_views Policy

### Current Problem
```sql
WITH CHECK (auth.uid() IS NOT NULL)  -- Doesn't enforce ownership
```

### Schema Confirmed
- `viewer_id` column exists and is **nullable** (allows anonymous browsing)

### Corrected Policy
Allow authenticated users to log views, but if `viewer_id` is set, it must match:

```sql
DROP POLICY IF EXISTS "Authenticated can log service views" ON public.service_views;

CREATE POLICY "Authenticated can log service views"
ON public.service_views
FOR INSERT TO authenticated
WITH CHECK (
  -- If viewer_id is provided, it must match the authenticated user
  (viewer_id IS NULL) OR (viewer_id = auth.uid())
);
```

### Optional: Restore Anonymous Tracking (if needed for metrics)
If you want anonymous users to track views (common for marketing funnels):

```sql
CREATE POLICY "Anon can log views without viewer_id"
ON public.service_views
FOR INSERT TO anon
WITH CHECK (viewer_id IS NULL);  -- Anon cannot claim to be a user
```

---

## Phase 4: Verify quote_request_items and redirect_analytics

Need to check their schemas before finalizing policies. Will query:
- Does `quote_request_items` have a `user_id` or link to owner?
- Does `redirect_analytics` have a `user_id` or session tracking?

---

## Files to Create/Modify

| File | Purpose |
|------|---------|
| Database Migration | Refinement policies for 4 missed tables + 2 corrections |
| `docs/RLS_TRIAGE.md` | Update with additional tables |

---

## Security Impact

| Item | Before | After |
|------|--------|-------|
| Remaining `{authenticated}` WITH CHECK `true` | 4 tables | 0 tables |
| `analytics_events` impersonation risk | Possible | Blocked |
| `service_views` impersonation risk | Possible | Blocked |

---

## Testing Checklist

After implementation:

1. **Analytics events**
   - [ ] Authenticated user can insert event with `user_id = auth.uid()`
   - [ ] Authenticated user can insert event with `user_id = NULL` (session-only)
   - [ ] Authenticated user CANNOT insert event with `user_id = some_other_id`

2. **Service views**
   - [ ] Same pattern as analytics_events

3. **System tables (automation_executions, payment_notifications)**
   - [ ] Frontend doesn't break (these should be edge-function-only)

4. **Run verification query**
   - [ ] Zero remaining `{authenticated}` WITH CHECK `true` policies
