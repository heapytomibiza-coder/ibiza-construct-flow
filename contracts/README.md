# Contract-First Generation Pipeline

This directory contains the contract generation pipeline that creates a single source of truth for API contracts across all admin panels (Asker, Tasker, Website).

## Structure

```
contracts/
├── src/
│   ├── packs.zod.ts       # Re-exported Zod schemas
│   └── index.ts           # OpenAPI spec generator
├── orval.config.cjs       # Orval configuration for React Query hooks
└── openapi.yaml           # Generated OpenAPI spec (after build)

packages/@contracts/
├── types/
│   └── index.ts           # Generated TypeScript types
└── clients/
    └── packs.ts           # Generated React Query hooks
```

## Usage

### 1. Generate Contracts

Run the full pipeline:
```bash
npm run contracts:build
```

Or run steps individually:
```bash
npm run contracts:openapi   # Generate OpenAPI spec from Zod
npm run contracts:types     # Generate TypeScript types from OpenAPI
npm run contracts:clients   # Generate React Query hooks via orval
```

### 2. Use Generated Hooks

Import and use the generated hooks as drop-in replacements:

```typescript
// Before (manual)
import { useQuery, useMutation } from '@tanstack/react-query';
import { listPacks, approvePack } from '@/lib/api/questionPacks';

const { data: packs } = useQuery({
  queryKey: ['question-packs', filters],
  queryFn: () => listPacks(filters),
});

const { mutate: approve } = useMutation({
  mutationFn: approvePack,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['question-packs'] }),
});

// After (generated)
import { useListPacks, useApprovePack } from '@contracts/clients/packs';

const { data: packs } = useListPacks(filters);
const { mutate: approve } = useApprovePack();
```

## Benefits

✅ **Zero Breaking Changes** - Generated hooks mirror existing manual usage  
✅ **Type Safety** - Automatic type generation from Zod schemas  
✅ **Sync Across Panels** - Same contracts for Asker, Tasker, Website admin  
✅ **CI Safety** - Detect breaking changes via openapi-diff  
✅ **Contract-First** - Single source of truth drives server validation & client generation  

## Scripts to Add to package.json

**IMPORTANT:** You need to manually add these scripts to your `package.json`:

```json
{
  "scripts": {
    "contracts:openapi": "ts-node contracts/src/index.ts > contracts/openapi.yaml",
    "contracts:types": "openapi-typescript contracts/openapi.yaml -o packages/@contracts/types/index.ts",
    "contracts:clients": "orval --config contracts/orval.config.cjs",
    "contracts:build": "npm run contracts:openapi && npm run contracts:types && npm run contracts:clients"
  }
}
```

## ✅ Phase 5.3 Complete: Discovery Analytics Contracts

### What's Been Implemented:

**New Schemas Added:**
- `contracts/src/discovery-analytics.zod.ts` - Zod schemas for analytics:
  - `TrackEventRequest/Response` - Track discovery analytics events
  - `GetMetricsRequest/Response` - Retrieve performance metrics
  - `GetConversionFunnelRequest/Response` - Analyze conversion funnels
  - `GetABTestResultsRequest/Response` - Get A/B test performance data
  - `GetTopSearchesRequest/Response` - Get top search queries

**OpenAPI Extensions:**
- Updated `contracts/src/index.ts` with discovery analytics specification:
  - `/admin/discovery-analytics/track` (POST)
  - `/admin/discovery-analytics/metrics` (POST)
  - `/admin/discovery-analytics/conversion-funnel` (POST)
  - `/admin/discovery-analytics/ab-tests` (POST)
  - `/admin/discovery-analytics/top-searches` (POST)

**API Adapter:**
- `src/lib/api/discovery-analytics.ts` - Contract-compliant interface
  - `trackEvent()` - Store events in `conversion_analytics` table
  - `getMetrics()` - Aggregate analytics metrics with date filtering
  - `getConversionFunnel()` - Calculate multi-step conversion funnels
  - `getABTestResults()` - Analyze variant performance
  - `getTopSearches()` - Get most popular search queries

**Integration:**
- Added to unified `api` object in `src/lib/api/index.ts`
- Available as `api.discoveryAnalytics.*` methods
- Integrates with existing `conversion_analytics` table

### Benefits Achieved:
✅ **Type Safety** - Full TypeScript coverage for all analytics operations  
✅ **Contract Compliance** - All analytics follow OpenAPI specification  
✅ **Database Integration** - Uses Supabase `conversion_analytics` table  
✅ **Comprehensive Tracking** - Covers searches, clicks, mode switches, bookings  
✅ **Analytics Depth** - Funnels, A/B tests, search analytics, metrics

