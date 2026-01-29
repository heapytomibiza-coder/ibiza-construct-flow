

# Fix: Realtime Role Listener Bug in roles.ts

## Problem Identified

There's a bug in `src/lib/roles.ts` that will break the role switcher in multi-tab scenarios:

```text
Current (buggy):
┌─────────────────────────────┐
│ profiles table UPDATE event │
│   payload.new.active_role ✓ │
│   payload.new.roles ✗       │ ← This column doesn't exist!
└─────────────────────────────┘
           ↓
┌─────────────────────────────┐
│ emit(newRole, [])           │ ← Roles get wiped to empty array
│ → HeaderRoleSwitcher breaks │
└─────────────────────────────┘
```

**Impact:** When any profile field is updated (e.g., display name, active_role), the realtime listener emits an empty `roles` array, causing:
- Role switcher to disappear (since `roles.length < 2`)
- UI to fall back to showing a single-role badge
- User has to refresh to restore correct state

---

## Root Cause

In `initRoleRealtime()` (lines 128-131):

```typescript
// BUG: profiles table doesn't have a 'roles' column
const newRole = payload.new?.active_role ?? null;
const newRoles = payload.new?.roles ?? [];  // ← Always returns []
emit(newRole, newRoles);
```

The `profiles` table schema:
- `active_role` ✓ (exists)
- `roles` ✗ (does NOT exist — roles are in `user_roles` table)

---

## Solution

When a profile update event fires, preserve the cached roles (which were correctly fetched from `user_roles` on initial load) instead of overwriting with an empty array:

```typescript
(payload: any) => {
  const newRole = payload.new?.active_role ?? null;
  // Keep existing cached roles — they come from user_roles table, not profiles
  emit(newRole, cachedRoles);
}
```

This is safe because:
1. Roles are added/removed via admin actions (`approve_professional`), not profile updates
2. The `user_roles` table is the authoritative source
3. Initial load already fetches roles correctly from `user_roles`
4. If roles actually change, user would need to refresh session anyway for security

---

## File to Modify

| File | Change |
|------|--------|
| `src/lib/roles.ts` | Fix line 130 to use `cachedRoles` instead of `payload.new?.roles` |

---

## Code Change

**Before (line 128-132):**
```typescript
(payload: any) => {
  const newRole = payload.new?.active_role ?? null;
  const newRoles = payload.new?.roles ?? [];
  emit(newRole, newRoles);
}
```

**After:**
```typescript
(payload: any) => {
  const newRole = payload.new?.active_role ?? null;
  // Roles come from user_roles table, not profiles - preserve cached value
  emit(newRole, cachedRoles);
}
```

---

## Architecture Verification Summary

After reviewing the full data flow, here's the verification:

| Component | Source of Truth | Status |
|-----------|-----------------|--------|
| `auth-session` edge function | Reads from `user_roles` table | ✓ Correct |
| `useRole()` hook | Uses `useCurrentSession()` → edge function | ✓ Correct |
| `HeaderRoleSwitcher` | Uses `useRole()` for roles array | ✓ Correct |
| `switchActiveRole()` | Validates against `user_roles`, writes to `profiles.active_role` | ✓ Correct |
| `getActiveRole()` | Fetches from both `profiles` and `user_roles` | ✓ Correct |
| `initRoleRealtime()` | Reads from `profiles` UPDATE event | ⚠️ Bug (roles field doesn't exist) |

---

## Testing Checklist

After fix:

- [ ] Open app in two browser tabs
- [ ] In Tab 1: Switch from Professional to Client mode
- [ ] Verify Tab 2: Role switcher still shows both options (not just a badge)
- [ ] Update any profile field (e.g., display name)
- [ ] Verify role switcher remains visible with all roles

