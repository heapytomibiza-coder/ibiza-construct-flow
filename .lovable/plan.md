
# Fix Analytics Events RLS Policy for Anonymous Tracking

## Problem Analysis

The `analytics_events` table is blocking inserts from **unauthenticated visitors** on the homepage and other public pages, causing a flood of console errors:

```
"new row violates row-level security policy for table \"analytics_events\""
```

### Root Cause

| Issue | Detail |
|-------|--------|
| **Current INSERT Policy** | Role: `{authenticated}` only |
| **CHECK Clause** | `auth.uid() IS NOT NULL` |
| **Expected Behavior** | Anonymous visitors should be able to log page views |
| **Actual Behavior** | All anonymous INSERT attempts are blocked |

The analytics system explicitly supports anonymous tracking (generates `sessionId` for all visitors, allows `user_id` to be null), but the RLS policy was incorrectly tightened to `authenticated`-only in a previous migration.

---

## Solution

Fix the RLS policy to allow **mixed anonymous + authenticated tracking** while preventing impersonation.

### Policy Logic

| User Type | Allowed? | Condition |
|-----------|----------|-----------|
| Anonymous | Yes | Must have `user_id IS NULL` (cannot claim to be a user) |
| Authenticated | Yes | Must have `user_id = auth.uid()` OR `user_id IS NULL` |
| Impersonation | No | Cannot set `user_id` to another user's ID |

---

## Database Migration

```sql
-- Fix analytics_events INSERT policy for mixed anonymous/authenticated tracking
-- The previous policy blocked anonymous visitors from logging page views

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "Authenticated insert analytics" ON public.analytics_events;

-- Allow anonymous inserts (for unauthenticated visitors)
-- They cannot claim to be a user (user_id must be NULL)
CREATE POLICY "Anon can insert analytics without user_id"
ON public.analytics_events
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

-- Allow authenticated inserts with ownership enforcement
-- If user_id is set, it must match auth.uid() (prevents impersonation)
-- If user_id is NULL, that's also allowed (session-only tracking)
CREATE POLICY "Authenticated can insert analytics with ownership"
ON public.analytics_events
FOR INSERT
TO authenticated
WITH CHECK (
  (user_id IS NULL) OR (user_id = auth.uid())
);
```

---

## Frontend Code Improvement (Optional)

Update the analytics adapter to include `user_id` when the user is authenticated, improving data quality:

**File**: `src/lib/analyticsAdapter.ts`

```typescript
// Add user_id when authenticated
import { supabase } from '@/integrations/supabase/client';

static async toRowWithUser(event: AnalyticsEventPayload): Promise<AnalyticsEventRow> {
  const baseRow = this.toRow(event);
  
  // Try to get current user ID if authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  return {
    ...baseRow,
    user_id: user?.id ?? null
  };
}
```

However, this is **not required** for the fix - the current code already works because `user_id` defaults to null.

---

## Files to Modify

| File | Action | Purpose |
|------|--------|---------|
| Database Migration | Create | Fix RLS policy for anonymous tracking |

---

## Testing Checklist

After implementation:

- [ ] Homepage loads without RLS errors in console
- [ ] Anonymous visitor page views are recorded in `analytics_events`
- [ ] Authenticated user page views include correct `user_id`
- [ ] Impersonation attack blocked (cannot insert with fake `user_id`)

---

## Security Considerations

| Concern | Mitigation |
|---------|------------|
| Spam from anonymous | Session-based tracking limits duplicate events; rate limiting can be added at edge |
| Impersonation | `user_id = auth.uid()` check prevents authenticated users from spoofing |
| Data pollution | Analytics is inherently low-trust; sensitive data stays in protected tables |

---

## Technical Details

### Why This Was Broken

The previous RLS refinement migration changed the analytics policy to:
```sql
CREATE POLICY "Authenticated insert analytics"
ON public.analytics_events
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);
```

This was too restrictive because:
1. It only grants INSERT to the `authenticated` role (not `anon`)
2. The `WITH CHECK` is redundant (authenticated users always have `auth.uid()`)
3. It doesn't consider the design requirement for anonymous visitor tracking

### Why Two Separate Policies

Supabase RLS requires separate policies for different roles. A single policy cannot have `TO anon, authenticated` - it must be split.
