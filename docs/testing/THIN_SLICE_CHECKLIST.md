# Thin Slice Test Session

> **Purpose:** Run the 5 critical journeys in under 30 minutes to validate launch readiness.

---

## Required Test Accounts

| Account Type | Email | Password | User ID | Notes |
|--------------|-------|----------|---------|-------|
| Client only (S2) | | | | New signup with intent=client |
| Pro verified w/ services (S8) | | | | `onboarding_phase='complete'`, `verification_status='verified'` |
| Dual-role user (S9) | | | | Has both roles, can switch |
| Admin with 2FA (S10) | | | | Has admin role + 2FA configured |

---

## Journey A: Client Job Post

**User State:** S2 (New Client)

| Step | Action | Expected Result | Pass |
|------|--------|-----------------|------|
| 1 | Sign in as client | Redirects to `/dashboard/client` | ☐ |
| 2 | Navigate to `/post` | Job wizard loads | ☐ |
| 3 | Complete all wizard steps | No errors, progress saved | ☐ |
| 4 | Submit job | Redirects to `/post/success` | ☐ |
| 5 | View job at `/jobs/:id` | Job detail page shows correct data | ☐ |
| 6 | Check DB | `jobs` table has new row with correct `client_id` | ☐ |

**Result:** ☐ PASS / ☐ FAIL

**Notes:**

**DB Verification Query:**
```sql
SELECT id, title, client_id, status, created_at 
FROM jobs 
WHERE client_id = '[USER_ID]' 
ORDER BY created_at DESC 
LIMIT 1;
```

---

## Journey B: Pro Dashboard Access

**User State:** S8 (Pro Complete)

| Step | Action | Expected Result | Pass |
|------|--------|-----------------|------|
| 1 | Sign in as verified pro | Redirects to `/dashboard/pro` | ☐ |
| 2 | Check for gates | NO gate overlays shown | ☐ |
| 3 | View leads/matches section | Data loads correctly | ☐ |
| 4 | Navigate to `/professional/service-setup` | Page loads, shows current services | ☐ |
| 5 | Return to dashboard | No redirect loops | ☐ |

**Result:** ☐ PASS / ☐ FAIL

**Notes:**

**DB Verification Query:**
```sql
SELECT onboarding_phase, verification_status 
FROM professional_profiles 
WHERE user_id = '[USER_ID]';
-- Should show: complete, verified
```

---

## Journey C: Role Switching

**User State:** S9 → S8 (Dual-role)

| Step | Action | Expected Result | Pass |
|------|--------|-----------------|------|
| 1 | Sign in as dual-role (active=pro) | Lands on `/dashboard/pro` | ☐ |
| 2 | Click role switcher | Role toggle visible | ☐ |
| 3 | Switch to client role | UI updates immediately | ☐ |
| 4 | Navigate to `/dashboard` | Redirects to `/dashboard/client` | ☐ |
| 5 | Refresh page | Still on client dashboard | ☐ |
| 6 | Switch back to pro role | UI updates | ☐ |
| 7 | Navigate to `/dashboard` | Redirects to `/dashboard/pro` | ☐ |
| 8 | Refresh page | Still on pro dashboard | ☐ |

**Result:** ☐ PASS / ☐ FAIL

**Notes:**

**DB Verification Query:**
```sql
SELECT active_role FROM profiles WHERE id = '[USER_ID]';
-- Should update when role is switched
```

---

## Journey D: Deep Link Protection

**User State:** S1 → S8 (Unauthenticated → Verified Pro)

| Step | Action | Expected Result | Pass |
|------|--------|-----------------|------|
| 1 | Sign out completely | Session cleared | ☐ |
| 2 | Visit `/dashboard/pro` directly | Redirects to `/auth?redirect=%2Fdashboard%2Fpro` | ☐ |
| 3 | Verify URL params | `redirect` param present in URL | ☐ |
| 4 | Sign in as verified pro | Auth completes | ☐ |
| 5 | Check final destination | Lands on `/dashboard/pro` (NOT `/dashboard/client`) | ☐ |

**Result:** ☐ PASS / ☐ FAIL

**Notes:**

---

## Journey E: Session Expiry

**User State:** S8 (Pro Complete)

| Step | Action | Expected Result | Pass |
|------|--------|-----------------|------|
| 1 | Sign in as verified pro | Dashboard loads | ☐ |
| 2 | Navigate to wizard (any step) | Wizard loads | ☐ |
| 3 | Open DevTools (F12) | Console visible | ☐ |
| 4 | Go to Application → Cookies | Cookie list visible | ☐ |
| 5 | Delete all site cookies | Cookies cleared | ☐ |
| 6 | Try to proceed in wizard | - | ☐ |
| 7 | Check result | Redirects to `/auth` gracefully (NO crash, NO infinite loop) | ☐ |

**Result:** ☐ PASS / ☐ FAIL

**Notes:**

---

## Summary

| Journey | Result | Blocker? | Notes |
|---------|--------|----------|-------|
| A: Client Job Post | PASS / FAIL | Y / N | |
| B: Pro Dashboard Access | PASS / FAIL | Y / N | |
| C: Role Switching | PASS / FAIL | Y / N | |
| D: Deep Link Protection | PASS / FAIL | Y / N | |
| E: Session Expiry | PASS / FAIL | Y / N | |

---

## Go/No-Go Decision

**Date:** _______________

**Tester:** _______________

| Check | Status |
|-------|--------|
| All P0 killer tests pass | ☐ |
| No blockers in summary | ☐ |
| DB writes verified | ☐ |
| No console errors in any journey | ☐ |

**Overall:** ☐ Ready for feedback stage / ☐ NOT ready (blockers found)

---

## Post-Test Actions

1. File bug reports for any failures (use `BUG_REPORT_TEMPLATE.md`)
2. Update LAUNCH_RAIL.md with any new edge cases discovered
3. Schedule next test session after fixes
