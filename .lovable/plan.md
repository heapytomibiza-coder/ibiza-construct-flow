

# Homepage Job Cards: Final Fixes Plan

## Summary of Issues

Based on detailed investigation, I've identified the remaining blockers:

| Issue | Current State | Impact |
|-------|--------------|--------|
| Build verification | No visible version number | Can't prove new build is running |
| Status filter | Uses `IN ('open', 'posted', 'published')` | Works - 24 jobs have `status='open'` |
| Category data | `micro_id` values don't match `service_micro_categories` slugs | Category badges never display |
| Job cards | Custom card layout in `LatestJobsSection` | Less engaging than `JobListingCard` |
| is_publicly_listed | Column doesn't exist | No robust visibility flag |

### Database Reality Check

The `jobs.micro_id` field contains mixed data that doesn't match the `service_micro_categories` table:
- Some have UUIDs like `71d97020-f5da-4f99-ab52-8ce0e761f824`
- Some have custom slugs like `kitchen-upgrade-002`, `facade-restore-003`
- The actual micro categories use different slugs like `full-kitchen-fit`, `deck-construction`

This means **category joins will always return null** until the data is normalized.

---

## Implementation Plan

### Fix 1: Add Build Version Banner (Verification)

Add a visible build version to the footer so deployments can be verified.

**File:** `src/components/Footer.tsx`

**Changes:**
- Add build timestamp or version hash to footer
- Uses Vite's build-time environment

```typescript
// Add to footer bottom section
const buildVersion = import.meta.env.VITE_BUILD_VERSION || 
  new Date().toISOString().slice(0, 10);

// In JSX, add after copyright:
<span className="text-xs text-primary-foreground/50 ml-2">
  v{buildVersion}
</span>
```

**File:** `vite.config.ts`

**Changes:**
- Define `VITE_BUILD_VERSION` at build time

```typescript
define: {
  'import.meta.env.VITE_BUILD_VERSION': JSON.stringify(
    new Date().toISOString().slice(0, 16).replace('T', '-')
  ),
}
```

---

### Fix 2: Add `is_publicly_listed` Column (Robust Visibility)

Add a reliable visibility flag to decouple from inconsistent status values.

**Database Migration:**
```sql
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS is_publicly_listed boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS published_at timestamptz NULL;

-- Backfill: mark all 'open' jobs as publicly listed
UPDATE public.jobs
SET is_publicly_listed = true,
    published_at = COALESCE(published_at, created_at)
WHERE status = 'open';

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_jobs_publicly_listed 
ON public.jobs(is_publicly_listed, published_at DESC NULLS LAST);
```

**File:** `src/hooks/useLatestJobs.ts`

**Changes:**
- Switch from status filter to `is_publicly_listed`

```typescript
// Replace .in('status', [...])
.eq('is_publicly_listed', true)
.order('published_at', { ascending: false, nullsFirst: false })
```

---

### Fix 3: Store `category_slug` on Job (Category Badges)

Since `micro_id` data is inconsistent, store category directly on the job.

**Option A: Database Column (Best)**

**Migration:**
```sql
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS category_slug text NULL;

-- Backfill from micro where possible (limited success expected)
UPDATE public.jobs j
SET category_slug = sc.slug
FROM service_micro_categories m
JOIN service_subcategories ss ON m.subcategory_id = ss.id
JOIN service_categories sc ON ss.category_id = sc.id
WHERE j.micro_id = m.slug
  AND j.category_slug IS NULL;
```

**Option B: Runtime Fallback (Immediate)**

For now, parse category from job title keywords until data is fixed.

**File:** `src/hooks/useLatestJobs.ts`

