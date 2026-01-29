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
