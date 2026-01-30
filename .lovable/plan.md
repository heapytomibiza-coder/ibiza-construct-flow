
# Homepage Job Cards Fix Plan: Complete Implementation

## Summary of Findings

### Current State Analysis
| Item | Status | Issue |
|------|--------|-------|
| Database has jobs | 24 jobs with `status='open'` confirmed | Data exists |
| `useLatestJobs.ts` | Query uses correct split pattern | No FK join errors |
| RLS policy | "Anyone can view open jobs" exists | Public access enabled |
| ServiceCategoryPage | Uses `category.name` not slug | Technical debt (fuzzy matching) |
| Canonical URL | Uses dynamic origin with SSR guard | Implemented |

### Root Cause: Why Job Cards May Still Be Empty

The current implementation looks correct, but there are edge cases that could cause empty sections:

1. **`micro_id` JOIN failures**: The nested join `service_micro_categories(...)` can fail silently if `jobs.micro_id` contains non-UUID text values or nulls, returning `null` for the entire nested object.

2. **Empty client IDs**: If jobs have `null` client_id values, the profile fetch skips them but the mapping still works (defaults to "Client").

3. **RLS blocking in practice**: Even with RLS policies, the actual response depends on the requesting user's context.

---

## Implementation Plan

### Fix 1: Robust `useLatestJobs` Query

**File:** `src/hooks/useLatestJobs.ts`

**Changes:**

A) **Guard against empty clientIds without extra query:**
```typescript
// Early return if no valid client IDs
if (clientIds.length === 0) {
  return jobs.map((job: any) => ({
    ...job,
    client: { name: 'Client', avatar: undefined },
  }));
}
```

B) **Remove micro_id join dependency for resilience:**

The nested `service_micro_categories` join via text `micro_id` can fail. Make it optional and gracefully degrade:

```typescript
// Simplified query without complex nested join
const { data: jobs, error: jobsError } = await supabase
  .from('jobs')
  .select(`
    id,
    title,
    description,
    status,
    created_at,
    budget_type,
    budget_value,
    location,
    client_id,
    micro_id
  `)
  .eq('status', 'open')
  .order('created_at', { ascending: false })
  .limit(limit);
```

If category badge is needed, fetch it separately or omit until `micro_id` is normalized to UUID.

C) **Add multi-status support (future-proofing):**
```typescript
// Instead of .eq('status', 'open')
.in('status', ['open', 'posted', 'published'])
```

Or create an `is_publicly_listed` flag as recommended.

---

### Fix 2: Robust `useFeaturedProfessionals` with Over-fetch

**File:** `src/hooks/useFeaturedProfessionals.ts`

**Changes:**

A) **Increase fetch limit to ensure full section:**
```typescript
// Fetch more than needed to account for filtering
const fetchLimit = Math.max(limit * 3, 20);

const { data, error } = await supabase
  .from('professional_profiles')
  .select(`...`)
  .limit(fetchLimit);
```

B) **Ensure section never appears empty:**
```typescript
// Filter and slice, but always return at least the available pros
const filtered = (data || [])
  .filter((pro: any) => pro.profiles?.avatar_url)
  .slice(0, limit);

// If we have less than requested but have some, return what we have
return filtered.length > 0 ? filtered : [];
```

---

### Fix 3: ServiceCategoryPage - Pass Slug Instead of Name

**File:** `src/pages/ServiceCategoryPage.tsx`

**Current (risky):**
```tsx
<Discovery initialCategoryName={category.name} />
```

**Improved:**
```tsx
<Discovery initialCategorySlug={category.slug} />
```

**File:** `src/pages/Discovery.tsx`

**Update interface:**
```typescript
interface DiscoveryProps {
  /** Initial category slug for pre-filtering (from ServiceCategoryPage) */
  initialCategorySlug?: string;
}
```

**Update filter initialization:**
```typescript
const [filters, setFilters] = useState<Filters>(() => {
  if (initialCategorySlug) {
    return {
      selectedTaxonomy: {
        category: initialCategorySlug, // Use slug for matching
        subcategory: '',
        micro: '',
      },
      // ...
    };
  }
  // ...
});
```

This ensures consistent slug-based filtering throughout.

---

### Fix 4: Canonical URL SSR Guard (Already Implemented)

**Current code in ServiceCategoryPage.tsx is correct:**
```tsx
<link rel="canonical" href={`${typeof window !== 'undefined' ? window.location.origin : ''}/services/${categorySlug}`} />
```

