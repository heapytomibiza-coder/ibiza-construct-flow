# Phase 6 Implementation Guide

## Prerequisites Complete ✅

The following files have been created:
- ✅ `contracts/orval.config.cjs` - Extended configuration for 5 API modules
- ✅ `contracts/generate.sh` - OpenAPI generation script
- ✅ `contracts/build.sh` - React Query hooks generation script
- ✅ `packages/@contracts/README.md` - Full documentation
- ✅ `packages/@contracts/MIGRATION_GUIDE.md` - Migration examples

## Step 1: Add NPM Scripts

**You must manually add these scripts to your `package.json`:**

```json
{
  "scripts": {
    "contracts:generate": "bash contracts/generate.sh",
    "contracts:build": "bash contracts/build.sh",
    "contracts:watch": "nodemon --watch contracts/src --ext ts --exec 'npm run contracts:generate && npm run contracts:build'"
  }
}
```

## Step 2: Make Scripts Executable

Run in your terminal:
```bash
chmod +x contracts/generate.sh
chmod +x contracts/build.sh
```

## Step 3: Generate OpenAPI Specification

Run:
```bash
npm run contracts:generate
```

This will:
- Execute `contracts/src/index.ts`
- Generate `contracts/openapi.yaml` from Zod schemas
- Output the complete OpenAPI 3.1 specification

**Expected output:**
```
📝 Generating OpenAPI specification from Zod schemas...
✅ OpenAPI spec generated successfully at contracts/openapi.yaml
```

## Step 4: Generate React Query Hooks

Run:
```bash
npm run contracts:build
```

This will generate 5 client files:
- `packages/@contracts/clients/packs.ts`
- `packages/@contracts/clients/ai-testing.ts`
- `packages/@contracts/clients/professional-matching.ts`
- `packages/@contracts/clients/discovery-analytics.ts`
- `packages/@contracts/clients/user-inspector.ts`

**Expected output:**
```
🔧 Generating React Query hooks from OpenAPI spec...
Generating Question Packs client...
Generating AI Testing client...
Generating Professional Matching client...
Generating Discovery Analytics client...
Generating User Inspector client...
✅ All React Query hooks generated successfully!
```

## Step 5: Verify Generated Hooks

Check that these files exist:
```bash
ls -la packages/@contracts/clients/
```

You should see:
```
packs.ts
ai-testing.ts
professional-matching.ts
discovery-analytics.ts
user-inspector.ts
```

## Step 6: Use Generated Hooks

### Example: User Inspector

**Before (manual API call):**
```typescript
import { api } from '@/lib/api';
import { useEffect, useState } from 'react';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.userInspector.listUsers({ limit: 50 })
      .then(res => setUsers(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  return <div>{users.map(u => <div key={u.id}>{u.full_name}</div>)}</div>;
};
```

**After (generated hook):**
```typescript
import { useGetAdminUserInspectorUsers } from '@contracts/clients/user-inspector';

const UserList = () => {
  const { data, isLoading } = useGetAdminUserInspectorUsers({
    query: { limit: 50 }
  });

  if (isLoading) return <div>Loading...</div>;
  return <div>{data?.data?.map(u => <div key={u.id}>{u.full_name}</div>)}</div>;
};
```

## Step 7: Migration Checklist

For each admin component:

1. **UserInspector Component**
   - [ ] Replace `api.userInspector.listUsers` with `useGetAdminUserInspectorUsers`
   - [ ] Replace `api.userInspector.updateUserStatus` with `usePutAdminUserInspectorStatus`
   - [ ] Add query invalidation after mutations
   - [ ] Remove manual state management

2. **DiscoveryAnalyticsDashboard Component**
   - [ ] Replace `api.discoveryAnalytics.getMetrics` with `usePostAdminDiscoveryAnalyticsMetrics`
   - [ ] Replace `api.discoveryAnalytics.getConversionFunnel` with `usePostAdminDiscoveryAnalyticsConversionFunnel`
   - [ ] Add polling with `refetchInterval`
   - [ ] Remove manual state management

3. **PackBrowser Component**
   - [ ] Replace `api.packs.list` with `useGetAdminPacks`
   - [ ] Replace `api.packs.approve` with `usePostAdminPacksPackIdApprove`
   - [ ] Add optimistic updates
   - [ ] Remove manual state management

