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

Add these scripts to your `package.json`:

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

## Next Steps

1. Run `npm run contracts:build` to generate initial contracts
2. Gradually replace manual hooks with generated ones in admin components
3. Add CI pipeline to detect breaking changes (Phase 3)
