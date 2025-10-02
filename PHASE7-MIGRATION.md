# Phase 7: Frontend Migration to Generated React Query Hooks

## Overview
This phase migrates manual API calls to type-safe, auto-generated React Query hooks, providing better type safety, automatic caching, and improved developer experience.

## Prerequisites

### 1. Add NPM Scripts to package.json
Since `package.json` is managed automatically, you need to verify these scripts exist:

```json
{
  "scripts": {
    "contracts:generate": "cd contracts && chmod +x generate.sh && ./generate.sh",
    "contracts:build": "cd contracts && chmod +x build.sh && ./build.sh",
    "contracts:watch": "npm run contracts:build -- --watch"
  }
}
```

### 2. Generate Contract Hooks
Run these commands in order:

```bash
# Generate OpenAPI specification from Zod schemas
npm run contracts:generate

# Generate React Query hooks from OpenAPI spec
npm run contracts:build
```

This will create the following files:
- `packages/@contracts/clients/packs.ts`
- `packages/@contracts/clients/ai-testing.ts`
- `packages/@contracts/clients/professional-matching.ts`
- `packages/@contracts/clients/discovery-analytics.ts`
- `packages/@contracts/clients/user-inspector.ts`

## Migration Status

### ✅ Phase 6: Contract-First Architecture (Complete)
- [x] OpenAPI specification generator (`contracts/src/index.ts`)
- [x] Zod schema definitions
- [x] Orval configuration for React Query generation
- [x] Build scripts and automation

### 🚧 Phase 7: Component Migration (In Progress)

#### Components to Migrate

##### 1. PackImporter.tsx ⏳
**Current Implementation:**
```typescript
import { importPack } from '@/lib/api/questionPacks';

// Manual API call in event handler
await importPack({
  slug: microserviceDef.slug,
  content: microserviceDef,
  source: 'manual',
  status: 'approved',
});
```

**Target Implementation:**
```typescript
import { usePostAdminPacksImport } from '@contracts/clients/packs';

// React Query mutation hook
const { mutateAsync: importPack } = usePostAdminPacksImport();

// Usage remains similar but with automatic type safety
await importPack({
  data: {
    slug: microserviceDef.slug,
    content: microserviceDef,
    source: 'manual',
    status: 'approved',
  }
});
```

**Benefits:**
- Type-safe request/response
- Automatic cache invalidation
- Built-in loading/error states
- Optimistic updates support

##### 2. TestRunner.tsx ⏳
**Current Implementation:**
```typescript
import { aiTesting } from '@/lib/api/ai-testing';

const testResponse = await aiTesting.executeTests({
  testSuites: ['database', 'edge-functions'],
  includeI18n: false,
});
```

**Target Implementation:**
```typescript
import { usePostAdminAiTestingExecute } from '@contracts/clients/ai-testing';

const { mutateAsync: executeTests } = usePostAdminAiTestingExecute();

const testResponse = await executeTests({
  data: {
    testSuites: ['database', 'edge-functions'],
    includeI18n: false,
  }
});
```

##### 3. ProfessionalMatchModal.tsx ⏳
**Current Implementation:**
```typescript
import { professionalMatching } from '@/lib/api/professional-matching';

const response = await professionalMatching.matchProfessionals({
  jobRequirements: { title, description, skills: [] },
  location: 'general',
  budget: 1000,
  urgency: 'normal'
});
```

**Target Implementation:**
```typescript
import { usePostAdminProfessionalMatchingMatch } from '@contracts/clients/professional-matching';

const { mutateAsync: matchProfessionals } = usePostAdminProfessionalMatchingMatch();

const response = await matchProfessionals({
  data: {
    jobRequirements: { title, description, skills: [] },
    location: 'general',
    budget: 1000,
    urgency: 'normal'
  }
});
```

## Migration Benefits

### Type Safety
- **Before:** Manual type definitions that can drift from API
- **After:** Types auto-generated from OpenAPI spec, guaranteed to match backend

### Caching & Performance
- **Before:** No automatic caching, manual state management
- **After:** React Query handles caching, deduplication, and background refetching

### Error Handling
- **Before:** Manual try/catch in every component
- **After:** Centralized error handling with `onError` callbacks

### Loading States
- **Before:** Manual loading state management
- **After:** Automatic `isLoading`, `isPending`, `isSuccess`, `isError` flags

### Developer Experience
- **Before:** Import from multiple adapter files, inconsistent patterns
- **After:** Single import, consistent API across all endpoints

## Implementation Checklist

- [ ] Generate OpenAPI spec (`npm run contracts:generate`)
- [ ] Generate React Query hooks (`npm run contracts:build`)
- [ ] Verify generated files in `packages/@contracts/clients/`
- [ ] Migrate PackImporter.tsx
- [ ] Migrate TestRunner.tsx
- [ ] Migrate ProfessionalMatchModal.tsx
- [ ] Test all migrated components
- [ ] Update imports throughout codebase
- [ ] Mark old adapter files as deprecated
- [ ] Update documentation

## Rollback Plan

If migration causes issues:
1. Revert component changes (old adapter imports still work)
2. Keep generated hooks for gradual migration
3. Run tests to verify backwards compatibility

## Next Steps

After successful migration:
1. **Phase 8**: Deprecate old adapter files
2. **Phase 9**: Add integration tests for generated hooks
3. **Phase 10**: Extend to additional API endpoints

## References

- [PHASE6-SETUP.md](./PHASE6-SETUP.md) - Contract generation setup
- [contracts/README.md](./contracts/README.md) - Contract architecture
- [Orval Documentation](https://orval.dev/) - React Query generator
- [React Query Documentation](https://tanstack.com/query/latest) - Query library