4. **AIPanel Component**
   - [ ] Replace `api.aiTesting.generateQuestions` with `usePostAdminAiTestingGenerateQuestions`
   - [ ] Replace `api.aiTesting.estimatePrice` with `usePostAdminAiTestingEstimatePrice`
   - [ ] Add mutation callbacks
   - [ ] Remove manual state management

5. **ProfessionalMatchModal Component**
   - [ ] Replace `api.professionalMatching.matchProfessionals` with `usePostAdminProfessionalMatchingMatch`
   - [ ] Replace `api.professionalMatching.rankMatches` with `usePostAdminProfessionalMatchingRank`
   - [ ] Add loading states
   - [ ] Remove manual state management

## Step 8: Setup CI/CD Validation

Create `.github/workflows/contracts-validation.yml`:

```yaml
name: Validate Contracts
on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  validate-contracts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Generate OpenAPI spec
        run: npm run contracts:generate
        
      - name: Generate React Query hooks
        run: npm run contracts:build
        
      - name: Type check
        run: npx tsc --noEmit
        
      - name: Check for uncommitted changes
        run: |
          if [[ -n $(git status -s) ]]; then
            echo "❌ Generated files are out of sync. Run 'npm run contracts:generate && npm run contracts:build'"
            git diff
            exit 1
          fi
          echo "✅ All generated files are up to date"
```

## Troubleshooting

### Error: "openapi.yaml not found"
**Solution:** Run `npm run contracts:generate` first

### Error: "Permission denied" on scripts
**Solution:** Run `chmod +x contracts/generate.sh contracts/build.sh`

### Error: Type errors in generated hooks
**Solution:** 
1. Regenerate OpenAPI spec: `npm run contracts:generate`
2. Clear node_modules: `rm -rf node_modules packages/@contracts/clients && npm install`
3. Regenerate hooks: `npm run contracts:build`

### Hook not found after generation
**Solution:** 
1. Check the endpoint has correct tags in `contracts/src/index.ts`
2. Verify Orval config includes the tag filter
3. Check the generated file exists in `packages/@contracts/clients/`

## Expected File Structure After Setup

```
project/
├── contracts/
│   ├── src/
│   │   ├── index.ts                    # OpenAPI generator
│   │   ├── packs.zod.ts               # Existing schemas
│   │   ├── ai-testing.zod.ts          # AI testing schemas
│   │   ├── professional-matching.zod.ts
│   │   ├── discovery-analytics.zod.ts
│   │   └── user-inspector.zod.ts
│   ├── openapi.yaml                    # Generated OpenAPI spec ⬅️
│   ├── orval.config.cjs               # Extended Orval config
│   ├── generate.sh                    # Generation script
│   └── build.sh                       # Build script
├── packages/
│   └── @contracts/
│       ├── clients/
│       │   ├── packs.ts               # Generated hooks ⬅️
│       │   ├── ai-testing.ts          # Generated hooks ⬅️
│       │   ├── professional-matching.ts # Generated hooks ⬅️
│       │   ├── discovery-analytics.ts # Generated hooks ⬅️
│       │   └── user-inspector.ts      # Generated hooks ⬅️
│       ├── README.md
│       └── MIGRATION_GUIDE.md
└── src/
    └── lib/
        └── api/
            └── index.ts               # Custom fetch instance
```

## Success Criteria

✅ Scripts added to package.json
✅ OpenAPI spec generated at `contracts/openapi.yaml`
✅ 5 client files generated in `packages/@contracts/clients/`
✅ No TypeScript errors in generated files
✅ Hooks import successfully in components
✅ CI workflow validates contracts on every push

## Next Steps After Implementation

1. **Update tsconfig.json** to add path alias:
```json
{
  "compilerOptions": {
    "paths": {
      "@contracts/*": ["./packages/@contracts/*"]
    }
  }
}
```

2. **Start migrating components** using the patterns in `MIGRATION_GUIDE.md`

3. **Set up watch mode** during development:
```bash
npm run contracts:watch
```

This will automatically regenerate hooks when schemas change.

## Support

- Full documentation: `packages/@contracts/README.md`
- Migration examples: `packages/@contracts/MIGRATION_GUIDE.md`
- Orval docs: https://orval.dev/
- React Query docs: https://tanstack.com/query/latest
