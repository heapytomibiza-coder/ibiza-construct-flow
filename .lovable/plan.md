

# Security Tightening: RouteGuard Scope and RPC Hardening

## Summary of Issues Found

Based on investigation, there are **critical security gaps** that need immediate attention:

### A) RouteGuard Intent Bypass is Too Broad

**Current State:**
The intent bypass logic at `RouteGuard.tsx:87-101` allows access when:
- `requiredRole === 'professional'`
- `requireOnboardingComplete === false` (this is the DEFAULT value!)
- User has `intent_role === 'professional'`

**Problem:**
Since `requireOnboardingComplete` defaults to `false`, the intent bypass applies to ALL these routes:
- `/job-board` - users can view full job details
- `/dashboard/pro` - full professional dashboard
- `/professional/services` - service management
- `/professional/payout-setup` - payout configuration
- `/professional/portfolio` - portfolio management
- `/settings/professional` - professional settings

This means **anyone who signs up with intent_role='professional' gets access to the entire professional area** before approval.

### B) apply_to_become_professional() Missing Auth Guard

The RPC uses `auth.uid()` directly but doesn't fail-fast if called anonymously. While `auth.uid()` returns NULL for anonymous users, the INSERT will fail silently with a constraint error rather than a clear "Not authenticated" message.

### C) reject_professional() Using reviewer_notes for User-Facing Reason

Currently `_reason` is stored in `reviewer_notes`, which should be internal. The table has no dedicated `rejection_reason` column for user-facing messages.

### D) RLS Policies for professional_verifications Look Good

Existing policies are correctly configured:
- Professionals can INSERT their own verification (professional_id = auth.uid())
- Professionals can SELECT their own verification
- Admins can SELECT/UPDATE all verifications

---

## Implementation Plan

### Phase 1: Fix RouteGuard Scope (CRITICAL)

**Approach:** Add a new prop `allowProfessionalIntent` that is explicitly opt-in, rather than relying on `!requireOnboardingComplete`.

**Changes to RouteGuard.tsx:**
1. Add new prop: `allowProfessionalIntent?: boolean` (default: false)
2. Change the bypass logic to check this prop instead of `!requireOnboardingComplete`
3. Only the onboarding route will pass `allowProfessionalIntent={true}`

**Routes that should allow intent bypass (safe):**
- `/onboarding/professional` - filling profile, uploading docs
- `/professional/verification` - viewing verification status

**Routes that MUST NOT allow intent bypass:**
- `/job-board` - full job details and apply functionality
- `/dashboard/pro` - professional dashboard
- `/professional/payout-setup` - financial setup
- `/professional/services`, `/services/new` - service management
- `/professional/portfolio` - portfolio management

### Phase 2: Add Auth Guard to apply_to_become_professional()

Add a fail-fast check at the start of the RPC:
```sql
IF auth.uid() IS NULL THEN
  RAISE EXCEPTION 'Not authenticated';
END IF;
```

### Phase 3: Add rejection_reason Column

Add a dedicated column for user-facing rejection reasons, keeping `reviewer_notes` for internal admin notes.

### Phase 4: Fix active_role Default in handle_new_user()

Currently the trigger sets `active_role = _intent_role` which can cause confusion. Users with `intent_role='professional'` see a pro dashboard they can't fully use.

**Fix:** Always set `active_role = 'client'` initially. Update to `'professional'` only after they explicitly start onboarding or get approved.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/RouteGuard.tsx` | Add `allowProfessionalIntent` prop, update bypass logic |
| `src/App.tsx` | Update route declarations to use new prop correctly |
| Database migration | Add auth guard to RPC, add rejection_reason column, fix active_role default |

---

## Technical Details

### RouteGuard.tsx Changes

```typescript
interface RouteGuardProps {
  children: React.ReactNode;
  requiredRole?: 'client' | 'professional' | 'admin';
  fallbackPath?: string;
  skipAuthInDev?: boolean;
  requireOnboardingComplete?: boolean;
  enforce2FA?: boolean;
  allowProfessionalIntent?: boolean; // NEW: Explicitly allow intent-based access
}

// ...

