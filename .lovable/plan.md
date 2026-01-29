

# Complete Flow Audit: Comprehensive State-Based Testing Strategy

## Executive Summary

This audit provides a complete flow map, state matrix, route guard analysis, and edit/create mode inventory for your platform. The analysis reveals several potential issues and edge cases that should be tested systematically.

---

## PART 1: Complete Flow Map (Directed Graph)

### Route List (83 Routes Total)

#### Public Routes (Unauthenticated Access)
| Route | Entry Conditions | Exit Actions | Fail Redirect |
|-------|-----------------|--------------|---------------|
| `/` | None | CTAs → `/auth?mode=signup&role=*` | N/A |
| `/discovery` | None | Card click → `/professionals/:id` | N/A |
| `/professionals` | None | Filter/search | N/A |
| `/professionals/:id` | None | Book/Contact → `/auth` if unauth | N/A |
| `/calculator` | None | Results → `/post` or `/auth` | N/A |
| `/how-it-works` | None | CTA → `/auth?mode=signup` | N/A |
| `/contact` | None | Form submit → email | N/A |
| `/book` | None | Booking flow | `/auth` if unauth |
| `/terms`, `/privacy`, `/cookie-policy` | None | Back navigation | N/A |
| `/install` | None | PWA install flow | N/A |
| `/fair`, `/fair/:sectorSlug` | None | Showcase navigation | N/A |

#### Auth Routes
| Route | Entry Conditions | Exit Actions | Fail Redirect |
|-------|-----------------|--------------|---------------|
| `/auth` | Unauthenticated | `redirectTo` param or → `getInitialDashboardRoute()` | N/A |
| `/auth?mode=signup&role=professional` | Unauthenticated | → `/auth/verify-email` | N/A |
| `/auth/verify-email` | Has `pending_verification_email` in localStorage | Resend → email, verify → `/auth/callback` | `/auth` |
| `/auth/forgot-password` | Unauthenticated | → `/auth/reset-password` (via email) | N/A |
| `/auth/reset-password` | Has reset token in URL | → `/auth` on success | `/auth/forgot-password` |
| `/auth/callback` | Email verification or OAuth | → `redirectTo` OR `getInitialDashboardRoute()` | `/auth` |
| `/auth/quick-start` | Authenticated + missing `display_name` OR `onboarding_completed=false` | → `/dashboard/client` or `/onboarding/professional` | `/auth` |

#### Dashboard Routes
| Route | Entry Conditions | Required Role | Exit Actions | Fail Redirect |
|-------|-----------------|---------------|--------------|---------------|
| `/dashboard` | Authenticated | Any | Smart redirect via `getInitialDashboardRoute()` | `/auth?redirect=...` |
| `/dashboard/client` | Authenticated | `client` | Navigation to features | `/auth?redirect=...` |
| `/dashboard/pro` | Authenticated | `professional` | Wrapped in `OnboardingGate` | `/auth?redirect=...` |
| `/dashboard/admin` | Authenticated | `admin` | Admin navigation | `/auth?redirect=...` |

#### Professional Onboarding Flow
| Route | Entry Conditions | Guard Config | Exit Actions | Fail Redirect |
|-------|-----------------|--------------|--------------|---------------|
| `/onboarding/professional` | `intent_role=professional` OR `role=professional` | `allowProfessionalIntent=true` | → Creates `professional_profiles` → `/dashboard/pro` | `/auth?redirect=...` |
| `/professional/verification` | Same as above + `onboarding_phase=intro_submitted` | `allowProfessionalIntent=true` | → Updates verification docs → `/dashboard/pro` | `/auth?redirect=...` |
| `/professional/service-setup` | `role=professional` + verified | `requiredRole=professional` | → Creates services → `/dashboard/pro` | `/auth?redirect=...` |
| `/professional/services` | Full professional role | `requiredRole=professional` | Service management | `/auth?redirect=...` |
| `/professional/services/wizard` | Full professional role | `requiredRole=professional` | Batch service selection | `/auth?redirect=...` |
| `/professional/portfolio` | Full professional role | `requiredRole=professional` | Portfolio management | `/auth?redirect=...` |
| `/professional/payout-setup` | Full professional role | `requiredRole=professional` | Stripe setup | `/auth?redirect=...` |

