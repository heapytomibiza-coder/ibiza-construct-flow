# Performance Optimizations

This document outlines the performance strategies implemented in the Ibiza Build Flow platform.

## React Query Optimizations

### 1. Optimistic Updates

Optimistic updates provide instant feedback by updating the UI before the server responds, then rolling back if the operation fails.

**Example: Applicant Status Updates**
```typescript
import { useOptimisticApplicants } from '@/hooks/useOptimisticApplicants';

const { applicants, updateApplicantStatus } = useOptimisticApplicants(jobId);

// This updates the UI instantly, then syncs with server
await updateApplicantStatus('applicant-123', 'shortlisted');
```

**How it works:**
1. User triggers action (e.g., drag applicant to new column)
2. UI updates immediately (optimistic)
3. API request sent in background
4. If successful: UI stays as-is
5. If failed: UI rolls back + shows error

### 2. Prefetching on Hover

Load data before users click, improving perceived performance.

**Basic Usage:**
```typescript
import { usePrefetchOnHover } from '@/hooks/usePrefetchOnHover';
import { prefetchApplicants } from '@/hooks/useOptimisticApplicants';

const { prefetchOnHover } = usePrefetchOnHover();

<Link 
  to={`/job/${jobId}/applicants`}
  {...prefetchOnHover(prefetchApplicants, jobId)}
>
  View Applicants
</Link>
```

**Benefits:**
- Data loads while user's mouse moves toward link
- By the time they click, data is cached
- Page appears to load instantly
- Works with both mouse hover and keyboard focus

### 3. Image Caching & Lazy Loading

Optimize attachment loading with thumbnails and lazy loading.

**Thumbnail Generation:**
```typescript
import { getThumbnailUrl } from '@/utils/imageCache';

// Generate 200x200 thumbnail
const thumbnail = getThumbnailUrl(fullImageUrl, 200, 200);

<img 
  src={thumbnail} 
  data-full-src={fullImageUrl}
  loading="lazy"
  alt="Attachment"
/>
```

**Lazy Loading:**
```typescript
import { lazyLoadImage } from '@/utils/imageCache';

const imgRef = useRef<HTMLImageElement>(null);

useEffect(() => {
  if (imgRef.current) {
    const cleanup = lazyLoadImage(
      imgRef.current,
      fullImageUrl,
      thumbnailUrl
    );
    return cleanup;
  }
}, [fullImageUrl, thumbnailUrl]);

<img 
  ref={imgRef}
  alt="Attachment"
  className="opacity-0 transition-opacity loaded:opacity-100"
/>
```

**Batch Preloading:**
```typescript
import { batchPreloadImages } from '@/utils/imageCache';

// Preload all images in a gallery
await batchPreloadImages([img1, img2, img3, img4]);
```

### 4. Query Configuration

Optimal React Query settings for the platform:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
      placeholderData: (previousData) => previousData, // Smooth transitions
    },
    mutations: {
      retry: 0, // Don't retry failed mutations
      networkMode: 'online',
    },
  },
});
```

**Key settings:**
- `staleTime`: How long data is fresh (5 min)
- `gcTime`: How long unused data stays in cache (30 min)
- `placeholderData`: Show previous data while refetching
- `retry: 1`: Retry failed requests once

## Real-time Updates

Combine React Query with Supabase real-time for efficient updates.

**Pattern:**
```typescript
// Initial fetch via React Query
const { data } = useQuery({
  queryKey: ['applicants', jobId],
  queryFn: fetchApplicants,
});

// Real-time updates invalidate cache
useEffect(() => {
  const channel = supabase
    .channel(`applicants:${jobId}`)
    .on('postgres_changes', { /* ... */ }, () => {
      queryClient.invalidateQueries(['applicants', jobId]);
    })
    .subscribe();

  return () => channel.unsubscribe();
}, [jobId]);
```

**Benefits:**
- React Query handles caching
- Real-time for instant updates
- Efficient: Only invalidates when needed
- Works offline with cached data

## Route Prefetching

Prefetch next likely routes for instant navigation.

**Example: Wizard Steps**
```typescript
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// When mounting step 2, prefetch step 3 data
useEffect(() => {
  if (currentStep === 2) {
    queryClient.prefetchQuery({
      queryKey: ['wizard-step', 3],
      queryFn: () => fetchStepData(3),
    });
  }
}, [currentStep]);
```

## Bundle Size Optimization

### Code Splitting

Dynamic imports for large components:

```typescript
// Before: Loaded on initial page load
import HeavyComponent from './HeavyComponent';

