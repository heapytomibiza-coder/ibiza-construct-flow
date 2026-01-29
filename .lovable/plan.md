

# Enable Multi-Role for Professionals (One Account, Two Roles)

## Current Architecture Analysis

Your codebase already has robust multi-role support:

| Component | Status | Location |
|-----------|--------|----------|
| `user_roles` table | Implemented | Database |
| `handle_new_user` trigger | Implemented | Always assigns `client` role |
| `approve_professional` RPC | Implemented | Grants `professional` role |
| `HeaderRoleSwitcher` dropdown | Implemented | Shows when user has 2+ roles |
| `switchActiveRole()` function | Implemented | Updates `active_role` in profiles |

**The gap:** When an admin approves a professional, the `approve_professional` function only grants the `professional` role. If the user somehow lost their `client` role, they can't switch back.

---

## Solution

Update the `approve_professional` function to ensure both roles exist:

```text
Current Flow:
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  User signs up  │ ──► │ Gets 'client'    │ ──► │ Admin approves  │
│  as professional│     │ role + pending   │     │ → gets 'pro'    │
└─────────────────┘     │ verification     │     └─────────────────┘
                        └──────────────────┘

Updated Flow:
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────────┐
│  User signs up  │ ──► │ Gets 'client'    │ ──► │ Admin approves          │
│  as professional│     │ role + pending   │     │ → ensures 'client' +    │
└─────────────────┘     │ verification     │     │   grants 'professional' │
                        └──────────────────┘     └─────────────────────────┘
```

---

## Database Changes

### 1. Update `approve_professional` Function

Add one line to ensure the `client` role exists:

```sql
-- Inside approve_professional, after granting professional role:

-- Grant professional role
INSERT INTO public.user_roles (user_id, role)
VALUES (_professional_id, 'professional'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;

-- NEW: Ensure client role also exists (for role switching)
INSERT INTO public.user_roles (user_id, role)
VALUES (_professional_id, 'client'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;
```

This is a defensive measure — the user should already have `client` from signup, but this guarantees it.

---

## No Frontend Changes Required

The UI already works correctly:

| Component | Behavior |
|-----------|----------|
| `HeaderRoleSwitcher` | Shows segmented control when `roles.length >= 2` |
| `switchActiveRole()` | Validates user has the role before switching |
| `getDashboardRoute()` | Returns correct dashboard for each role |
| `getInitialDashboardRoute()` | Routes based on `active_role` and profile state |

Once the database has both roles, the switcher will automatically appear.

---

## Files to Modify

| File | Change |
|------|--------|
| Database migration | Add line to ensure `client` role in `approve_professional` |

---

## Testing Checklist

After applying the change:

- [ ] Sign up as professional (should get `client` role + pending verification)
- [ ] Admin approves → user now has both `client` and `professional` roles
- [ ] HeaderRoleSwitcher shows segmented control with both options
- [ ] Switching to Client mode → navigates to `/dashboard/client`
- [ ] Switching to Professional mode → navigates to `/dashboard/pro`
- [ ] Existing approved professionals can run a backfill to get `client` role

---

## Optional: Backfill Existing Professionals

If you have professionals who were approved before this change and are missing the `client` role:

```sql
-- Backfill: ensure all professionals also have client role
INSERT INTO public.user_roles (user_id, role)
SELECT ur.user_id, 'client'::app_role
FROM public.user_roles ur
WHERE ur.role = 'professional'
ON CONFLICT (user_id, role) DO NOTHING;
```