#### Client Routes
| Route | Entry Conditions | Required Role | Exit Actions | Fail Redirect |
|-------|-----------------|---------------|--------------|---------------|
| `/post` | Authenticated | `client` | 7-step wizard → `/post/success` | `/auth?redirect=...` |
| `/post/success` | Job just created | `client` | → `/jobs/:jobId` or `/dashboard/client` | `/dashboard/client` |
| `/templates` | Authenticated | `client` | Template selection | `/auth?redirect=...` |
| `/jobs/:jobId` | Any (RLS enforced) | None | Job actions | N/A |
| `/jobs/:jobId/matches` | Job owner | RLS | Match management | `/auth` |

#### Admin Routes (All require `admin` role + 2FA)
All 45+ admin routes are nested under `/admin/*` with shared `RouteGuard`:
- `/admin` (index → `AdminDashboard`)
- `/admin/users`, `/admin/profiles`, `/admin/jobs`, etc.

#### Settings Routes
| Route | Entry Conditions | Required Role | Nested In |
|-------|-----------------|---------------|-----------|
| `/settings` | Authenticated | None | `SettingsLayout` |
| `/settings/profile` | Authenticated | None | Profile editing |
| `/settings/account` | Authenticated | None | Account management |
| `/settings/notifications` | Authenticated | None | Notification prefs |
| `/settings/client` | Authenticated | `client` | Client-specific |
| `/settings/professional` | Authenticated | `professional` | Pro-specific |

### Shared Flows (Multiple Entry Points = Potential Bug Class)

```text
Critical Shared Routes:
┌─────────────────────────────────────────────────────────────────────┐
│ /onboarding/professional                                            │
│ ├── Entry 1: New signup with intent_role=professional              │
│ ├── Entry 2: Existing client switching to professional             │
│ ├── Entry 3: Rejected professional re-applying                     │
│ └── Entry 4: Incomplete onboarding returning                       │
│                                                                     │
│ RISK: All 4 entries use SAME component with NO explicit mode flag  │
│ BUG RISK: May reset existing data on return visits                 │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ /professional/services/wizard                                       │
│ ├── Entry 1: First-time service setup (onboarding gate)           │
│ ├── Entry 2: Adding more services from dashboard                   │
│ └── Entry 3: Editing existing services                             │
│                                                                     │
│ RISK: Uses delta-tracking pattern but entry context not explicit   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ /settings/profile vs /settings/professional                        │
│ ├── /settings/profile: Basic profile (all users)                  │
│ └── /settings/professional: Pro-specific (bio, rates, portfolio)  │
│                                                                     │
│ RISK: Overlap in what fields are editable where                    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## PART 2: State Matrix Test Plan

### User States (Complete List)

| State ID | Description | Key DB Conditions |
|----------|-------------|-------------------|
| `S1` | Unauthenticated visitor | No session |
| `S2` | Authenticated client only | `user_roles.role='client'`, `active_role='client'` |
| `S3` | Client with pro intent (pre-verification) | `intent_role='professional'`, `verification_status='pending'`, NO `professional` role |
| `S4` | Professional pending verification | `professional_verifications.status='pending'`, may have `professional` role |
| `S5` | Professional rejected | `professional_verifications.status='rejected'` |
| `S6` | Professional verified, services incomplete | `verification_status='verified'`, `professional_services` count = 0 |
| `S7` | Professional verified, services complete | Full access |
| `S8` | Dual-role user (client + professional) | Both roles in `user_roles`, `active_role` determines context |
| `S9` | Admin (with 2FA) | `role='admin'`, 2FA configured |
| `S10` | Admin (without 2FA) | `role='admin'`, NO 2FA - blocked from admin routes |
| `S11` | First login (no display_name) | `profiles.display_name IS NULL` |
| `S12` | Onboarding incomplete | `profiles.onboarding_completed=false` |
| `S13` | Session expired | Session existed but JWT expired |
| `S14` | Profile missing (edge case) | User exists in auth.users but no profile row |

### State vs Route Matrix (Top Routes)

| Route | S1 Unauth | S2 Client | S3 Intent | S4 Pending | S5 Rejected | S6 No Services | S7 Full Pro | S8 Dual | S9 Admin | S10 No2FA |
|-------|-----------|-----------|-----------|------------|-------------|----------------|-------------|---------|----------|-----------|
| `/` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/auth` | ✅ | → dashboard | → dashboard | → dashboard | → dashboard | → dashboard | → dashboard | → dashboard | → dashboard | → dashboard |
| `/dashboard` | → `/auth` | → `/dashboard/client` | → `/onboarding/pro` | → `/dashboard/pro`* | → `/dashboard/pro`* | → `/dashboard/pro`* | → `/dashboard/pro` | → active_role | → `/admin` | → `/admin` |
| `/dashboard/client` | → `/auth` | ✅ | → `/auth` | → `/auth` | → `/auth` | → `/auth` | → `/auth` | ✅ if active=client | → `/auth` | → `/auth` |
| `/dashboard/pro` | → `/auth` | → `/auth` | → `/auth` | ✅ gated | ✅ gated | ✅ gated | ✅ | ✅ if active=pro | → `/auth` | → `/auth` |
| `/post` | → `/auth` | ✅ | ✅? | ✅? | ✅? | ✅? | ✅? | ✅ | ✅? | ✅? |
| `/job-board` | → `/auth` | → `/auth` | → `/auth` | → `/auth` | → `/auth` | → `/auth` | ✅ | ✅ if active=pro | → `/auth` | → `/auth` |
| `/onboarding/pro` | → `/auth` | → `/auth` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | → `/auth` | → `/auth` |
| `/admin` | → `/auth` | → `/auth` | → `/auth` | → `/auth` | → `/auth` | → `/auth` | → `/auth` | → `/auth` | ✅ | → 2FA setup |
| `/settings/pro` | → `/auth` | → `/auth` | → `/auth` | → `/auth` | → `/auth` | → `/auth` | ✅ | ✅ | → `/auth` | → `/auth` |

