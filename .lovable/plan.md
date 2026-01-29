

# Fix: Professional Service Preferences Wizard - Critical Bugs

## Problem Summary

The Phase 1 implementation has **critical logic bugs** that will cause data loss and confusing UX in production:

| Bug | Impact | Severity |
|-----|--------|----------|
| **Existing services not shown as selected** | Pro opens wizard, sees 0 selected despite having 30 active services in DB | 🔴 Critical |
| **Mass deactivation on save** | Pro adds 2 services, saves → all other 30 services get deactivated | 🔴 Critical |
| **"Select all" can't deselect DB services** | Toggle only affects session state, not previously saved services | 🟡 High |
| **Review step shows wrong count** | Shows only session-added services, not total active | 🟡 High |

---

## Root Cause Analysis

### The Data Flow Problem

```text
Current (Broken):
┌─────────────────────┐     ┌──────────────────────┐
│  existingServices   │     │  selectedServices    │
│  (from DB)          │  ×  │  (session only)      │
│  [30 active items]  │     │  [2 new additions]   │
└─────────────────────┘     └──────────────────────┘
                                    ↓
                            saveServices() uses
                            selectedServices as 
                            "final truth" (WRONG!)
                                    ↓
                            Deactivates 30 services
```

The `selectedServices` array only tracks **session changes**, not the complete picture. When saving, the code treats this partial list as the complete selection.

---

## Solution Architecture

### New Data Model (in hook state)

Track **three** sets instead of one array:

```typescript
// What's currently active in DB
existingActiveIds: Set<string>  // from DB query

// Session changes only
addedMicroIds: Set<string>      // user ticked NEW services
removedMicroIds: Set<string>    // user UN-ticked EXISTING services

// Computed final truth (for display & save)
finalSelectedIds = existingActiveIds + addedMicroIds - removedMicroIds
```

---

## Technical Implementation

### 1. Update `useProfessionalServicePreferences.ts`

**Changes:**

| Current | Fixed |
|---------|-------|
| `selectedServices: ServiceSelection[]` | Keep for display metadata |
| Single toggle function | Track adds vs removals separately |
| `saveServices()` uses `selectedServices` | Compute `finalSelectedIds` from both sources |

**New state:**
```typescript
const [addedMicroIds, setAddedMicroIds] = useState<Set<string>>(new Set());
const [removedMicroIds, setRemovedMicroIds] = useState<Set<string>>(new Set());

// Computed
const existingActiveIds = useMemo(() => 
  new Set(existingServices.filter(s => s.is_active).map(s => s.micro_service_id)),
  [existingServices]
);

const finalSelectedIds = useMemo(() => {
  const result = new Set(existingActiveIds);
  addedMicroIds.forEach(id => result.add(id));
  removedMicroIds.forEach(id => result.delete(id));
  return result;
}, [existingActiveIds, addedMicroIds, removedMicroIds]);
```

**Fixed `toggleMicroService()`:**
```typescript
const toggleMicroService = useCallback((selection: ServiceSelection) => {
  const { microServiceId } = selection;
  const isExistingActive = existingActiveIds.has(microServiceId);
  const isAdded = addedMicroIds.has(microServiceId);
  const isRemoved = removedMicroIds.has(microServiceId);
  const isCurrentlySelected = (isExistingActive && !isRemoved) || isAdded;

  if (isCurrentlySelected) {
    // Deselecting
    if (isExistingActive) {
      // Mark as removed (was from DB)
      setRemovedMicroIds(prev => new Set(prev).add(microServiceId));
    }
    if (isAdded) {
      // Remove from session additions
      setAddedMicroIds(prev => {
        const next = new Set(prev);
        next.delete(microServiceId);
        return next;
      });
    }
    // Remove from display array
    setSelectedServices(prev => prev.filter(s => s.microServiceId !== microServiceId));
  } else {
    // Selecting
    if (isRemoved) {
      // Un-remove (restore DB selection)
      setRemovedMicroIds(prev => {
        const next = new Set(prev);
        next.delete(microServiceId);
        return next;
      });
    } else if (!isExistingActive) {
      // New addition
      setAddedMicroIds(prev => new Set(prev).add(microServiceId));
      setSelectedServices(prev => [...prev, selection]);
    }
  }
}, [existingActiveIds, addedMicroIds, removedMicroIds]);
```

**Fixed `saveServices()`:**
```typescript
const saveServices = useCallback(async () => {
  if (!professionalId) return false;

  setSaving(true);
  try {
    const finalIds = [...finalSelectedIds];
    const existingIds = existingServices.map(s => s.micro_service_id);
    
    // Services to INSERT (new, never existed)
    const toInsert = finalIds.filter(id => !existingIds.includes(id));
    
    // Services to REACTIVATE (existed but was inactive, now selected)
    const toReactivate = finalIds.filter(id => {
      const existing = existingServices.find(s => s.micro_service_id === id);
      return existing && !existing.is_active;
    });
    
    // Services to DEACTIVATE (was active, now not selected)
    const toDeactivate = existingServices
      .filter(s => s.is_active && !finalSelectedIds.has(s.micro_service_id))
      .map(s => s.micro_service_id);

    // Execute batch operations...
    // (same Promise.all pattern as before)

    // Clear session state after save
    setAddedMicroIds(new Set());
    setRemovedMicroIds(new Set());
    
    await fetchExistingServices();
    return true;
  } catch (error) {
    // error handling
    return false;
  } finally {
    setSaving(false);
  }
}, [professionalId, finalSelectedIds, existingServices, fetchExistingServices]);
```

---

### 2. Update `ServicePreferencesWizard.tsx`

