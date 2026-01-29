# Flow Contract — Technical Standards

> **Version:** 1.0  
> **Last Updated:** 2025-01-29

This document defines the technical standards for routing, state management, and auth flows.

---

## 1. Redirect Parameter Standard

### Canonical Parameter

| Use Case | Parameter | Example |
|----------|-----------|---------|
| Post-auth redirect | `redirect` | `/auth?redirect=%2Fdashboard%2Fpro` |

### Deprecated Parameters

| Parameter | Status | Migration |
|-----------|--------|-----------|
| `returnTo` | **Deprecated** | Replace with `redirect` |
| `next` | **Deprecated** | Replace with `redirect` |

---

## 2. Auth Callback Flow

All authentication email redirects (verification, recovery) **MUST** route through `/auth/callback`.

```
User clicks email link
    ↓
/auth/callback (initializes session)
    ↓
Read `redirect` param or determine default
    ↓
Navigate to destination
```

### Callback Priority Order

1. `redirect` query param (if valid)
2. Role-based default (from `getInitialDashboardRoute`)
3. Fallback: `/dashboard`

---

## 3. Onboarding Phase Contract

### Table: `professional_profiles`

| Column | Type | Values |
|--------|------|--------|
| `onboarding_phase` | text | See below |
| `verification_status` | text | See below |

### Phase Values

```typescript
export const ONBOARDING_PHASES = {
  NOT_STARTED: 'not_started',
  INTRO_SUBMITTED: 'intro_submitted',
  VERIFICATION_PENDING: 'verification_pending',
  SERVICE_CONFIGURED: 'service_configured',
  COMPLETE: 'complete',
} as const;

export type OnboardingPhase = typeof ONBOARDING_PHASES[keyof typeof ONBOARDING_PHASES];
```

### Verification Status Values

```typescript
export const VERIFICATION_STATUSES = {
  UNVERIFIED: 'unverified',
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
} as const;

export type VerificationStatus = typeof VERIFICATION_STATUSES[keyof typeof VERIFICATION_STATUSES];
```

### Phase Transitions

```
not_started
    ↓ (complete wizard)
intro_submitted
    ↓ (upload docs)
verification_pending
    ↓ (admin approves)
    ↓ (configure services)
complete ← verification_status = 'verified'
```

---

## 4. Role System Contract

### Table: `user_roles`

| Column | Type | Constraint |
|--------|------|------------|
| `user_id` | uuid | FK → auth.users |
| `role` | app_role | 'client', 'professional', 'admin' |

### Table: `profiles`

| Column | Type | Purpose |
|--------|------|---------|
| `active_role` | text | Current UI context |
| `intent_role` | text | Signup intention |
| `onboarding_completed` | boolean | Quick-start gate |

### Role Assignment Rules

1. All users get `client` role on signup (trigger)
2. `professional` role requires admin approval
3. `admin` role granted manually
4. Professionals always retain `client` role (dual-role)

---

## 5. Navigation Standards

### Internal Navigation

**MUST USE:**
- `<Link>` from react-router-dom
- `navigate()` from useNavigate

**FORBIDDEN:**
- `<a href="#">` (placeholder anchors)
- `window.location.href` (breaks SPA)
- `window.location.replace` (loses state)

### External Links

Use `<a href="..." target="_blank" rel="noopener noreferrer">`

---

## 6. Error Handling Standards

### No Silent Failures

Every async operation must either:
1. Show success toast/feedback
2. Show error toast with actionable message
3. Log error with context for debugging

### Session Expiry

```typescript
// Standard handling
if (sessionError?.message?.includes('session')) {
  navigate('/auth?redirect=' + encodeURIComponent(location.pathname));
}
```

---

## 7. Wizard State Contract

### URL Sync

Wizard step must sync with URL: `?step=N`

### Draft Persistence

- Store drafts in localStorage with key: `{wizard_name}_draft`
- Clear draft on successful completion
- Hydrate from DB on page load (DB wins on conflict)

### Micro-Service Entry

When entering from service pages:
- **MUST** include `microServiceId` param
- Validates micro-service exists before proceeding

---

## 8. Guard Implementation Rules

### RouteGuard Props

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `requiredRole` | string | - | Role check |
| `allowProfessionalIntent` | boolean | `false` | Allow pre-approval access |
| `requireOnboardingComplete` | boolean | `false` | Force onboarding gate |
| `enforce2FA` | boolean | `true` | Admin 2FA requirement |

### Intent-Based Access

Only enable `allowProfessionalIntent` for:
- `/onboarding/professional`
- `/professional/verification`

**Never** enable for:
- `/dashboard/pro`
- `/jobs/*`
- `/contracts/*`

---

## 9. Database Read Patterns

### Onboarding Status Check

```typescript
// CORRECT: Use professional_profiles
const { data } = await supabase
  .from('professional_profiles')
  .select('onboarding_phase, verification_status')
  .eq('user_id', userId)
  .maybeSingle();

// DEPRECATED: profiles.tasker_onboarding_status
// Do not use for professional onboarding checks
```

### Role Check

```typescript
// CORRECT: Use user_roles table
const { data } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', userId);

// WRONG: Never check roles on profiles table
```

---

## 10. Changelog

| Date | Change | Author |
|------|--------|--------|
| 2025-01-29 | Initial version | Launch Rail System |
