# Bug Report Template

Use this template when reporting issues found during testing.

---

## Quick Info

| Field | Value |
|-------|-------|
| **Date** | |
| **Tester** | |
| **Priority** | P0 / P1 / P2 |
| **User State #** | (1-10 from Launch Rail) |
| **Route** | |
| **Browser** | |

---

## What Happened

_Describe what you observed_

---

## Expected Behavior

_Describe what should have happened according to the Launch Rail matrix_

---

## Steps to Reproduce

1. Sign in as [state type]
2. Navigate to [route]
3. Click/do [action]
4. Observe [result]

---

## Browser Console Errors

```
Paste any red text from browser console (F12 → Console tab)
```

---

## Network Errors (if applicable)

| Request | Status | Error |
|---------|--------|-------|
| | | |

---

## Screenshots

_Attach screenshots if helpful_

---

## Priority Guide

| Priority | Definition | Examples |
|----------|------------|----------|
| **P0** | Blocks progress, crashes, wrong access, data loss | Redirect loop, wrong role accessing admin, form not submitting |
| **P1** | Confusing but survivable | Wrong redirect target, UI glitch, unclear error message |
| **P2** | Nice to fix later | Cosmetic issue, minor UX improvement, edge case polish |

---

## State Reference

| # | State Name | Roles | Active Role |
|---|------------|-------|-------------|
| 1 | Unauthenticated | - | - |
| 2 | New Client | client | client |
| 3 | Pro Intent | client | client |
| 4 | Pro Intro Done | client | professional |
| 5 | Pro Pending | client | professional |
| 6 | Pro Rejected | client/professional | professional |
| 7 | Pro Verified | client, professional | professional |
| 8 | Pro Complete | client, professional | professional |
| 9 | Dual (as client) | client, professional | client |
| 10 | Admin | client, admin | admin |
