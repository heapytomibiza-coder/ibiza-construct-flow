# Routing & Navigation Guide

This document describes the complete routing architecture for the application.

## Core Principles

1. **Single Source of Truth**: All dashboard routing logic is centralized in `getInitialDashboardRoute()` in `src/lib/roles.ts`
2. **Database-Driven**: User roles and active role are stored in the database, never in localStorage
3. **Onboarding Enforcement**: Professional users must complete onboarding before accessing the professional dashboard
4. **Consistent Auth Flow**: All authentication flows go through `/auth` with URL parameters

---

## Authentication Flow

### Entry Points

- **`/auth`** - Main authentication page
  - Query params:
    - `?mode=signin` - Sign in form
    - `?mode=signup` - Sign up form
    - `?role=client` - Pre-select client role on signup
    - `?role=professional` - Pre-select professional role on signup

### Authentication Process

```
1. User signs up/in at /auth
2. → /auth/callback (OAuth return, session established)
3. → Profile check:
   - No display_name? → /auth/quick-start
   - Has display_name? → getInitialDashboardRoute() determines destination
4. → Dashboard (based on role and onboarding status)
```

### Key Components

- **`UnifiedAuth.tsx`** - Main auth page with sign in/sign up tabs
- **`AuthCallback.tsx`** - Handles OAuth returns and session establishment
- **`QuickStart.tsx`** - Lightweight identity gate for collecting display name

---

## Dashboard Routing Logic

### `getInitialDashboardRoute()` Decision Tree

Located in `src/lib/roles.ts`, this function is the **single source of truth** for initial routing.

```typescript
async function getInitialDashboardRoute(userId: string): 
  Promise<{ path: string; reason: InitialRouteReason }>
```

**Decision Flow:**

1. **Check Profile Completeness**
   - No `display_name`? → `/auth/quick-start` (reason: `no_display_name`)

2. **Check Admin Role**
   - Has 'admin' role AND `active_role === 'admin'`? → `/dashboard/admin` (reason: `admin_dashboard`)

3. **Check Professional Role**
   - Has 'professional' role OR `active_role === 'professional'`?
     - Check `professional_profiles.onboarding_status`
     - Status !== 'complete'? → `/onboarding/professional` (reason: `pro_needs_onboarding`)
     - Status === 'complete'? → `/dashboard/pro` (reason: `pro_dashboard`)

4. **Default to Client**
   - → `/dashboard/client` (reason: `client_dashboard`)

### Where It's Used

- **`Dashboard.tsx`** - Generic `/dashboard` route redirects using this logic
- **`AuthCallback.tsx`** - After successful authentication
- **`RouteGuard.tsx`** - For onboarding enforcement redirects

---

## Protected Routes

### Route Guards

All protected routes use the `<RouteGuard>` component:

```tsx
<RouteGuard 
  requiredRole="professional"       // Optional: 'client' | 'professional' | 'admin'
  requireOnboardingComplete={true}  // Optional: Professional onboarding check
  fallbackPath="/auth"              // Optional: Where to redirect if unauthorized
>
  <YourComponent />
</RouteGuard>
```

### Professional Onboarding Enforcement

The professional dashboard route **requires onboarding completion**:

```tsx
<Route path="/dashboard/pro" element={
  <RouteGuard requiredRole="professional" requireOnboardingComplete>
    <UnifiedProfessionalDashboard />
  </RouteGuard>
} />
```

**Flow:**
1. User accesses `/dashboard/pro`
2. RouteGuard checks:
   - Is user authenticated?
   - Does user have 'professional' role?
   - Is `professional_profiles.onboarding_status === 'complete'`?
3. If onboarding incomplete → Redirect to `/onboarding/professional`
4. If complete → Render dashboard

---

## Role Management

### Database Structure

```sql
-- User roles table (many-to-many with users)
user_roles:
  - user_id: uuid
  - role: app_role ('client' | 'professional' | 'admin')

-- Profile table
profiles:
  - id: uuid
  - display_name: text
  - active_role: app_role (current active role)
  - tasker_onboarding_status: text ('not_started' | 'in_progress' | 'complete')

-- Professional profiles
professional_profiles:
  - user_id: uuid
  - onboarding_status: text ('not_started' | 'in_progress' | 'complete')
```

### Role Switching

Users with multiple roles can switch between them:

1. **`/role-switcher`** - UI for selecting active role
2. Updates `profiles.active_role` in database
3. Next navigation respects new active role via `getInitialDashboardRoute()`

**Important:** Role selection is **NOT stored in localStorage** - always read from database.

---

## Common User Journeys

### New Client User

```
1. → /auth?mode=signup&role=client
2. → Create account
3. → /auth/callback
4. → Profile check: no display_name
5. → /auth/quick-start (enter name)
6. → /dashboard/client
```

### New Professional User

```
1. → /auth?mode=signup&role=professional
2. → Create account
3. → /auth/callback
4. → Profile check: no display_name
5. → /auth/quick-start (enter name)
6. → Onboarding check: not complete
7. → /onboarding/professional (complete onboarding)
8. → /dashboard/pro
```

### Existing User Sign In