`* gated` = `OnboardingGate` shows interstitial, not the actual dashboard

### Expected Toasts/Modals by State

| State | Route | Expected UI |
|-------|-------|-------------|
| S10 (Admin no 2FA) | `/admin/*` | Toast: "Two-Factor Authentication Required" |
| S5 (Rejected) | `/dashboard/pro` | Gate UI: "Verification Not Approved" with rejection reason |
| S6 (No Services) | `/dashboard/pro` | Gate UI: "Configure Your Services" |
| S4 (Pending) | `/dashboard/pro` | Gate UI: "Verification In Progress" |
| S13 (Expired) | Any protected | → `/auth?redirect=...` (silent redirect) |
| S14 (No Profile) | Any | Error toast or crash (BUG if crashes) |

---

## PART 3: Route Guard / Redirect Loop Audit

### RouteGuard Configuration Matrix

| Route | `requiredRole` | `allowProfessionalIntent` | `requireOnboardingComplete` | `enforce2FA` |
|-------|---------------|---------------------------|----------------------------|--------------|
| `/dashboard/client` | `client` | `false` | `false` | N/A |
| `/dashboard/pro` | `professional` | `false` | `false` | N/A |
| `/admin/*` | `admin` | `false` | `false` | `true` |
| `/onboarding/professional` | `professional` | `true` | `false` | N/A |
| `/professional/verification` | `professional` | `true` | `false` | N/A |
| `/professional/services` | `professional` | `false` | `false` | N/A |
| `/professional/service-setup` | `professional` | `false` | `false` | N/A |
| `/post` | `client` | `false` | `false` | N/A |
| `/job-board` | `professional` | `false` | `false` | N/A |
| `/settings` | None (auth only) | `false` | `false` | N/A |
| `/settings/professional` | `professional` | `false` | `false` | N/A |

### Redirect Loop Analysis

| Scenario | State | Route Entered | Expected Behavior | Loop Risk |
|----------|-------|---------------|-------------------|-----------|
| 1 | S3 (intent only) | `/dashboard/pro` | → `/auth?redirect=/dashboard/pro` → signs in → loops? | ⚠️ MEDIUM |
| 2 | S4 (pending) | `/job-board` | → `/auth` (no pro role yet) → signs in → same state → loops | ⚠️ HIGH |
| 3 | S11 (no name) | `/dashboard` | → `/auth/quick-start` → completes → `/dashboard` → routes correctly | ✅ OK |
| 4 | S6 (no services) | `/dashboard/pro` | → `OnboardingGate` → `/professional/service-setup` | ✅ OK |
| 5 | S10 (no 2FA) | `/admin` | → `/admin/security?setup2fa=true` → sets up → `/admin` | ✅ OK |
| 6 | S14 (no profile) | Any | Crash? Or graceful handling? | 🔴 HIGH RISK |

