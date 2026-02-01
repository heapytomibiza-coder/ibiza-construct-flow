# Constructive Solutions Ibiza V2 — Intelligence Extraction

> **Purpose**: Extract existing logic, NOT redesign.  
> **Generated**: 2026-02-01

---

## 1. Category Hierarchy

### 1.1 Database Tables (Source of Truth)

| Table | Purpose | Core/UI |
|-------|---------|---------|
| `service_categories` | 16 top-level categories | **Core** |
| `service_subcategories` | ~146 subcategories linked via `category_id` | **Core** |
| `service_micro_categories` | 400+ micro-services linked via `subcategory_id`, uses `slug` for matching | **Core** |

**Type Definitions**: `src/integrations/supabase/types.ts` (auto-generated, read-only)

### 1.2 UI Components (Database-Driven)

| File Path | Purpose | Core/UI |
|-----------|---------|---------|
| `src/components/wizard/db-powered/CategorySelector.tsx` | Fetches active categories from DB, filters by `category_group` | UI |
| `src/components/wizard/db-powered/SubcategorySelector.tsx` | Fetches subcategories by `category_id` | UI |
| `src/components/wizard/canonical/MicroStep.tsx` | Fetches micro-services by `subcategory_id` | UI |

### 1.3 Utilities & Logic

| File Path | Purpose | Core/UI |
|-----------|---------|---------|
| `src/lib/services/categoryMapping.ts` | `findCategoryMatch()` — maps strings to category UUIDs via slug/name matching | **Core** |
| `src/lib/performance/prefetchCategories.ts` | Prefetches taxonomy levels for wizard performance | Core |
| `docs/service-taxonomy-tree.md` | Generated reference: 16 categories, 146 subcategories, 400+ micros | Docs |

### 1.4 Taxonomy Population

| File Path | Purpose | Core/UI |
|-----------|---------|---------|
| `supabase/functions/populate-taxonomy/index.ts` | Defines & inserts all 16 categories + subcategories | **Core** |
| `src/lib/admin/seedCommercialQuestions.ts` | Programmatic upsert for "Commercial & Industrial" category | Core |

---

## 2. Question Logic

### 2.1 Question Pack Storage

| Location | Purpose | Core/UI |
|----------|---------|---------|
| `question_packs` table (DB) | Stores approved question packs linked via `micro_slug` | **Core** |
| `public/data/microservices_master_v1.json` | 115 microservices with structured questions (6495 lines) | **Core** |
| `src/data/construction-services.json` | 10,000+ lines defining services and question blocks | **Core** |
| `question-packs/templates/hvac-generic-template.json` | Template for HVAC question generation | Reference |

### 2.2 Question Loading Priority (Tiered)

**File**: `src/lib/data/constructionQuestionBlocks.ts`

| Priority | Source | Lines |
|----------|--------|-------|
| 1 (Highest) | Database `question_packs` table | 780-813 |
| 2 | AI `generate-contextual-questions` edge function | (invoked from QuestionsStep) |
| 3 (Fallback) | Hardcoded `tradeBlocks` in constructionQuestionBlocks.ts | 898-916 |

### 2.3 Question-to-Micro Linking

- **Linking Key**: `micro_slug` in `question_packs` matches `slug` in `service_micro_categories`
- **Slug Variants Checked**: Original input, hyphenated ID, raw ID (lines 768-777)

### 2.4 Question Schemas & Types

| File Path | Purpose | Core/UI |
|-----------|---------|---------|
| `contracts/src/packs.zod.ts` | Zod schemas for `QuestionPackContent`, `PackFilters`, `ImportPackPayload` | **Core** |
| `src/schemas/packs.ts` | Core pack schemas (re-exported by contracts) | **Core** |
| `src/types/packs.ts` | TypeScript interfaces for `QuestionDef`, `MicroserviceDef` | Core |

### 2.5 Question Generation

| File Path | Purpose | Core/UI |
|-----------|---------|---------|
| `supabase/functions/generate-question-pack/index.ts` | AI-generates question pack JSON from service name | Core |
| `supabase/functions/generate-contextual-questions/index.ts` | Generates contextual questions for wizard | Core |
| `src/components/admin/questionPacks/PackGenerationDrawer.tsx` | Admin UI for triggering AI generation | UI |

---

## 3. Job Wizard Logic

### 3.1 Step Flow Controller

**Main File**: `src/components/wizard/canonical/CanonicalJobWizard.tsx`

