# V1 → V2 Migration Export: Taxonomy & Question System

## Executive Summary

This document extracts **all V1 source-of-truth assets** for the 16-category taxonomy and question pack system.

---

## A) The 16-Category Taxonomy (Source of Truth)

### Location: `supabase/functions/populate-taxonomy/index.ts`

The **canonical 16 categories** are defined in the edge function that populates the database:

| # | Category | Slug | Icon | Group |
|---|----------|------|------|-------|
| 1 | Construction | `construction` | 🏗️ Building2 | STRUCTURAL |
| 2 | Carpentry | `carpentry` | 🔨 Hammer | STRUCTURAL |
| 3 | Plumbing | `plumbing` | 💧 Droplet | MEP |
| 4 | Electrical | `electrical` | ⚡ Zap | MEP |
| 5 | HVAC | `hvac` | 🌬️ Wind | MEP |
| 6 | Painting & Decorating | `painting-decorating` | 🎨 Paintbrush | FINISHES |
| 7 | Gardening & Landscaping | `gardening-landscaping` | 🌿 Leaf | EXTERIOR |
| 8 | Cleaning | `cleaning` | ✨ Sparkles | SERVICES |
| 9 | Pool & Spa | `pool-spa` | 🌊 Waves | EXTERIOR |
| 10 | Architects & Design | `architects-design` | 📐 Ruler | PROFESSIONAL |
| 11 | Kitchen & Bathroom | `kitchen-bathroom` | 🚿 Bath | PROFESSIONAL |
| 12 | Floors, Doors & Windows | `floors-doors-windows` | 🚪 DoorOpen | PROFESSIONAL |
| 13 | Handyman and General Services | `handyman-general-services` | 🔧 Wrench | SERVICES |
| 14 | Commercial & Industrial | `commercial-industrial` | 🏢 Building | PROFESSIONAL |
| 15 | Legal & Regulatory | `legal-regulatory` | 📋 FileText | PROFESSIONAL |
| 16 | Transportation, Moving and Delivery | `transport-moving-delivery` | 🚚 Truck | SERVICES |

### Database Tables
- `service_categories` → 16 rows
- `service_subcategories` → ~90 rows (varies)
- `service_micro_categories` → 400+ rows

---

## B) Question Pack System

### Linking Key: `micro_slug`

Question packs are linked to micro-services via the **`micro_slug`** field:

```
micro_slug (in question_packs) ↔ slug (in service_micro_categories)
```

### Question Pack Sources (Edge Functions)

All question packs are defined in TypeScript files under:
```
supabase/functions/_shared/
├── constructionQuestionPacks.ts      (41 packs)
├── carpentryQuestionPacks.ts
├── electricalQuestionPacks.ts
├── plumbingPacks.ts
├── hvacQuestionPacks.ts
├── paintingDecoratingPacks.ts
├── gardeningLandscapingQuestionPacks.ts
├── poolSpaQuestionPacks.ts
├── kitchenBathroomQuestionPacks.ts
├── floorsDoorsWindowsQuestionPacks.ts
├── handymanQuestionPacks.ts
├── commercialIndustrialQuestionPacks.ts
├── legalRegulatoryQuestionPacks.ts
└── transportQuestionPacks.ts
```

### Question Pack Schema

```typescript
type MicroservicePackContent = {
  slug: string;           // Links to service_micro_categories.slug
  subcategorySlug: string;
  name: string;
  questions: QuestionDef[];
};

type QuestionDef = {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number' | 'file';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  helpText?: string;
  dependsOn?: { questionId: string; value: string | string[] };
  min?: number;
  max?: number;
  accept?: string;
};
```

### Seed Edge Functions

Each category has a dedicated seeder:
- `supabase/functions/seed-construction-questions/`
- `supabase/functions/seed-electrical-questions/`
- `supabase/functions/seed-hvac-questions/`
- etc.

These call the Supabase API to upsert into `question_packs` table.

---

## C) Alternative JSON Sources

### 1. Static Construction Services JSON
**File:** `src/data/construction-services.json` (10,517 lines)

Structure:
```json
{
  "services": [
    {
      "id": "excavation-groundworks",
      "label": "Excavation & Groundworks",
      "icon": "Shovel",
      "description": "...",
      "budgetRange": { "min": 800, "max": 15000 },
      "blocks": [
        {
          "id": "job_location",
          "type": "text_field",
          "title": "Where is the job located?",
          "required": true,
          "config": { "placeholder": "..." }
        },
        {
          "id": "machinery_access",
          "type": "type_selector",
          "title": "How easy is access for machinery?",
          "required": true,
          "config": {
            "multiSelect": false,
            "options": [
              { "value": "easy", "label": "Easy (wide entrance)" },
              ...
            ]
          }
        }
      ],
      "promptTemplate": "Create a detailed..."
    }
  ]
}
```

### 2. Microservices Master Reference
**File:** `public/data/microservices_master_v1.json` (6,495 lines)

