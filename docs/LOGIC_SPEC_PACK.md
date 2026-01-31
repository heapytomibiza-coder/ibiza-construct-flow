# Logic Spec Pack

> **Purpose**: Prove the dev team understands the system logic. This document contains the role matrix, state machines, invariants, and gating map.
> **Created**: 2026-01-31

---

## 1. Role & Capability Matrix

| Role | Capabilities | Automatic Grants |
|------|-------------|------------------|
| **Client** | Create jobs, edit jobs (until published), pay/escrow, message professionals, leave reviews, switch to professional mode (if dual-role) | Default for all new signups |
| **Professional** | Complete onboarding, configure services, view job board (full details), apply/quote, message clients, complete jobs, receive payments | Also gets `client` role (dual-identity) |
| **Admin** | Moderate content, verify professionals, manage disputes, override statuses, view audit logs | Requires 2FA for protected routes |

### Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Pro signup also gets client role | ✅ Always true - dual-identity guaranteed |
| Role switch via dropdown | Updates `profiles.active_role`, does not change DB permissions |
| Public job board (logged out) | Shows `public_jobs_preview` only - no login prompt |
| Unverified pro tries to access dashboard | Redirected to next onboarding step |

---

## 2. State Machines

### A. Professional Onboarding

```
┌──────────────┐    ┌──────────────────┐    ┌────────────────────┐
│ not_started  │ ─► │ intro_submitted  │ ─► │ verification_pending│
└──────────────┘    └──────────────────┘    └────────────────────┘
                                                      │
                                                      ▼
┌──────────────┐    ┌──────────────────┐    ┌────────────────────┐
│   complete   │ ◄─ │ service_configured│ ◄─ │     verified       │
└──────────────┘    └──────────────────┘    └────────────────────┘
```

**Phases & Routes:**

| Phase | UI Route | Who Can Advance |
|-------|----------|-----------------|
| `not_started` | `/onboarding/professional` | User submits intro form |
| `intro_submitted` | `/professional/verification` | User submits verification |
| `verification_pending` | `/professional/verification/status` | Admin approves |
| `verified` | `/professional/service-setup` | User configures services |
| `service_configured` | `/professional/services/wizard` | System validates service exists |
| `complete` | `/dashboard` | Requires ≥1 active service in DB |

**Key Invariants:**
- Phase can only move forward (enforced by `maxPhase()`)
- Completion requires truth-based validation (service must exist in DB)
- Refresh doesn't reset phase

**Source:** `src/lib/onboarding/markProfessionalOnboardingComplete.ts`

---

### B. Job Lifecycle

```
┌─────────┐    ┌───────────┐    ┌─────────────┐    ┌───────────┐
│  draft  │ ─► │ published │ ─► │ in_progress │ ─► │ completed │
└─────────┘    └───────────┘    └─────────────┘    └───────────┘
                     │                                    │
                     ▼                                    ▼
              ┌───────────┐                        ┌───────────┐
              │ cancelled │                        │ archived  │
              └───────────┘                        └───────────┘
```

**Visibility by Status:**

| Status | Client | Professional (Anon) | Professional (Auth) |
|--------|--------|---------------------|---------------------|
| `draft` | ✅ Full | ❌ Hidden | ❌ Hidden |
| `published` | ✅ Full | ✅ Preview only | ✅ Full |
| `in_progress` | ✅ Full | ❌ Hidden | ✅ If assigned |
| `completed` | ✅ Full | ❌ Hidden | ✅ If assigned |

**Source:** `src/lib/jobs/dataSource.ts`

---

### C. Conversation Creation

```
┌──────────────────────────────────────────┐
│ Client initiates "Start Conversation"    │
└──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│ Check: existing (client_id, pro_id, job) │
└──────────────────────────────────────────┘
          │                    │
          ▼                    ▼
    ┌──────────┐        ┌──────────────┐
    │  EXISTS  │        │ DOESN'T EXIST│
    └──────────┘        └──────────────┘
          │                    │
          ▼                    ▼
    Return existing      Insert new record
          │                    │
          └───────┬────────────┘
                  ▼
         Navigate to conversation
```

**Uniqueness Constraint:** `(client_id, professional_id, job_id)`

**Source:** `src/hooks/useMessages.ts:102-141`

---

## 3. System Invariants

These rules must **always** be true:

| # | Invariant | Enforcement |
|---|-----------|-------------|
| 1 | A user can have multiple roles, but one `active_role` | `profiles.active_role` column |
| 2 | Professional signup implies client role exists too | `handle_new_user` trigger + admin grant function |
| 3 | Public job preview never exposes private fields | `public_jobs_preview` view + `PRIVATE_ONLY_COLUMNS` guard |
| 4 | Public pages never block browsing with auth redirects | Action-point gating via `useAuthGate` |
| 5 | Onboarding phase can only advance, never regress | `maxPhase()` helper |
| 6 | Job wizard produces complete payload even without chat | Validation at form level |
| 7 | Double-click "Start Conversation" doesn't create duplicates | Check-then-insert pattern in mutation |
| 8 | Role switching doesn't wipe cached roles | Zustand persistence + realtime listener |
| 9 | Refresh during onboarding doesn't reset phase | Phase stored in `professional_profiles.onboarding_phase` |
| 10 | Deep link to `/job-board` logged out shows content | Route not wrapped in `RouteGuard` |

---

## 4. Route Gating Map

