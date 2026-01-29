

# Launch Rail System — Your Systematic Verification Framework

## Executive Summary

Based on my codebase analysis, I've identified your current architecture and will provide you with a complete **Launch Rail System** you can use to systematically verify every part of your platform.

---

## Part 1: Your Current State Model (The Foundation)

### Canonical User Access State

| Field | Table | Values | Purpose |
|-------|-------|--------|---------|
| `roles[]` | `user_roles` | `client`, `professional`, `admin` | What the user CAN do |
| `active_role` | `profiles` | `client`, `professional`, `admin` | Current UI context |
| `intent_role` | `profiles` | `client`, `professional` | Signup intention (routing) |
| `onboarding_completed` | `profiles` | `true/false` | Quick-start gate (all users) |
| `onboarding_phase` | `professional_profiles` | See below | Pro-specific progress |
| `verification_status` | `professional_profiles` | See below | Pro credential approval |

### Onboarding Phase Values (Professional Journey)

| Phase | Meaning | Set By | Next Step |
|-------|---------|--------|-----------|
| `not_started` | Default | DB default | Complete intro wizard |
| `intro_submitted` | Wizard done | `ProfessionalOnboardingPage.tsx:71` | Upload verification docs |
| `verification_pending` | Docs uploaded | `VerificationForm.tsx:75` | Await admin review |
| `service_configured` | Services set up | `ServiceCatalogSetup.tsx:88` | (Legacy path) |
| `complete` | Fully onboarded | `useProfessionalServicePreferences.ts:346` | Access pro dashboard |

### Verification Status Values

| Status | Meaning | Set By |
|--------|---------|--------|
| `unverified` | Default | DB default |
| `pending` | Awaiting review | Wizard submission |
| `verified` | Approved by admin | Admin action |
| `rejected` | Denied with reason | Admin action |

---

## Part 2: The 10 User States (Your Test Matrix)

| # | State Name | Roles | Active | Pro Phase | Ver Status | Expected Home |
|---|------------|-------|--------|-----------|------------|---------------|
| 1 | Unauthenticated | - | - | - | - | `/` or `/auth` |
| 2 | New Client | `client` | `client` | - | - | `/dashboard/client` |
| 3 | Pro Intent (no role yet) | `client` | `client` | `not_started` | `pending` | `/onboarding/professional` |
| 4 | Pro Intro Done | `client` | `professional` | `intro_submitted` | `pending` | Gate: Upload Docs |
| 5 | Pro Docs Submitted | `client` | `professional` | `verification_pending` | `pending` | Gate: Under Review |
| 6 | Pro Rejected | `client`/`professional` | `professional` | varies | `rejected` | Gate: Resubmit |
| 7 | Pro Verified (no services) | `client`, `professional` | `professional` | `verified`/varies | `verified` | Gate: Configure Services |
| 8 | Pro Fully Onboarded | `client`, `professional` | `professional` | `complete` | `verified` | `/dashboard/pro` |
| 9 | Dual-Role (active=client) | `client`, `professional` | `client` | `complete` | `verified` | `/dashboard/client` |
| 10 | Admin | `client`, `admin` | `admin` | - | - | `/admin` (2FA gate) |

---

## Part 3: The 15 Critical Routes (Your Thin Slice)

Test these 15 routes across all 10 states for complete coverage:

### Public Routes
1. `/` — Landing page
2. `/auth` — Sign in/up

### Client Routes
3. `/dashboard/client` — Client home
4. `/post` — Create job
5. `/post/success` — Job posted confirmation
6. `/jobs/:id` — Job detail view

### Professional Routes
7. `/onboarding/professional` — Pro wizard
8. `/professional/verification` — Upload docs
9. `/professional/service-setup` — Configure services
10. `/dashboard/pro` — Pro home (gated)
11. `/jobs/:id/matches` — View matched pros

### Settings
12. `/settings/profile` — User profile
13. `/settings/professional` — Pro-specific settings