### Critical Redirect Flow: `getInitialDashboardRoute()`

```text
Priority Queue:
1. No display_name → /auth/quick-start
2. Admin + active_role=admin → /admin
3. onboarding_completed=false → /auth/quick-start
4. Professional + tasker_onboarding_status != 'complete' → /onboarding/professional
5. Professional → /dashboard/pro
6. Default → /dashboard/client
```

**Potential Issues:**
1. Step 4 checks `tasker_onboarding_status` but `OnboardingGate` checks `onboarding_phase` - **inconsistent field usage**
2. A user could have `onboarding_completed=true` but `tasker_onboarding_status='not_started'` - conflicting states

---

## PART 4: Edit Mode vs Create Mode Audit

### Identified Dual-Mode Flows

| Flow | Create Route | Edit Route | Mode Detection | Hydration Method |
|------|-------------|------------|----------------|------------------|
| **Professional Onboarding** | `/onboarding/professional` (first visit) | Same route (return visit) | `useWizardAutosave` draft detection | localStorage draft OR existing `professional_profiles` row |
| **Service Selection Wizard** | `/professional/services/wizard` (first setup) | Same route (edit) | `existingServices` from DB | `useProfessionalServicePreferences` hook |
| **Job Wizard** | `/post` (always creates new) | N/A | Always create mode | N/A (no edit flow) |
| **Profile Settings** | `/settings/profile` | Same | Always edit (updates existing) | `useAuth().profile` |
| **Professional Settings** | `/settings/professional` | Same | Always edit | `fetchProfile()` from `professional_profiles` |
| **Portfolio Manager** | In `/settings/professional` | Same | Add/edit toggle via `editingImage` state | `portfolio_images` array |
| **Service Management** | Modal in `/settings/professional` | Same modal | `editingService` state | Service passed to modal |

### Detailed Flow Analysis

#### 1. Professional Onboarding Wizard
**Files:** `ProfessionalOnboardingWizard.tsx`, `ProfessionalOnboardingPage.tsx`

| Test Case | Expected Behavior | Current Implementation |
|-----------|-------------------|----------------------|
| First visit, no draft, no DB row | Start at step 0 with empty form | ✅ `data` initialized empty |
| Return visit, draft exists | Resume from draft with data | ✅ `loadDraft()` on mount |
| Return visit, DB row exists but no draft | Hydrate from DB | ⚠️ NOT IMPLEMENTED - will start fresh |
| Rejected pro returning | Show rejection reason, resume editing | ⚠️ UNCLEAR - uses same flow |

**BUG RISK:** If a professional completes Phase 1 onboarding, their data is saved to `professional_profiles`, but on return the wizard uses localStorage draft OR starts fresh - **existing DB data is NOT hydrated**.

#### 2. Service Preferences Wizard
**Files:** `ServicePreferencesWizard.tsx`, `useProfessionalServicePreferences.ts`

| Test Case | Expected Behavior | Current Implementation |
|-----------|-------------------|----------------------|
| First visit, no services | Start with 0 selected | ✅ `finalSelectedIds` computed correctly |
| Return visit, has 20 active services | Show 20 as selected | ✅ Fixed via delta-tracking pattern |
| Add 5 new services | Total becomes 25 | ✅ `addedMicroIds` tracked |
| Remove 3 existing services | Total becomes 17, 3 become `is_active=false` | ✅ `removedMicroIds` tracked |
| "Select all" in subcategory | All micro-services selected | ✅ `toggleSubcategoryServices` handles both sources |

**Status:** ✅ Recently fixed with proper delta-tracking pattern.

#### 3. Profile Settings vs Professional Settings Overlap
**Files:** `ProfileSettings.tsx`, `ProfessionalSettings.tsx`

