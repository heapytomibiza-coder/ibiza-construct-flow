# Contract-Generated React Query Hooks

This directory contains auto-generated React Query hooks from OpenAPI specifications.

## Overview

All hooks are generated using Orval from the OpenAPI spec defined in `contracts/openapi.yaml`. These hooks provide:

- **Type Safety**: Full TypeScript types from Zod schemas
- **React Query Integration**: Automatic caching, refetching, and state management
- **Consistent API**: Same interface across all API modules
- **Zero Manual Maintenance**: Re-generate when schemas change

## Available Clients

### Question Packs (`@contracts/clients/packs`)
```typescript
import { 
  useGetAdminPacks,
  usePostAdminPacksImport,
  usePostAdminPacksPackIdApprove 
} from '@contracts/clients/packs';

// List all packs
const { data: packs, isLoading } = useGetAdminPacks({
  query: { status: 'approved' }
});

// Import a pack
const { mutate: importPack } = usePostAdminPacksImport();
importPack({ 
  data: { content: packData, source: 'ai' } 
});
```

### AI Testing (`@contracts/clients/ai-testing`)
```typescript
import { 
  usePostAdminAiTestingGenerateQuestions,
  usePostAdminAiTestingEstimatePrice 
} from '@contracts/clients/ai-testing';

// Generate questions
const { mutate: generateQuestions } = usePostAdminAiTestingGenerateQuestions();
generateQuestions({ 
  data: { serviceType: 'plumbing', context: {} } 
});
```

### Professional Matching (`@contracts/clients/professional-matching`)
```typescript
import { 
  usePostAdminProfessionalMatchingMatch,
  usePostAdminProfessionalMatchingRank 
} from '@contracts/clients/professional-matching';

// Find matching professionals
const { mutate: matchPros } = usePostAdminProfessionalMatchingMatch();
matchPros({ 
  data: { 
    jobRequirements: { skills: ['plumbing'] },
    location: { lat: 40.7, lng: -74.0 }
  } 
});
```

### Discovery Analytics (`@contracts/clients/discovery-analytics`)
```typescript
import { 
  usePostAdminDiscoveryAnalyticsTrack,
  usePostAdminDiscoveryAnalyticsMetrics 
} from '@contracts/clients/discovery-analytics';

// Track event
const { mutate: trackEvent } = usePostAdminDiscoveryAnalyticsTrack();
trackEvent({ 
  data: { 
    eventType: 'search',
    sessionId: 'session-123',
    metadata: { query: 'plumber' }
  } 
});
```

### User Inspector (`@contracts/clients/user-inspector`)
```typescript
import { 
  useGetAdminUserInspectorUsers,
  useGetAdminUserInspectorProfileUserId,
  usePutAdminUserInspectorStatus 
} from '@contracts/clients/user-inspector';

// List users
const { data: users } = useGetAdminUserInspectorUsers({
  query: { limit: 50, role: 'admin' }
});

// Get user profile
const { data: profile } = useGetAdminUserInspectorProfileUserId({
  params: { userId: 'user-123' }
});

// Update user status
const { mutate: updateStatus } = usePutAdminUserInspectorStatus();
updateStatus({ 
  data: { userId: 'user-123', roles: ['admin', 'client'] } 
});
```

## Regenerating Hooks

When you update Zod schemas or API contracts:

```bash
# 1. Generate OpenAPI spec from Zod schemas
npm run contracts:generate

# 2. Generate React Query hooks from OpenAPI spec
npm run contracts:build
```

## Benefits Over Manual Hooks

| Feature | Manual Hooks | Generated Hooks |
|---------|-------------|-----------------|
| Type Safety | Manual types | Auto-generated from schemas |
| Consistency | Varies by developer | Uniform across all APIs |
| Maintenance | Manual updates needed | Regenerate on schema change |
| Cache Keys | Manual configuration | Auto-generated and optimized |
| Validation | Optional | Built-in Zod validation |
| Documentation | Manual | Auto-generated from OpenAPI |

## Migration from Manual API Calls

### Before (Manual)
```typescript
const [loading, setLoading] = useState(false);
const [data, setData] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await api.userInspector.listUsers({ limit: 50 });
      setData(result.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

### After (Generated Hook)
```typescript
const { data, isLoading, error } = useGetAdminUserInspectorUsers({
  query: { limit: 50 }
});
```

## Advanced Usage

### Dependent Queries
```typescript
// Wait for user profile before fetching jobs
const { data: profile } = useGetAdminUserInspectorProfileUserId({
  params: { userId }
});

const { data: jobs } = useGetAdminUserInspectorJobsUserId({
  params: { userId },
  query: { enabled: !!profile } // Only fetch when profile is loaded
});
```

### Mutations with Optimistic Updates
```typescript
const queryClient = useQueryClient();

const { mutate: updateStatus } = usePutAdminUserInspectorStatus({
  mutation: {
    onMutate: async (newData) => {
      // Optimistically update cache
      await queryClient.cancelQueries(['users']);
      const previous = queryClient.getQueryData(['users']);
      queryClient.setQueryData(['users'], (old) => ({
        ...old,
        data: old.data.map(u => 
          u.id === newData.userId ? { ...u, roles: newData.roles } : u
        )
      }));
      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['users'], context.previous);
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries(['users']);
    }
  }
});
```

### Custom Query Configuration
```typescript
const { data } = useGetAdminUserInspectorUsers({
  query: { 
    limit: 50,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 3
  }
});
```

## CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/contracts.yml
name: Validate Contracts
on: [push, pull_request]

jobs:
  contracts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run contracts:generate
      - run: npm run contracts:build
      - run: npm run typecheck
```

## Troubleshooting

### Hook not found after generation
- Ensure OpenAPI spec is up to date: `npm run contracts:generate`
- Check that the endpoint has correct tags in `contracts/src/index.ts`
- Verify Orval config includes the correct tag filter

### Type errors in generated hooks
- Regenerate OpenAPI spec: `npm run contracts:generate`
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Zod schema definitions match expected types

### Build fails during generation
- Ensure `openapi.yaml` exists (run `contracts:generate` first)
- Check TypeScript compilation: `npx tsc --noEmit`
- Verify all Zod schemas are properly exported

## Best Practices

1. **Always regenerate after schema changes**: Run both `contracts:generate` and `contracts:build`
2. **Use generated hooks exclusively**: Avoid mixing generated and manual API calls
3. **Leverage React Query features**: Use staleTime, cacheTime, and invalidation strategies
4. **Handle errors properly**: Always check `error` and `isError` from hooks
5. **Optimize queries**: Use `enabled` option for dependent queries
6. **Type everything**: Use TypeScript's inference with generated types

## Support

For issues or questions:
- Check [Orval documentation](https://orval.dev/)
- Review [React Query documentation](https://tanstack.com/query/latest)
- See [OpenAPI specification](https://swagger.io/specification/)
