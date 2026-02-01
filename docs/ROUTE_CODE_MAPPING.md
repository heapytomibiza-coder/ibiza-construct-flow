# Route → Code Mapping

This document maps the architecture mind map to actual source files.

---

## 🌐 PUBLIC ROUTES (No Auth Required)

| Route | Page Component | Key Components |
|-------|----------------|----------------|
| `/` | `src/pages/Index.tsx` | `Hero.tsx`, `HomepageServiceTiles.tsx`, `FeaturedProfessionalsSection.tsx` |
| `/discovery`, `/services/:slug` | `src/pages/Discovery.tsx`, `src/pages/ServiceCategoryPage.tsx` | `src/components/discovery/*` |
| `/job-board` | `src/pages/JobBoardPage.tsx` | `src/components/marketplace/JobsMarketplace.tsx` |
| `/professionals` | `src/pages/BrowseProfessionalsPage.tsx` | `src/components/professionals/*` |
| `/professionals/:id` | `src/pages/ProfessionalProfile.tsx` | `ProfessionalHeroSection.tsx`, `ProfessionalReviewsSection.tsx` |
| `/privacy` | `src/pages/PrivacyPolicy.tsx` | - |
| `/terms` | `src/pages/TermsOfService.tsx` | - |
| `/cookie-policy` | `src/pages/CookiePolicy.tsx` | - |
| `/how-it-works` | `src/pages/HowItWorks.tsx` | `src/components/HowItWorks.tsx` |
| `/calculator` | `src/pages/Calculator.tsx` | `src/components/calculator/*` |
| `/contact` | `src/pages/Contact.tsx` | - |
| `/fair/:section` | `src/pages/FairShowcase.tsx` | `src/components/fair/*` |

---

## 🔗 SHARED (Auth Required, Any Role)

| Route | Page Component | Key Components |
|-------|----------------|----------------|
| `/dashboard` | `src/pages/Dashboard.tsx` | Redirects based on `active_role` |
| `/messages`, `/messaging/:id` | `src/pages/MessagingPage.tsx` | `src/components/messaging/*` |
| `/payments` | `src/pages/PaymentsPage.tsx` | `src/components/payments/*` |
| `/disputes`, `/disputes/:id` | `src/pages/DisputeCenterPage.tsx`, `src/pages/DisputeDetailPage.tsx` | `src/components/disputes/*` |
| `/contracts`, `/contracts/:id` | `src/pages/ContractManagementPage.tsx`, `src/pages/ContractDetail.tsx` | `src/components/contracts/*` |
| `/settings/*` | `src/pages/Settings.tsx` | `src/pages/settings/*` |

---

## 🔐 AUTH FLOW

| Route | Page Component | Purpose |
|-------|----------------|---------|
| `/auth` | `src/pages/UnifiedAuth.tsx` | Login/Signup |
| `/auth/callback` | `src/pages/AuthCallback.tsx` | Email verification, OAuth callback |
| `/auth/verify-email` | `src/pages/VerifyEmail.tsx` | Email verification pending |
| `/auth/forgot-password` | `src/pages/ForgotPassword.tsx` | Password reset request |
| `/auth/reset-password` | `src/pages/ResetPassword.tsx` | Password reset form |
| `/role-switcher` | `src/pages/RoleSwitcher.tsx` | Switch between client/professional |
| `/auth/quick-start` | `src/pages/QuickStart.tsx` | Onboarding entry |

### Auth Hooks & Logic
- `src/hooks/useAuth.ts` — Session, user, profile state
- `src/hooks/useAuthGate.ts` — Action-point gating
- `src/lib/roles.ts` — Role management, realtime sync
- `supabase/functions/auth-session/index.ts` — Server-side session enrichment

---

## 🔵 CLIENT ROUTES (role: client)

| Route | Page Component | Key Components |
|-------|----------------|----------------|
| `/dashboard/client` | `src/pages/Dashboard.tsx` → `ClientDashboard` | `src/components/dashboards/ClientDashboard.tsx` |
| `/post` | `src/pages/PostJob.tsx` | `src/components/wizard/canonical/CanonicalJobWizard.tsx` |
| `/post/success` | `src/pages/PostJobSuccessPage.tsx` | - |
| `/dashboard/client/analytics/*` | `src/pages/admin/analytics/*` | Analytics views |
| `/templates` | `src/pages/Templates.tsx` | Job templates |

### Client Components
```
src/components/client/
├── dashboard/
│   ├── ClientMetricCard.tsx
│   ├── ProjectTimeline.tsx
│   └── SpendingChart.tsx
├── ClientJobsView.tsx
├── ClientMessagesView.tsx
├── ClientPaymentsView.tsx
└── EnhancedClientDashboard.tsx
```

---

## 🟢 PRO ONBOARDING (Select OR role)

| Route | Page Component | Key Components |
|-------|----------------|----------------|
| `/onboarding/professional` | `src/pages/ProfessionalOnboardingPage.tsx` | `src/components/onboarding/wizard/ProfessionalOnboardingWizard.tsx` |
| `/professional/verification` | `src/pages/ProfessionalVerificationPage.tsx` | `src/components/professional/verification/*` |
| `/professional/service-setup` | `src/pages/ServiceSetupWizard.tsx` | `src/components/professional/services/*` |
| `/professional/services` | `src/pages/ProfessionalServicesPage.tsx` | `ServiceManagementPanel.tsx` |
| `/professional/portfolio` | `src/pages/ProfessionalPortfolioPage.tsx` | `PortfolioManager.tsx` |

