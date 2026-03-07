

# Unlock All Access + Page Checklist

## What We're Doing

Three changes to make the app fully navigable as a template for review:

1. **Enable auto-confirm email signups** - No email verification needed
2. **Remove all route guards** - Every page accessible without role checks
3. **Create a Page Checklist page** - Master list of every route with checkboxes to track review progress

---

## 1. Auto-Confirm Email Signups

Use the auth configuration tool to enable auto-confirm so new accounts are instantly active.

---

## 2. Strip Route Guards from App.tsx

Replace every `<RouteGuard ...>` wrapper with just the child component. This means:

- ~30 RouteGuard wrappers removed across dashboards, admin, settings, professional, client routes
- AdminGuard components inside individual pages (like `QuestionPackAudit.tsx`, `PricingManager.tsx`) left as-is for now since they're inside the page files - but we'll also strip those

**Files affected:**
- `src/App.tsx` - Remove all RouteGuard wrappers
- `src/pages/AdminQuestions.tsx` - Remove AdminGuard
- `src/pages/admin/PricingManager.tsx` - Remove AdminGuard
- `src/pages/admin/CalculatorAnalytics.tsx` - Remove AdminGuard
- Any other pages with inline AdminGuard usage

---

## 3. Create Page Review Checklist

New page at `/admin/page-checklist` with:

- Every route from the app organized by section (Public, Auth, Client, Professional, Admin, Settings, etc.)
- Checkbox for each page with localStorage persistence
- Direct link to navigate to each page
- Progress counter (e.g., "14/72 checked")
- "Clear all" reset button

### Route Sections

| Section | Routes |
|---------|--------|
| Public | `/`, `/services`, `/discovery`, `/job-board`, `/calculator`, `/how-it-works`, `/contact`, `/professionals`, `/fair`, etc. |
| Auth | `/auth`, `/auth/verify-email`, `/auth/forgot-password`, `/auth/reset-password`, `/role-switcher` |
| Client | `/dashboard/client`, `/post`, `/templates`, `/dashboard/client/analytics/*` |
| Professional | `/dashboard/pro`, `/onboarding/professional`, `/professional/verification`, `/professional/services`, `/professional/portfolio`, `/availability`, `/calendar`, `/earnings`, etc. |
| Messaging | `/messages`, `/messaging` |
| Contracts & Payments | `/contracts`, `/disputes`, `/payments`, `/escrow/*` |
| Admin | All `/admin/*` routes (~35 routes) |
| Settings | `/settings/profile`, `/settings/account`, `/settings/notifications`, etc. |
| Legal | `/terms`, `/privacy`, `/cookie-policy` |

**File**: `src/pages/admin/PageChecklist.tsx`

Add route in App.tsx at `/page-checklist` (public, no guard).

---

## Files Changed

| File | Change |
|------|--------|
| `src/App.tsx` | Remove all RouteGuard wrappers, add `/page-checklist` route |
| `src/pages/admin/PageChecklist.tsx` | New checklist page |
| `src/pages/AdminQuestions.tsx` | Remove AdminGuard |
| `src/pages/admin/PricingManager.tsx` | Remove AdminGuard |
| `src/pages/admin/CalculatorAnalytics.tsx` | Remove AdminGuard |
| Auth config | Enable auto-confirm emails |