```typescript
// Add category inference function
const inferCategoryFromTitle = (title: string): { name: string; slug: string } | null => {
  const titleLower = title.toLowerCase();
  const categoryKeywords: Record<string, { name: string; slug: string }> = {
    'kitchen': { name: 'Kitchen & Bathroom', slug: 'kitchen-bathroom' },
    'bathroom': { name: 'Kitchen & Bathroom', slug: 'kitchen-bathroom' },
    'electrical': { name: 'Electrical', slug: 'electrical' },
    'lighting': { name: 'Electrical', slug: 'electrical' },
    'painting': { name: 'Painting & Decorating', slug: 'painting-decorating' },
    'deck': { name: 'Carpentry', slug: 'carpentry' },
    'pergola': { name: 'Carpentry', slug: 'carpentry' },
    'lawn': { name: 'Gardening & Landscaping', slug: 'gardening-landscaping' },
    'garden': { name: 'Gardening & Landscaping', slug: 'gardening-landscaping' },
    'pool': { name: 'Pool & Spa', slug: 'pool-spa' },
    'window': { name: 'Floors, Doors & Windows', slug: 'floors-doors-windows' },
    'door': { name: 'Floors, Doors & Windows', slug: 'floors-doors-windows' },
    'plumbing': { name: 'Plumbing', slug: 'plumbing' },
    'construction': { name: 'Construction', slug: 'construction' },
  };
  
  for (const [keyword, category] of Object.entries(categoryKeywords)) {
    if (titleLower.includes(keyword)) return category;
  }
  return null;
};

// Use in job mapping
const inferred = inferCategoryFromTitle(job.title);
return {
  ...job,
  category_name: inferred?.name || null,
  category_slug: inferred?.slug || null,
  // ...
};
```

---

### Fix 4: Use JobListingCard Component (Visual Parity)

Replace custom card markup with the actual `JobListingCard` in compact mode.

**File:** `src/components/home/LatestJobsSection.tsx`

**Changes:**
```typescript
import { JobListingCard } from '@/components/marketplace/JobListingCard';

// Adapt job data to JobListingCard expected shape
const adaptJob = (job: LatestJob) => ({
  ...job,
  client: {
    name: job.client.name,
    avatar: job.client.avatar,
  },
  category: job.category_name || undefined,
});

// In render:
{jobs?.slice(0, 6).map((job) => (
  <Link key={job.id} to={`/jobs/${job.id}`}>
    <JobListingCard
      job={adaptJob(job)}
      viewMode="compact"
    />
  </Link>
))}
```

However, `JobListingCard` in compact mode includes a "Send Offer" button which isn't appropriate for public homepage. 

**Alternative: Create `JobPreviewCard` Component**

A simpler component that:
- Uses the same styling as `JobListingCard`
- Omits professional-only actions
- Links to job detail page
- Shows category badge when available

---

## Files to Modify

| File | Change |
|------|--------|
| `vite.config.ts` | Add `VITE_BUILD_VERSION` define |
| `src/components/Footer.tsx` | Display build version |
| `src/hooks/useLatestJobs.ts` | Add category inference, use `is_publicly_listed` (if added) |
| `src/components/home/LatestJobsSection.tsx` | Improve card styling or use `JobListingCard` |
| Database migration | Add `is_publicly_listed`, `published_at`, optionally `category_slug` |

---

## Implementation Order

1. **Add build version** - Immediate verification capability
2. **Add category inference** - Get category badges working now
3. **Database migration** - Add `is_publicly_listed` + backfill
4. **Update useLatestJobs** - Switch to `is_publicly_listed` filter
5. **Enhance job cards** - Better visual parity with job board

---

## Technical Notes

### Why Category Joins Fail

```text
Job micro_id values:
- "kitchen-upgrade-002" (custom, not in table)
- "71d97020-f5da-4f99-ab52-8ce0e761f824" (UUID, not in slug column)

service_micro_categories.slug values:
- "full-kitchen-fit"
- "deck-construction"
- "room-painting"

Result: LEFT JOIN always returns null
```

### Why is_publicly_listed is Better Than Status

| Status Value | Count | Should Show? |
|-------------|-------|--------------|
| open | 24 | Yes |
| complete | 2 | No |
| in_progress | 2 | No |
| assigned | 1 | No |
| invited | 1 | No |
| offered | 1 | No |

Using `is_publicly_listed = true` is:
- Explicit intent (not inferred from status)
- Won't break if new statuses are added
- Can show jobs that are "in progress but still accepting quotes"

---

## QA Checklist

- [ ] Build version visible in footer after deployment
- [ ] Hard reload + Network tab shows no invalid joins
- [ ] Homepage shows job cards with category badges (via inference)
- [ ] "Latest Projects" section displays 6 jobs when data exists
- [ ] Job card click routes to `/jobs/:id`
- [ ] Empty state shows CTA when no jobs available
- [ ] Test logged out vs logged in (same results for public jobs)

