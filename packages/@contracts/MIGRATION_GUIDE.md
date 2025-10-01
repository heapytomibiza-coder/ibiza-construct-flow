# Migration Guide: Manual API Calls → Generated Hooks

This guide shows how to migrate from manual API calls to auto-generated React Query hooks.

## Prerequisites

1. Add scripts to `package.json`:
```json
{
  "scripts": {
    "contracts:generate": "bash contracts/generate.sh",
    "contracts:build": "bash contracts/build.sh"
  }
}
```

2. Generate hooks:
```bash
npm run contracts:generate  # Creates openapi.yaml
npm run contracts:build     # Generates React Query hooks
```

## Migration Patterns

### Pattern 1: Simple Data Fetching

#### Before (Manual)
```typescript
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.userInspector.listUsers({ limit: 50 });
        if (response.success) {
          setUsers(response.data);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.full_name}</div>
      ))}
    </div>
  );
};
```

#### After (Generated Hook)
```typescript
import { useGetAdminUserInspectorUsers } from '@contracts/clients/user-inspector';

const UserList = () => {
  const { data, isLoading, error } = useGetAdminUserInspectorUsers({
    query: { limit: 50 }
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.data?.map(user => (
        <div key={user.id}>{user.full_name}</div>
      ))}
    </div>
  );
};
```

**Benefits**: 15 lines → 7 lines, automatic caching, automatic refetching

---

### Pattern 2: Mutations with State Updates

#### Before (Manual)
```typescript
const UserInspector = () => {
  const [users, setUsers] = useState([]);
  const { toast } = useToast();

  const promoteToAdmin = async (userId: string, currentRoles: string[]) => {
    try {
      const updatedRoles = [...currentRoles, 'admin'];
      const response = await api.userInspector.updateUserStatus({
        userId,
        roles: updatedRoles,
      });

      if (response.success) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? response.data : user
        ));
        toast({ title: "User promoted" });
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  return (
    <Button onClick={() => promoteToAdmin(user.id, user.roles)}>
      Promote
    </Button>
  );
};
```

#### After (Generated Hook)
```typescript
import { usePutAdminUserInspectorStatus } from '@contracts/clients/user-inspector';
import { useQueryClient } from '@tanstack/react-query';

const UserInspector = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: promoteToAdmin } = usePutAdminUserInspectorStatus({
    mutation: {
      onSuccess: (response) => {
        queryClient.invalidateQueries(['admin-user-inspector-users']);
        toast({ title: "User promoted" });
      },
      onError: (error) => {
        toast({ 
          title: "Error", 
          description: error.message,
          variant: "destructive" 
        });
      }
    }
  });

  return (
    <Button onClick={() => promoteToAdmin({ 
      data: { 
        userId: user.id, 
        roles: [...user.roles, 'admin'] 
      } 
    })}>
      Promote
    </Button>
  );
};
```

**Benefits**: Automatic cache invalidation, optimistic updates, error handling

---

### Pattern 3: Dependent Queries

#### Before (Manual)
```typescript
const UserDetails = ({ userId }: { userId: string }) => {
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      const response = await api.userInspector.getUserProfile({ userId });
      setProfile(response.data);
    };
    fetchProfile();
  }, [userId]);

  useEffect(() => {
    if (!profile) return;

    const fetchJobs = async () => {
      const response = await api.userInspector.getUserJobs({ userId });
      setJobs(response.data);
    };

    const fetchActivity = async () => {
      const response = await api.userInspector.getUserActivity({ userId });
      setActivity(response.data);
    };

    fetchJobs();
    fetchActivity();
  }, [profile, userId]);

  return (
    <div>
      <h2>{profile?.full_name}</h2>
      <JobsList jobs={jobs} />
      <ActivityLog activity={activity} />
    </div>
  );
};
```

#### After (Generated Hooks)
```typescript
import { 
  useGetAdminUserInspectorProfileUserId,
  useGetAdminUserInspectorJobsUserId,
  useGetAdminUserInspectorActivityUserId 
} from '@contracts/clients/user-inspector';

const UserDetails = ({ userId }: { userId: string }) => {
  const { data: profileData } = useGetAdminUserInspectorProfileUserId({
    params: { userId }
  });

  const { data: jobsData } = useGetAdminUserInspectorJobsUserId({
    params: { userId },
    query: { enabled: !!profileData?.data }
  });

  const { data: activityData } = useGetAdminUserInspectorActivityUserId({
    params: { userId },
    query: { enabled: !!profileData?.data, limit: 20 }
  });

  return (
    <div>
      <h2>{profileData?.data?.full_name}</h2>
      <JobsList jobs={jobsData?.data} />
      <ActivityLog activity={activityData?.data} />
    </div>
  );
};
```

**Benefits**: Parallel fetching, automatic dependency management, less code

---

### Pattern 4: Real-time Updates with Polling

#### Before (Manual)
```typescript
const AnalyticsDashboard = () => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      const response = await api.discoveryAnalytics.getMetrics({
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      });
      setMetrics(response.data);
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Poll every 30s

    return () => clearInterval(interval);
  }, []);

  return <MetricsChart data={metrics} />;
};
```