| Step | Name | Auto-Advance | Lines |
|------|------|--------------|-------|
| 1 | Main Category | Yes (on select) | 60-68 |
| 2 | Subcategory | Yes (on select) | — |
| 3 | Micro Service | No (multi-select allowed) | — |
| 4 | Questions | Skip if no DB pack | 354-406 |
| 5 | Logistics | No | — |
| 6 | Extras | No | — |
| 7 | Review | Submit button | — |

### 3.2 Branching & Conditionals

| Logic | Location | Lines |
|-------|----------|-------|
| **Step 4 Skip Check** | `checkShouldSkipQuestions()` | 354-406 |
| **Forward Navigation** | `handleNext()` — skips step 4 if `skipQuestions` true | 276-286 |
| **Backward Navigation** | `handleBack()` — skips step 4 going back | 288-298 |
| **Conditional Field Visibility** | `src/lib/forms/conditionalLogic.ts` | 10-59 |

### 3.3 State Management

| File Path | Purpose | Core/UI |
|-----------|---------|---------|
| `src/features/wizard/useWizard.ts` | `WizardState` interface definition | **Core** |
| `src/hooks/useAutosaveSession.ts` | 600ms debounced autosave to `form_sessions` | Core |
| `src/components/wizard/canonical/CanonicalJobWizard.tsx` | Autosave implementation (lines 188-209) | Core |

### 3.4 Draft Recovery & Persistence

| File Path | Purpose | Lines |
|-----------|---------|-------|
| `CanonicalJobWizard.tsx` | Draft restoration on mount | 121-175 |
| `DraftRecoveryModal.tsx` | User prompt to resume/discard draft | — |
| `form_sessions` table | Server-side draft storage | — |

### 3.5 Submission & Idempotency

| Logic | Location | Lines |
|-------|----------|-------|
| **Double-submit Guard** | `isSubmittingRef` | 432-456 |
| **Idempotency Key** | Hash of user ID + content + time bucket | 469-477 |
| **Session Cleanup** | Clears `form_sessions` on success | 535-542 |

### 3.6 Entry Point

| File Path | Purpose | Core/UI |
|-----------|---------|---------|
| `src/pages/PostJob.tsx` | Route `/post` — launches CanonicalJobWizard | UI |

---

## 4. Matching Logic

### 4.1 Professional-to-Service Link

| Table | Purpose | Core/UI |
|-------|---------|---------|
| `professional_services` | Links professionals to micro-services via `micro_service_id` | **Core** |
| `professional_profiles` | Contains `verification_status`, `is_active`, `onboarding_phase` | **Core** |

### 4.2 Eligibility Rules (Hard Filters)

| Rule | Implementation |
|------|----------------|
| `is_active = true` | `professional_services` table |
| `verification_status = 'verified'` | `professional_profiles` table |
| `micro_service_id` matches job | Join on `service_micro_categories.id` |

### 4.3 Scoring Algorithms

**Heuristic Matcher**: `supabase/functions/ai-professional-matcher/index.ts`

| Factor | Points | Lines |
|--------|--------|-------|
| Service Match | +50 | 84-89 |
| Rating | rating × 8 | 92-94 |
| Response Time (<2h) | +10 | 102-107 |
| Location Match | +15 | 109-116 |
| Budget Fit (≤120%) | +10 | 118-124 |
| Instant Booking | +5 | 127-129 |
| Review Count (>50) | +5 | 131-137 |

**AI Matcher**: `supabase/functions/smart-match-professionals/index.ts`

- Uses Gemini LLM to analyze job description vs professional bios
- Returns multi-dimensional scores: skill, experience, price, location (lines 46-120)

### 4.4 Notification Logic

**File**: `supabase/functions/notify-matching-pros/index.ts`

- Filters for verified, active professionals matching `micro_slug`
- Triggers real-time notifications (lines 69-106)

### 4.5 API Contracts

| File Path | Purpose | Core/UI |
|-----------|---------|---------|
| `src/lib/api/professional-matching.ts` | Request/response interfaces for matching | Core |
| `src/hooks/useJobMatching.ts` | React Query wrapper (placeholder pending migration) | UI |

---

## 5. Data Contracts & Schemas

### 5.1 API Contracts (Zod)

| File Path | Contents | Core/UI |
|-----------|----------|---------|
| `contracts/src/jobs.zod.ts` | `DraftJobSchema`, `JobSchema`, save/submit payloads | **Core** |
| `contracts/src/services.zod.ts` | `QuestionSchema`, `ServiceMicroSchema` | **Core** |
| `contracts/src/contracts.zod.ts` | `ContractSchema` (escrow, milestones) | **Core** |
| `contracts/src/packs.zod.ts` | `PackFiltersSchema`, `ImportPackPayloadSchema` | **Core** |
| `contracts/src/professional-matching.zod.ts` | Matching request/response schemas | Core |

