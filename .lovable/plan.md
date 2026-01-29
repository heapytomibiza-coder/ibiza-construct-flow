

# Enhanced Launch Rail System — Complete Test Matrix + Bug Reporting

## Summary

Upgrading the existing docs with **two key improvements**:
1. **Enhanced 15×10 State-Route Matrix** with Expected UI Outcome + Expected DB columns
2. **Bug Report Template** for structured tester feedback

---

## Part 1: Enhanced LAUNCH_RAIL.md

### Replace Section 7 with Full State-Route Matrix

The current doc has just a list of routes. We'll add a comprehensive matrix with:

| Column | Purpose |
|--------|---------|
| Route | The URL path |
| S1-S10 | Expected behavior per state |
| Expected UI | What the user sees |
| Expected DB | Tables read/written |

### New Matrix Format

```text
┌──────────────────────────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬─────────────────────┬─────────────────────────┐
│ Route                    │ S1   │ S2   │ S3   │ S4   │ S5   │ S6   │ S7   │ S8   │ S9   │ S10  │ Expected UI         │ Expected DB             │
├──────────────────────────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼─────────────────────┼─────────────────────────┤
│ /                        │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ Landing page        │ R: none                 │
│ /auth                    │ ✓    │ →D   │ →D   │ →D   │ →D   │ →D   │ →D   │ →D   │ →D   │ →D   │ Sign in/up forms    │ R: profiles             │
│ /dashboard/client        │ →A   │ ✓    │ →O   │ →O   │ →O   │ →O   │ →O   │ ✓    │ ✓    │ ✓    │ Client job list     │ R: jobs, profiles       │
│ /dashboard/pro           │ →A   │ →A   │ →O   │ G1   │ G2   │ G3   │ G4   │ ✓    │ →C   │ ✓    │ Pro leads/contracts │ R: professional_profiles│
│ /post                    │ →A   │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ Job wizard          │ W: jobs, job_answers    │
│ /post/success            │ →A   │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ Success confirmation│ R: jobs                 │
│ /jobs/:id                │ →A   │ ✓*   │ ✓*   │ ✓*   │ ✓*   │ ✓*   │ ✓*   │ ✓*   │ ✓*   │ ✓    │ Job detail          │ R: jobs, job_answers    │
│ /jobs/:id/matches        │ →A   │ ✓*   │ →A   │ →A   │ →A   │ →A   │ →A   │ ✓    │ ✓*   │ ✓    │ Matched pros list   │ R: matches              │
│ /onboarding/professional │ →A   │ →A   │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ 5-step wizard       │ R/W: professional_profs │
│ /professional/verify     │ →A   │ →A   │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ Upload docs form    │ W: professional_profs   │
│ /professional/service    │ →A   │ →A   │ →A   │ →A   │ →A   │ →A   │ ✓    │ ✓    │ ✓    │ ✓    │ Service selection   │ R/W: pro_service_links  │
│ /settings/profile        │ →A   │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ Profile form        │ R/W: profiles           │
│ /settings/professional   │ →A   │ →A   │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ ✓    │ Pro settings form   │ R/W: professional_profs │
│ /admin                   │ →A   │ →A   │ →A   │ →A   │ →A   │ →A   │ →A   │ →A   │ →A   │ 2FA  │ Admin dashboard     │ R: users, jobs, etc.    │
│ /admin/users             │ →A   │ →A   │ →A   │ →A   │ →A   │ →A   │ →A   │ →A   │ →A   │ 2FA  │ User management     │ R/W: profiles, roles    │
└──────────────────────────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴─────────────────────┴─────────────────────────┘

Legend:
✓  = Accessible (shows Expected UI)
✓* = Accessible if owner (RLS-gated)
→A = Redirect to /auth
→D = Redirect to dashboard (role-based)
→O = Redirect to /onboarding/professional
→C = Redirect to /dashboard/client
G1 = Gate: Upload Verification Docs
G2 = Gate: Under Admin Review
G3 = Gate: Application Rejected
G4 = Gate: Configure Services
2FA = Requires 2FA setup first

R: = Database reads
W: = Database writes
R/W: = Both reads and writes
```

### Add Notes Column for Edge Cases

