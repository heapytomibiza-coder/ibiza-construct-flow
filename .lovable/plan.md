

# Fixes for Public Job Board & Sneaky Preview: Critical Refinements

## Summary of Current Issues

Based on my investigation, I've identified three critical issues with the current implementation that need immediate attention:

| Issue | Current State | Risk Level |
|-------|--------------|------------|
| **Privacy leak** | `public_jobs_preview` view exposes `address_preview` | CRITICAL |
| **Status filter fragility** | View filters by `status IN ('open', 'posted', 'published')` | MEDIUM |
| **Fake photo placeholders** | Cards inject `['placeholder']` as photo URLs | LOW-MEDIUM |
| **Category inference** | Duplicated title-keyword parsing | TECH DEBT |

---

## Detailed Findings

### Issue 1: Privacy Leak in Preview View (CRITICAL)

**Current state in migration:**
```sql
location->>'address' AS address_preview, -- Only town/area portion for previews
```

**Actual data observed:**
```
address_preview: "San Antonio (Sant Antoni)"
```

This leaks the actual address to anonymous users! The comment says "Only town/area portion" but the column extracts the full `address` field.

### Issue 2: Status Filter Fragility (MEDIUM)

**Current filter:**
```sql
WHERE is_publicly_listed = true
  AND status IN ('open', 'posted', 'published')
```

Since `is_publicly_listed = true` is the single source of truth you added, the status filter is redundant and could cause jobs to disappear if status values change.

### Issue 3: Fake Photo Placeholders (LOW-MEDIUM)

**In `LatestJobsSection.tsx`:**
```typescript
answers: job.has_photos ? { extras: { photos: ['placeholder'] } } : undefined,
```

**In `JobsMarketplace.tsx`:**
```typescript
answers: { extras: { photos: job.has_photos ? ['placeholder'] : [] } }
```

This injects a fake `'placeholder'` URL which could:
- Break image loading in `JobListingCard` (tries to load `placeholder` as URL)
- Confuse the hero image logic
- Create inconsistent behavior

### Issue 4: Duplicated Category Inference (TECH DEBT)

The `inferCategoryFromTitle()` function is duplicated in:
- `src/hooks/useLatestJobs.ts`
- `src/components/marketplace/JobsMarketplace.tsx`

Both have slight differences. This should be a shared utility.

---

## Implementation Plan

### Fix 1: Database Migration - Remove Address and Simplify Status Filter

Create a new migration to update the `public_jobs_preview` view:

```sql
CREATE OR REPLACE VIEW public.public_jobs_preview 
WITH (security_invoker=on) AS
SELECT
  id,
  title,
  LEFT(COALESCE(description, ''), 200) AS teaser,
  budget_type,
  budget_value,
  -- SAFE: Only expose area/town, never address
  COALESCE(location->>'area', location->>'town', 'Ibiza') AS area,
  location->>'town' AS town,
  -- REMOVED: location->>'address' AS address_preview (PRIVACY LEAK)
  created_at,
  published_at,
  status,
  micro_id,
  CASE 
    WHEN answers->'extras'->'photos' IS NOT NULL 
         AND jsonb_array_length(answers->'extras'->'photos') > 0 
    THEN true 
    ELSE false 
  END AS has_photos
FROM public.jobs
WHERE is_publicly_listed = true;
-- REMOVED: status filter - rely on is_publicly_listed alone
```

**Changes:**
1. Remove `address_preview` column entirely (privacy fix)
2. Update `area` to use `COALESCE` with fallback chain
3. Remove `status IN (...)` filter - rely solely on `is_publicly_listed`

---

### Fix 2: Create Shared Category Inference Utility

**New file:** `src/lib/jobs/categoryInference.ts`

```typescript
/**
 * Infer category from job title keywords
 * Temporary fallback until category_slug is stored on jobs
 */
export interface InferredCategory {
  name: string;
  slug: string;
}

const CATEGORY_KEYWORDS: Record<string, InferredCategory> = {
  'kitchen': { name: 'Kitchen & Bathroom', slug: 'kitchen-bathroom' },
  'bathroom': { name: 'Kitchen & Bathroom', slug: 'kitchen-bathroom' },
  'electrical': { name: 'Electrical', slug: 'electrical' },
  'lighting': { name: 'Electrical', slug: 'electrical' },
  // ... rest of keywords
};

export function inferCategoryFromTitle(title: string): InferredCategory | null {
  if (!title) return null;
  const titleLower = title.toLowerCase();
  
  for (const [keyword, category] of Object.entries(CATEGORY_KEYWORDS)) {
    if (titleLower.includes(keyword)) return category;
  }
  return null;
}
```

