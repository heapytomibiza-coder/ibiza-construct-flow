# Launch Rail System — Single Source of Truth

> **Version:** 1.0  
> **Last Updated:** 2025-01-29  
> **Status:** Active

This document is the canonical reference for all routing, state, and guard logic.  
**If it's not in this doc, it's not shipping in feedback stage.**

---

## 1. Product Promise

A dual-role marketplace where:
- **Clients** post jobs and hire verified professionals
- **Professionals** complete onboarding, get verified, configure services, and receive leads

---

## 2. Core Flows (Feedback Stage Scope)

### Must Work
| Flow | Description |
|------|-------------|
| Sign up / Sign in | Email-based auth with role intent |
| Quick-start | First-time user welcome + profile setup |
| Role switching | Pro ↔ Client toggle for dual-role users |
| Client job post | Create job → view → manage |
| Pro onboarding | 5-step wizard → verification → services |
| Pro receives leads | View matched jobs/contracts |
| Settings | Profile + account + notifications |
| Admin basics | User management, verifications |

### Explicitly Out of Scope
- Payment/escrow (stubbed)
- Advanced analytics
- AI matching refinements
- Mobile app
- Social features

---

## 3. Canonical State Model

### User Access State Object

```typescript
interface UserAccessState {
  // From user_roles table
  roles: ('client' | 'professional' | 'admin')[];
  
  // From profiles table
  activeRole: 'client' | 'professional' | 'admin';
  intentRole: 'client' | 'professional' | null;
  onboardingCompleted: boolean;  // Quick-start gate
  
  // From professional_profiles table (pros only)
  onboardingPhase: OnboardingPhase;
  verificationStatus: VerificationStatus;
}
```

### Onboarding Phase Values

| Phase | DB Value | Meaning | Set By |
|-------|----------|---------|--------|
| Not Started | `not_started` | Default state | DB default |
| Intro Done | `intro_submitted` | Wizard completed | `ProfessionalOnboardingPage.tsx` |
| Pending Review | `verification_pending` | Docs uploaded | `VerificationForm.tsx` |
| Services Done | `service_configured` | Services selected | (Legacy) |
| Complete | `complete` | Fully onboarded | `useProfessionalServicePreferences.ts` |

### Verification Status Values

| Status | DB Value | Meaning |
|--------|----------|---------|
| Unverified | `unverified` | Default |
| Pending | `pending` | Awaiting review |
| Verified | `verified` | Admin approved |
| Rejected | `rejected` | Admin denied |

---

## 4. The 10 User States (Test Matrix)

| # | State | Roles | Active | Phase | Ver Status | Home |
|---|-------|-------|--------|-------|------------|------|
| 1 | Unauthenticated | - | - | - | - | `/` |
| 2 | New Client | `client` | `client` | - | - | `/dashboard/client` |
| 3 | Pro Intent | `client` | `client` | `not_started` | `pending` | `/onboarding/professional` |
| 4 | Pro Intro Done | `client` | `professional` | `intro_submitted` | `pending` | Gate: Upload Docs |
| 5 | Pro Pending | `client` | `professional` | `verification_pending` | `pending` | Gate: Under Review |
| 6 | Pro Rejected | `client`/`professional` | `professional` | varies | `rejected` | Gate: Resubmit |
| 7 | Pro Verified | `client`, `professional` | `professional` | varies | `verified` | Gate: Services |
| 8 | Pro Complete | `client`, `professional` | `professional` | `complete` | `verified` | `/dashboard/pro` |
| 9 | Dual (as client) | `client`, `professional` | `client` | `complete` | `verified` | `/dashboard/client` |
| 10 | Admin | `client`, `admin` | `admin` | - | - | `/admin` (2FA) |

---

## 5. Guard Rules

### Route → Guard Mapping

| Route | Guard | Required Role | Special Props |
|-------|-------|---------------|---------------|
| `/onboarding/professional` | RouteGuard | `professional` | `allowProfessionalIntent=true` |
| `/professional/verification` | RouteGuard | `professional` | `allowProfessionalIntent=true` |
| `/professional/service-setup` | RouteGuard | `professional` | - |
| `/dashboard/pro` | RouteGuard + OnboardingGate | `professional` | Multi-phase gates |
| `/admin/*` | RouteGuard | `admin` | `enforce2FA=true` |
| `/dashboard/client` | RouteGuard | `client` | - |
| `/settings/*` | RouteGuard | (any auth) | - |

### Redirect Behavior