### Onboarding Wizard Steps
```
src/components/onboarding/wizard/
├── steps/
│   ├── Step1Welcome.tsx
│   ├── Step2Story.tsx
│   ├── Step3Categories.tsx
│   ├── Step4Coverage.tsx
│   └── Step5Review.tsx
├── shared/
│   ├── ModernCategoryCard.tsx
│   ├── NavigationButtons.tsx
│   └── StepProgress.tsx
└── ProfessionalOnboardingWizard.tsx
```

---

## 🟠 PRO DASHBOARD (3-gate)

| Route | Page Component | Key Components |
|-------|----------------|----------------|
| `/dashboard/pro` | `src/pages/Dashboard.tsx` → `ProfessionalDashboard` | `src/components/dashboards/ProfessionalDashboard.tsx` |
| `/dashboard/pro/service-menu` | `src/pages/ProfessionalMenuBoard.tsx` | Menu board pricing |

### Professional Dashboard Components
```
src/components/professional/
├── dashboard/
│   ├── EarningsChart.tsx
│   ├── JobsPipeline.tsx
│   └── MetricCard.tsx
├── features/
│   ├── HeroStatsBar.tsx
│   ├── ProfessionalStatsCards.tsx
│   └── RecentJobsSection.tsx
├── insights/
│   ├── CompetitorBenchmarkPanel.tsx
│   ├── PerformanceMetrics.tsx
│   └── RevenueForecastPanel.tsx
├── screens/
│   ├── EarningsScreen.tsx
│   ├── LeadsScreen.tsx
│   ├── MyJobsScreen.tsx
│   └── TodayScreen.tsx
└── ProfessionalDashboard.tsx
```

---

## 🔴 ADMIN ROUTES (role: admin)

| Route | Page Component | Key Components |
|-------|----------------|----------------|
| `/admin` | `src/pages/admin/AdminDashboard.tsx` | `src/components/admin/workspaces/*` |
| `/admin/users` | AdminDashboard tab | `UsersTable.tsx`, `UserDetails.tsx` |
| `/admin/jobs` | AdminDashboard tab | `JobsTable.tsx` |
| `/admin/questions` | `src/pages/AdminQuestions.tsx` | `QuestionsEditor.tsx` |
| `/admin/health` | AdminDashboard tab | `SystemHealthMonitor.tsx` |
| `/admin/security` | AdminDashboard tab | `SecuritySettings.tsx` |

### Admin Components
```
src/components/admin/
├── analytics/
├── dashboard/
├── layout/
│   ├── AdminLayout.tsx
│   ├── AdminSidebar.tsx
│   └── AdminBreadcrumbs.tsx
├── payments/
├── pricing/
├── questionPacks/
├── services/
├── users/
└── workspaces/
    ├── AdminDashboard.tsx
    ├── VerificationQueue.tsx
    ├── UserInspector.tsx
    └── ...
```

---

## 📦 CONTRACTS (API Layer)

```
contracts/
├── src/
│   ├── auth.zod.ts          → Auth schemas
│   ├── jobs.zod.ts          → Job wizard, job board
│   ├── services.zod.ts      → Service taxonomy
│   ├── offers.zod.ts        → Quote/offer flow
│   ├── escrow.zod.ts        → Payment escrow
│   ├── payments.zod.ts      → Payment processing
│   └── packs.zod.ts         → Question packs
└── openapi.yaml             → Generated API spec

packages/@contracts/
├── clients/
│   ├── auth.ts              → useAuth queries
│   ├── jobs.ts              → useJobs queries
│   ├── services.ts          → useServices queries
│   └── ...
└── types/
    └── index.ts             → Shared TypeScript types
```

---

## 🗄️ EDGE FUNCTIONS

| Function | Purpose | Used By |
|----------|---------|---------|
| `auth-session` | Enrich session with roles/profile | `useAuth` |
| `jobs-list` / `jobs-get` | Job CRUD | Job board, wizard |
| `generate-contextual-questions` | AI questions for wizard | `QuestionsStep.tsx` |
| `notify-job-broadcast` | Notify matching pros | Post job success |
| `smart-match-professionals` | AI matching | `AISmartMatcher.tsx` |
| `stripe-webhook` | Payment webhooks | Stripe integration |
| `fund-escrow` / `release-escrow` | Escrow flow | Contracts |

---

## 🏗️ MODULAR PACKAGES

```
packages/
├── @contracts/          → API hooks + types
├── @core/               → Infrastructure (future)
└── @ref-impl/
    ├── admin/           → Admin module routes
    ├── client/          → Client module routes
    ├── user/            → User module routes
    ├── workers/         → Professional module routes
    └── shared/          → Shared layouts/hooks
```

---

## 🔒 GUARDS & PROTECTION

| Guard | Location | Purpose |
|-------|----------|---------|
| `RouteGuard` | `src/components/RouteGuard.tsx` | Route-level auth check |
| `AdminGuard` | `src/components/admin/workspaces/AdminGuard.tsx` | Admin role gate |
| `OnboardingGate` | `src/components/professional/OnboardingGate.tsx` | Pro onboarding check |
| `PermissionGate` | `src/components/security/PermissionGate.tsx` | Permission-based UI |
| `useAuthGate` | `src/hooks/useAuthGate.ts` | Action-point gating |

---

## 📊 STATE STORES

```
src/stores/
├── authStore.ts         → Auth state (Zustand)
├── uiStore.ts           → UI state (modals, drawers)
├── filterStore.ts       → Search/filter state
├── cartStore.ts         → Booking cart
├── dashboardStore.ts    → Dashboard preferences
└── notificationStore.ts → Notification state
```