Update both `useLatestJobs.ts` and `JobsMarketplace.tsx` to import from this shared utility.

---

### Fix 3: Remove Fake Photo Placeholders - Use Boolean Flag

**File:** `src/hooks/useLatestJobs.ts`

**Current (problematic):**
```typescript
answers: job.has_photos ? { extras: { photos: ['placeholder'] } } : undefined,
```

**Fixed:**
```typescript
// Don't fake answers - use has_photos boolean directly
has_photos: job.has_photos || false,
// answers is NOT included in preview mode
```

**File:** `src/components/marketplace/JobsMarketplace.tsx`

**Current (problematic):**
```typescript
answers: { extras: { photos: job.has_photos ? ['placeholder'] : [] } }
```

**Fixed:**
```typescript
// Use has_photos flag instead of fake photo arrays
has_photos: job.has_photos || false,
answers: undefined, // No answers in preview mode
```

**File:** `src/components/marketplace/JobListingCard.tsx`

Update to check `has_photos` boolean alongside `answers?.extras?.photos`:

```typescript
// Add has_photos to props
interface JobListingCardProps {
  job: {
    // ... existing props
    has_photos?: boolean; // New: explicit flag for preview mode
  };
}

// In photo count logic:
const photoCount = job.answers?.extras?.photos?.length || 0;
const hasPhotos = job.has_photos || photoCount > 0;

// In hero image logic:
const heroImage = job.answers?.extras?.photos?.[0] || serviceVisuals.hero;

// Show badge based on boolean when in preview mode
{hasPhotos && !photoCount && previewMode && (
  <Badge className="...">
    Photos available
  </Badge>
)}
```

---

### Fix 4: Update LatestJobsSection Adapter

**File:** `src/components/home/LatestJobsSection.tsx`

Update the `adaptJobForCard` function to match `JobListingCard` expectations without faking data:

```typescript
const adaptJobForCard = (job: NonNullable<typeof jobs>[0]) => ({
  id: job.id,
  title: job.title,
  description: job.description || job.teaser || '',
  budget_type: job.budget_type,
  budget_value: job.budget_value,
  location: {
    address: '', // Never expose in preview
    area: formatJobLocation(job.location),
  },
  created_at: job.created_at,
  status: job.status || 'open',
  client: {
    name: 'Client', // Privacy: always generic
    avatar: undefined,
  },
  category: job.category_name || undefined,
  // Use boolean flag, don't fake answers
  has_photos: job.has_photos,
  answers: undefined, // No answers in preview
});
```

---

## Files to Modify

| File | Change |
|------|--------|
| `supabase/migrations/` | New migration: update `public_jobs_preview` view |
| `src/lib/jobs/categoryInference.ts` | NEW: shared category inference utility |
| `src/hooks/useLatestJobs.ts` | Use shared utility, remove fake answers |
| `src/components/marketplace/JobsMarketplace.tsx` | Use shared utility, remove fake answers |
| `src/components/marketplace/JobListingCard.tsx` | Add `has_photos` prop support |
| `src/components/home/LatestJobsSection.tsx` | Update adapter to use boolean flag |

---

## Implementation Order

1. **Database migration** - Fix privacy leak + simplify filter
2. **Create shared utility** - `categoryInference.ts`
3. **Update hooks/components** - Use shared utility + has_photos flag
4. **Test** - Verify cards show without broken images or leaked data

---

## Expected Behavior After Fix

| Scenario | Before | After |
|----------|--------|-------|
| Address in preview | Exposed via `address_preview` | Not exposed at all |
| Photo URLs in preview | Fake `['placeholder']` injected | Boolean `has_photos` flag |
| Category inference | Duplicated in 2 files | Shared utility |
| Status filtering | Redundant `status IN (...)` | Only `is_publicly_listed` |

---

## Security Benefits

1. **No address leakage** - Preview view cannot expose street addresses
2. **No fake data injection** - Boolean flags instead of placeholder URLs
3. **Single source of truth** - `is_publicly_listed` controls visibility
4. **Maintainable inference** - Category logic in one place