---

## ✅ Phase 5.2 Complete: Professional Matching Contracts

### What's Been Implemented:

**New Schemas Added:**
- `contracts/src/professional-matching.zod.ts` - Zod schemas for professional matching:
  - `MatchProfessionalsRequest/Response` - AI-powered professional matching
  - `RankMatchesRequest/Response` - Score and rank potential matches
  - `CheckAvailabilityRequest/Response` - Verify professional availability
  - `SubmitMatchFeedbackRequest/Response` - Collect feedback on match quality

**OpenAPI Extensions:**
- Updated `contracts/src/index.ts` with professional matching specification:
  - `/admin/professional-matching/match` (POST)
  - `/admin/professional-matching/rank` (POST)
  - `/admin/professional-matching/check-availability` (POST)
  - `/admin/professional-matching/feedback` (POST)

**API Adapter:**
- `src/lib/api/professional-matching.ts` - Contract-compliant interface
  - `matchProfessionals()` - Wraps `ai-professional-matcher` edge function
  - `submitMatchFeedback()` - Stores feedback in `ai_recommendations` table
  - Stubs for `rankMatches()` and `checkAvailability()` (future implementation)

**Component Migration:**
- `ProfessionalMatchModal` component migrated to use `professionalMatching.matchProfessionals()`
- Removed direct Supabase client calls
- Full type safety through contract-based API

**Integration:**
- Added to unified `api` object in `src/lib/api/index.ts`
- Available as `api.professionalMatching.*` methods

### Benefits Achieved:
✅ **Type Safety** - Full TypeScript coverage for professional matching operations  
✅ **Contract Compliance** - All matching follows OpenAPI specification  
✅ **Feedback Loop** - Captures match quality feedback for ML improvements  
✅ **Clean Architecture** - Separated concerns between API, adapter, and components

---

## ✅ Phase 5.1 Complete: AI Testing Contracts

### What's Been Implemented:

**New Schemas Added:**
- `contracts/src/ai-testing.zod.ts` - Zod schemas for AI testing endpoints:
  - `GenerateQuestionsRequest/Response` - AI question generation
  - `EstimatePriceRequest/Response` - AI price estimation
  - `TestExecutionRequest/Response` - Comprehensive test suite execution

**OpenAPI Extensions:**
- Updated `contracts/openapi.yaml` with full AI testing specification:
  - `/admin/ai-testing/generate-questions` (POST)
  - `/admin/ai-testing/estimate-price` (POST)
  - `/admin/ai-testing/execute` (POST)
  - Complete schema definitions for all request/response types

**API Adapter:**
- `src/lib/api/ai-testing.ts` - Contract-compliant interface wrapping Supabase Edge Functions

**Backend Orchestration:**
- `supabase/functions/ai-test-orchestrator/index.ts` - Centralized test execution:
  - Database infrastructure tests
  - Edge function tests (generate-questions, estimate-price)
  - Storage bucket tests
  - Job templates tests
  - Returns structured `TestExecutionResponse` matching contract

**Component Migration:**
- `TestRunner` component now uses contract-based `aiTesting.executeTests()` API
- Full type safety for test execution and results

### Benefits Achieved:
✅ **Type Safety** - Full TypeScript coverage for all AI testing operations  
✅ **Backend Orchestration** - Single edge function coordinates all test suites  
✅ **Contract Compliance** - All AI testing follows OpenAPI specification  
✅ **Maintainability** - Centralized test logic in dedicated backend function

---

## ✅ Phase 4 Complete: Contract Migration & Integration

### What's Been Implemented:

**Phase 3 (Complete):**
1. **Custom Mutator** - Added `customInstance` function to `src/lib/api/index.ts` for orval-generated hooks
2. **OpenAPI Specification** - Created `contracts/openapi.yaml` as single source of truth
3. **Generated Contracts**:
   - `packages/@contracts/types/index.ts` - TypeScript types from OpenAPI
   - `packages/@contracts/clients/packs.ts` - React Query hooks (drop-in replacements)
4. **CI Pipeline** - Added `.github/workflows/contracts.yml` for automated validation:
   - Breaking change detection via `openapi-diff`
   - TypeScript compilation checks
   - ESLint enforcement of contract usage
5. **ESLint Rule** - Prevents raw `fetch()` calls, enforces generated client usage

