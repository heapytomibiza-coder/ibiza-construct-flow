
# Homepage Fixes Plan: Critical Runtime Errors

## Summary of Issues Found

The homepage implementation has **critical runtime errors** preventing the Latest Jobs and Featured Professionals sections from loading. The network requests show these errors:

| Section | Error | Root Cause |
|---------|-------|------------|
| Latest Jobs | PGRST200 - No FK relationship between `jobs` and `profiles` | Query uses `profiles!jobs_client_id_fkey` but no FK exists |
| Featured Professionals | PGRST200 - No FK relationship between `professional_profiles` and `professional_stats` | Query tries to join tables without FK |

Additionally, there are the secondary issues you flagged that also need addressing.

---

## Fix 1: useLatestJobs.ts - Remove Invalid FK Join

**Problem:** The query attempts to join `jobs` to `profiles` using a non-existent foreign key `jobs_client_id_fkey`.

**Solution:** Fetch jobs and profiles separately, then merge client-side.

**File:** `src/hooks/useLatestJobs.ts`

**Changes:**
```typescript
// BEFORE: Single query with invalid FK join
.select(`
  id, title, ...,
  profiles!jobs_client_id_fkey (display_name, avatar_url),
  service_micro_categories (...)
`)

// AFTER: Fetch jobs first, then profiles separately
const { data: jobs } = await supabase
  .from('jobs')
  .select(`
    id, title, description, status, created_at,
    budget_type, budget_value, location, client_id, micro_id,
    service_micro_categories (
      name, subcategory_id,
      service_subcategories (
        name, category_id,
        service_categories (name, slug)
      )
    )
  `)
  .eq('status', 'open')
  .order('created_at', { ascending: false })
  .limit(limit);

// Get unique client IDs
const clientIds = [...new Set(jobs.map(j => j.client_id).filter(Boolean))];

// Fetch profiles separately
const { data: profiles } = await supabase
  .from('profiles')
  .select('id, display_name, avatar_url')
  .in('id', clientIds);

// Merge client-side
const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]));
return jobs.map(job => ({
  ...job,
  client: {
    name: profileMap[job.client_id]?.display_name || 'Client',
    avatar: profileMap[job.client_id]?.avatar_url,
  },
}));
```

---

## Fix 2: useFeaturedProfessionals.ts - Remove Invalid FK Join + Fix Empty Section

**Problem 1:** Query tries to join `professional_profiles` to `professional_stats` without a FK relationship.

**Problem 2:** Fetches only 6 items, then filters client-side for avatars - could result in 0-2 displayed.

**Solution:** 
- Remove the `professional_stats` join (ratings can be added later when FK exists)
- Fetch 20 items, filter for avatar + tagline, then slice to 6

**File:** `src/hooks/useFeaturedProfessionals.ts`

**Changes:**
```typescript
// BEFORE: Invalid join + insufficient limit
const { data } = await supabase
  .from('professional_profiles')
  .select(`
    ...,
    professional_stats (average_rating, total_reviews)  // INVALID JOIN
  `)
  .limit(limit);  // Only fetches 6

// AFTER: Remove invalid join + over-fetch for safety
const { data } = await supabase
  .from('professional_profiles')
  .select(`
    user_id,
    business_name,
    tagline,
    verification_status,
    specializations,
    profiles!professional_profiles_user_id_fkey (
      display_name,
      avatar_url
    )
  `)
  .eq('verification_status', 'verified')
  .eq('is_active', true)
  .not('tagline', 'is', null)
  .order('updated_at', { ascending: false })
  .limit(20);  // Fetch more to ensure we have enough after filtering

// Filter for those with avatars, then take only what we need
return (data || [])
  .filter((pro) => pro.profiles?.avatar_url)
  .slice(0, limit)  // Take only the requested limit
  .map((pro) => ({
    id: pro.user_id,
    user_id: pro.user_id,
    business_name: pro.business_name,
    full_name: pro.profiles?.display_name || null,
    tagline: pro.tagline,
    avatar_url: pro.profiles?.avatar_url,
    verification_status: pro.verification_status,
    specializations: pro.specializations,
    rating: null,  // Omit until FK relationship is created
    total_reviews: null,
  }));
```

---

## Fix 3: ServiceCategoryPage.tsx - Dynamic Canonical URL

**Problem:** Canonical URL is hardcoded to `https://csibiza.com`.

**Solution:** Use dynamic origin.

**File:** `src/pages/ServiceCategoryPage.tsx`

**Changes:**
```typescript
// BEFORE
<link rel="canonical" href={`https://csibiza.com/services/${categorySlug}`} />

// AFTER
<link rel="canonical" href={`${window.location.origin}/services/${categorySlug}`} />
```

---

## Fix 4: Discovery Category Filtering (Optional Enhancement)

**Current State:** The implementation passes `category.name` (e.g., "Construction") to Discovery, and the filter logic uses case-insensitive substring matching which works with the current mixed data in `professional_service_items.category`.

**Assessment:** The current fuzzy matching approach (`itemCategory.includes(filterCategory)`) actually handles this adequately because:
- "Construction" matches "construction" (case-insensitive)
- "Carpentry" matches "carpentry-woodwork" (substring)

**Recommendation:** No immediate fix needed, but document this as technical debt. Long-term, standardize `professional_service_items.category` to use slugs.

---

## Implementation Order

1. **Fix useLatestJobs.ts** - Split query into two fetches (jobs + profiles separately)
2. **Fix useFeaturedProfessionals.ts** - Remove invalid join + over-fetch pattern
3. **Fix ServiceCategoryPage.tsx** - Dynamic canonical URL
4. **Test** - Verify homepage loads without console errors

---

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useLatestJobs.ts` | Split query, fetch profiles separately |
| `src/hooks/useFeaturedProfessionals.ts` | Remove stats join, fetch 20 + slice to 6 |
| `src/pages/ServiceCategoryPage.tsx` | Dynamic canonical URL |

---

## Technical Notes

### Why Not Add Foreign Keys?

Adding FKs would require:
1. All `jobs.client_id` values to exist in `profiles.id`
2. All `professional_stats.professional_id` values to exist in `professional_profiles.user_id`

This may not be true for legacy data. The safer approach is to make queries work without FKs.

### Why Over-Fetch for Featured Professionals?

If we fetch exactly 6 and 4 have no avatar, we display only 2. By fetching 20 and slicing to 6, we almost guarantee 6 results (assuming at least 6 verified professionals have avatars).