// After: Loaded only when needed
const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<Skeleton />}>
  <HeavyComponent />
</Suspense>
```

### Tree Shaking

Ensure imports don't pull in entire libraries:

```typescript
// ❌ Bad: Imports entire lodash
import _ from 'lodash';

// ✅ Good: Imports only needed function
import debounce from 'lodash/debounce';
```

## Network Optimizations

### Request Batching

Batch multiple requests when possible:

```typescript
// ❌ Bad: 3 separate requests
const job = await fetchJob(jobId);
const applicants = await fetchApplicants(jobId);
const offers = await fetchOffers(jobId);

// ✅ Good: 1 combined request
const { job, applicants, offers } = await fetchJobDetails(jobId);
```

### Parallel Queries

Use `useQueries` for parallel fetching:

```typescript
const results = useQueries({
  queries: [
    { queryKey: ['job', jobId], queryFn: () => fetchJob(jobId) },
    { queryKey: ['applicants', jobId], queryFn: () => fetchApplicants(jobId) },
    { queryKey: ['offers', jobId], queryFn: () => fetchOffers(jobId) },
  ],
});
```

## Memory Management

### Cache Size Limits

Monitor and manage cache size:

```typescript
import { getCacheStats, clearThumbnailCache } from '@/utils/imageCache';

// Check cache size
const stats = getCacheStats();
console.log(`Thumbnails: ${stats.thumbnails}, Images: ${stats.fullImages}`);

// Clear when needed (e.g., on route change)
clearThumbnailCache();
```

### Garbage Collection

React Query automatically removes unused data after `gcTime` (30 minutes).

## Mobile-Specific Optimizations

### Touch Feedback

Instant visual feedback for better perceived performance:

```css
.interactive-button {
  @apply active:scale-95 transition-transform duration-micro;
}
```

### Reduce Network Requests

- Longer `staleTime` on mobile (10 min vs 5 min)
- Aggressive prefetching on Wi-Fi
- Cache-first strategy on cellular

### Image Optimization

- Serve WebP format when supported
- Smaller image sizes for mobile
- Lazy load below-the-fold images

## Monitoring

### Performance Metrics

Track key metrics:

```typescript
// Web Vitals
import { onCLS, onFID, onLCP } from 'web-vitals';

onCLS(console.log); // Cumulative Layout Shift
onFID(console.log); // First Input Delay
onLCP(console.log); // Largest Contentful Paint
```

### React Query DevTools

Enable in development:

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

## Best Practices Checklist

- [ ] Use optimistic updates for instant feedback
- [ ] Prefetch on hover for likely navigation
- [ ] Lazy load images with thumbnails
- [ ] Batch API requests when possible
- [ ] Use placeholderData for smooth transitions
- [ ] Implement proper error boundaries
- [ ] Monitor bundle size regularly
- [ ] Test on real mobile devices
- [ ] Set appropriate staleTime for each query
- [ ] Use proper loading states
- [ ] Implement request cancellation
- [ ] Clear caches appropriately

## Performance Budget

Target metrics:
- **Initial Load**: < 3s on 3G
- **Time to Interactive**: < 5s on 3G
- **First Contentful Paint**: < 1.5s
- **Bundle Size**: < 200KB gzipped
- **Lighthouse Score**: > 90

## Common Pitfalls

### ❌ Over-fetching
```typescript
// Fetching entire user object when only need name
const { user } = useUser();
return user.name;
```

### ✅ Selective Fetching
```typescript
// Fetch only needed fields
const { data: userName } = useQuery(['user-name', userId], 
  () => fetchUserName(userId)
);
```

### ❌ No Loading States
```typescript
// Content pops in abruptly
{data && <Content data={data} />}
```

### ✅ Smooth Loading
```typescript
// Show skeleton while loading
{isLoading ? <Skeleton /> : <Content data={data} />}
```

## Resources

- [React Query Best Practices](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- [Web Vitals](https://web.dev/vitals/)
- [Image Optimization](https://web.dev/fast/#optimize-your-images)
- [Bundle Size Analysis](https://bundlephobia.com/)
