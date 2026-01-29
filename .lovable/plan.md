# P0 Launch Patch — Completed

## Issues Fixed

### ✅ 1. Unified Onboarding Truth (Single Field)
**Files Modified:** `src/lib/roles.ts`

**Before:** `getInitialDashboardRoute()` checked `profiles.tasker_onboarding_status`, while `OnboardingGate` checked `professional_profiles.onboarding_phase` — two conflicting sources.

**After:** Both now use `professional_profiles.onboarding_phase` and `professional_profiles.verification_status` as the single source of truth.

**Acceptance Criteria:**
- [ ] Professional with no `professional_profiles` row → redirects to `/onboarding/professional`
- [ ] Professional with `onboarding_phase=intro_submitted` → redirects to `/onboarding/professional`
- [ ] Professional with `verification_status=verified` → goes to `/dashboard/pro`

---

### ✅ 2. DB Hydration in Pro Onboarding Wizard
**Files Modified:** 
- `src/components/onboarding/wizard/ProfessionalOnboardingWizard.tsx`
- `src/hooks/useWizardAutosave.ts`

**Before:** Only localStorage draft was restored. Returning professionals with existing DB data started fresh.

**After:** Hydration order:
1. Check `professional_profiles` for existing data + timestamp
2. Check localStorage draft + timestamp
3. Use whichever is newer
4. If neither, start fresh

**Acceptance Criteria:**
- [ ] Pro with existing DB data but no localStorage → loads from DB
- [ ] Pro with stale DB data but newer localStorage → loads from localStorage
- [ ] Pro with newer DB data than localStorage → loads from DB, clears stale draft
- [ ] Fresh pro → starts with empty form

---

### ✅ 3. Bio Field Duplication Resolved
**Files Modified:** `src/pages/settings/ProfileSettings.tsx`

**Before:** `profiles.bio` editable in ProfileSettings, `professional_profiles.bio` editable in ProfessionalSettings — users confused about which to use.

**After:** 
- Professionals see an info banner in ProfileSettings directing them to ProfessionalSettings for bio
- Non-professionals continue to edit bio in ProfileSettings
- `professional_profiles.bio` is the canonical bio for all professional-related views

**Acceptance Criteria:**
- [ ] Client user → sees bio textarea in ProfileSettings
- [ ] Professional user → sees info banner with link to ProfessionalSettings
- [ ] Professional bio updates in ProfessionalSettings work correctly

---

## Manual Verification Steps

### Quick Smoke Test

1. **Sign up as new professional**
   - Complete onboarding wizard through step 3
   - Close browser, return to `/onboarding/professional`
   - ✓ Should restore from localStorage draft

2. **Complete onboarding, then return**
   - Finish onboarding wizard (creates DB row)
   - Clear localStorage
   - Return to `/onboarding/professional`
   - ✓ Should hydrate from DB (toast: "Previous progress loaded")

3. **Professional settings bio**
   - As verified professional, go to `/settings/profile`
   - ✓ Should see info banner directing to `/settings/professional`
   - Go to `/settings/professional`
   - ✓ Should be able to edit bio there

4. **Routing check**
   - As professional with `verification_status=pending` → should go to onboarding
   - As professional with `verification_status=verified` → should go to `/dashboard/pro`

---

## Files Changed Summary

| File | Change |
|------|--------|
| `src/lib/roles.ts` | Changed `getInitialDashboardRoute()` to check `professional_profiles` instead of `profiles.tasker_onboarding_status` |
| `src/components/onboarding/wizard/ProfessionalOnboardingWizard.tsx` | Added DB hydration with timestamp comparison |
| `src/hooks/useWizardAutosave.ts` | Added `getDraftTimestamp()` function and timestamp tracking |
| `src/pages/settings/ProfileSettings.tsx` | Conditional bio field display based on professional role |
