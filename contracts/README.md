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

### Next Steps:

1. Manually add the scripts above to your `package.json`
2. Run `npm run contracts:build` to regenerate contracts after schema changes
3. Apply this pattern to future admin features (Asker, Tasker, Website panels)
