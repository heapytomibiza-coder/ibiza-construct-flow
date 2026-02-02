

# Step 3 → Step 4 Contract Lock Implementation

## Executive Summary

This plan enforces a single-slug contract between Step 3 (Micro Service Selection) and Step 4 (Questions). Currently, Step 4 uses a complex 4-tier fallback system that undermines data quality. With **329/330** micro-services already having approved question packs, the infrastructure is ready—the code just doesn't trust it.

**The missing micro-service**: `door-installation` (Carpentry → General Joinery)

---

## What This Fixes

| Before | After |
|--------|-------|
| Generic "scope/urgency" questions leak through | Only micro-specific questions OR explicit placeholder |
| 4 competing question sources | Single database lookup |
| AI generates random questions | AI removed from wizard flow |
| Trust breaks when questions feel unrelated | Questions always match selected service |

---

## Implementation Phases

### Phase 1: Clean Step 4 Loading Logic

**File**: `src/components/wizard/canonical/QuestionsStep.tsx`

**Current 4-tier fallback** (lines 127-289):
```text
TIER -1: buildConstructionWizardQuestions (local matchers)
TIER  0: Static JSON via mapMicroIdToServiceId  
TIER  1: Database question_packs (correct approach)
TIER  2: AI edge function generate-contextual-questions
TIER  3: Generic fallback (scope/urgency)
```

**New single-source approach**:
```text
1. Query question_packs WHERE micro_slug = :slug AND status = 'approved' AND is_active = true
2. If found → use pack questions
3. If NOT found → show "specialist review" placeholder
```

**Changes**:
- Remove the dynamic import of `buildConstructionWizardQuestions` (lines 141-189)
- Remove static JSON lookup via `mapMicroIdToServiceId` (lines 192-214)
- Remove AI edge function call `generate-contextual-questions` (lines 248-275)
- Remove `getFallbackQuestions()` usage (lines 99-125, 133-136, 277-279)
- Keep `transformPackToAIQuestions` as the only transformer

**Critical SQL fix** (line 219-225):
```typescript
// BEFORE (missing version ordering)
.maybeSingle();

// AFTER (guarantees newest approved pack)
.order('version', { ascending: false })
.limit(1)
.maybeSingle();
```

---

### Phase 2: Add "No Pack" Graceful Handling

**New Component**: `src/components/wizard/canonical/NoQuestionsPlaceholder.tsx`

```text
┌─────────────────────────────────────────────────────────┐
│  📋  We're refining the briefing questions for          │
│      [Door Installation]                                 │
│                                                          │
│  A specialist will review your request personally.      │
│  Continue to share timing, location, and any photos.    │
│                                                          │
│  [ Continue to Logistics → ]                             │
└─────────────────────────────────────────────────────────┘
```

**When pack missing, flag in answers** (for admin visibility):
```typescript
onAnswersChange({
  ...answers,
  _pack_missing: true,
  _pack_missing_slug: primaryMicroSlug,
});
```

This gives admin visibility without adding a new table—jobs with missing packs can be queried via:
```sql
SELECT * FROM jobs WHERE answers->>'_pack_missing' = 'true';
```

---

### Phase 3: Clean Logistics ID Filtering

**Current problematic filter** (lines 232-238):
```typescript
const logisticsIds = ['job_location', 'location', 'start_time', 'start_date', 
  'preferred_date', 'project_assets', 'budget', 'budget_range',
  'timeline', 'completion_date', 'access', 'access_details', 
  'consultation', 'consultation_type', 'urgency', 'q8', 'q9',  // ← DANGEROUS
  'description', 'additional_notes', 'notes', 'when_needed',
  'occupied', 'property_access', 'start_date_preference'];
```

**Problem**: `q8`, `q9` are generic IDs that could match legitimate micro-questions.

**Fix**: Remove numeric IDs, keep only semantic logistics keys:
```typescript
const LOGISTICS_KEYS = new Set([
  'job_location', 'location',
  'start_date', 'start_time', 'preferred_date', 'when_needed', 'start_date_preference',
  'budget', 'budget_range',
  'project_assets', 'photos',
  'access', 'access_details', 'property_access',
  'consultation', 'consultation_type',
  'completion_date', 'timeline',
  'urgency', 'description', 'additional_notes', 'notes', 'occupied'
]);
```

---

### Phase 4: Wizard State Guard

