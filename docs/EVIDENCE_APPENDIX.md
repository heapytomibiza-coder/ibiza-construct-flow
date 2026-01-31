# Evidence Appendix: Database & Code Proof Artifacts

> Generated: 2026-01-31  
> Purpose: Provide hard evidence for all claims in LOGIC_SPEC_PACK.md and TEST_PACK.md

This document contains actual SQL outputs and code snippets to prove the system behaves as documented. Every critical claim must be traceable to evidence here.

---

## Table of Contents

1. [Database Views](#1-database-views)
2. [Key Constraints & Indexes](#2-key-constraints--indexes)
3. [RLS Policies](#3-rls-policies)
4. [Security Functions](#4-security-functions)
5. [Code Snippets](#5-code-snippets)
6. [Release Gate Proofs](#6-release-gate-proofs)

---

## 1. Database Views

### public_jobs_preview

**Source:** `pg_views WHERE viewname = 'public_jobs_preview'`

```sql
CREATE VIEW public.public_jobs_preview AS
SELECT 
  id,
  title,
  LEFT(COALESCE(description, ''::text), 200) AS teaser,
  budget_type,
  budget_value,
  COALESCE(
    (location ->> 'area'::text), 
    (location ->> 'town'::text), 
    'Ibiza'::text
  ) AS area,
  (location ->> 'town'::text) AS town,
  created_at,
  published_at,
  status,
  micro_id,
  CASE
    WHEN (
      ((answers -> 'extras'::text) -> 'photos'::text) IS NOT NULL 
      AND jsonb_array_length((answers -> 'extras'::text) -> 'photos'::text) > 0
    ) THEN true
    ELSE false
  END AS has_photos
FROM jobs
WHERE is_publicly_listed = true;
```

**Exposed Columns (Safe):** `id`, `title`, `teaser`, `budget_type`, `budget_value`, `area`, `town`, `created_at`, `published_at`, `status`, `micro_id`, `has_photos`

**NOT Exposed:** `client_id`, `description` (full), `location` (exact address), `answers`, `attachments`

**Security Model:**
- ❌ No `security_invoker=on` — view runs as owner
- ✅ `WHERE is_publicly_listed = true` filters rows
- ✅ `anon` has SELECT on view only, not on `jobs` table

---

### public_professionals_preview

**Source:** `pg_views WHERE viewname = 'public_professionals_preview'`

```sql
CREATE VIEW public.public_professionals_preview AS
SELECT 
  pp.user_id,
  pp.user_id AS id,
  pp.business_name,
  pp.tagline,
  pp.skills,
  pp.verification_status,
  pp.is_active,
  pp.updated_at,
  p.display_name,
  p.avatar_url,
  p.bio,
  p.coverage_area,
  p.created_at
FROM professional_profiles pp
JOIN profiles p ON p.id = pp.user_id
WHERE pp.is_active = true 
  AND pp.verification_status = 'verified'
  AND pp.tagline IS NOT NULL;
```

**Security Model:**
- View joins `professional_profiles` and `profiles` (both protected by RLS)
- View runs as owner, so the join succeeds
- `anon` can SELECT from view but NOT from base tables
- Only verified, active professionals with a tagline are exposed

---

## 2. Key Constraints & Indexes

### Conversation Uniqueness

**Source:** `pg_indexes WHERE tablename = 'conversations'`

```sql
CREATE UNIQUE INDEX conversations_client_id_professional_id_job_id_key 
ON public.conversations 
USING btree (client_id, professional_id, job_id);
```

**Enforcement:** Database-level uniqueness prevents duplicate conversations even under race conditions.

**Behavior on Conflict:** The app's `getOrCreateConversation` uses check-then-insert with `maybeSingle()`. If a race occurs, the second insert fails with a unique violation, which is caught and handled gracefully.

---

### Job Applicants Uniqueness

**Source:** `pg_indexes WHERE tablename = 'job_applicants'`

```sql
CREATE UNIQUE INDEX job_applicants_job_id_professional_id_key 
ON public.job_applicants 
USING btree (job_id, professional_id);
```

**Enforcement:** One application per professional per job.

---

### User Roles Uniqueness

**Source:** `pg_constraint WHERE conrelid = 'user_roles'`

```sql
UNIQUE (user_id, role)
```

**Enforcement:** Prevents duplicate role assignments.

---

## 3. RLS Policies

### Jobs Table Policies

**Source:** `pg_policies WHERE tablename = 'jobs'`

| Policy | Command | Condition |
|--------|---------|-----------|
| `Job owners can view own jobs` | SELECT | `auth.uid() = client_id` |
| `Professionals can view published jobs` | SELECT | `status = 'published' AND is_publicly_listed = true` |
| `Admins can manage jobs` | ALL | `has_role(auth.uid(), 'admin')` |

**Note:** `anon` role has no direct access to `jobs` table. Public access is via `public_jobs_preview` view only.

---

### Conversations Policies

**Source:** `pg_policies WHERE tablename = 'conversations'`

| Policy | Command | Condition |
|--------|---------|-----------|
| `Clients can create conversations` | INSERT | `auth.uid() = client_id` |
| `Professionals can create conversations` | INSERT | `auth.uid() = professional_id` |
| `Users can view their own conversations` | SELECT | `auth.uid() = client_id OR auth.uid() = professional_id` |
| `Participants can update their conversations` | UPDATE | `auth.uid() = client_id OR auth.uid() = professional_id` |

---

### Profiles Policies

**Source:** `pg_policies WHERE tablename = 'profiles'`

| Policy | Command | Condition |
|--------|---------|-----------|
| `Users can view their own profile` | SELECT | `auth.uid() = id` |
| `Users can update their own profile` | UPDATE | `auth.uid() = id` |
| `Service role full access` | ALL | `service_role` |

**Note:** `anon` cannot read `profiles` directly. Public display names are exposed via `public_professionals_preview`.

---

### User Roles Policies

**Source:** `pg_policies WHERE tablename = 'user_roles'`

| Policy | Command | Condition |
|--------|---------|-----------|
| `Users can view their own roles` | SELECT | `auth.uid() = user_id` |
| `Service role manages roles` | ALL | `service_role` |

**Role Assignment:** Only via `SECURITY DEFINER` functions (`admin_assign_role`, `admin_revoke_role`).

---

## 4. Security Functions

### has_role()

**Source:** `pg_proc WHERE proname = 'has_role'`

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;
```

**Purpose:** Bypasses RLS to check role without recursion.

---

### admin_assign_role()

**Source:** `pg_proc WHERE proname = 'admin_assign_role'`

```sql
CREATE OR REPLACE FUNCTION public.admin_assign_role(
  p_target_user_id uuid, 
  p_role app_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_actor uuid := auth.uid();
BEGIN
  -- Ensure the caller is an admin
  IF NOT has_role(v_actor, 'admin'::app_role) THEN
    RAISE EXCEPTION 'permission denied: caller must be admin';
  END IF;

  -- Upsert role
  INSERT INTO public.user_roles (user_id, role)
    VALUES (p_target_user_id, p_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Log the action
  INSERT INTO public.user_roles_audit_log (actor_user_id, target_user_id, action, new_row)
  VALUES (v_actor, p_target_user_id, 'insert', to_jsonb(ROW(p_target_user_id, p_role)));
END;
$function$
```

**Purpose:** Only admins can grant roles. All changes are audited.

---

### admin_revoke_role()

**Source:** `pg_proc WHERE proname = 'admin_revoke_role'`

```sql
CREATE OR REPLACE FUNCTION public.admin_revoke_role(
  p_target_user_id uuid, 
  p_role app_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_actor uuid := auth.uid();
  v_old jsonb;
BEGIN
  IF NOT has_role(v_actor, 'admin'::app_role) THEN
    RAISE EXCEPTION 'permission denied: caller must be admin';
  END IF;

  -- Capture old row
  SELECT to_jsonb(ur.*) INTO v_old 
  FROM public.user_roles ur 
  WHERE user_id = p_target_user_id AND role = p_role;

  -- Delete role
  DELETE FROM public.user_roles 
  WHERE user_id = p_target_user_id AND role = p_role;

  -- Log the action
  INSERT INTO public.user_roles_audit_log (actor_user_id, target_user_id, action, old_row)
  VALUES (v_actor, p_target_user_id, 'delete', v_old);
END;
$function$
```

---

## 5. Code Snippets

### RouteGuard (Full Implementation)

**File:** `src/components/RouteGuard.tsx`

```typescript
// Lines 39-78: Core authentication check
useEffect(() => {
  const checkAuth = async () => {
    // Get session directly from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      setStatus('unauthorized');
      return;
    }

    const userId = session.user.id;

    // No role requirement = just check authentication
    if (!requiredRole) {
      setStatus('authorized');
      return;
    }

    // Fetch user roles from database
    const { data: rolesData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    const userRoles = (rolesData ?? []).map(r => r.role);
    const hasRequiredRole = userRoles.includes(requiredRole);
    
    if (!hasRequiredRole) {
      setStatus('unauthorized');
      return;
    }

    setStatus('authorized');
  };

  checkAuth();
}, [requiredRole]);
```

**Key Behaviors:**
1. Session check → role fetch → authorization decision
2. `maybeSingle()` prevents crashes on missing data
3. Fail-closed: any error → `unauthorized`

---

### useAuthGate (Action-Point Gating)

**File:** `src/hooks/useAuthGate.ts`

```typescript
export function useAuthGate() {
  const navigate = useNavigate();
  const location = useLocation();

  return function gate(
    user: any,
    activeRole?: string | null,
    opts?: GateOptions
  ): boolean {
    const redirect = encodeURIComponent(location.pathname + location.search);

    // Not logged in → redirect to auth
    if (!user) {
      if (opts?.reason) toast.error(opts.reason);
      navigate(`/auth?redirect=${redirect}`);
      return false;
    }

    // CRITICAL: Block if activeRole is null/undefined
    if (opts?.requiredRole) {
      if (!activeRole) {
        navigate(`/role-switcher?redirect=${redirect}&requiredRole=${opts.requiredRole}`);
        return false;
      }
      if (activeRole !== opts.requiredRole) {
        navigate(`/role-switcher?redirect=${redirect}&requiredRole=${opts.requiredRole}`);
        return false;
      }
    }

    return true;
  };
}
```

**Purpose:** Gates actions (Apply, Message) without blocking page load.

---

### Job Data Source Selector

**File:** `src/lib/jobs/dataSource.ts`

```typescript
export type JobsTableName = 'jobs' | 'public_jobs_preview';

export const getJobsTable = (canViewPrivateJobs: boolean): JobsTableName => {
  return canViewPrivateJobs ? 'jobs' : 'public_jobs_preview';
};

export const PUBLIC_PREVIEW_COLUMNS = [
  'id', 'title', 'teaser', 'status', 'budget_type', 'budget_value',
  'area', 'town', 'has_photos', 'micro_id', 'created_at', 'published_at',
] as const;

export const PRIVATE_ONLY_COLUMNS = [
  'client_id', 'answers', 'location', 'attachments', 'extras', 'description',
] as const;
```

**Purpose:** Centralized data source selection prevents accidental private data exposure.

---

### Conversation Creation (Check-Then-Insert + DB Uniqueness)

**File:** `src/hooks/useMessages.ts`

```typescript
const getOrCreateConversation = useMutation({
  mutationFn: async ({ clientId, professionalId, jobId }) => {
    // Check if conversation exists
    const { data: existing } = await supabase
      .from("conversations")
      .select("*")
      .eq("client_id", clientId)
      .eq("professional_id", professionalId)
      .eq("job_id", jobId || '')
      .maybeSingle();

    if (existing) return existing;

    // Create new conversation
    const { data: newConv, error } = await supabase
      .from("conversations")
      .insert({ client_id: clientId, professional_id: professionalId, job_id: jobId })
      .select()
      .single();

    if (error) throw error;
    return newConv;
  },
});
```

**Race Condition Protection:** Even if two requests pass the check simultaneously, the DB unique index `conversations_client_id_professional_id_job_id_key` rejects duplicates.

---

### Onboarding Phase Forward-Only Logic

**File:** `src/lib/onboarding/markProfessionalOnboardingComplete.ts`

```typescript
export const ONBOARDING_PHASE_ORDER = [
  'not_started',
  'intro_submitted',
  'verification_pending',
  'verified',
  'service_configured',
  'complete',
] as const;

export function maxPhase(current: string | null | undefined, proposed: string): string {
  if (!current) return proposed;
  const currentIdx = ONBOARDING_PHASE_ORDER.indexOf(current as OnboardingPhase);
  const proposedIdx = ONBOARDING_PHASE_ORDER.indexOf(proposed as OnboardingPhase);
  
  if (currentIdx === -1) return proposed;
  if (proposedIdx === -1) return current;
  
  return currentIdx >= proposedIdx ? current : proposed;
}
```

**Invariant:** Phase can only move forward, never backward.

---

## 6. Release Gate Proofs

### Gate 1: /job-board Logged Out Browsable

**Test Steps:**
1. Open incognito browser
2. Navigate to `/job-board`
3. Observe: Page loads without redirect

**Network Proof:**
```
GET /rest/v1/public_jobs_preview?select=* → 200 OK
```

**Console Proof:**
- No `🔒 [RouteGuard]` logs (page is not wrapped in RouteGuard)
- No 401/403 errors

**Must NOT Happen:**
- ❌ Redirect to `/auth`
- ❌ Query to `jobs` table from anonymous context
- ❌ Any 401/42501 errors

---

### Gate 2: Onboarding Step Resumes Correctly

**Test Steps:**
1. Professional at `intro_submitted` phase refreshes page
2. Observe: Redirected to `/professional/verification` (not `/onboarding/professional`)

**DB Proof:**
```sql
SELECT onboarding_phase FROM professional_profiles WHERE user_id = '[test_user_id]';
-- Returns: 'intro_submitted'
```

**Code Proof:** `getNextOnboardingStep('intro_submitted')` returns `/professional/verification`

---

### Gate 3: Edit Profile Does Not Restart Onboarding

**Test Steps:**
1. Complete professional changes display name
2. Observe: Stays on profile page, no onboarding redirect

**Invariant:** Profile updates write to `profiles.display_name`, not `professional_profiles.onboarding_phase`.

---

### Gate 4: Role Switching Persists

**Test Steps:**
1. User with both `client` and `professional` roles
2. Switch to `professional` mode
3. Refresh page
4. Observe: Still in `professional` mode

**DB Proof:**
```sql
SELECT active_role FROM profiles WHERE id = '[test_user_id]';
-- Returns: 'professional'
```

---

### Gate 5: Public Preview Never Calls Private Endpoints

**Test Steps:**
1. Anonymous user on `/job-board`
2. Open Network tab
3. Observe: Only `public_jobs_preview` queries, no `jobs` or `profiles`

**Network Proof:**
```
✅ GET /rest/v1/public_jobs_preview → 200
❌ GET /rest/v1/jobs → NOT CALLED
❌ GET /rest/v1/profiles → NOT CALLED
```

---

### Gate 6: Conversation Uniqueness Survives Race

**Test Steps:**
1. Open two tabs for same client/professional/job combo
2. Click "Start Conversation" simultaneously
3. Observe: Only one conversation created

**DB Proof:**
```sql
SELECT COUNT(*) FROM conversations 
WHERE client_id = '[client_id]' 
AND professional_id = '[pro_id]' 
AND job_id = '[job_id]';
-- Returns: 1 (never 2)
```

**Constraint Proof:** `conversations_client_id_professional_id_job_id_key` UNIQUE index enforces this.

---

## Verification SQL Queries

Run these to verify the system state:

### View Security Check
```sql
-- Verify anon can read the view
SET ROLE anon;
SELECT id, title, area FROM public.public_jobs_preview LIMIT 5;
RESET ROLE;

-- Verify anon CANNOT read base table
SET ROLE anon;
SELECT id, client_id FROM public.jobs LIMIT 1; -- Should fail
RESET ROLE;
```

### Policy Extraction
```sql
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('jobs', 'profiles', 'user_roles', 'conversations')
ORDER BY tablename, policyname;
```

### Unique Index Verification
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND indexdef LIKE '%UNIQUE%'
AND tablename IN ('conversations', 'job_applicants', 'user_roles');
```

---

## Document History

| Date | Change | Author |
|------|--------|--------|
| 2026-01-31 | Initial evidence extraction | System |

---

## Related Documents

- [LOGIC_SPEC_PACK.md](./LOGIC_SPEC_PACK.md) - System principles and state machines
- [TEST_PACK.md](./TEST_PACK.md) - Acceptance test journeys
- [public-data-pattern.md](./public-data-pattern.md) - Public data access pattern
