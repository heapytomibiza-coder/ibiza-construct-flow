
# Public Job Board & Sneaky Preview: Complete Fix Plan

## Root Cause Analysis

| Component | Issue | Impact |
|-----------|-------|--------|
| **jobs table RLS** | ✅ Correct - allows public SELECT on open jobs | Jobs accessible publicly |
| **profiles table RLS** | ❌ Only allows viewing verified professional profiles | Client names/avatars fail to load for non-professional clients |
| **JobsMarketplace** | Queries profiles for client info | Empty/broken client data when logged out |
| **LatestJobsSection** | Custom cards instead of `JobListingCard` | Visual inconsistency with job board |
| **Privacy** | No "sneaky preview" mode implemented | Client identity exposed publicly (when it loads) |

### The Critical RLS Problem

The `profiles` table has this public SELECT policy:
```sql
"Public can view verified professional profiles"
USING (EXISTS (
  SELECT 1 FROM professional_profiles pp
  WHERE pp.user_id = profiles.id 
    AND pp.is_active = true 
    AND pp.verification_status = 'verified'
))
```

This means **only verified professionals' profiles are publicly visible**. Regular clients who post jobs won't have their profile data accessible to anonymous users - causing empty client names/avatars.

---

## Solution Architecture: "Sneaky Preview" Mode

### Principle
- **Public visitors** see job cards with generic "Client" label (no real identity)
- **Professionals (authenticated)** see full client details + can apply
- **Actions (Apply/Message/Contact)** are gated behind professional login

This is exactly what you requested: "sneaky view before committing".

---

## Implementation Plan

### 1. Create `public_jobs_preview` View (Security Best Practice)

Create a database view that exposes ONLY preview-safe fields. This prevents accidental data leakage regardless of frontend code.

```sql
CREATE OR REPLACE VIEW public.public_jobs_preview AS
SELECT
  id,
  title,
  LEFT(COALESCE(description, ''), 200) AS teaser,
  budget_type,
  budget_value,
  location->>'area' AS area,
  location->>'town' AS town,
  created_at,
  published_at,
  status,
  micro_id,
  -- NO client_id exposed!
  -- NO exact address exposed!
  -- NO answers.extras (attachments) exposed!
  CASE 
    WHEN answers->'extras'->'photos' IS NOT NULL 
    THEN jsonb_array_length(answers->'extras'->'photos') > 0 
    ELSE false 
  END AS has_photos
FROM public.jobs
WHERE is_publicly_listed = true
  AND status IN ('open', 'posted', 'published');

GRANT SELECT ON public.public_jobs_preview TO anon, authenticated;
```

**Benefits:**
- Anonymous users can ONLY access preview-safe data
- `client_id`, exact address, attachments are NOT in the view
- Future code changes can't accidentally leak private data

---

### 2. Update `useLatestJobs` Hook for Preview Mode

**File:** `src/hooks/useLatestJobs.ts`

**Changes:**
- For public preview: use `public_jobs_preview` view
- Always return `client: { name: 'Client' }` (no real identity)
- Add optional `mode` parameter for future authenticated fetches

```typescript
export const useLatestJobs = (limit: number = 6, mode: 'public_preview' | 'authenticated' = 'public_preview') => {
  return useQuery({
    queryKey: ['latest-jobs', limit, mode],
    queryFn: async (): Promise<LatestJob[]> => {
      // Use preview view for public access - no client data exposed
      const { data: jobs, error } = await supabase
        .from('public_jobs_preview')
        .select('*')
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching jobs preview:', error);
        return [];
      }

      return (jobs || []).map((job: any) => {
        const inferred = inferCategoryFromTitle(job.title);
        return {
          id: job.id,
          title: job.title,
          description: job.teaser || '',
          status: job.status,
          created_at: job.created_at,
          budget_type: job.budget_type || 'fixed',
          budget_value: job.budget_value || 0,
          location: { area: job.area || job.town || 'Ibiza' },
          category_name: inferred?.name || null,
          category_slug: inferred?.slug || null,
          has_photos: job.has_photos || false,
          // Privacy: NEVER expose real client identity publicly
          client: {
            name: 'Client',
            avatar: undefined,
          },
        };
      });
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};
```

---

### 3. Update `JobsMarketplace` for Public Preview Mode

**File:** `src/components/marketplace/JobsMarketplace.tsx`

**Changes:**
- Use `public_jobs_preview` view when user is NOT authenticated
- Use full jobs query with client profiles when authenticated as professional
- Add `isAuthenticated` check

