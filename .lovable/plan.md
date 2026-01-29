

# P0 Launch Patch v3 — Final Surgical Fixes

## Summary

The P0 patch is 80% complete. Two files need small, targeted fixes to be launch-ready.

---

## Remaining Issues

| # | Issue | File | Fix |
|---|-------|------|-----|
| 1 | `hasRealProgress` missing fields | `ProfessionalOnboardingWizard.tsx` | Add `experienceYears`, `availability`, `contactEmail`, `contactPhone` |
| 2 | Toast on every DB restore | `ProfessionalOnboardingWizard.tsx` | Only toast when draft existed and was cleared |
| 3 | `onboarding_phase` set even with 0 services | `useProfessionalServicePreferences.ts` | Guard with `finalIds.length > 0` |

---

## Fix 1: Expand `hasRealProgress` Check

**File:** `src/components/onboarding/wizard/ProfessionalOnboardingWizard.tsx`

**Current (lines 107-113):**
```typescript
const hasRealProgress = Boolean(
  dbData.tagline?.trim() || 
  dbData.bio?.trim() || 
  (dbData.categories && dbData.categories.length > 0) ||
  (dbData.regions && dbData.regions.length > 0)
);
```

**Fixed:**
```typescript
const hasRealProgress = Boolean(
  dbData.tagline?.trim() || 
  dbData.bio?.trim() || 
  (dbData.experienceYears && dbData.experienceYears.trim()) ||
  (dbData.categories?.length ?? 0) > 0 ||
  (dbData.regions?.length ?? 0) > 0 ||
  (dbData.availability?.length ?? 0) > 0 ||
  dbData.contactEmail?.trim() ||
  dbData.contactPhone?.trim()
);
```

**Why:** Ensures DB hydration happens when user has ANY meaningful progress, not just tagline/bio/categories/regions.

---

## Fix 2: Toast Only on Conflict

**File:** `src/components/onboarding/wizard/ProfessionalOnboardingWizard.tsx`

**Current behavior (lines 122-131):**
```typescript
} else if (proProfile && hasRealProgress) {
  setData({ ...EMPTY_DATA, displayName, ...dbData });
  if (hasDraftSaved) {
    clearDraft(); // Clear stale draft
  }
  if (!hydrationToastShownRef.current) {
    toast.info('Previous progress loaded', { duration: 2000 });  // ALWAYS toasts
    hydrationToastShownRef.current = true;
  }
```

**Fixed behavior:**
```typescript
} else if (proProfile && hasRealProgress) {
  setData({ ...EMPTY_DATA, displayName, ...dbData });
  const hadDraftCleared = hasDraftSaved;
  if (hasDraftSaved) {
    clearDraft(); // Clear stale draft
  }
  // Only toast if we cleared a draft (conflict scenario)
  if (hadDraftCleared && !hydrationToastShownRef.current) {
    toast.info('Loaded saved progress (draft cleared)', { duration: 2000 });
    hydrationToastShownRef.current = true;
  }
```

**Why:** Users shouldn't see "Previous progress loaded" on every page refresh. Only notify when something actionable happened (draft was cleared in favor of DB).

---

## Fix 3: Guard `onboarding_phase` Update

**File:** `src/hooks/useProfessionalServicePreferences.ts`

**Current (lines 342-346):**
```typescript
// After saving services, mark onboarding as complete
await supabase
  .from('professional_profiles')
  .update({ onboarding_phase: 'complete' })
  .eq('user_id', professionalId);
```

**Fixed:**
```typescript
// After saving services, mark onboarding as complete (only if at least 1 active service)
if (finalIds.length > 0) {
  await supabase
    .from('professional_profiles')
    .update({ onboarding_phase: 'complete' })
    .eq('user_id', professionalId);
}
```