| Condition | Redirect To |
|-----------|-------------|
| No session | `/auth?redirect={current}` |
| Needs quick-start | `/auth/quick-start` |
| Pro needs onboarding | `/onboarding/professional` |
| Wrong role | `/dashboard` (auto-routes by role) |
| Admin needs 2FA | `/admin/security?setup2fa=true` |

---

## 6. P0 Killer Tests (Go/No-Go)

| # | Test | Pass Criteria |
|---|------|---------------|
| 1 | Fresh signup → quick-start | Profile created, `onboarding_completed=false` |
| 2 | Pro intent → wizard | Wizard loads, DB hydration works |
| 3 | Pro saves services | `onboarding_phase='complete'` in DB |
| 4 | Verified pro → dashboard | No gates, full access |
| 5 | Role switch (pro→client) | Dashboard + nav update |
| 6 | Deep link unauthenticated | Redirect preserved through auth |
| 7 | Session expiry mid-flow | Graceful auth redirect |
| 8 | Admin 2FA gate | Blocks until configured |
| 9 | Wrong-role access | Clean denial, no crash |
| 10 | Page refresh mid-wizard | Progress restored correctly |

---

## 7. State-Route Matrix (15×10 Complete)

### Full Matrix with Expected Outcomes

| Route | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 | S9 | S10 | Expected UI | Expected DB |
|-------|----|----|----|----|----|----|----|----|----|----|-------------|-------------|
| `/` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Landing page | R: none |
| `/auth` | ✓ | →D | →D | →D | →D | →D | →D | →D | →D | →D | Sign in/up forms | R: profiles |
| `/dashboard/client` | →A | ✓ | →O | →O | →O | →O | →O | ✓ | ✓ | ✓ | Client job list | R: jobs, profiles |
| `/dashboard/pro` | →A | →A | →O | G1 | G2 | G3 | G4 | ✓ | →C | ✓ | Pro leads/contracts | R: professional_profiles |
| `/post` | →A | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Job wizard | W: jobs, job_answers |
| `/post/success` | →A | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Success confirmation | R: jobs |
| `/jobs/:id` | →A | ✓* | ✓* | ✓* | ✓* | ✓* | ✓* | ✓* | ✓* | ✓ | Job detail | R: jobs, job_answers |
| `/jobs/:id/matches` | →A | ✓* | →A | →A | →A | →A | →A | ✓ | ✓* | ✓ | Matched pros list | R: matches |
| `/onboarding/professional` | →A | →A | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 5-step wizard | R/W: professional_profiles |
| `/professional/verification` | →A | →A | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Upload docs form | W: professional_profiles |
| `/professional/service-setup` | →A | →A | →A | →A | →A | →A | ✓ | ✓ | ✓ | ✓ | Service selection | R/W: professional_service_links |
| `/settings/profile` | →A | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Profile form | R/W: profiles |
| `/settings/professional` | →A | →A | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Pro settings form | R/W: professional_profiles |
| `/admin` | →A | →A | →A | →A | →A | →A | →A | →A | →A | 2FA | Admin dashboard | R: users, jobs, etc. |
| `/admin/users` | →A | →A | →A | →A | →A | →A | →A | →A | →A | 2FA | User management | R/W: profiles, roles |

### Legend

| Symbol | Meaning |
|--------|---------|
| ✓ | Accessible (shows Expected UI) |
| ✓* | Accessible if owner (RLS-gated) |
| →A | Redirect to `/auth` |
| →D | Redirect to dashboard (role-based) |
| →O | Redirect to `/onboarding/professional` |
| →C | Redirect to `/dashboard/client` |
| G1 | Gate: Upload Verification Docs |
| G2 | Gate: Under Admin Review |
| G3 | Gate: Application Rejected |
| G4 | Gate: Configure Services |
| 2FA | Requires 2FA setup first |
| R: | Database reads |
| W: | Database writes |
| R/W: | Both reads and writes |

### Edge Case Notes

| Route | Notes |
|-------|-------|
| `/jobs/:id` | Owner sees edit button; others see view-only |
| `/jobs/:id/matches` | Only job owner can view matches |
| `/dashboard/pro` | Gate varies by `onboarding_phase` value |
| `/professional/service-setup` | Only accessible after `verification_status='verified'` |

---

## 8. Weekly Verification Cycle

| Day | Focus |
|-----|-------|
| Mon-Tue | Implement P0 tasks only |
| Wed | Run 15-route × 10-state matrix |
| Thu | Fix failures + killer tests |
| Fri | Demo + collect feedback |

---

## 9. Parking Lot (Post-Feedback)

