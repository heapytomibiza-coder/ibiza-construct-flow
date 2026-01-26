

# Refinement Plan: Security Tightening Adjustments

## Summary of Adjustments Needed

Based on the code review, there are 4 specific refinements to make the implementation bulletproof:

## Changes to Implement

### 1. RouteGuard: Use `maybeSingle()` Instead of `single()`

**Current code (line 98-102):**
```typescript
const { data: profileData } = await supabase
  .from('profiles')
  .select('intent_role')
  .eq('id', userId)
  .single();
```

**Issue:** If profile creation fails or is delayed, `.single()` throws an error instead of returning null gracefully.

**Fix:**
```typescript
const { data: profileData } = await supabase
  .from('profiles')
  .select('intent_role')
  .eq('id', userId)
  .maybeSingle();
```

### 2. RouteGuard: Add Verification Status Check

**Current code (line 104):**
```typescript
if (profileData?.intent_role === 'professional') {
```

**Issue:** Only checks intent_role, not whether a pending verification row exists.

**Fix:** Also verify the user has a pending or rejected verification (not approved - if approved they should have the role):
```typescript
if (profileData?.intent_role === 'professional') {
  // Verify they have a pending/rejected verification row (not yet approved)
  const { data: verificationData } = await supabase
    .from('professional_verifications')
    .select('status')
    .eq('professional_id', userId)
    .maybeSingle();
    
  // Only allow access if verification exists and is pending or was rejected
  // (approved users should have the professional role already)
  if (verificationData && ['pending', 'rejected'].includes(verificationData.status)) {
    console.log('🔒 [RouteGuard] User has intent_role=professional with pending/rejected verification, allowing onboarding access');
    if (!isStale) setStatus('authorized');
    return;
  }
}
```

### 3. apply_to_become_professional(): Remove active_role Update

**Current code (lines 22-27):**
```sql
UPDATE public.profiles
SET intent_role = 'professional',
    active_role = 'professional',  -- This should NOT be here
    updated_at = now()
WHERE id = auth.uid();
```

**Issue:** The RPC shouldn't flip `active_role` to professional automatically. This should happen only when user explicitly starts onboarding in the UI.

**Fix:**
```sql
UPDATE public.profiles
SET intent_role = 'professional',
    updated_at = now()
WHERE id = auth.uid();
```

### 4. apply_to_become_professional(): Use Structured Error Code

**Current code (line 14):**
```sql
RAISE EXCEPTION 'Not authenticated';
```

**Fix:** Use a proper error code for better client-side handling:
```sql
RAISE EXCEPTION USING
  ERRCODE = '28000',
  MESSAGE = 'Not authenticated';
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/RouteGuard.tsx` | Use `maybeSingle()`, add verification status check |
| Database migration | Fix `apply_to_become_professional()` RPC |

---

## Technical Details

### RouteGuard.tsx - Lines 97-109

Replace the current bypass block with:

```typescript
// Special case: Allow users with intent_role = 'professional' to access onboarding
// ONLY when allowProfessionalIntent is explicitly set to true (opt-in, not default)
// This prevents unapproved users from accessing job board, dashboard, etc.
if (!hasRequiredRole && requiredRole === 'professional' && allowProfessionalIntent) {
  // Use maybeSingle() to handle missing profile gracefully
  const { data: profileData } = await supabase
    .from('profiles')
    .select('intent_role')
    .eq('id', userId)
    .maybeSingle();
  
  if (profileData?.intent_role === 'professional') {
    // Additional check: verify they have a pending/rejected verification
    // (approved users should already have the professional role)
    const { data: verificationData } = await supabase
      .from('professional_verifications')
      .select('status')
      .eq('professional_id', userId)
      .maybeSingle();
    
    // Only allow if verification exists and is pending or rejected
    if (verificationData && ['pending', 'rejected'].includes(verificationData.status)) {
      console.log('🔒 [RouteGuard] User has pending/rejected verification, allowing onboarding access');
      if (!isStale) setStatus('authorized');
      return;
    }
  }
}
```

### Database Migration - apply_to_become_professional()

```sql
CREATE OR REPLACE FUNCTION public.apply_to_become_professional()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  _uid uuid;
BEGIN
  _uid := auth.uid();
  
  -- Fail-fast with structured error if not authenticated
  IF _uid IS NULL THEN
    RAISE EXCEPTION USING
      ERRCODE = '28000',
      MESSAGE = 'Not authenticated';
  END IF;
  
  -- Create pending verification entry
  INSERT INTO public.professional_verifications (professional_id, status)
  VALUES (_uid, 'pending')
  ON CONFLICT (professional_id) DO NOTHING;
  
  -- Update profile intent ONLY (do NOT change active_role here)
  -- active_role switch happens explicitly when user starts onboarding in UI
  UPDATE public.profiles
  SET intent_role = 'professional',
      updated_at = now()
  WHERE id = _uid;
  
  RETURN true;
END;
$$;
```

---

## What These Fixes Prevent

| Edge Case | Current Behavior | After Fix |
|-----------|------------------|-----------|
| Profile creation fails | `.single()` throws error, auth flow crashes | `maybeSingle()` returns null, access denied gracefully |
| Legacy user with intent but no verification | Could bypass RouteGuard | Verification row required |
| Approved user still using intent bypass | Could trigger (redundant) | Not triggered - they have the role |
| Anonymous RPC call | Generic error message | Structured error code for client handling |
| Calling RPC auto-switches to pro mode | Unexpected UX (pro dashboard they can't use) | Stay in client mode until explicit switch |

---

## Testing After Implementation

1. **Profile missing edge case**: Temporarily delete profile row, confirm RouteGuard doesn't crash
2. **Verification missing edge case**: User with intent_role='professional' but no verification row - should be blocked
3. **RPC doesn't flip active_role**: Call apply_to_become_professional(), confirm active_role stays 'client'
4. **Anonymous RPC error**: Call RPC without auth, confirm error code 28000

