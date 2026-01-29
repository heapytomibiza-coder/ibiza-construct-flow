

# Professional Service Selection Wizard - Implementation Plan

## Current State Analysis

### What Already Exists ✅

| Component | Status | Location |
|-----------|--------|----------|
| **3-tier taxonomy** | ✅ Active | 16 categories → 128 subcategories → 330 micro-services |
| **Client Job Wizard** | ✅ Complete | `CanonicalJobWizard.tsx` - 7-step tap-first flow |
| **professional_services table** | ✅ Exists | Stores `professional_id`, `micro_service_id`, `pricing_structure`, `service_areas` |
| **ServiceCascadeConfigurator** | ✅ Exists | Multi-step category → subcategory → micro selection with pricing |
| **professional_profiles fields** | ✅ Rich | Has `service_regions`, `languages`, `availability`, `min_project_value`, `certifications`, `team_size`, etc. |
| **Job matching hook** | ⚠️ Stubbed | `useJobMatching.ts` returns empty array - needs implementation |

### What's Missing ❌

| Component | Impact |
|-----------|--------|
| **Checkbox multi-select for micro-services** | Professionals must pick services one-by-one instead of batch select |
| **Capability filters per service** | No tools/solo/helper preferences stored |
| **Unified preferences wizard** | Currently scattered across onboarding + service setup |
| **Active matching algorithm** | Just a placeholder returning `[]` |

---

## Proposed Architecture

### User Experience Flow (5 Steps)

```text
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: Pick Main Categories (multi-select tiles)             │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐            │
│  │Plumb  │ │Elect  │ │Carp   │ │HVAC   │ │Paint  │  ...       │
│  └───────┘ └───────┘ └───────┘ └───────┘ └───────┘            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: Pick Subcategories (expand only selected categories)  │
│  ▼ Plumbing                                                    │
│    ☑ Bathroom Plumbing                                         │
│    ☑ Kitchen Plumbing                                          │
│    ☐ Pool Plumbing                                             │
│  ▼ Electrical                                                  │
│    ☑ Home Automation                                           │
│    ☐ Solar Installation                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: Pick Micro-Services (checkboxes within subcats)       │
│  ▼ Bathroom Plumbing                                           │
│    ☑ Shower installation                                       │
│    ☑ Bathtub replacement                                       │
│    ☐ Bidet installation (not my thing)                         │
│    ☐ Underfloor heating (don't have tools)                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: Capability Filters (global or per-service)            │
│  • Service areas on island (multi-select regions)              │
│  • Min job value (€)                                           │
│  • Work style: Solo / Team / Either                            │
│  • Languages spoken                                            │
│  • Emergency callouts? Yes/No                                  │
│  • Certifications (upload later)                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 5: Review & Save                                         │
│  Summary of all selections → "Matching is now active"          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Model Changes

### Option A: Extend `professional_services` (Recommended)

Add capability columns to the existing table:

```sql
ALTER TABLE professional_services ADD COLUMN IF NOT EXISTS 
  min_budget numeric DEFAULT 0,
  can_work_solo boolean DEFAULT true,
  requires_helper boolean DEFAULT false,
  tools_available text[] DEFAULT '{}',
  certifications_required text[] DEFAULT '{}';
```

### Option B: New `professional_service_preferences` table

For complex filtering needs:

```sql
CREATE TABLE professional_service_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES professional_profiles(user_id),
  micro_service_id uuid NOT NULL REFERENCES service_micro_categories(id),
  min_budget numeric DEFAULT 0,
  coverage_areas jsonb DEFAULT '[]', -- specific areas for this service
  solo_or_team text DEFAULT 'either', -- 'solo', 'team', 'either'
  tools_tags text[] DEFAULT '{}',
  availability_override jsonb, -- optional override from profile
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(professional_id, micro_service_id)
);
```

**Recommendation**: Start with Option A (simpler), migrate to Option B if filtering complexity grows.

---

## Matching Algorithm Design

### Hard Rules (Eligibility)

```sql
-- Professional is eligible for a job IF:
SELECT pp.user_id
FROM professional_profiles pp
JOIN professional_services ps ON pp.user_id = ps.professional_id
WHERE 
  ps.micro_service_id = :job_micro_service_id
  AND ps.is_active = true
  AND pp.is_active = true
  AND pp.verification_status = 'verified'
  AND (ps.min_budget IS NULL OR :job_budget >= ps.min_budget)
  AND (pp.service_regions ?| :job_location_array)
```

### Soft Scoring (Ranking)

| Factor | Points |
|--------|--------|
| Response time < 4 hours | +20 |
| Rating > 4.5 | +15 |
| Completed similar jobs | +10 per job (max 30) |
| Has required certifications | +10 |
| Language match | +5 |
| Premium subscription | +10 |

---

## Implementation Phases

### Phase 1: Multi-Select Micro-Service Wizard
- Create `ProfessionalServicePreferencesWizard.tsx`
- Reuse `CategorySelector` and `SubcategorySelector` from job wizard
- Build new `MicroServiceMultiSelect.tsx` with checkbox grid
- Save selections to `professional_services` table

### Phase 2: Capability Filters UI
- Add Step 4 with global filters (regions, min budget, work style)
- Store in `professional_profiles` or per-service in `professional_services.service_areas`

### Phase 3: Matching Algorithm
- Implement `useJobMatching.ts` with actual SQL query
- Create database function `match_professionals_for_job(job_id)`
- Add scoring logic

### Phase 4: Notifications
- When job created, run matching
- Notify top N professionals via `activity_feed`

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/components/professional/ServicePreferencesWizard.tsx` | **Create** | Main 5-step wizard component |
| `src/components/professional/MicroServiceMultiSelect.tsx` | **Create** | Checkbox grid for micro-services |
| `src/components/professional/CapabilityFiltersStep.tsx` | **Create** | Step 4 filters UI |
| `src/hooks/useProfessionalServicePreferences.ts` | **Create** | CRUD for service preferences |
| `src/hooks/useJobMatching.ts` | **Modify** | Implement actual matching logic |
| `supabase/migrations/xxx_add_service_capabilities.sql` | **Create** | Add columns or new table |
| `src/pages/ProfessionalServicesPage.tsx` | **Create** | Dashboard entry point for wizard |

---

## Technical Notes

### Same "Cannon" Principle
Both wizards will use:
- Same `service_categories` table (16 categories)
- Same `service_subcategories` table (128 subcategories)  
- Same `service_micro_categories` table (330 micro-services)

This ensures:
- Client posts job with `micro_service_id = 'abc123'`
- Professional selects `micro_service_id = 'abc123'`  
- Matching is a simple JOIN

### Existing Fields to Leverage
`professional_profiles` already has:
- `service_regions` (jsonb) - island areas
- `languages` (jsonb) - spoken languages
- `min_project_value` / `max_project_value` - budget range
- `team_size` - solo vs team indicator
- `emergency_service` - callout availability
- `certifications` (jsonb) - qualifications

No need to duplicate; the wizard just needs to populate these.

---

## Success Metrics

After implementation:
- [ ] Professional can select 10+ micro-services in under 2 minutes
- [ ] Job posting triggers notification to at least 3 matched professionals
- [ ] Matching accuracy: >80% of notified professionals have relevant skills
- [ ] Dashboard shows "X jobs match your services" counter

