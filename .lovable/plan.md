

# Flow Integrity Fixes - Implementation Plan

## Overview
Based on the comprehensive codebase audit, the PWA caching fix is correctly implemented, but several Flow Contract items still need attention. This plan addresses the remaining gaps in priority order.

---

## Phase 1: Critical Path Fixes (Prevents Broken Flows)

### 1.1 Fix AuthCallback Dead Code Bug
**File:** `src/pages/AuthCallback.tsx`

**Problem:** Lines 69-71 contain unreachable code - `redirectTo` is checked twice, but if it exists, we already returned on line 32-33.

**Fix:**
- Remove the redundant `if (redirectTo)` block on lines 69-71
- Keep only the else branch with `getInitialDashboardRoute()`

---

### 1.2 Standardize Redirect Parameter Documentation
**Decision Required:** The code consistently uses `redirect`, but the Flow Contract memory says `returnTo`.

**Options:**
1. Update docs/memory to match code (`redirect`)
2. Update all code to use `returnTo`

**Recommendation:** Option 1 - the code is already consistent with `redirect`. Update the architectural documentation to reflect reality.

---

### 1.3 Enforce Wizard Service Selection
**Files:**
- `src/components/Hero.tsx`
- `src/components/navigation/QuickActions.tsx`
- `src/components/wizard/canonical/CanonicalJobWizard.tsx`

**Problem:** Users can enter `/post` with no service context, leading to empty wizard state.

**Fix:**
1. Update entry points to include a service selection indicator:
   - Hero: Navigate to `/post?source=hero` (triggers selection step)
   - QuickActions: Navigate to `/post?source=quick`

2. In CanonicalJobWizard, check URL params on mount:
   - If `microServiceId` exists: pre-populate service
   - If `service`/`category` exists: resolve to microServiceId
   - If no params OR `source=hero`: ensure step 1 forces selection (current behavior)

---

## Phase 2: URL-Based Draft Recovery

### 2.1 Add draftId to URL
**File:** `src/components/wizard/canonical/CanonicalJobWizard.tsx`

**Changes:**
1. After creating/loading a draft, update URL: `navigate(/post?draftId=${id}, { replace: true })`
2. On mount, check for `draftId` param and load from Supabase if present
3. Share-friendly: anyone with draftId can view (if authed as owner)

**Benefits:**
- Bookmarkable wizard progress
- Auth redirects preserve draft via URL (not just session)
- Debugging: can see which draft is active

---

## Phase 3: Navigation Hygiene (Prevent SW/Cache Issues)

### 3.1 Replace window.location.href with navigate()
**Files to update (10 total):**

| File | Line | Current | Replace With |
|------|------|---------|--------------|
| `ErrorBoundary.tsx` | 53 | `window.location.href = '/'` | `navigate('/')` or reload intentionally |
| `common/ErrorBoundary.tsx` | 75 | `window.location.href = '/'` | `navigate('/')` |
| `NotificationItem.tsx` | 26 | `window.location.href` | `navigate(notification.actionUrl)` |
| `RealtimeNotifications.tsx` | 29 | `window.location.href` | `navigate(notification.action_url)` |
| `EnhancedServiceCard.tsx` | 30 | `window.location.href` | `navigate(...)` |
| `VerifyEmail.tsx` | 122 | `window.location.href` | `navigate(getAuthRoute(...))` |
| `SimpleProfessionalDashboard.tsx` | 249 | `window.location.href` | `navigate('/dashboard/pro#features')` |
| `ComparisonModal.tsx` | 139 | `window.location.href` | `navigate(...)` |
| `EnhancedProfessionalCard.tsx` | 219 | `<a href>` | `<Link to>` |
| `Footer.tsx` | 47 | `<a href="#">` | `<Link to="/services">` |

**Note:** ErrorBoundary may intentionally use `window.location.href` to force a clean reload after an error. This should be documented as an intentional exception.

---

## Phase 4: Verification Tests

### Manual Test Checklist (Run After Implementation)
1. **Service -> Wizard -> Login -> Returns to Wizard**
   - Go to `/discovery` -> click service -> "Start" -> login -> verify returns to wizard with service pre-selected

2. **Wizard Refresh Survival**
   - Get to step 4 -> refresh -> verify same step with answers intact

3. **Wizard Publish Success**
   - Complete wizard -> publish -> verify job appears in dashboard

4. **Pro Onboarding Guard**
   - Login as incomplete pro -> verify redirected to `/onboarding/professional`, not dashboard

5. **Client Route Blocking**
   - As client, navigate to `/dashboard/pro` -> verify redirected to `/dashboard/client`

6. **Already Logged In + Auth**
   - While logged in, visit `/auth?redirect=/post` -> verify goes to `/post`, not dashboard

7. **Empty Wizard Handling**
   - Navigate directly to `/post` -> verify service selection step appears

---

## Files Modified Summary

| File | Changes |
|------|---------|
| `src/pages/AuthCallback.tsx` | Remove dead code (lines 69-71) |
| `src/components/Hero.tsx` | Add `?source=hero` param |
| `src/components/navigation/QuickActions.tsx` | Add `?source=quick` param |
| `src/components/wizard/canonical/CanonicalJobWizard.tsx` | Add draftId URL handling |
| `src/components/error/ErrorBoundary.tsx` | Document intentional reload OR convert to navigate |
| `src/components/common/ErrorBoundary.tsx` | Convert to navigate |
| `src/components/notifications/NotificationItem.tsx` | Use navigate hook |
| `src/components/professional/RealtimeNotifications.tsx` | Use navigate hook |
| `src/components/services/EnhancedServiceCard.tsx` | Use navigate hook |
| `src/pages/VerifyEmail.tsx` | Use navigate hook |
| `src/components/dashboards/SimpleProfessionalDashboard.tsx` | Use navigate hook |
| `src/components/professionals/ComparisonModal.tsx` | Use navigate hook |
| `src/components/professionals/EnhancedProfessionalCard.tsx` | Use Link component |
| `src/components/Footer.tsx` | Use Link for internal routes |

---

## Priority Order
1. **Immediate:** Phase 1 (AuthCallback fix, docs alignment)
2. **This Sprint:** Phase 3 (Navigation hygiene - prevents PWA issues)
3. **Next Sprint:** Phase 2 (draftId URL) + Phase 4 (verification)