| Idea | Impact | Effort |
|------|--------|--------|
| ... | ... | ... |

*Add new ideas here instead of implementing them during feedback stage.*

---

## 10. DB Verification Queries

> **Purpose:** Every route becomes verifiable: Front → Expected UI → Expected DB with zero guessing.

### Placeholders

| Placeholder | Source | Description |
|-------------|--------|-------------|
| `[USER_ID]` | `auth.uid()` | The test user's UUID |
| `[JOB_ID]` | Journey A output | A job created during testing |
| `[BOOKING_ID]` | If applicable | A booking ID from the system |

### Verification Rules

1. **No writes on view**: Dashboards and detail pages should only READ
2. **Owner-only writes**: Only the resource owner should be able to UPDATE
3. **RLS enforcement**: Cross-user access should fail or return empty results

---

### Route: `/` (Landing)

**Expected UI:** Landing page with hero, services  
**Expected DB:** R: none (static content)

```sql
-- No DB queries required for landing page
```

---

### Route: `/auth`

**Expected UI:** Sign in/up forms  
**Expected DB:** R: profiles | W: profiles, user_roles (on signup)

```sql
-- After signup: verify profile created
SELECT id, display_name, onboarding_completed, active_role, intent_role, created_at
FROM profiles
WHERE id = '[USER_ID]';

-- Verify roles assigned
SELECT role, created_at
FROM user_roles
WHERE user_id = '[USER_ID]';
```

---

### Route: `/auth/quick-start`

**Expected UI:** First-time welcome + profile setup  
**Expected DB:** R/W: profiles

```sql
-- Before quick-start
SELECT id, display_name, onboarding_completed
FROM profiles
WHERE id = '[USER_ID]';
-- Expected: onboarding_completed = false

-- After quick-start completion
SELECT id, display_name, onboarding_completed, active_role
FROM profiles
WHERE id = '[USER_ID]';
-- Expected: onboarding_completed = true, display_name set
```

---

### Route: `/dashboard/client`

**Expected UI:** Client job list  
**Expected DB:** R: jobs, profiles

```sql
-- Verify job list loads for client
SELECT id, title, status, created_at
FROM jobs
WHERE client_id = '[USER_ID]'
ORDER BY created_at DESC
LIMIT 10;

-- Verify no writes on load (check updated_at unchanged)
```

---

### Route: `/post`

**Expected UI:** Job wizard  
**Expected DB:** W: jobs, bookings (on submit)

```sql
-- After submit: verify job created
SELECT id, title, client_id, status, created_at
FROM jobs
WHERE client_id = '[USER_ID]'
ORDER BY created_at DESC
LIMIT 1;

-- Or using bookings table
SELECT id, title, client_id, status, created_at
FROM bookings
WHERE client_id = '[USER_ID]'
ORDER BY created_at DESC
LIMIT 1;
```

---

### Route: `/post/success`

**Expected UI:** Success confirmation with job details  
**Expected DB:** R: jobs/bookings

```sql
SELECT id, title, client_id, status, created_at
FROM bookings
WHERE client_id = '[USER_ID]'
ORDER BY created_at DESC
LIMIT 1;
-- Expected: status = 'draft' or 'published', client_id matches
```

---

### Route: `/jobs/:id`

**Expected UI:** Job detail view (edit if owner)  
**Expected DB:** R: jobs, job_answers

```sql
-- Verify job data
SELECT id, title, description, client_id, status
FROM jobs
WHERE id = '[JOB_ID]';

-- RLS test: run as different user
-- Expected: 0 rows or access denied for non-owner
SELECT id FROM jobs WHERE id = '[JOB_ID]';
```

---

### Route: `/jobs/:id/matches`

**Expected UI:** Matched professionals list  
**Expected DB:** R: job_matches

```sql
-- Verify matches for job
SELECT jm.id, jm.booking_id, jm.professional_id, jm.status, jm.created_at
FROM job_matches jm
WHERE jm.booking_id = '[BOOKING_ID]'
ORDER BY jm.created_at DESC
LIMIT 50;

-- RLS test: only job owner should see matches
```

---

### Route: `/onboarding/professional`

**Expected UI:** 5-step professional wizard  
**Expected DB:** R/W: professional_profiles

```sql
-- Verify pro profile exists with correct phase
SELECT user_id, onboarding_phase, verification_status,
       tagline, bio, experience_years, cover_image_url, updated_at
FROM professional_profiles
WHERE user_id = '[USER_ID]';

-- After wizard completion
-- Expected: onboarding_phase = 'intro_submitted'
```

