# Performance Optimization Guide

## Overview

This guide covers the performance optimizations implemented in Phase 6, including database query optimization, frontend performance improvements, caching strategies, and monitoring tools.

## Table of Contents
1. [Database Optimization](#database-optimization)
2. [Frontend Performance](#frontend-performance)
3. [Caching Strategy](#caching-strategy)
4. [Lazy Loading](#lazy-loading)
5. [Performance Monitoring](#performance-monitoring)
6. [Best Practices](#best-practices)

## Database Optimization

### Strategic Indexes

The following indexes have been added for optimal query performance:

```sql
-- Jobs table
CREATE INDEX idx_jobs_status_created ON jobs(status, created_at DESC);
CREATE INDEX idx_jobs_client_status ON jobs(client_id, status);
CREATE INDEX idx_jobs_service_micro ON jobs(service_id, micro_slug);

-- Applications table
CREATE INDEX idx_applications_job_status ON applications(job_id, status);
CREATE INDEX idx_applications_professional_created ON applications(professional_id, created_at DESC);

-- Messages table
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_recipient_unread ON messages(recipient_id, read) WHERE read = false;

-- Contracts table
CREATE INDEX idx_contracts_client_tasker ON contracts(client_id, tasker_id);
CREATE INDEX idx_contracts_status ON contracts(status) WHERE status = 'active';
```

### Query Optimization Patterns

#### Use Query Keys for Consistent Caching

```typescript
import { queryKeys } from '@/lib/performance/queryOptimization';

// ✅ GOOD - Use query key factory
const { data } = useQuery({
  queryKey: queryKeys.job(jobId),
  queryFn: () => fetchJob(jobId)
});

// ❌ BAD - Inline query keys
const { data } = useQuery({
  queryKey: ['job', jobId],
  queryFn: () => fetchJob(jobId)
});
```

#### Batch Queries

```typescript
import { batchQuery } from '@/lib/performance/queryOptimization';

// Fetch multiple jobs efficiently
const jobs = await batchQuery(
  jobIds,
  (id) => fetchJob(id),
  10 // batch size
);
```

#### Optimistic Updates

```typescript
import { optimisticUpdate } from '@/lib/performance/queryOptimization';

const mutation = useMutation({
  mutationFn: updateJob,
  onMutate: async (newData) => {
    // Optimistically update
    const rollback = optimisticUpdate(
      queryClient,
      queryKeys.job(jobId),
      (old) => ({ ...old, ...newData })
    );
    
    return { rollback };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    context?.rollback();
  },
});
```

## Frontend Performance

### Code Splitting

Routes and heavy components are lazy-loaded to reduce initial bundle size:

```typescript
import { lazyLoad, LazyBoundary } from '@/lib/performance/lazyLoad';

// Lazy load a page
const JobsPage = lazyLoad(() => import('@/pages/Jobs'));

// Use in router
<Route path="/jobs" element={
  <LazyBoundary>
    <JobsPage />
  </LazyBoundary>
} />
```

### Preloading Components

Preload components on hover or before navigation:

```typescript
import { preloadComponent } from '@/lib/performance/lazyLoad';

<Link 
  to="/jobs"
  onMouseEnter={() => preloadComponent(() => import('@/pages/Jobs'))}
>
  View Jobs
</Link>
```

### React Optimization

#### Use Memo for Expensive Computations

```typescript
const sortedJobs = useMemo(
  () => jobs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
  [jobs]
);
```

#### Use Callback for Event Handlers

```typescript
const handleClick = useCallback((id: string) => {
  navigate(`/job/${id}`);
}, [navigate]);
```

#### Memoize Components

```typescript
const JobCard = memo(({ job }) => {
  return <Card>...</Card>;
}, (prev, next) => prev.job.id === next.job.id);
```

## Caching Strategy

### React Query Configuration

The app uses an optimized QueryClient with aggressive caching:

```typescript
import { createOptimizedQueryClient } from '@/lib/performance/queryOptimization';

const queryClient = createOptimizedQueryClient();
// - 5 minute stale time
// - 10 minute garbage collection
// - Automatic retries with exponential backoff
// - Window focus refetch
```

### Cache Times by Data Type

| Data Type | Stale Time | GC Time | Reason |
|-----------|-----------|---------|--------|
| User Profile | 10 min | 30 min | Changes infrequently |
| Jobs List | 2 min | 10 min | Semi-static, updated periodically |
| Messages | 30 sec | 5 min | Real-time, frequent updates |
| Services | 1 hour | 24 hours | Static catalogue data |
| Reviews | 5 min | 20 min | Infrequent updates |

### Custom Cache Configuration

```typescript
// Static data - cache longer
useQuery({
  queryKey: queryKeys.services(),
  queryFn: fetchServices,
  staleTime: 60 * 60 * 1000, // 1 hour
  gcTime: 24 * 60 * 60 * 1000, // 24 hours
});

// Real-time data - cache shorter
useQuery({
  queryKey: queryKeys.messages(conversationId),
  queryFn: () => fetchMessages(conversationId),
  staleTime: 30 * 1000, // 30 seconds
  refetchInterval: 30 * 1000, // Poll every 30s
});
```

## Lazy Loading

### Lazy Loading Images

```typescript
<img 
  src={imageUrl} 
  loading="lazy"
  alt="Description"
/>
```

### Intersection Observer for Components

```typescript
const LazyComponent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {isVisible ? <HeavyComponent /> : <Placeholder />}
    </div>
  );
};
```

## Performance Monitoring

### Web Vitals Tracking

Web Vitals are automatically tracked:

```typescript
import { initWebVitals } from '@/lib/performance/webVitals';

// In your app entry point
initWebVitals();
```

Tracked metrics:
- **CLS** (Cumulative Layout Shift): < 0.1 good
- **FID** (First Input Delay): < 100ms good
- **FCP** (First Contentful Paint): < 1.8s good
- **LCP** (Largest Contentful Paint): < 2.5s good
- **TTFB** (Time to First Byte): < 800ms good

### Custom Performance Measurements

```typescript
import { measureAsync } from '@/lib/performance/webVitals';

// Measure async operation
const data = await measureAsync('fetchJobs', async () => {
  return await fetchJobs();
});
// Logs: ⚡ fetchJobs: 234.56ms
```

### Performance Dashboard

Access the Performance Dashboard from Admin panel:
- Real-time performance metrics
- Core Web Vitals scores
- Optimization recommendations
- Resource utilization

## Best Practices

### 1. Database Queries

✅ **DO:**
- Use indexes for frequently queried columns
- Batch queries when fetching multiple records
- Use `.select()` to fetch only needed columns
- Implement pagination for large datasets

❌ **DON'T:**
- Fetch all columns when you only need a few
- Make N+1 queries (use joins or batch fetches)
- Query without indexes on large tables
- Load all records without pagination

### 2. React Components

✅ **DO:**
- Memoize expensive computations
- Use React.memo for pure components
- Implement virtualization for long lists
- Lazy load routes and heavy components

❌ **DON'T:**
- Create inline functions in JSX
- Render large lists without virtualization
- Import everything eagerly
- Skip memoization on expensive operations

### 3. Caching

✅ **DO:**
- Configure appropriate stale times
- Implement optimistic updates
- Prefetch data before navigation
- Cache static data aggressively

❌ **DON'T:**
- Use the same cache time for all data
- Skip optimistic updates for better UX
- Ignore prefetching opportunities
- Clear cache unnecessarily

### 4. Bundle Size

✅ **DO:**
- Code split by route
- Lazy load heavy dependencies
- Use tree-shaking
- Analyze bundle with tools

❌ **DON'T:**
- Import entire libraries when you need one function
- Bundle everything in main chunk
- Ignore bundle size warnings
- Add dependencies without checking size

## Performance Budget

Target metrics for optimal performance:

| Metric | Target | Max |
|--------|--------|-----|
| Initial Bundle | 300KB | 500KB |
| FCP | < 1.5s | 2.5s |
| LCP | < 2.0s | 3.5s |
| TTI | < 3.0s | 5.0s |
| CLS | < 0.05 | 0.1 |

## Monitoring in Production

### Setting Up Analytics

```typescript
// Send Web Vitals to your analytics service
import { initWebVitals } from '@/lib/performance/webVitals';

initWebVitals();
// Automatically sends to /api/analytics endpoint
```

### Debugging Performance Issues

1. **Use React DevTools Profiler**
   - Record component renders
   - Identify slow components
   - Check for unnecessary re-renders

2. **Use Chrome DevTools**
   - Performance tab for bottlenecks
   - Network tab for slow requests
   - Coverage tab for unused code

3. **Check React Query DevTools**
   - View cached queries
   - Check stale/fresh status
   - Inspect query timings

## Troubleshooting

### Slow Initial Load
- Check bundle size with `npm run build -- --stats`
- Enable code splitting for routes
- Lazy load heavy components
- Optimize images and assets

### Slow Query Performance
- Add database indexes
- Check for N+1 queries
- Implement query batching
- Use pagination

### Poor Web Vitals
- Reduce JavaScript bundle size
- Optimize images (WebP, lazy loading)
- Minimize layout shifts
- Defer non-critical CSS/JS

---

**Last Updated**: Phase 6 Implementation
**Related**: `docs/DEVELOPER_GUIDE.md`, `docs/DATABASE_SCHEMA.md`