| Field | ProfileSettings | ProfessionalSettings | Conflict? |
|-------|----------------|---------------------|-----------|
| `display_name` | ✅ Editable | ❌ Not shown | No |
| `full_name` | ✅ Editable | ❌ Not shown | No |
| `bio` | ✅ Editable (profiles.bio) | ✅ Editable (professional_profiles.bio) | ⚠️ **TWO DIFFERENT FIELDS** |
| `phone` | ✅ Editable | ❌ Not shown | No |
| `hourly_rate` | ❌ Not shown | ✅ Editable | No |
| `portfolio_images` | ❌ Not shown | ✅ Editable | No |

**Issue:** `bio` exists in BOTH `profiles` and `professional_profiles` tables. Users may edit one thinking it updates the other.

---

## PART 5: Button Contract Audit (Key Flows)

### Auth Flow Buttons
| Button | Location | Target | Preconditions | Success | Failure |
|--------|----------|--------|---------------|---------|---------|
| "Sign In" | `/auth` signin tab | Form submit → `signInMutation` | Valid email + password | → `redirectTo` or dashboard | Toast: "Email or password incorrect" |
| "Create Account" | `/auth` signup tab | Form submit → `supabase.auth.signUp` | Valid form + role selected | → `/auth/verify-email` | Toast: error message |
| "Forgot password?" | `/auth` signin tab | Link to `/auth/forgot-password` | None | Page navigation | N/A |
| "Continue without signing in" | `/auth` signin tab | `navigate(redirectTo)` | None | → destination | N/A |

### Dashboard Buttons
| Button | Location | Target | Preconditions | Success | Failure |
|--------|----------|--------|---------------|---------|---------|
| "Post a Job" | Client dashboard | Link to `/post` | `client` role | Wizard opens | N/A |
| "Edit Profile" | Pro dashboard | Link to `/settings/professional` | `professional` role | Settings open | N/A |
| "Configure Services Now" | `OnboardingGate` | Link to `/professional/service-setup` | Verified but no services | Wizard opens | N/A |
| "Upload Documents" | `OnboardingGate` | Link to `/professional/verification` | Phase = `intro_submitted` | Upload page opens | N/A |

### Wizard Buttons
| Button | Location | Target | Preconditions | Success | Failure |
|--------|----------|--------|---------------|---------|---------|
| "Next" | Job wizard | Step increment + URL param update | Step validation passed | Next step | Disabled/toast |
| "Back" | Job wizard | Step decrement | Step > 1 | Previous step | N/A |
| "Submit" | Pro onboarding step 5 | `handleSubmit()` | All required fields | → `/dashboard/pro` | Toast: error |
| "Save Services" | Service wizard step 5 | `saveServices()` | At least 1 service selected | Toast: success | Toast: error |

---

## PART 6: Critical Test Scenarios

### Killer Test 1: Deep-Link Test Matrix

For each route, open directly in new browser tab:

| Route | S1 Unauth | S2 Client | S3 Intent | S7 Full Pro | S8 Dual |
|-------|-----------|-----------|-----------|-------------|---------|
| `/dashboard/client` | → `/auth?redirect=...` | ✅ Dashboard | → `/auth?redirect=...` | → `/auth?redirect=...` | ✅ if `active_role=client` |
| `/dashboard/pro` | → `/auth?redirect=...` | → `/auth?redirect=...` | → `/auth?redirect=...` | ✅ or Gate | ✅ if `active_role=pro` |
| `/post` | → `/auth?redirect=/post` | ✅ Wizard | ✅? | ✅? | ✅ |
| `/job-board` | → `/auth?redirect=...` | → `/auth?redirect=...` | → `/auth?redirect=...` | ✅ | ✅ if `active_role=pro` |
| `/professional/services/wizard` | → `/auth?redirect=...` | → `/auth?redirect=...` | → `/auth?redirect=...` | ✅ | ✅ |
| `/admin` | → `/auth?redirect=/admin` | → `/auth?redirect=/admin` | → `/auth?redirect=/admin` | → `/auth?redirect=/admin` | → `/auth?redirect=/admin` |
| `/settings/professional` | → `/auth?redirect=...` | → `/auth?redirect=...` | → `/auth?redirect=...` | ✅ | ✅ |

### Killer Test 2: Partial Completion Test