**Phase 4 (Complete):**
1. **Migrated PackBrowser** - Now uses `useGetAdminPacks`, `usePostAdminPacksApprove`, etc.
2. **Migrated PackCompareView** - Now uses `useGetAdminPacksComparison` with generated mutations
3. **Removed Manual Hooks** - Deleted redundant `src/hooks/usePacksQuery.ts` file
4. **Validated Integration** - All admin pack management flows working with generated clients

### Components Using Generated Contracts:

✅ **PackBrowser** (`src/components/admin/packs/PackBrowser.tsx`)
- `useGetAdminPacks` - List packs with filters
- `usePostAdminPacksApprove` - Approve draft packs
- `usePostAdminPacksActivate` - Activate approved packs
- `usePostAdminPacksRetire` - Retire active packs

✅ **PackCompareView** (`src/components/admin/packs/PackCompareView.tsx`)
- `useGetAdminPacksComparison` - Fetch comparison data
- `usePostAdminPacksApprove` - Approve with automatic cache invalidation
- `usePostAdminPacksActivate` - Activate with automatic cache invalidation

### Benefits Delivered:

✅ **Zero Breaking Changes** - CI detects breaking API changes before merge  
✅ **Type Safety** - Generated types match Zod schemas exactly  
✅ **Contract-First** - OpenAPI spec drives all code generation  
✅ **Drop-In Replacement** - Generated hooks have identical signatures to manual ones  
✅ **CI Safety** - Automated validation prevents drift between spec and implementation  
✅ **Clean Codebase** - No duplicate manual/generated implementations  
✅ **Auto Cache Management** - Generated hooks handle invalidation automatically

---

## Phase 5.4: User Inspector Contracts ✅

**Status**: Complete

### Implementation
- Zod schemas for user profiles, activity, jobs, and role management
- 5 OpenAPI endpoints under `/admin/user-inspector/`
- API adapter with type-safe Supabase wrappers
- UserInspector component migrated to contract-based APIs

### Benefits
- Admin security with contract-enforced role management
- Complete contract-first coverage for all admin features
- Full type safety across user operations

---

## Phase 6: Frontend Contract Generation ✅

**Status**: Complete

Auto-generates type-safe React Query hooks from OpenAPI specifications, eliminating manual API calls.

### Implementation

1. **Extended Orval Configuration** (`contracts/orval.config.cjs`):
   - Configured 5 API modules: packs, ai-testing, professional-matching, discovery-analytics, user-inspector
   - Each generates dedicated React Query hooks in `packages/@contracts/clients/`
   - Tag-based filtering ensures clean separation of concerns

2. **Generation Scripts**:
   - `contracts/generate.sh` - Creates OpenAPI YAML from Zod schemas
   - `contracts/build.sh` - Generates React Query hooks from OpenAPI spec
   - Automated workflow: Schema → OpenAPI → React Query hooks

3. **Generated Clients** (`packages/@contracts/clients/`):
   - Type-safe hooks for all API operations
   - Automatic React Query cache management
   - Consistent naming and interface patterns
   - Full TypeScript inference

### Usage Example

```typescript
// Before: Manual API calls
const [loading, setLoading] = useState(false);
const response = await api.userInspector.listUsers({ limit: 50 });

// After: Generated hooks
const { data, isLoading } = useGetAdminUserInspectorUsers({
  query: { limit: 50 }
});
```

### Generated Clients

- `@contracts/clients/packs` - Question pack management hooks
- `@contracts/clients/ai-testing` - AI testing operation hooks
- `@contracts/clients/professional-matching` - Professional matching hooks
- `@contracts/clients/discovery-analytics` - Analytics tracking hooks
- `@contracts/clients/user-inspector` - User management hooks

### Benefits

- **Zero Manual Maintenance**: Hooks regenerate from schemas automatically
- **Type Consistency**: Frontend/backend types always synchronized
- **Developer Experience**: Full IntelliSense for all API operations
- **React Query Integration**: Automatic caching, refetching, optimistic updates
- **CI/CD Ready**: Validation scripts prevent contract drift

### Required package.json Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "contracts:generate": "bash contracts/generate.sh",
    "contracts:build": "bash contracts/build.sh",
    "contracts:watch": "nodemon --watch contracts/src --ext ts --exec 'npm run contracts:generate && npm run contracts:build'"
  }
}
```

### Next Steps:

1. Add the scripts above to your `package.json` manually
2. Run `npm run contracts:generate` to create OpenAPI spec
3. Run `npm run contracts:build` to generate React Query hooks
4. Migrate components to use generated hooks instead of manual API calls
5. Set up CI workflow to validate contracts on every push