---

### Route: `/professional/verification`

**Expected UI:** Document upload form  
**Expected DB:** W: professional_profiles, professional_verifications, professional_documents

```sql
-- Pro profile phase check
SELECT onboarding_phase, verification_status
FROM professional_profiles
WHERE user_id = '[USER_ID]';
-- Expected after upload: onboarding_phase = 'verification_pending'

-- Verification request created
SELECT id, professional_id, status, verification_method, created_at
FROM professional_verifications
WHERE professional_id = '[USER_ID]'
ORDER BY created_at DESC
LIMIT 1;

-- Documents uploaded
SELECT id, professional_id, document_type, file_name, verification_status, created_at
FROM professional_documents
WHERE professional_id = '[USER_ID]'
ORDER BY created_at DESC;
```

---

### Route: `/professional/service-setup`

**Expected UI:** Service selection interface  
**Expected DB:** R/W: professional_services, professional_profiles

```sql
-- Active services count
SELECT COUNT(*) AS active_services
FROM professional_services
WHERE professional_id = '[USER_ID]' AND is_active = true;

-- Services detail
SELECT id, micro_service_id, is_active, pricing_structure, updated_at
FROM professional_services
WHERE professional_id = '[USER_ID]'
ORDER BY updated_at DESC;

-- Phase check (should be 'complete' if active_services > 0)
SELECT onboarding_phase
FROM professional_profiles
WHERE user_id = '[USER_ID]';
-- Expected: 'complete' if at least 1 active service

-- Edge case: 0 services should NOT force 'complete'
SELECT COUNT(*) AS active_services
FROM professional_services
WHERE professional_id = '[USER_ID]' AND is_active = true;
-- If 0, onboarding_phase should NOT be 'complete'
```

---

### Route: `/dashboard/pro`

**Expected UI:** Pro leads/contracts dashboard  
**Expected DB:** R: professional_profiles, professional_services, job_matches

```sql
-- Pro profile status (determines gates)
SELECT onboarding_phase, verification_status
FROM professional_profiles
WHERE user_id = '[USER_ID]';

-- Active services count
SELECT COUNT(*) AS active_services
FROM professional_services
WHERE professional_id = '[USER_ID]' AND is_active = true;

-- Matches/leads (if shown on dashboard)
SELECT jm.id, jm.booking_id, jm.status, b.title
FROM job_matches jm
JOIN bookings b ON jm.booking_id = b.id
WHERE jm.professional_id = '[USER_ID]'
ORDER BY jm.created_at DESC
LIMIT 10;
```

---

### Route: `/job-board`

**Expected UI:** Available jobs for professionals  
**Expected DB:** R: jobs/bookings

```sql
-- Open jobs available to pros
SELECT id, title, status, created_at
FROM bookings
WHERE status IN ('draft', 'open', 'published')
ORDER BY created_at DESC
LIMIT 50;
```

---

### Route: `/settings/profile`

**Expected UI:** Profile edit form  
**Expected DB:** R/W: profiles

```sql
-- Current profile data
SELECT id, display_name, full_name, phone, location,
       active_role, onboarding_completed
FROM profiles
WHERE id = '[USER_ID]';

-- After role switch: verify persistence
SELECT active_role
FROM profiles
WHERE id = '[USER_ID]';
-- Should match the role user switched to
```

---

### Route: `/admin`

**Expected UI:** Admin dashboard  
**Expected DB:** R: various admin tables

```sql
-- Verify admin role exists
SELECT role
FROM user_roles
WHERE user_id = '[USER_ID]';
-- Expected: includes 'admin'

-- 2FA status check (if stored in profiles)
SELECT id, two_factor_enabled
FROM profiles
WHERE id = '[USER_ID]';
-- Must be true to access admin routes
```

---

### Route: `/admin/users`

**Expected UI:** User management interface  
**Expected DB:** R/W: profiles, user_roles

```sql
-- Admin can read all profiles
SELECT id, display_name, email, active_role, created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 50;

-- Admin can modify roles
SELECT user_id, role, created_at
FROM user_roles
WHERE user_id = '[TARGET_USER_ID]';
```

---

### Quick Reference: Table Mapping

| Purpose | Actual Table Name |
|---------|-------------------|
| Job matching | `job_matches` |
| Verification requests | `professional_verifications` |
| Verification documents | `professional_documents` |
| Professional services | `professional_services` |
| User profiles | `profiles` |
| Pro profiles | `professional_profiles` |
| User roles | `user_roles` |
| Jobs/Bookings | `jobs`, `bookings` |