| Route | Edge Case Notes |
|-------|-----------------|
| `/jobs/:id` | Owner sees edit button; others see view-only |
| `/jobs/:id/matches` | Only job owner can view matches |
| `/dashboard/pro` | Gate varies by `onboarding_phase` value |
| `/professional/service` | Only accessible after `verification_status='verified'` |

---

## Part 2: Bug Report Template

Create `docs/testing/BUG_REPORT_TEMPLATE.md`:

```markdown
# Bug Report Template

## Quick Info
- **Date:** 
- **Tester:** 
- **Priority:** P0 / P1 / P2
- **State #:** (1-10 from Launch Rail)

## What Happened
_Describe what you saw_

## Expected Behavior
_Describe what should have happened_

## Steps to Reproduce
1. 
2. 
3. 

## Browser Console Errors
_Copy any red text from browser console (F12)_

## Screenshots
_Attach if helpful_

## Priority Guide
- **P0:** Blocks progress, crashes, wrong access, data loss
- **P1:** Confusing but survivable (wrong redirect, UI glitch)
- **P2:** Nice to fix later (cosmetic, minor UX)
```

---

## Part 3: Thin Slice Test Checklist

Create `docs/testing/THIN_SLICE_CHECKLIST.md`:

```markdown
# Thin Slice Test Session

## Required Test Accounts
| Account Type | Email | Password | User ID |
|--------------|-------|----------|---------|
| Client only | | | |
| Pro verified w/ services | | | |
| Admin with 2FA | | | |

---

## Journey A: Client Job Post
- [ ] Sign in as client
- [ ] Navigate to /post
- [ ] Complete job wizard (all steps)
- [ ] See /post/success
- [ ] View job at /jobs/:id
- [ ] Verify job row in DB

**Result:** PASS / FAIL
**Notes:**

---

## Journey B: Pro Dashboard Access
- [ ] Sign in as verified pro
- [ ] Navigate to /dashboard/pro
- [ ] No gates shown
- [ ] Can see leads/matches
- [ ] Can access /professional/service-setup

**Result:** PASS / FAIL
**Notes:**

---

## Journey C: Role Switching
- [ ] Sign in as dual-role user (active=pro)
- [ ] Switch to client role
- [ ] Navigate to /dashboard
- [ ] Lands on /dashboard/client
- [ ] Switch back to pro role
- [ ] Navigate to /dashboard
- [ ] Lands on /dashboard/pro
- [ ] Refresh page - role persists

**Result:** PASS / FAIL
**Notes:**

---

## Journey D: Deep Link Protection
- [ ] Sign out completely
- [ ] Visit /dashboard/pro directly
- [ ] Redirected to /auth?redirect=%2Fdashboard%2Fpro
- [ ] Sign in as verified pro
- [ ] Lands on /dashboard/pro (not /dashboard/client)

**Result:** PASS / FAIL
**Notes:**

---

## Journey E: Session Expiry
- [ ] Sign in, navigate to wizard mid-step
- [ ] Clear session (DevTools → Application → Cookies → delete)
- [ ] Try to proceed
- [ ] Should redirect to /auth gracefully (no crash)

**Result:** PASS / FAIL
**Notes:**

---

## Summary
| Journey | Result | Blocker? |
|---------|--------|----------|
| A: Client Job Post | | |
| B: Pro Dashboard | | |
| C: Role Switching | | |
| D: Deep Link | | |
| E: Session Expiry | | |

**Overall:** Ready for feedback stage? YES / NO
```

---

## Files to Create/Update

| File | Action |
|------|--------|
| `docs/LAUNCH_RAIL.md` | Update Section 7 with full matrix |
| `docs/testing/BUG_REPORT_TEMPLATE.md` | Create new |
| `docs/testing/THIN_SLICE_CHECKLIST.md` | Create new |

---

## Implementation Summary

These enhancements give your team:

1. **15×10 Matrix with DB columns** — Instant debugging when something fails
2. **Bug Report Template** — Structured feedback from testers
3. **Thin Slice Checklist** — Run the 5 critical journeys in under 30 minutes

This is the **minimum viable test system** that prevents drift without overengineering.