### Public Routes (No Auth Required)

| Route | Data Source | Notes |
|-------|-------------|-------|
| `/` | `public_professionals_preview`, `public_jobs_preview` | No protected table access |
| `/job-board` | `public_jobs_preview` | Apply/Message buttons gated |
| `/professionals` | `public_professionals_preview` | Message button gated |
| `/auth` | - | Login/signup |
| `/auth/callback` | - | Token exchange |

### Protected Routes

| Route | Required Role | Additional Checks |
|-------|---------------|-------------------|
| `/dashboard` | `client` or `professional` | - |
| `/dashboard/professional/*` | `professional` | `requireOnboardingComplete` |
| `/professional/service-setup` | `professional` | `allowProfessionalIntent` |
| `/professional/verification` | `professional` | `allowProfessionalIntent` |
| `/admin/*` | `admin` | `enforce2FA`, IP whitelist |

### Action-Point Gates (Public Route, Protected Action)

| Route | Action | Gate |
|-------|--------|------|
| `/job-board` | "Apply" button | `useAuthGate({ requiredRole: 'professional' })` |
| `/job-board` | "Message" button | `useAuthGate({ requiredRole: 'professional' })` |
| `/professionals/:id` | "Start Conversation" | `useAuthGate({ requiredRole: 'client' })` |

---

## 5. Data Visibility Map

### Jobs

| Field | `public_jobs_preview` | `jobs` (authenticated pro) |
|-------|----------------------|---------------------------|
| `id` | ✅ | ✅ |
| `title` | ✅ | ✅ |
| `teaser` | ✅ (first 200 chars of description) | ✅ |
| `description` | ❌ | ✅ |
| `budget_type` | ✅ | ✅ |
| `budget_value` | ✅ | ✅ |
| `area` | ✅ | ✅ |
| `town` | ✅ | ✅ |
| `location` (full address) | ❌ | ✅ |
| `client_id` | ❌ | ✅ |
| `answers` | ❌ | ✅ |
| `attachments` | ❌ | ✅ |

### Professionals

| Field | `public_professionals_preview` | `professional_profiles` (full) |
|-------|-------------------------------|-------------------------------|
| `user_id` | ✅ | ✅ |
| `display_name` | ✅ | ✅ |
| `avatar_url` | ✅ | ✅ |
| `tagline` | ✅ | ✅ |
| `bio` | ✅ | ✅ |
| `skills` | ✅ | ✅ |
| `business_name` | ✅ | ✅ |
| `contact_email` | ❌ | ✅ |
| `contact_phone` | ❌ | ✅ |
| `vat_number` | ❌ | ✅ |
| `bank_details` | ❌ | ✅ |

---

## 6. Key Source Files

| Component | File | Purpose |
|-----------|------|---------|
| Route Guard | `src/components/RouteGuard.tsx` | Auth + role + onboarding enforcement |
| Action Gate | `src/hooks/useAuthGate.ts` | Point-of-interaction gating |
| Onboarding Resolver | `src/lib/onboarding/markProfessionalOnboardingComplete.ts` | Phase progression logic |
| Job Data Source | `src/lib/jobs/dataSource.ts` | Public vs private table selector |
| Conversation Create | `src/hooks/useMessages.ts` | Duplicate prevention |
| Role Functions | DB: `has_role()`, `is_admin()` | SECURITY DEFINER checks |
| Public Views | DB: `public_jobs_preview`, `public_professionals_preview` | Sanitized data exposure |

---

## 7. Database Functions (Logic-Critical)

| Function | Purpose |
|----------|---------|
| `has_role(user_id, role)` | Check if user has specific role (SECURITY DEFINER) |
| `is_admin()` | Check if current user is admin |
| `is_super_admin()` | Check if current user is super admin |
| `handle_new_user()` | Trigger: creates profile + default client role |
| `apply_to_become_professional()` | RPC: initializes professional application |

---

## 8. Views (Public Data Surface)

### `public_jobs_preview`

```sql
SELECT
  id, title, LEFT(description, 200) AS teaser,
  budget_type, budget_value, area, town,
  status, created_at, published_at, has_photos
FROM jobs
WHERE is_publicly_listed = true;
```

### `public_professionals_preview`

```sql
SELECT
  pp.user_id, pp.business_name, pp.tagline, pp.skills,
  pp.verification_status, pp.updated_at,
  p.display_name, p.avatar_url
FROM professional_profiles pp
JOIN profiles p ON p.id = pp.user_id
WHERE pp.is_active = true
  AND pp.verification_status = 'verified'
  AND pp.tagline IS NOT NULL;
```

**Security Note:** No `security_invoker=on` — views run as owner to read protected tables without granting anon access.

---

## Appendix: Quick Verification Commands

### Test Anon Access

```sql
SET ROLE anon;
SELECT id, title, teaser FROM public.public_jobs_preview LIMIT 5;
SELECT user_id, display_name FROM public.public_professionals_preview LIMIT 5;
RESET ROLE;
```

### Verify Role Functions

```sql
-- Should return true for admin user
SELECT has_role('ADMIN_USER_ID_HERE', 'admin');

-- Should return false for regular user
SELECT has_role('REGULAR_USER_ID_HERE', 'admin');
```

### Check Onboarding Phase

```sql
SELECT user_id, onboarding_phase, verification_status
FROM professional_profiles
WHERE user_id = 'USER_ID_HERE';
```