### 5.2 Validation Schemas

| File Path | Contents | Core/UI |
|-----------|----------|---------|
| `src/lib/schemas/jobWizard.ts` | `jobPayloadSchema` — frontend validation | Core |
| `src/lib/validation/jobWizard.ts` | `wizardCompletePayloadSchema`, `bookingInsertSchema` | **Core** |
| `src/schemas/packs.ts` | Core pack schemas | Core |

### 5.3 TypeScript Interfaces

| File Path | Contents | Core/UI |
|-----------|----------|---------|
| `src/types/services.ts` | `ServiceMenuItem`, `ServiceMaterial`, `ServicePricingAddon` | Core |
| `src/types/packs.ts` | `QuestionDef`, `MicroserviceDef`, `PackStatus` | Core |
| `src/types/construction-services.ts` | `ServiceBlock`, `ConstructionService` | Core |
| `src/lib/contracts.ts` | `WizardCompletePayload`, `BookingCreateInput` | **Core** |
| `packages/@ref-impl/client/dto/client.dto.ts` | `DraftJob`, `Job`, `Booking`, `Offer` | Core |

### 5.4 Generated Types

| File Path | Contents | Core/UI |
|-----------|----------|---------|
| `src/integrations/supabase/types.ts` | Auto-generated from DB schema (READ-ONLY) | Core |
| `packages/@contracts/types/index.ts` | Generated API types | Core |

---

## 6. Seed & Reference Data

### 6.1 JSON Service Definitions

| File Path | Contents | Size |
|-----------|----------|------|
| `src/data/construction-services.json` | Services + question blocks | 10,517 lines |
| `public/data/microservices_master_v1.json` | 115 microservices + questions | 6,495 lines |
| `src/data/microservices_master_v1_1.json` | Updated variant | — |
| `src/data/plumbing-heating-services.json` | Plumbing-specific services | — |

### 6.2 Question Pack Templates

| File Path | Purpose |
|-----------|---------|
| `question-packs/templates/hvac-generic-template.json` | HVAC question template |
| `question-packs/templates/hvac-uuid-mapping.json` | UUID mappings for HVAC |

### 6.3 SQL Seed Scripts

| File Path | Purpose |
|-----------|---------|
| `scripts/seed_sprint_154_demo.sql` | Demo disputes, messages, sentiments |
| `scripts/seed_complete_discovery.sql` | Discovery service data |
| `scripts/seed_fair_services_2025.sql` | Ibiza Fair 2025 services |
| `scripts/seed_ibiza_fair_2025.sql` | Fair-specific data |
| `scripts/seed_professionals_discovery.sql` | Professional profiles for marketplace |

### 6.4 Import & Transform Utilities

| File Path | Purpose | Core/UI |
|-----------|---------|---------|
| `src/lib/questionPacks/transformJsonToContent.ts` | Converts construction-services.json to pack format | **Core** |
| `src/lib/questionPacks/importService.ts` | Imports service to question_packs table | Core |
| `src/hooks/admin/useImportServices.ts` | Hook for bulk importing services | UI |

### 6.5 Locale Files

| Directory | Languages |
|-----------|-----------|
| `public/locales/en/` | English translations |
| `public/locales/de/` | German |
| `public/locales/es/` | Spanish |
| `public/locales/fr/` | French |

---

## Summary: Core Logic Files

These files contain the critical business logic (NOT UI):

```
# Category Hierarchy
src/lib/services/categoryMapping.ts
supabase/functions/populate-taxonomy/index.ts

# Question Logic
src/lib/data/constructionQuestionBlocks.ts
contracts/src/packs.zod.ts
supabase/functions/generate-question-pack/index.ts

# Wizard Flow
src/components/wizard/canonical/CanonicalJobWizard.tsx
src/features/wizard/useWizard.ts
src/lib/forms/conditionalLogic.ts
src/lib/validation/jobWizard.ts

# Matching
supabase/functions/ai-professional-matcher/index.ts
supabase/functions/smart-match-professionals/index.ts
supabase/functions/notify-matching-pros/index.ts

# Data Contracts
contracts/src/jobs.zod.ts
contracts/src/services.zod.ts
src/lib/contracts.ts

# Seed Data
src/data/construction-services.json
public/data/microservices_master_v1.json
src/lib/questionPacks/transformJsonToContent.ts
```