**Note:** Empty string fallback for SSR is acceptable since canonical tags are primarily for crawler context where `window` is available.

---

### Fix 5: Privacy Gating for "Sneaky Preview"

**Requirement:** Public can see job previews, but client details and apply actions are gated.

**Implementation Strategy:**

A) **Homepage/Job Board Cards (public preview):**
- Show: title, teaser (first 160 chars), budget, area, category, posted time
- Hide: client identity, exact address, attachments, contact info
- CTA: "View Details" (always works)

B) **Job Detail Page (gated actions):**
- If not authenticated: Show preview + "Sign in as Professional to Apply" panel
- If authenticated but not professional: Show "Switch to Professional to apply"
- If authenticated as professional: Show full details + Apply/Message buttons

**Files to modify:**
- `src/pages/JobDetail.tsx` (or equivalent)
- RLS policies on `jobs` table (optional: create `public_jobs_preview` view)

---

## Database Improvements (Recommended)

### Option A: Add `is_publicly_listed` Flag (Best Practice)

**Migration:**
```sql
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS is_publicly_listed boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS published_at timestamptz NULL;

-- Backfill existing open jobs
UPDATE public.jobs
SET is_publicly_listed = true,
    published_at = COALESCE(published_at, created_at)
WHERE status = 'open';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_jobs_publicly_listed 
ON public.jobs(is_publicly_listed, published_at DESC NULLS LAST);
```

**Benefits:**
- Single source of truth for visibility
- No dependency on inconsistent `status` values
- Explicit control over public listings

### Option B: Create Public Preview View (Security)

```sql
CREATE OR REPLACE VIEW public.public_jobs_preview AS
SELECT
  id,
  title,
  left(coalesce(description,''), 160) as teaser,
  budget_type,
  budget_value,
  location->>'area' as area,
  location->>'town' as town,
  created_at,
  micro_id
FROM public.jobs
WHERE status IN ('open', 'posted', 'published');

-- Grant public access
GRANT SELECT ON public.public_jobs_preview TO anon, authenticated;
```

**Benefits:**
- Impossible to accidentally leak sensitive fields
- Query the view instead of `jobs` table for public contexts

---

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useLatestJobs.ts` | Guard empty clientIds, simplify micro join, multi-status support |
| `src/hooks/useFeaturedProfessionals.ts` | Over-fetch (20-30), filter, slice to limit |
| `src/pages/ServiceCategoryPage.tsx` | Pass `initialCategorySlug` instead of name |
| `src/pages/Discovery.tsx` | Accept `initialCategorySlug` prop, use for filtering |
| `supabase/migrations/` | (Optional) Add `is_publicly_listed` column + index |

---

## Implementation Order

1. **Fix useLatestJobs.ts** - Guard empty clients, simplify query
2. **Fix useFeaturedProfessionals.ts** - Over-fetch pattern
3. **Update ServiceCategoryPage + Discovery** - Pass slug instead of name
4. **Test homepage** - Verify job cards appear for logged-out users
5. **(Optional) Database migration** - Add `is_publicly_listed` for robust filtering
6. **(Future) Privacy gating** - Implement locked panel on job detail page

---

## QA Checklist

- [ ] Homepage loads job cards when 24 open jobs exist in DB
- [ ] Homepage loads when no jobs exist (shows empty state)
- [ ] Featured professionals section never appears empty (min 6 with avatars)
- [ ] `/services/construction` stays on that URL (no redirect)
- [ ] Category filter works correctly using slug matching
- [ ] Canonical URL renders correctly in page source
- [ ] Job cards show public-safe fields only (no client contact info)
- [ ] Test logged out vs logged in (RLS behavior)

---

## Technical Notes

### Why Pass Slug Instead of Name?

| Scenario | Name-based | Slug-based |
|----------|------------|------------|
| "Kitchen & Bathroom" | Exact match required | `kitchen-bathroom` stable |
| Data has "construction" | Fuzzy match needed | Direct match |
| Category renamed | Breaks filtering | URL stable |

### Why Over-fetch for Featured Professionals?

If limit=6 and 4 of 6 lack avatars, section shows 2 cards.
Over-fetch (20) + filter + slice(6) = guaranteed 6 cards (if 6+ have avatars).

### Why Simplify Micro Join?

The `jobs.micro_id` column contains mixed data (UUIDs and text slugs).
The nested join `service_micro_categories(...)` fails silently when `micro_id` isn't a valid FK.
Omitting category badge is safer until data is normalized.