Structure:
```json
{
  "export_name": "TM Direct Ibiza – Microservices MASTER v1",
  "version": "1.0",
  "microservices_count": 115,
  "microservices": [
    {
      "category": "PAINTING, DECORATING & FINISHING SERVICES",
      "subcategory": "Interior Painting",
      "service": "Walls, ceilings & trim painting",
      "questions": [...],
      "question_order": [...],
      "ai_prompt_template": "..."
    }
  ]
}
```

---

## D) Import/Seed Mechanisms

### 1. Edge Function: populate-taxonomy
**Populates:** Categories + Subcategories + Micros

```bash
# Invoke to seed the 3-tier hierarchy
curl -X POST https://<project>.supabase.co/functions/v1/populate-taxonomy
```

### 2. Edge Function: seed-*-questions
**Populates:** Question packs for each category

```bash
# Example: seed construction questions
curl -X POST https://<project>.supabase.co/functions/v1/seed-construction-questions
```

### 3. Admin UI Importer
**File:** `src/pages/admin/ImportQuestions.tsx`
**Hook:** `src/hooks/admin/useImportServices.ts`

Allows uploading JSON files that get parsed and inserted into `question_packs`.

### 4. Transform Utility
**File:** `src/lib/questionPacks/transformJsonToContent.ts`

Converts `ConstructionService` JSON format to `MicroserviceDef` schema:
- Filters out logistics questions (`LOGISTICS_QUESTION_IDS`)
- Maps `blocks` to `questions`
- Generates UUIDs

---

## E) Database Schema (Target Tables)

### service_categories
```sql
id UUID, name TEXT, slug TEXT UNIQUE, icon_emoji TEXT, 
icon_name TEXT, display_order INT, category_group TEXT, is_active BOOL
```

### service_subcategories
```sql
id UUID, category_id UUID FK, name TEXT, slug TEXT UNIQUE,
icon_emoji TEXT, icon_name TEXT, display_order INT, is_active BOOL
```

### service_micro_categories
```sql
id UUID, subcategory_id UUID FK, name TEXT, slug TEXT UNIQUE,
description TEXT, display_order INT, is_active BOOL
```

### question_packs
```sql
pack_id UUID, micro_slug TEXT, version INT, status TEXT,
source TEXT, content JSONB, is_active BOOL,
created_at TIMESTAMP, approved_at TIMESTAMP
UNIQUE(micro_slug, version)
```

---

## F) V2 Migration Checklist

### Step 1: Seed Taxonomy
```bash
# Call the populate-taxonomy edge function
POST /functions/v1/populate-taxonomy
```

### Step 2: Seed Question Packs
```bash
# Call each category seeder
POST /functions/v1/seed-construction-questions
POST /functions/v1/seed-electrical-questions
POST /functions/v1/seed-hvac-questions
POST /functions/v1/seed-painting-questions
# ... etc for all 16 categories
```

### Step 3: Verify Data
```sql
-- Check categories
SELECT COUNT(*) FROM service_categories WHERE is_active = true;
-- Expected: 16

-- Check subcategories
SELECT COUNT(*) FROM service_subcategories WHERE is_active = true;
-- Expected: ~90

-- Check micros
SELECT COUNT(*) FROM service_micro_categories WHERE is_active = true;
-- Expected: 400+

-- Check question packs
SELECT COUNT(*) FROM question_packs WHERE is_active = true;
-- Expected: 300+
```

### Step 4: Wire Wizard to Use Database
The wizard at `/post` should:
1. Fetch categories from `service_categories`
2. Fetch subcategories from `service_subcategories`
3. Fetch micros from `service_micro_categories`
4. Lookup questions from `question_packs` via `micro_slug`

---

## G) Key Files for Export

| Asset | Location | Purpose |
|-------|----------|---------|
| Taxonomy Seeder | `supabase/functions/populate-taxonomy/index.ts` | 16 categories + subs + micros |
| Construction Packs | `supabase/functions/_shared/constructionQuestionPacks.ts` | 41 packs |
| All Question Packs | `supabase/functions/_shared/*QuestionPacks.ts` | All categories |
| Construction JSON | `src/data/construction-services.json` | Static fallback |
| Master Reference | `public/data/microservices_master_v1.json` | 115 micros |
| Transform Logic | `src/lib/questionPacks/transformJsonToContent.ts` | JSON → DB format |
| Import Hook | `src/hooks/admin/useImportServices.ts` | Admin import |
| Type Definitions | `src/types/construction-services.ts` | ServiceBlock, ConstructionService |
| Pack Types | `src/types/packs.ts` | MicroserviceDef, QuestionDef |

---

## H) Why V2 Shows Different System

The `/post` route in V2 likely fails because:

1. **Taxonomy tables are empty** → Need to run `populate-taxonomy`
2. **Question packs are empty** → Need to run `seed-*-questions`
3. **Wizard fetches from DB** → Returns empty arrays

**Fix:** Execute the edge function seeders to populate the database with V1's canonical data.