```
1. → /auth?mode=signin
2. → Enter credentials
3. → /auth/callback
4. → getInitialDashboardRoute() determines destination
5. → Appropriate dashboard (client/pro/admin)
```

### Multi-Role User

```
1. → /auth?mode=signin
2. → /auth/callback
3. → getInitialDashboardRoute() uses active_role from profile
4. → Dashboard for active role
5. User clicks role switcher → /role-switcher
6. Select different role → Updates profiles.active_role
7. → Navigate to new dashboard
```

---

## Navigation Utilities

Located in `src/lib/navigation.ts`:

```typescript
// Auth routes
getAuthRoute(mode?: 'signin' | 'signup', role?: 'client' | 'professional'): string

// Settings routes
getSettingsRoute(section: 'profile' | 'account' | 'notifications' | 'client' | 'professional'): string

// Dashboard routes
getDashboardForRole(role: Role): string

// Professional management
getProfessionalRoute(page: 'verification' | 'services' | 'portfolio' | 'onboarding'): string

// Admin routes
getAdminRoute(section: 'questions' | 'website-settings' | 'verifications'): string
```

**Usage:**
```typescript
import { getAuthRoute, getDashboardForRole } from '@/lib/navigation';

// Navigate to sign up for professionals
navigate(getAuthRoute('signup', 'professional'));

// Navigate to professional dashboard
navigate(getDashboardForRole('professional'));
```

---

## Admin Routes

### Admin Dashboard Workspaces

The admin dashboard at `/dashboard/admin` has multiple workspaces accessible via sidebar:

- **Command Centre** - Live jobs and operations
- **Professional Analytics** - Performance & earnings
- **AI System Monitor** - AI functions & performance
- **Risk Management** - Risk flags & compliance
- **Market Intelligence** - Market analysis
- **Professional Hub** - Professional management
- **Verifications** - Professional verification requests (links to `/admin/verifications`)
- **Service Catalogue** - Service taxonomy management
- **Content Moderation** - Review flagged content
- **User Analytics** - User cohorts & activity
- **Analytics Dashboard** - Advanced analytics & BI
- **Business Intelligence** - AI-powered insights
- **Report Generator** - Automated reporting
- **Alert System** - Business alerts
- **AI Automation** - Smart matching & automation
- **Payment Management** - Transaction & dispute management

### Standalone Admin Pages

- **`/admin/questions`** - Manage Q&A content
- **`/admin/website-settings`** - Website configuration
- **`/admin/verifications`** - Professional verification review

All admin routes are protected with `<RouteGuard requiredRole="admin">`.

---

## Settings Routes

All settings routes are under `/settings/*` and require authentication:

- **`/settings/profile`** - User profile settings
- **`/settings/account`** - Account management
- **`/settings/notifications`** - Notification preferences
- **`/settings/client`** - Client-specific settings (requires 'client' role)
- **`/settings/professional`** - Professional-specific settings (requires 'professional' role)

---

## Error Handling

### Unauthorized Access

If a user tries to access a protected route without proper authorization:

1. **RouteGuard** captures the attempt
2. Stores intended destination in `?redirect=` query param
3. Redirects to `/auth?redirect=/intended/path`
4. After successful auth, user is redirected to original destination

### Onboarding Incomplete

If a professional tries to access `/dashboard/pro` without completing onboarding:

1. **RouteGuard** with `requireOnboardingComplete` catches it
2. Redirects directly to `/onboarding/professional`
3. No redirect param needed (onboarding is required before dashboard access)

---

## Testing Checklist

- [ ] **New client signup** → QuickStart → client dashboard
- [ ] **New professional signup** → QuickStart → onboarding → pro dashboard
- [ ] **Existing user sign in** → Correct dashboard based on active_role
- [ ] **Multi-role user** → Can switch roles via /role-switcher
- [ ] **Professional without onboarding** → Cannot access /dashboard/pro
- [ ] **Admin user** → Accesses /dashboard/admin when active_role is 'admin'
- [ ] **Unauthorized access** → Redirects to /auth with redirect param
- [ ] **Generic /dashboard** → Redirects to appropriate dashboard
- [ ] **Logout** → Clears session, redirects to /auth

---

## Migration Notes

### What Changed

1. **Removed localStorage role storage** - RoleSwitcher no longer stores selected role
2. **Removed DISABLE_AUTH_FOR_WIREFRAME flag** - All routes now properly guarded
3. **Centralized routing logic** - All dashboard routing goes through `getInitialDashboardRoute()`
4. **Simplified auth routes** - Single `/auth` entry point with query params
5. **Enforced professional onboarding** - RouteGuard checks onboarding completion

### What Stayed

- **QuickStart page** - Still used as lightweight identity gate
- **Role switching** - Multi-role users can still switch via /role-switcher
- **Auth callback flow** - OAuth returns still handled via /auth/callback

---

## Future Improvements

- [ ] Add loading states during role checks
- [ ] Add analytics tracking for routing decisions
- [ ] Add breadcrumb navigation for complex flows
- [ ] Add deep linking support for specific dashboard sections
- [ ] Add route preloading for faster navigation