### Admin
14. `/admin` — Admin dashboard (2FA)
15. `/admin/users` — User management

---

## Part 4: Route Guard Contract (Your Single Source of Truth)

### Current Guard Implementations

| Route | Guard | Required Role | Special Logic |
|-------|-------|---------------|---------------|
| `/onboarding/professional` | `RouteGuard` | `professional` | `allowProfessionalIntent=true` |
| `/professional/verification` | `RouteGuard` | `professional` | `allowProfessionalIntent=true` |
| `/professional/service-setup` | `RouteGuard` | `professional` | No intent fallback |
| `/dashboard/pro` | `RouteGuard` + `OnboardingGate` | `professional` | Multi-phase gates |
| `/admin/*` | `RouteGuard` | `admin` | `enforce2FA=true` |
| `/dashboard/client` | `RouteGuard` | `client` | (implicit) |

### Redirect Standard

| Parameter | Usage |
|-----------|-------|
| `redirect` | Auth callback return URL |
| `returnTo` | Deprecated (use `redirect`) |

---

## Part 5: Core Journey Test Scripts

### Journey A: Client Posts Job

```text
Steps:
1. Sign up with intent=client
2. Complete quick-start (sets onboarding_completed=true)
3. Navigate to /post
4. Complete job wizard
5. View /post/success
6. See job at /jobs/:id

Pass Criteria:
✅ Job row created with correct owner
✅ Client can view/edit own job
✅ Pro cannot edit client's job (RLS)
```

### Journey B: Professional Onboarding

```text
Steps:
1. Sign up with intent=professional
2. Complete quick-start → redirected to /onboarding/professional
3. Complete 5-step wizard → onboarding_phase='intro_submitted'
4. Upload docs at /professional/verification → phase='verification_pending'
5. Admin approves → verification_status='verified'
6. Configure services → onboarding_phase='complete'
7. Access /dashboard/pro without gates

Pass Criteria:
✅ Each phase transition persists correctly
✅ Gates show at correct phases
✅ Dashboard accessible only after complete
```

### Journey C: Role Switching

```text
Steps:
1. As fully-onboarded pro (has both roles)
2. Toggle active_role to 'client'
3. Navigate to /dashboard → goes to /dashboard/client
4. Toggle active_role to 'professional'
5. Navigate to /dashboard → goes to /dashboard/pro

Pass Criteria:
✅ Active role persists across page refresh
✅ Correct dashboard shown for active role
✅ Navigation adapts to active role
```

### Journey D: Deep Link Protection

```text
Steps:
1. As unauthenticated user
2. Visit /dashboard/pro directly
3. Should redirect to /auth?redirect=/dashboard/pro
4. Sign in as verified pro
5. Should land on /dashboard/pro (not /dashboard/client)

Pass Criteria:
✅ Deep link preserved through auth
✅ No redirect loops
✅ Correct destination after auth
```

---

## Part 6: State-Route Matrix Template

Use this checklist for systematic testing:

```text
┌────────────────────────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┐
│ Route                  │ S1   │ S2   │ S3   │ S4   │ S5   │ S6   │ S7   │ S8   │ S9   │ S10  │
├────────────────────────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┤
│ /                      │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │
│ /auth                  │ ✓    │ →D   │ →D   │ →D   │ →D   │ →D   │ →D   │ →D   │ →D   │ →D   │
│ /dashboard/client      │ →A   │ ✓    │ →O   │ →O   │ →O   │ →O   │ →O   │ ✓    │ ✓    │ ✓    │
│ /dashboard/pro         │ →A   │ →A   │ →O   │ G1   │ G2   │ G3   │ G4   │ ✓    │ →C   │ ✓    │
│ /onboarding/pro        │ →A   │ →A   │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │
│ /professional/verify   │ →A   │ →A   │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │
│ /professional/service  │ →A   │ →A   │ →A   │ →A   │ →A   │ →A   │ ✓    │ ✓    │ ✓    │ ✓    │
│ /admin                 │ →A   │ →A   │ →A   │ →A   │ →A   │ →A   │ →A   │ →A   │ →A   │ 2FA  │
│ /post                  │ →A   │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │
│ /settings/profile      │ →A   │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │
└────────────────────────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┘

Legend:
✓  = Accessible
→A = Redirect to /auth
→D = Redirect to dashboard
→O = Redirect to onboarding
→C = Redirect to client dashboard
G1 = Gate: Upload Docs
G2 = Gate: Under Review
G3 = Gate: Rejected
G4 = Gate: Configure Services
2FA = Requires 2FA setup
```