// Special case: Allow users with intent_role = 'professional' to access onboarding
// ONLY when allowProfessionalIntent is explicitly true
if (!hasRequiredRole && requiredRole === 'professional' && allowProfessionalIntent) {
  const { data: profileData } = await supabase
    .from('profiles')
    .select('intent_role')
    .eq('id', userId)
    .single();
  
  if (profileData?.intent_role === 'professional') {
    console.log('🔒 [RouteGuard] User has intent_role=professional, allowing onboarding access');
    if (!isStale) setStatus('authorized');
    return;
  }
}
```

### App.tsx Route Updates

```typescript
// Onboarding - ALLOW intent bypass
<Route path="/onboarding/professional" element={
  <RouteGuard requiredRole="professional" allowProfessionalIntent={true}>
    <ProfessionalOnboardingPage />
  </RouteGuard>
} />

// Verification status - ALLOW intent bypass
<Route path="/professional/verification" element={
  <RouteGuard requiredRole="professional" allowProfessionalIntent={true}>
    <ProfessionalVerificationPage />
  </RouteGuard>
} />

// Job board - NO intent bypass (requires actual role)
<Route path="/job-board" element={
  <RouteGuard requiredRole="professional">
    <JobBoardPage />
  </RouteGuard>
} />

// Dashboard - NO intent bypass
<Route path="/dashboard/pro" element={
  <RouteGuard requiredRole="professional">
    <UnifiedProfessionalDashboard />
  </RouteGuard>
} />
```

### Database Migration

```sql
-- 1. Add auth guard to apply_to_become_professional()
CREATE OR REPLACE FUNCTION public.apply_to_become_professional()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Fail-fast if not authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  INSERT INTO public.professional_verifications (professional_id, status)
  VALUES (auth.uid(), 'pending')
  ON CONFLICT (professional_id) DO NOTHING;
  
  UPDATE public.profiles
  SET intent_role = 'professional',
      active_role = 'professional',
      updated_at = now()
  WHERE id = auth.uid();
  
  RETURN true;
END;
$$;

-- 2. Add rejection_reason column for user-facing messages
ALTER TABLE public.professional_verifications 
ADD COLUMN IF NOT EXISTS rejection_reason text;

COMMENT ON COLUMN public.professional_verifications.rejection_reason IS 'User-facing reason for rejection';
COMMENT ON COLUMN public.professional_verifications.reviewer_notes IS 'Internal admin notes (not shown to user)';

-- 3. Fix handle_new_user to default active_role to client
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  _intent_role text;
BEGIN
  _intent_role := COALESCE(NEW.raw_user_meta_data->>'intent_role', 'client');
  
  INSERT INTO public.profiles (id, full_name, active_role, intent_role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'client',      -- Always start as client
    _intent_role   -- Store intent separately
  )
  ON CONFLICT (id) DO UPDATE SET
    intent_role = EXCLUDED.intent_role;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  IF _intent_role = 'professional' THEN
    INSERT INTO public.professional_verifications (professional_id, status)
    VALUES (NEW.id, 'pending')
    ON CONFLICT (professional_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;
```

---

## What This Fixes

| Issue | Fix |
|-------|-----|
| Intent bypass too broad | New `allowProfessionalIntent` prop is opt-in, not default |
| Job board accessible pre-approval | Only routes with explicit prop get bypass |
| RPC can be called anonymously | Auth.uid() check with clear error message |
| Rejection reason mixed with admin notes | Separate `rejection_reason` column |
| active_role confusion | Always start as 'client', update explicitly |

---

## Testing Checklist

After implementation, verify:

1. **New pro-intent signup**
   - Has `client` role only
   - Has `intent_role = 'professional'`
   - Has `active_role = 'client'`
   - Can access `/onboarding/professional`
   - BLOCKED from `/job-board`, `/dashboard/pro`

2. **Existing client applies via RPC**
   - Creates pending verification
   - Updates intent_role
   - Still blocked from pro-only routes

3. **Admin approval**
   - Grants `professional` role
   - User can now access all pro routes
   - Verification status shows approved

4. **Anonymous RPC call**
   - Returns clear "Not authenticated" error