**Why:** Prevents marking onboarding complete when user saves with 0 services selected (edge case that could cause confusing state).

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/onboarding/wizard/ProfessionalOnboardingWizard.tsx` | Fix 1 + Fix 2 |
| `src/hooks/useProfessionalServicePreferences.ts` | Fix 3 |

---

## Updated Acceptance Criteria

| Test | Expected Behavior |
|------|-------------------|
| Pro with DB row (only `experienceYears` filled) | ✅ Hydrates from DB |
| Pro with DB row (only `contactEmail` filled) | ✅ Hydrates from DB |
| DB restore, no draft existed | ✅ No toast shown |
| DB restore, draft existed and was cleared | ✅ Toast: "Loaded saved progress (draft cleared)" |
| Save with 0 services | ✅ `onboarding_phase` stays unchanged |
| Save with 1+ services | ✅ `onboarding_phase` becomes 'complete' |

---

## Manual Verification Steps

1. **Expanded field detection:**
   - Create pro profile with only `experience_years = '5'` in DB
   - Clear localStorage
   - Visit `/onboarding/professional`
   - ✓ Should hydrate from DB (not start fresh)

2. **Toast conflict-only:**
   - Complete step 1-2 (saves to DB)
   - Clear localStorage
   - Return to wizard
   - ✓ No toast (DB loaded without conflict)
   
3. **Toast on conflict:**
   - Complete step 1-2
   - Make local edits
   - Close browser, wait, return
   - If DB is newer → ✓ Toast "draft cleared"

4. **Service save guard:**
   - As verified pro, go to service wizard
   - Deselect all services, save
   - ✓ `onboarding_phase` should NOT become 'complete'

---

## Technical Implementation

### Change 1: ProfessionalOnboardingWizard.tsx lines 107-131

Replace the `hasRealProgress` definition and the DB restore block:

```typescript
// Check for real progress indicators (expanded to include all fields)
const hasRealProgress = Boolean(
  dbData.tagline?.trim() || 
  dbData.bio?.trim() || 
  (dbData.experienceYears && dbData.experienceYears.trim()) ||
  (dbData.categories?.length ?? 0) > 0 ||
  (dbData.regions?.length ?? 0) > 0 ||
  (dbData.availability?.length ?? 0) > 0 ||
  dbData.contactEmail?.trim() ||
  dbData.contactPhone?.trim()
);

if (draft && localTimestamp > dbTimestamp) {
  // Local draft is newer - restore it
  setData({ ...EMPTY_DATA, displayName, ...draft });
  if (!hydrationToastShownRef.current) {
    toast.info('Draft restored', { duration: 2000 });
    hydrationToastShownRef.current = true;
  }
} else if (proProfile && hasRealProgress) {
  // DB data exists with real content and is newer (or no local draft)
  setData({ ...EMPTY_DATA, displayName, ...dbData });
  const hadDraftCleared = hasDraftSaved;
  if (hasDraftSaved) {
    clearDraft(); // Clear stale draft
  }
  // Only toast if we cleared a stale draft (conflict scenario)
  if (hadDraftCleared && !hydrationToastShownRef.current) {
    toast.info('Loaded saved progress (draft cleared)', { duration: 2000 });
    hydrationToastShownRef.current = true;
  }
} else if (draft) {
  // Only draft exists
  setData({ ...EMPTY_DATA, displayName, ...draft });
  if (!hydrationToastShownRef.current) {
    toast.info('Draft restored', { duration: 2000 });
    hydrationToastShownRef.current = true;
  }
} else {
  // Start fresh - no toast needed
  setData({ ...EMPTY_DATA, displayName });
}
```

### Change 2: useProfessionalServicePreferences.ts lines 342-346

Wrap the onboarding phase update with a guard:

```typescript
// After saving services, mark onboarding as complete (only if at least 1 active service)
if (finalIds.length > 0) {
  await supabase
    .from('professional_profiles')
    .update({ onboarding_phase: 'complete' })
    .eq('user_id', professionalId);
}
```

---

## Go/No-Go After This Patch

✅ App builds without errors
✅ All onboarding fields trigger DB hydration
✅ No toast spam on page refresh
✅ Saving services only sets complete when services > 0
✅ Verified pro with services → dashboard loads without gates

**This completes the P0 Launch Patch.**