---

## Part 7: P0 Go/No-Go Checklist

### Killer Tests (Must Pass)

| # | Test | Pass Criteria |
|---|------|---------------|
| 1 | Fresh signup → quick-start | Profile created, onboarding_completed=false |
| 2 | Pro intent → onboarding wizard | Wizard loads with DB hydration |
| 3 | Pro saves services → complete | onboarding_phase='complete' in DB |
| 4 | Verified pro → dashboard | No gates shown, full access |
| 5 | Role switch (pro→client) | Dashboard changes, nav adapts |
| 6 | Deep link unauthenticated | Redirect preserved through auth |
| 7 | Session expiry mid-flow | Graceful redirect to auth |
| 8 | Admin 2FA gate | Blocks until 2FA configured |
| 9 | Wrong-role access attempt | Clean denial, no crash |
| 10 | Page refresh mid-wizard | Progress restored correctly |

### Data Contract Verification

| Journey | Table Writes | RLS Check |
|---------|--------------|-----------|
| Client posts job | `jobs` | Pro can view, client can edit |
| Pro onboards | `professional_profiles` | Only owner can update |
| Admin approves | `professional_profiles` | Only admin can set verified |
| Role switch | `profiles.active_role` | Only owner can toggle |

---

## Part 8: Weekly Verification Cycle

### Monday-Tuesday: Implement
- Work on P0 tasks only
- Update Flow Contract for any changes

### Wednesday: Test Matrix
- Run 15-route × 10-state matrix
- Document failures

### Thursday: Fix + Regression
- Fix any failures
- Run killer tests

### Friday: Demo + Feedback
- Short stakeholder demo
- Collect 3 questions:
  1. "What confused you?"
  2. "Where did you get stuck?"
  3. "What did you expect to happen?"

---

## Part 9: Known Issues to Monitor

### Current Inconsistency Found

| Issue | Location | Impact |
|-------|----------|--------|
| `tasker_onboarding_status` check | `RouteGuard.tsx:165` | References deprecated field instead of `onboarding_phase` |
| Missing `complete` phase in DB | Query result | Only `not_started`, `service_configured`, `verified` found |

### Recommended Fixes

1. Update RouteGuard line 165 to use `professional_profiles.onboarding_phase`
2. Verify the `onboarding_phase='complete'` logic is executing (currently may not be reached)

---

## Part 10: Implementation Files

### Files to Create

| File | Purpose |
|------|---------|
| `docs/LAUNCH_RAIL.md` | Single source of truth document |
| `docs/FLOW_CONTRACT.md` | Redirect params, phases, state model |
| `src/lib/__tests__/routes.test.ts` | Automated route matrix tests |

### Files to Update

| File | Change |
|------|--------|
| `src/components/RouteGuard.tsx:165` | Fix deprecated field reference |
| `src/lib/roles.ts` | Add phase value constants |

---

## Summary

This Launch Rail System gives you:

1. **State Model** — The 10 canonical user states
2. **Route Matrix** — 15 routes × 10 states checklist
3. **Journey Scripts** — 4 core flows to test
4. **Go/No-Go Gates** — 10 killer tests
5. **Weekly Cycle** — Structured verification rhythm

**Next Steps:**
1. Run the 10 killer tests manually
2. Document any failures
3. Fix P0 blockers only
4. Repeat until all pass

This system prevents "wandering" by forcing every decision through the Launch Rail document.