#### After (Generated Hook with Polling)
```typescript
import { usePostAdminDiscoveryAnalyticsMetrics } from '@contracts/clients/discovery-analytics';

const AnalyticsDashboard = () => {
  const { data } = usePostAdminDiscoveryAnalyticsMetrics({
    data: {
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    }
  }, {
    query: {
      refetchInterval: 30000, // Auto-refetch every 30s
      refetchIntervalInBackground: true
    }
  });

  return <MetricsChart data={data?.data} />;
};
```

**Benefits**: Built-in polling, background refetching, automatic cleanup

---

### Pattern 5: Optimistic Updates

#### After (Generated Hook with Optimistic UI)
```typescript
import { usePutAdminUserInspectorStatus } from '@contracts/clients/user-inspector';
import { useQueryClient } from '@tanstack/react-query';

const UserRoleToggle = ({ user }) => {
  const queryClient = useQueryClient();

  const { mutate: updateRoles } = usePutAdminUserInspectorStatus({
    mutation: {
      onMutate: async (newData) => {
        // Cancel outgoing queries
        await queryClient.cancelQueries(['admin-user-inspector-users']);

        // Snapshot current value
        const previous = queryClient.getQueryData(['admin-user-inspector-users']);

        // Optimistically update UI
        queryClient.setQueryData(['admin-user-inspector-users'], (old) => ({
          ...old,
          data: old.data.map(u => 
            u.id === newData.userId 
              ? { ...u, roles: newData.roles }
              : u
          )
        }));

        return { previous };
      },
      onError: (err, variables, context) => {
        // Rollback on error
        queryClient.setQueryData(
          ['admin-user-inspector-users'], 
          context.previous
        );
      },
      onSettled: () => {
        // Refetch to ensure sync
        queryClient.invalidateQueries(['admin-user-inspector-users']);
      }
    }
  });

  return (
    <Switch 
      checked={user.roles.includes('admin')}
      onCheckedChange={(checked) => {
        const newRoles = checked 
          ? [...user.roles, 'admin']
          : user.roles.filter(r => r !== 'admin');
        
        updateRoles({ data: { userId: user.id, roles: newRoles } });
      }}
    />
  );
};
```

**Benefits**: Instant UI feedback, automatic rollback on error, eventual consistency

---

## Common Migration Scenarios

### Admin Dashboard
- **Before**: Multiple useState, useEffect, manual error handling
- **After**: Single hook per resource, automatic loading/error states
- **Complexity Reduction**: ~60% less code

### User Management
- **Before**: Manual state updates after mutations
- **After**: Automatic cache invalidation, optimistic updates
- **Reliability**: Cache always in sync

### Analytics & Metrics
- **Before**: Manual polling with setInterval
- **After**: Built-in refetchInterval with background updates
- **Performance**: Automatic request deduplication

### Form Submissions
- **Before**: Manual loading states, error handling, success callbacks
- **After**: Generated mutation hooks with built-in states
- **User Experience**: Consistent error/success handling

---

## Checklist for Each Component

- [ ] Identify all manual API calls
- [ ] Find corresponding generated hook
- [ ] Replace useState + useEffect with hook
- [ ] Update error handling to use hook's error state
- [ ] Add cache invalidation after mutations
- [ ] Test loading, success, and error states
- [ ] Remove unused manual API imports
- [ ] Verify type safety (no `any` types)

---

## Best Practices

1. **Always use generated hooks over manual API calls**
   ```typescript
   // ❌ Don't
   const response = await api.userInspector.listUsers();
   
   // ✅ Do
   const { data } = useGetAdminUserInspectorUsers();
   ```

2. **Leverage React Query features**
   ```typescript
   const { data, isLoading, error, refetch } = useGetAdminUserInspectorUsers({
     query: {
       staleTime: 5 * 60 * 1000, // 5 min
       cacheTime: 10 * 60 * 1000, // 10 min
       refetchOnWindowFocus: true
     }
   });
   ```

3. **Invalidate caches after mutations**
   ```typescript
   const { mutate } = usePutAdminUserInspectorStatus({
     mutation: {
       onSuccess: () => {
         queryClient.invalidateQueries(['admin-user-inspector-users']);
       }
     }
   });
   ```

4. **Use enabled for dependent queries**
   ```typescript
   const { data: jobs } = useGetAdminUserInspectorJobsUserId({
     params: { userId },
     query: { enabled: !!userId }
   });
   ```

---

## Troubleshooting

### Hook not updating after mutation
**Solution**: Invalidate query cache
```typescript
queryClient.invalidateQueries(['admin-user-inspector-users']);
```

### Stale data after navigation
**Solution**: Configure staleTime
```typescript
const { data } = useGetAdminUserInspectorUsers({
  query: { staleTime: 0 } // Always fresh
});
```

### Multiple identical requests
**Solution**: React Query deduplicates automatically, no action needed

### Type errors with response data
**Solution**: Check OpenAPI spec is up to date
```bash
npm run contracts:generate
npm run contracts:build
```

---

## Support

For questions or issues:
- Review [React Query docs](https://tanstack.com/query/latest)
- Check [Orval documentation](https://orval.dev/)
- See generated client README at `packages/@contracts/README.md`
