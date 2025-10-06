# Bundle Optimization Guide

## Overview

This guide covers bundle optimization strategies implemented in Phase 7 to reduce initial load times and improve performance.

## Code Splitting Strategy

### Route-Based Splitting

All major routes are lazy-loaded to reduce initial bundle size:

```typescript
// Automatic via React Router lazy loading
const Discovery = lazy(() => import('@/pages/Discovery'));
const PostJob = lazy(() => import('@/pages/PostJob'));
```

### Component-Level Splitting

Heavy components are split using the `LazyComponentLoader`:

```typescript
import { LazyComponentLoader } from '@/components/performance/LazyComponentLoader';

// Usage
<LazyComponentLoader 
  factory={() => import('./HeavyComponent')}
  fallback={<LoadingState />}
/>
```

## Preloading Strategy

### Route Preloading

Preload routes on hover for instant navigation:

```typescript
import { useRoutePreload } from '@/components/performance/BundleOptimizer';

const { handleMouseEnter } = useRoutePreload();

<Link 
  to="/discovery" 
  onMouseEnter={() => handleMouseEnter('/discovery')}
>
  Discovery
</Link>
```

### Dynamic Import Utilities

Centralized dynamic imports for heavy dependencies:

```typescript
import { importUtils } from '@/components/performance/BundleOptimizer';

// Load charts only when needed
const { BarChart } = await importUtils.loadCharts();
```

## Image Optimization

### OptimizedImage Component

Use the `OptimizedImage` component for automatic optimization:

```tsx
import { OptimizedImage } from '@/components/performance/OptimizedImage';

<OptimizedImage
  src="/large-image.jpg"
  alt="Description"
  priority={false} // lazy load by default
  fallback="/placeholder.svg"
/>
```

**Features:**
- Automatic lazy loading
- Loading states
- Error handling with fallbacks
- Priority loading for above-fold images

## PWA Features

### Service Worker

Service worker provides offline support and caching:

- **Precaching**: Critical assets cached on install
- **Runtime caching**: Network-first with cache fallback
- **Offline support**: Fallback to cached content

### Installation

Users can install the app as PWA:

```typescript
import { usePWA } from '@/hooks/usePWA';

const { isInstallable, promptInstall } = usePWA();

if (isInstallable) {
  <button onClick={promptInstall}>Install App</button>
}
```

### Manifest

App manifest in `public/manifest.json` provides:
- App name and icons
- Display mode (standalone)
- Theme colors
- Shortcuts to key features

## Bundle Analysis

### Development Monitoring

In development, bundle metrics are logged automatically:

```typescript
import { logBundleMetrics } from '@/components/performance/BundleOptimizer';

// Call after app loads
useEffect(() => {
  logBundleMetrics();
}, []);
```

### BundleAnalyzer Component

Visual bundle size monitor in development:

```tsx
import { BundleAnalyzer } from '@/components/performance/BundleOptimizer';

// Automatically shows in dev mode
<BundleAnalyzer />
```

## Best Practices

### 1. Lazy Load Heavy Dependencies

```typescript
// ❌ Direct import
import { HeavyChart } from 'recharts';

// ✅ Dynamic import
const loadChart = () => import('recharts').then(m => m.HeavyChart);
```

### 2. Use Route Preloading

```typescript
// Preload on hover for instant navigation
<Link 
  to="/heavy-page"
  onMouseEnter={() => preloadRoute('/heavy-page')}
>
```

### 3. Optimize Images

```typescript
// ✅ Use OptimizedImage
<OptimizedImage src="image.jpg" alt="..." priority={false} />

// ✅ Priority for above-fold
<OptimizedImage src="hero.jpg" alt="..." priority={true} />
```

### 4. Split by Feature

Keep feature-specific code in separate chunks:

```typescript
// Each dashboard loads independently
const ProfessionalDashboard = lazy(() => import('./ProfessionalDashboard'));
const ClientDashboard = lazy(() => import('./ClientDashboard'));
```

## Performance Targets

- **Initial Bundle**: < 400KB gzipped
- **Route Chunks**: < 100KB each
- **Time to Interactive**: < 3s on 3G
- **First Contentful Paint**: < 1.8s

## Monitoring

### Web Vitals

Automatically tracked via Phase 6 implementation:
- LCP (Largest Contentful Paint)
- FCP (First Contentful Paint)
- CLS (Cumulative Layout Shift)

### Bundle Size

Monitor bundle size in CI/CD:

```bash
# Build and analyze
npm run build
# Check dist/ folder size
du -sh dist/
```

## Troubleshooting

### Large Bundle Size

1. Check for duplicate dependencies
2. Analyze with `npm ls <package>`
3. Use dynamic imports for heavy libraries
4. Remove unused dependencies

### Slow Route Transitions

1. Enable route preloading
2. Check for blocking network requests
3. Optimize component mounting
4. Use React.memo for expensive renders

### Service Worker Issues

1. Clear browser cache
2. Unregister old service workers
3. Check console for SW errors
4. Test in incognito mode

## Next Steps

Future optimizations:
- Server-side rendering (SSR)
- Edge caching
- Image CDN integration
- Advanced compression (Brotli)
- HTTP/2 server push
