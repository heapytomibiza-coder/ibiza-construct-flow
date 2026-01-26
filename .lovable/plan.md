

# Plan: Fix Authentication and Email Confirmation Issues

## Problem Analysis

Based on my investigation, there are actually **two separate issues**:

### Issue 1: Existing User Cannot Sign In
- User `heapymagic@googlemail.com` already exists since November 2025
- Account is fully verified but sign-in fails with "Invalid login credentials"
- This means the password being entered doesn't match the original

### Issue 2: Missing User Role
- The user's profile exists but `user_roles` table has no entry
- This could cause authorization issues after successful login

---

## Immediate Fix (Manual)

For the specific user experiencing this issue:

**Option A - Password Reset (Recommended)**
The user should click "Forgot password?" on the sign-in form and receive a reset link.

**Option B - Admin Password Reset (If emails aren't working)**
I can create a temporary admin function to reset the password directly.

---

## Technical Fixes Required

### Phase 1: Fix Role Assignment Gap

**Problem**: Users can have profiles without corresponding `user_roles` entries.

**Solution**: Create a database trigger that ensures roles are created when profiles are created.

```sql
-- Migration: Ensure user roles exist for all profiles
INSERT INTO user_roles (user_id, role)
SELECT id, 
  CASE 
    WHEN active_role = 'professional' THEN 'professional'
    WHEN active_role = 'admin' THEN 'admin'
    ELSE 'client'
  END
FROM profiles
WHERE id NOT IN (SELECT user_id FROM user_roles);

-- Create trigger to auto-assign role on profile creation
CREATE OR REPLACE FUNCTION ensure_user_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, COALESCE(NEW.active_role, 'client'))
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER ensure_user_role_on_profile
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION ensure_user_role();
```

### Phase 2: Improve Auth Error Messaging

**Problem**: "Invalid login credentials" is generic and doesn't help users understand if:
- Their email doesn't exist
- Their password is wrong
- Their account isn't verified

**Solution**: Update `UnifiedAuth.tsx` to provide better error guidance:

```typescript
// In catch block, detect specific error types
if (error.message.includes('Invalid login credentials')) {
  // Check if user exists first
  toast({
    title: 'Sign in failed',
    description: 'Please check your email and password, or try resetting your password.',
    variant: 'destructive'
  });
}
```

### Phase 3: Email Delivery Verification

**Current State**:
- `RESEND_API_KEY` secret is configured
- `send-email` edge function uses Resend
- Auth emails use Supabase's built-in SMTP (separate from Resend)

**Verification Steps**:
1. Supabase Auth emails use their own SMTP - not our Resend setup
2. Need to check if custom SMTP is configured in Supabase Auth settings
3. If using Supabase default SMTP, emails may be rate-limited or landing in spam

---

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/UnifiedAuth.tsx` | Improve error messages, add password reset prominence |
| Database migration | Add role sync trigger and backfill missing roles |
| `supabase/config.toml` | No changes needed |

---

## Immediate Action for This User

Since the user's account already exists and is verified:

1. **Direct them to use "Forgot password?"** - This will send a password reset email
2. **If that email doesn't arrive**, the issue is with Supabase Auth SMTP settings (not our Resend integration)
3. **Fallback**: I can create an admin endpoint to reset the password directly

---

## Technical Details

### Why "confirmation email not landing" is misleading
The logs show the account IS confirmed. The issue is the password, not email verification.

### Supabase Auth Email Flow
- Auth emails (signup confirmation, password reset) use Supabase's internal SMTP
- Our `send-email` edge function with Resend is for application emails (notifications, etc.)
- These are two separate email systems

### Auto-confirm Setting
Currently, new signups require email confirmation. We could enable auto-confirm to bypass this, but that reduces security.