| Step | Action | Expected |
|------|--------|----------|
| 1 | Start pro onboarding, fill steps 1-3, close browser | Data saved to localStorage via `useWizardAutosave` |
| 2 | Return to `/onboarding/professional` | Toast: "Restore your previous progress?" + data restored |
| 3 | Complete onboarding, verify submitted | `professional_profiles` row created |
| 4 | Return to `/onboarding/professional` after verification pending | ⚠️ **UNCLEAR** - may show fresh wizard or block access |
| 5 | After rejection, return to `/onboarding/professional` | Should show rejection reason + allow re-edit |

### Killer Test 3: Empty Account Test

Create user with minimal data:
- No jobs posted
- No `professional_profiles` row
- No `professional_services` rows
- `onboarding_completed = true`
- `tasker_onboarding_status = 'not_started'`

| Route | Expected |
|-------|----------|
| `/dashboard/client` | Empty state: "No jobs yet" |
| `/dashboard/pro` | Either blocked (no pro role) OR empty with CTA |
| `/settings/professional` | Either blocked OR empty profile form |
| `/professional/services/wizard` | Empty selection (0 of 330) |

### Killer Test 4: Session Expiry Mid-Flow

| Scenario | Expected |
|----------|----------|
| User in job wizard step 4, session expires | On step 5 submit → `/auth?redirect=/post` with draft preserved |
| User editing professional settings, session expires | On save → `/auth?redirect=/settings/professional` |
| User in admin panel, session expires | → `/auth?redirect=/admin/...` |

---

## PART 7: Identified Issues & Recommendations

### 🔴 High Priority Issues

1. **Onboarding Field Inconsistency**
   - `getInitialDashboardRoute()` uses `tasker_onboarding_status`
   - `OnboardingGate` uses `onboarding_phase`
   - These can be out of sync

2. **Profile Bio Duplication**
   - `profiles.bio` and `professional_profiles.bio` both exist
   - Users may edit wrong one

3. **No DB Hydration in Onboarding Wizard**
   - Returning professionals with existing `professional_profiles` data start fresh
   - Only localStorage draft is restored

### 🟡 Medium Priority Issues

4. **Intent-Based Access Edge Cases**
   - User with `intent_role=professional` but NO verification row is blocked
   - May cause confusion after signup

5. **Dual-Role Active Role Context**
   - `/post` requires `client` role but professionals can also be clients
   - Role context affects what they see

6. **Service Wizard Entry Points**
   - First-time setup vs editing uses same route with no explicit mode

### 🟢 Low Priority Issues

7. **Admin 2FA Flow**
   - Clear but could show more context about why 2FA is required

8. **Empty State Consistency**
   - Different components handle empty states differently

---

## PART 8: Recommended Test Automation

### E2E Test Suite Structure

```text
tests/
├── auth/
│   ├── signup-client.spec.ts
│   ├── signup-professional.spec.ts
│   ├── signin.spec.ts
│   ├── password-reset.spec.ts
│   └── session-expiry.spec.ts
├── onboarding/
│   ├── professional-first-time.spec.ts
│   ├── professional-resume-draft.spec.ts
│   ├── professional-after-rejection.spec.ts
│   └── client-quick-start.spec.ts
├── dashboards/
│   ├── client-empty-state.spec.ts
│   ├── professional-gates.spec.ts
│   ├── admin-2fa-gate.spec.ts
│   └── role-switching.spec.ts
├── wizards/
│   ├── job-wizard-complete.spec.ts
│   ├── job-wizard-draft-restore.spec.ts
│   ├── service-wizard-create.spec.ts
│   ├── service-wizard-edit.spec.ts
│   └── service-wizard-deselect.spec.ts
├── deep-links/
│   ├── protected-routes-unauth.spec.ts
│   ├── protected-routes-wrong-role.spec.ts
│   └── redirect-loop-prevention.spec.ts
└── settings/
    ├── profile-settings.spec.ts
    ├── professional-settings.spec.ts
    └── field-sync.spec.ts
```

---

## Summary

This audit reveals a well-structured routing system with proper guards, but identifies several edge cases that need testing:

1. **Inconsistent onboarding field usage** between different components
2. **No database hydration** for returning professionals in onboarding wizard
3. **Potential redirect loops** for users with intent but no verification
4. **Duplicate bio fields** causing potential data confusion

The recommended next step is to implement the E2E test suite outlined above, focusing first on the "Killer Tests" which will catch 80% of hidden bugs.

