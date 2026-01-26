

# Revised Plan: Secure Authentication & Role Assignment Fixes

## Summary of Issues Found

### Confirmed Facts
1. **User `heapymagic@googlemail.com`** signed up via **email/password** (not OAuth)
2. **Account is verified** (email_confirmed_at: 2025-11-20)
3. **The backfill worked** - user now has `professional` role assigned
4. **Sign-in failures** are due to password mismatch (not email confirmation)
5. **User roles table** has composite unique constraint `(user_id, role)`

### Security Risks in Current Implementation
1. **Trigger trusts `profiles.active_role`** - privilege escalation vector if users can edit this field
2. **Trigger is on `profiles`** - unreliable if profile creation fails or is async

---

## Phase 1: Harden the Role Assignment Trigger

### Current (Risky)
```sql
-- Trusts active_role from profile - SECURITY RISK
INSERT INTO user_roles (user_id, role)
VALUES (NEW.id, CASE WHEN NEW.active_role = 'admin' THEN 'admin'::app_role ...)
```

### Proposed Fix
Always assign `client` role by default. Role promotions happen through admin-only functions.

```sql
CREATE OR REPLACE FUNCTION public.ensure_user_role_on_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Always default to 'client' - never trust user-provided data for roles
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'client'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;
```

### Future Enhancement (Optional)
- Move trigger to `auth.users` creation for reliability
- Create admin-only RPC for role promotions

---

## Phase 2: Improve Error Messaging (Security-Conscious)

### Current Issue
The error message reveals too much about the password reset flow.

### Proposed Fix
Generic message that covers both wrong password AND potential OAuth confusion:

```typescript
if (error.message?.includes('Invalid login credentials')) {
  toast({
    title: 'Sign in failed',
    description: 'Email or password incorrect. If you normally sign in with Google, use "Continue with Google". Otherwise, try resetting your password.',
    variant: 'destructive'
  });
}
```

This:
- Doesn't leak account existence
- Covers OAuth users who forgot they used Google
- Guides toward password reset without confirming the email exists

---

## Phase 3: Immediate User Resolution

For `heapymagic@googlemail.com`:

1. **Role is now fixed** - backfill assigned `professional` role today
2. **Password issue remains** - user needs to:
   - Use "Forgot password" to receive a reset link
   - If email doesn't arrive, check spam folder
   - If still no email, investigate SMTP/deliverability

**No OAuth needed** - confirmed email-only signup.

---

## Phase 4: Add Roles Integrity Monitoring (Admin Tool)

Add a query to the admin toolkit to detect orphaned profiles:

```sql
-- Find profiles without any role assignment
SELECT p.id, p.full_name, p.created_at
FROM profiles p
LEFT JOIN user_roles ur ON ur.user_id = p.id
WHERE ur.user_id IS NULL;
```

---

## Files to Modify

| File | Change |
|------|--------|
| Database migration | Replace trigger to always default to 'client' |
| `src/pages/UnifiedAuth.tsx` | Update error message to be more generic/helpful |

---

## Technical Notes

### Why the original trigger was risky
The `profiles.active_role` field could be:
- Set by the user during signup (via `intent_role` in metadata)
- Modified client-side after creation
- Used for UI display only

Trusting it for role assignment allows privilege escalation. A malicious user could:
1. Sign up with `intent_role: admin`
2. Profile trigger reads `active_role` = 'admin'
3. User gets admin role automatically

### Safer architecture pattern
```
┌──────────────┐    ┌───────────────┐    ┌────────────────┐
│  Sign Up     │───▶│ Create Profile │───▶│ Assign 'client' │
│  (any role)  │    │ (stores intent)│    │ Role by Default │
└──────────────┘    └───────────────┘    └────────────────┘
                                                 │
                                                 ▼
┌──────────────┐    ┌───────────────┐    ┌────────────────┐
│  Admin       │───▶│ Promote to    │───▶│ Add Role       │
│  Dashboard   │    │ Professional  │    │ via Admin RPC  │
└──────────────┘    └───────────────┘    └────────────────┘
```