```typescript
const loadJobs = async () => {
  try {
    setLoading(true);
    
    if (!user) {
      // PUBLIC PREVIEW MODE: Use safe view, no client data
      const { data: jobsData, error } = await supabase
        .from('public_jobs_preview')
        .select('*')
        .order(sortBy, { ascending: false });

      if (error) throw error;

      const formattedJobs = (jobsData || []).map(job => ({
        ...job,
        description: job.teaser,
        location: { address: '', area: job.area || job.town || 'Ibiza' },
        category: inferCategoryFromTitle(job.title)?.name,
        client: {
          name: 'Client',
          avatar: undefined,
          rating: undefined,
          jobs_completed: undefined
        }
      }));

      setJobs(formattedJobs);
      return;
    }

    // AUTHENTICATED MODE: Full data with client profiles
    // ... existing code for authenticated users ...
  }
};
```

---

### 4. Update `LatestJobsSection` to Use `JobListingCard`

**File:** `src/components/home/LatestJobsSection.tsx`

**Changes:**
- Replace custom card markup with `JobListingCard` in compact mode
- Add `previewMode` prop to `JobListingCard` to hide professional actions

```typescript
import { JobListingCard } from '@/components/marketplace/JobListingCard';

// In the render:
{jobs?.slice(0, 6).map((job) => (
  <Link key={job.id} to={`/jobs/${job.id}`}>
    <JobListingCard
      job={{
        ...job,
        location: { address: '', area: formatJobLocation(job.location) },
        client: { name: 'Client' },
        status: 'open',
      }}
      viewMode="compact"
      previewMode={true}  // New prop to hide Apply/Message buttons
    />
  </Link>
))}
```

---

### 5. Add `previewMode` to `JobListingCard`

**File:** `src/components/marketplace/JobListingCard.tsx`

**Changes:**
- Add optional `previewMode?: boolean` prop
- When `previewMode=true`:
  - Hide "Send Offer" button
  - Hide "Message" button  
  - Show "View Details" only
  - Show "Sign in as Professional to apply" CTA

```typescript
interface JobListingCardProps {
  // ... existing props
  previewMode?: boolean;  // For public/anonymous viewers
}

// In compact mode render:
{viewMode === 'compact' && (
  <div className="flex items-center gap-2">
    {previewMode ? (
      <Button variant="outline" size="sm" asChild>
        <Link to={`/jobs/${job.id}`}>View Details</Link>
      </Button>
    ) : (
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => onSendOffer?.(job.id)}
      >
        Send Offer
      </Button>
    )}
  </div>
)}
```

---

### 6. Gate Actions on Job Detail Page

**File:** `src/pages/JobDetail.tsx` (or equivalent)

When a public user clicks "View Details":
- Show preview data (title, teaser, budget, area, category)
- Show locked panel with CTA: "Sign in as Professional to apply"
- DO NOT show:
  - Client identity/avatar
  - Exact address/map
  - Attachments
  - Phone/email
  - Apply/Message buttons

---

## Files to Modify

| File | Change |
|------|--------|
| Database migration | Create `public_jobs_preview` view |
| `src/hooks/useLatestJobs.ts` | Use preview view, remove client data |
| `src/components/marketplace/JobsMarketplace.tsx` | Use preview view for unauthenticated |
| `src/components/marketplace/JobListingCard.tsx` | Add `previewMode` prop |
| `src/components/home/LatestJobsSection.tsx` | Use `JobListingCard` instead of custom cards |

---

## Implementation Order

1. **Database migration** - Create `public_jobs_preview` view
2. **useLatestJobs.ts** - Switch to preview view, remove client data
3. **JobsMarketplace.tsx** - Split authenticated vs public query paths
4. **JobListingCard.tsx** - Add `previewMode` prop
5. **LatestJobsSection.tsx** - Use `JobListingCard` with `previewMode`
6. **Test** - Verify cards appear logged out + actions are gated

---

## Expected Behavior After Fix

| Scenario | Job Cards | Client Name | Apply/Message |
|----------|-----------|-------------|---------------|
| Logged out on Homepage | ✅ Visible | "Client" (generic) | Hidden |
| Logged out on Job Board | ✅ Visible | "Client" (generic) | Hidden |
| Logged out on Job Detail | ✅ Preview visible | Hidden | "Sign in to apply" CTA |
| Logged in as Professional | ✅ Full details | Real name | ✅ Enabled |
| Logged in as Client | ✅ Visible | "Client" (own jobs show real) | Hidden (not their target) |

---

## Security Benefits

1. **View-based access control** - Anonymous users literally cannot query private fields
2. **No client identity leakage** - Clients stay anonymous until professional engagement
3. **Consistent behavior** - Same preview logic for homepage AND job board
4. **Future-proof** - Adding fields to jobs table won't accidentally expose them publicly
