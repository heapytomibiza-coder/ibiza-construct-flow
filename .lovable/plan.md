

# Polish Tweaks for UnifiedAuth.tsx

## Overview

Apply final refinements to ensure consistent styling, clean builds, and patch-safe text.

---

## Changes Summary

| Item | Change | Reason |
|------|--------|--------|
| Skip links | Replace `<button>` with `<Button variant="link">` | Consistent shadcn styling + focus states |
| Unused variable | Remove `signUpMutation` | Prevents build warnings if `noUnusedLocals` enabled |
| Apostrophe escaping | Change `doesn't` → `doesn't` | Patch-safe HTML entity |

---

## Detailed Changes

### 1. Replace Raw Buttons with Button variant="link"

**Sign In skip link (lines 294-302):**
```tsx
// Current:
<div className="text-center pt-2">
  <button
    type="button"
    className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
    onClick={() => navigate(redirectTo)}
  >
    Continue without signing in
  </button>
</div>

// New:
<div className="text-center pt-2">
  <Button
    type="button"
    variant="link"
    className="text-xs text-muted-foreground hover:text-foreground p-0 h-auto"
    onClick={() => navigate(redirectTo)}
  >
    Continue without signing in
  </Button>
</div>
```

**Sign Up skip link (lines 443-452):** Same pattern with "Continue without creating an account" text.

### 2. Remove Unused Variable

**Line 42:**
```tsx
// Remove this line:
const signUpMutation = useSignUp();
```

**Line 11 — Update import:**
```tsx
// Current:
import { useSignIn, useSignUp } from '../../packages/@contracts/clients';

// New:
import { useSignIn } from '../../packages/@contracts/clients';
```

### 3. Escape Apostrophes in Validation Messages

**Lines 278 and 423:**
```tsx
// Current:
That email doesn't look right — try name@domain.com

// New (HTML entity):
That email doesn't look right — try name@domain.com
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/UnifiedAuth.tsx` | All changes above |

---

## Testing Checklist

After implementation:

- [ ] Skip links render with proper focus states (keyboard navigation)
- [ ] No build warnings about unused variables
- [ ] Validation messages display correctly with apostrophe
- [ ] Sign in and sign up flows work correctly