**File**: `src/components/wizard/canonical/CanonicalJobWizard.tsx`

Add guard in `handleMicroSelect` (line 330-352):

```typescript
const handleMicroSelect = useCallback(async (micros: string[], microIds: string[], microSlugs: string[]) => {
  // GUARD: Ensure slug exists for pack lookup
  if (microSlugs.length === 0 || !microSlugs[0]) {
    console.error('[Wizard] No micro_slug provided - cannot proceed to Step 4');
    toast.error('Service data incomplete. Please try selecting again.');
    return;
  }
  
  // Remove legacy UUID lookup (lines 332-341)
  setWizardState(prev => ({ 
    ...prev, 
    microNames: micros, 
    microIds,
    microSlugs
  }));
});
```

**Also remove** the `checkShouldSkipQuestions` function (lines 354-405) and `skipQuestions` state entirely—Step 4 always shows, either with pack questions or the placeholder.

---

### Phase 5: Create Pack for Missing Micro (Optional but Recommended)

**Missing**: `door-installation` (Carpentry → General Joinery)

**Option A**: Create a 6-question manual DNA pack via SQL or admin UI

**Option B**: Temporarily exclude from Step 3 during soft launch

Given 329/330 coverage, creating one pack is faster than adding exclusion logic.

---

## Files Changed

| File | Action |
|------|--------|
| `QuestionsStep.tsx` | Major refactor: remove 4-tier fallback, single DB lookup |
| `CanonicalJobWizard.tsx` | Remove `buildConstructionWizardQuestions` call, remove `skipQuestions` logic |
| **New**: `NoQuestionsPlaceholder.tsx` | Graceful "specialist review" component |

## Files Deprecated (Mark as Legacy, Do Not Delete Yet)

| File | Reason |
|------|--------|
| `src/lib/data/constructionQuestionBlocks.ts` | No longer used in wizard; keep for reference |
| `src/lib/mappers/serviceIdMapper.ts` | No longer used in wizard |
| `src/lib/transformers/blockToQuestion.ts` | Only used for static JSON (removed) |
| `src/data/construction-services.json` | 10,517 lines of static data, now superseded by DB |

---

## Technical Details

### Simplified QuestionsStep.loadQuestions()

```typescript
const loadQuestions = async () => {
  setLoading(true);
  setError(null);

  // GUARD: Must have micro_slug
  if (!primaryMicroSlug) {
    console.error('[Step4] No micro_slug provided');
    setQuestions([]);
    setPackSource('no_pack');
    setLoading(false);
    return;
  }

  // SINGLE SOURCE: Database pack lookup
  const { data: pack, error: packError } = await supabase
    .from('question_packs')
    .select('content, version')
    .eq('micro_slug', primaryMicroSlug)
    .eq('status', 'approved')
    .eq('is_active', true)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!packError && pack?.content) {
    const transformed = transformPackToAIQuestions(pack.content);
    const filtered = transformed.filter(q => !LOGISTICS_KEYS.has(q.id));
    
    if (filtered.length > 0) {
      setQuestions(filtered);
      setPackSource('pack');
      setLoading(false);
      return;
    }
  }

  // NO PACK: Flag for admin visibility
  onAnswersChange({
    ...answers,
    _pack_missing: true,
    _pack_missing_slug: primaryMicroSlug,
  });
  
  setQuestions([]);
  setPackSource('no_pack');
  setLoading(false);
};
```

---

## QA Test Checklist

1. Pick a micro from Step 3 that definitely has an approved pack
2. Confirm Step 4 shows only micro-specific questions
3. Temporarily set that pack to `is_active = false` → Step 4 shows placeholder
4. Submit job → `answers` includes `_pack_missing: true` flag
5. Re-enable pack → Step 4 returns to normal
6. Verify "door-installation" shows placeholder until pack is created

---

## What NOT to Do

- Do NOT invent slugs on the fly in Step 4
- Do NOT map names → slugs in Step 4
- Do NOT let AI create identity
- Do NOT reuse category-level questions
- Do NOT keep generic fallback as a hidden option

---

## Outcome

After this change, Step 4 becomes deterministic and trustworthy:

- **329 micros**: Show curated, micro-specific questions
- **1 micro (door-installation)**: Show placeholder + flag for follow-up
- **Zero micros**: Generic questions never shown

The wizard is now "subscription-worthy"—professionals can trust that leads come with relevant, detailed briefings.

