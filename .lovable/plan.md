
# Updated Homepage Redesign Plan (Validated)

## Changes from Original Plan

Based on validation against the actual codebase and database, I've made these critical updates:

| Issue | Original Plan | Updated Plan |
|-------|---------------|--------------|
| Routing | `/discovery?category={slug}` | `/services/:slug` (SEO-friendly) |
| Category names | Some hardcoded mismatches | 100% DB-driven, no hardcoding |
| Professional query | `ORDER BY RANDOM()` | Pre-filter + cache |
| Descriptions | Assumed `short_description` column | Omit for now (column doesn't exist) |

---

## Database Schema

### Actual Category Names (from DB)
The homepage tiles will use these exact names from `service_categories`:

| Category | Slug | Group |
|----------|------|-------|
| Construction | construction | STRUCTURAL |
| Carpentry | carpentry | STRUCTURAL |
| Plumbing | plumbing | MEP |
| Electrical | electrical | MEP |
| Painting & Decorating | painting-decorating | FINISHES |
| Gardening & Landscaping | gardening-landscaping | EXTERIOR |
| Pool & Spa | pool-spa | EXTERIOR |
| Kitchen & Bathroom | kitchen-bathroom | PROFESSIONAL |

### New Table: `homepage_featured_services`

```sql
CREATE TABLE homepage_featured_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
  sort_order INT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: Public read access
ALTER TABLE homepage_featured_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view featured services"
  ON homepage_featured_services FOR SELECT
  TO public USING (is_active = true);
```

### Seed Data (8 Featured Categories)

```sql
INSERT INTO homepage_featured_services (category_id, sort_order) VALUES
('5e97f736-36b8-4d7d-9fcf-f1c52f845237', 1), -- Construction
('d384aa17-5dc6-4bc6-b0f1-0ea1f4186a8c', 2), -- Carpentry
('098dc559-b205-4f0c-9dbe-6210358fc2df', 3), -- Electrical
('1e540b07-14c7-471a-87db-25704275de48', 4), -- Plumbing
('ba7182bd-0867-45af-8df5-30888fa32dee', 5), -- Painting & Decorating
('ec0e677b-4f65-42af-b137-d2d9c4b53509', 6), -- Pool & Spa
('d00c7fec-2c46-4540-9aa8-4bb509a90b02', 7), -- Gardening & Landscaping
('1d0d5594-33b5-4244-8041-167017de5cbf', 8); -- Kitchen & Bathroom
```

---

## Routing Updates

### New Route: `/services/:categorySlug`

**File:** `src/App.tsx`

Add new route that renders Discovery pre-filtered:

```tsx
// Replace the redirect
<Route path="/services" element={<Navigate to="/discovery" replace />} />

// With these routes
<Route path="/services" element={<Discovery />} />
<Route path="/services/:categorySlug" element={<ServiceCategoryPage />} />
```

### New Page: `src/pages/ServiceCategoryPage.tsx`

Thin wrapper that:
1. Extracts `categorySlug` from URL params
2. Looks up `category_id` from `service_categories` table using slug
3. Renders Discovery component with pre-set category filter
4. Sets SEO meta tags specific to that category

```text
URL: /services/construction
Resolves to: category_id = 5e97f736-...
Renders: Discovery with filters.selectedTaxonomy.category = "construction"
Meta title: "Construction Services in Ibiza | CS Ibiza"
```

---

## Component Architecture

### New Files to Create

```text
src/pages/ServiceCategoryPage.tsx        -- SEO-friendly category landing page
src/components/home/
├── HomepageServiceTiles.tsx             -- Featured category grid
├── LatestJobsSection.tsx                -- Recent open jobs
├── FeaturedProfessionalsSection.tsx     -- Verified professionals
├── ValuePropsSection.tsx                -- Trust indicators
├── SEOContentBlock.tsx                  -- Crawlable keyword text
├── FinalCTASection.tsx                  -- Closing CTA
└── index.ts                             -- Barrel export
src/hooks/
├── useHomepageFeaturedServices.ts       -- Fetch featured categories
├── useLatestJobs.ts                     -- Fetch recent open jobs
└── useFeaturedProfessionals.ts          -- Fetch verified professionals
```

### Files to Modify

```text
src/App.tsx                              -- Add /services/:slug route
src/pages/Index.tsx                      -- New section composition
src/components/Hero.tsx                  -- Updated copy and CTAs
src/components/HowItWorks.tsx            -- Simplified content
public/locales/en/hero.json              -- New SEO-focused copy
```

---

## Component Specifications

### 1. HomepageServiceTiles

**Data Query:**
```sql
SELECT 
  hfs.sort_order,
  sc.id,
  sc.name,
  sc.slug,
  sc.icon_emoji,
  sc.category_group
FROM homepage_featured_services hfs
JOIN service_categories sc ON hfs.category_id = sc.id
WHERE hfs.is_active = true AND sc.is_active = true
ORDER BY hfs.sort_order
```

**Tile Click Destination:**
```text
/services/{slug}
Example: /services/construction
```

**No descriptions** - omit until `short_description` column is added to `service_categories`.

**Fallback:** If featured list is empty, show first 8 categories ordered by `display_order`.

### 2. LatestJobsSection

**Data Query:**
```sql
SELECT 
  j.id, 
  j.title, 
  j.status, 
  j.location,
  j.created_at,
  j.budget_type,
  j.budget_value,
  m.name as micro_name,
  ss.name as subcategory_name,
  sc.name as category_name,
  sc.slug as category_slug
FROM jobs j
LEFT JOIN service_micro_categories m ON j.micro_id::uuid = m.id
LEFT JOIN service_subcategories ss ON m.subcategory_id = ss.id
LEFT JOIN service_categories sc ON ss.category_id = sc.id
WHERE j.status = 'open'
ORDER BY j.created_at DESC
LIMIT 6
```

**Location Formatting:**
```typescript
const formatLocation = (location: any): string => {
  if (!location) return 'Ibiza';
  return location.address || location.area || location.town || 'Ibiza';
};
```

**Uses existing:** `JobListingCard` with `viewMode="compact"`

**Fallback:** If no jobs, show "Be the first to post a project" with CTA.

### 3. FeaturedProfessionalsSection

**Data Query (improved):**
```sql
SELECT 
  pp.user_id,
  pp.business_name,
  pp.tagline,
  pp.verification_status,
  p.display_name,
  p.avatar_url
FROM professional_profiles pp
JOIN profiles p ON pp.user_id = p.id
WHERE 
  pp.verification_status = 'verified' 
  AND pp.is_active = true
  AND p.avatar_url IS NOT NULL
  AND pp.tagline IS NOT NULL
ORDER BY pp.updated_at DESC
LIMIT 6
```

**Caching:** 5 minute stale time in React Query

**Uses existing:** `ProfessionalCard` or simplified version

---

## Hero Section Updates

### New Copy (SEO-focused)

**H1:** "Trusted Construction & Property Professionals in Ibiza"

**Tagline:** "Find verified builders, tradespeople, and specialists for your Ibiza property. Compare quotes, reviews, and portfolios - all in one place."

**Primary CTA:** "Post Your Project" → `/post`

**Secondary CTA:** "Find Professionals" → `/services`

### Translation File Updates

**public/locales/en/hero.json:**
```json
{
  "title": "Trusted Construction & Property Professionals",
  "highlight": "in Ibiza",
  "tagline": "Find verified builders, tradespeople, and specialists for your Ibiza property. Compare quotes, reviews, and portfolios — all in one place.",
  "cta": {
    "postProject": "Post Your Project",
    "browseServices": "Find Professionals"
  }
}
```

---

## SEO Implementation

### Meta Tags (Index.tsx)
```tsx
<Helmet>
  <title>Construction & Property Professionals in Ibiza | CS Ibiza</title>
  <meta 
    name="description" 
    content="Find trusted builders, tradespeople, and construction professionals in Ibiza. Compare quotes, reviews, and portfolios on CS Ibiza." 
  />
</Helmet>
```

### SEO Content Block (visible, crawlable)
```text
## Construction & Property Services Across Ibiza

CS Ibiza connects homeowners, developers, and property managers with 
trusted construction professionals across Ibiza. From full villa 
renovations and new builds to carpentry, electrical work, plumbing, 
and bespoke finishes, our platform helps you find reliable tradespeople 
without stress, delays, or hidden risks.
```

---

## Page Layout Order

```text
1. Hero (updated copy, SEO H1)
2. HomepageServiceTiles (8 featured categories)
3. LatestJobsSection (6 recent jobs)
4. FeaturedProfessionalsSection (6 verified pros)
5. HowItWorks (simplified)
6. ValuePropsSection (trust bullets)
7. SEOContentBlock (crawlable text)
8. FinalCTASection ("Ready to Start?")
9. Footer
```

Removed: "Professional Registration Step 1/2/3" section

---

## Implementation Order

1. **Database:** Create `homepage_featured_services` table and seed
2. **Routing:** Add `/services/:categorySlug` route + `ServiceCategoryPage`
3. **Hooks:** Create the three data-fetching hooks
4. **Components:** Build home section components
5. **Integration:** Update Index.tsx with new layout
6. **Copy:** Update Hero and localization files
7. **Testing:** Verify all tile links resolve correctly

---

## QA Checklist

- [ ] Every tile title exactly matches DB `service_categories.name`
- [ ] Every tile links to `/services/{slug}` and returns 200
- [ ] Renaming a category in DB updates homepage automatically
- [ ] Deleting/deactivating a category removes it from homepage
- [ ] Location fallback works for jobs with missing address
- [ ] Featured professionals show only those with avatars and taglines
- [ ] Meta tags render correctly for SEO
- [ ] Mobile responsive grid layouts work

---

## Summary of Key Decisions

| Decision | Rationale |
|----------|-----------|
| Use `/services/:slug` not query params | Better SEO, cleaner URLs |
| Tiles 100% DB-driven | Prevents naming drift |
| No hardcoded descriptions | Column doesn't exist yet |
| Filter professionals by avatar+tagline | Ensures quality display |
| 5-min cache on featured pros | Prevents random churn |
| Resolve slug→id internally | Slug changes won't break filtering |