**Changes:**

| Current | Fixed |
|---------|-------|
| `selectedMicroServiceIds` from `selectedServices` only | Get from hook's `finalSelectedIds` |
| `canGoNext()` checks `selectedServices.length` | Check `finalSelectedIds.size` |
| Review step shows `selectedServices.length` | Show `finalSelectedIds.size` |

**Key fixes:**

```typescript
// Destructure new values from hook
const {
  selectedServices,
  existingServices,
  finalSelectedIds, // NEW
  loading: loadingExisting,
  saving,
  toggleMicroService,
  toggleSubcategoryServices,
  saveServices,
  isMicroServiceSelected
} = useProfessionalServicePreferences(user?.id);

// Use finalSelectedIds for the multi-select component
<MicroServiceMultiSelect
  selectedMicroServiceIds={finalSelectedIds} // Changed from local Set
  ...
/>

// Fix canGoNext for step 3
const canGoNext = () => {
  switch (currentStep) {
    case 3: return finalSelectedIds.size > 0; // Changed
    // ...
  }
};

// Fix review step display
<p className="text-2xl font-bold text-primary">
  {finalSelectedIds.size} services
</p>
```

---

### 3. Update `MicroServiceMultiSelect.tsx`

**Changes:**

| Current | Fixed |
|---------|-------|
| `selectedMicroServiceIds: Set<string>` | Change to accept computed Set from hook |
| `totalSelected = selectedMicroServiceIds.size` | Works correctly now (shows true total) |

No major changes needed—the component already accepts a Set. The fix is in how the Set is computed (in the hook).

---

### 4. Fix `toggleSubcategoryServices()` in hook

**Current problem:** Only removes from `selectedServices`, doesn't add to `removedMicroIds`.

**Fixed:**
```typescript
const toggleSubcategoryServices = useCallback((
  subcategoryId: string,
  subcategoryName: string,
  categoryId: string,
  categoryName: string,
  microServices: Array<{ id: string; name: string }>
) => {
  const allSelected = microServices.every(ms => finalSelectedIds.has(ms.id));
  
  if (allSelected) {
    // Deselect all in this subcategory
    microServices.forEach(ms => {
      if (existingActiveIds.has(ms.id)) {
        setRemovedMicroIds(prev => new Set(prev).add(ms.id));
      }
      setAddedMicroIds(prev => {
        const next = new Set(prev);
        next.delete(ms.id);
        return next;
      });
    });
    setSelectedServices(prev => 
      prev.filter(s => !microServices.some(ms => ms.id === s.microServiceId))
    );
  } else {
    // Select all in this subcategory
    microServices.forEach(ms => {
      if (!finalSelectedIds.has(ms.id)) {
        if (existingActiveIds.has(ms.id)) {
          // Was removed, un-remove it
          setRemovedMicroIds(prev => {
            const next = new Set(prev);
            next.delete(ms.id);
            return next;
          });
        } else {
          // New addition
          setAddedMicroIds(prev => new Set(prev).add(ms.id));
          setSelectedServices(prev => [...prev, {
            categoryId,
            categoryName,
            subcategoryId,
            subcategoryName,
            microServiceId: ms.id,
            microServiceName: ms.name
          }]);
        }
      }
    });
  }
}, [existingActiveIds, finalSelectedIds]);
```

---

### 5. Initialize display metadata from existing services

When wizard loads, populate `selectedServices` with metadata for existing active services:

```typescript
// In hook, after existingServices loads
useEffect(() => {
  const loadExistingMetadata = async () => {
    if (existingServices.length === 0) return;
    
    const activeIds = existingServices
      .filter(s => s.is_active)
      .map(s => s.micro_service_id);
    
    if (activeIds.length === 0) return;

    // Fetch micro-service details for display
    const { data } = await supabase
      .from('service_micro_categories')
      .select(`
        id, name,
        subcategory:service_subcategories!inner(
          id, name,
          category:service_categories!inner(id, name)
        )
      `)
      .in('id', activeIds);

    if (data) {
      const selections: ServiceSelection[] = data.map(m => ({
        microServiceId: m.id,
        microServiceName: m.name,
        subcategoryId: m.subcategory.id,
        subcategoryName: m.subcategory.name,
        categoryId: m.subcategory.category.id,
        categoryName: m.subcategory.category.name
      }));
      setSelectedServices(selections);
    }
  };

  loadExistingMetadata();
}, [existingServices]);
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useProfessionalServicePreferences.ts` | Add `addedMicroIds`, `removedMicroIds`, `finalSelectedIds`; fix toggle and save logic |
| `src/components/professional/ServicePreferencesWizard.tsx` | Use `finalSelectedIds` from hook; fix review step display |
| `src/components/professional/MicroServiceMultiSelect.tsx` | Minor - ensure it uses the computed Set correctly |

---

## Verification Checklist

After implementation, test these scenarios:

| Test | Expected Behavior |
|------|-------------------|
| Pro has 10 active services, opens wizard | ✅ Shows 10 as selected |
| Pro adds 2 new services, saves | ✅ Total becomes 12 |
| Pro removes 3 existing services, saves | ✅ Those 3 become `is_active=false` |
| "Select all" on subcategory with mixed state | ✅ All become selected |
| "Deselect all" on subcategory | ✅ All become deselected (including DB ones) |
| Pro makes changes, navigates away, comes back | ✅ Session state preserved until save |

---

## No Database Changes Required

The existing `professional_services` table structure is sufficient:
- `is_active` column already exists
- `min_budget`, `can_work_solo`, etc. already added in previous migration

This is purely a **frontend logic fix**.

