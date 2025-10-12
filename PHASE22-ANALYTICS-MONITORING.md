# Phase 22: Advanced Analytics & Monitoring System

## Overview
Complete analytics and monitoring system with performance tracking, error reporting, user behavior analytics, and real-time metrics collection.

## Features Implemented

### 1. Core Analytics System
- **Event Tracking**: Custom event tracking with priorities and metadata
- **Session Management**: Automatic session tracking with 30-minute timeout
- **Event Buffering**: Efficient batching and transmission of events
- **Provider System**: Pluggable analytics provider architecture

### 2. Performance Monitoring
- **Web Vitals Tracking**:
  - First Contentful Paint (FCP)
  - Largest Contentful Paint (LCP)
  - First Input Delay (FID)
  - Cumulative Layout Shift (CLS)
  - Time to First Byte (TTFB)
- **Custom Metrics**:
  - DOM ready time
  - Window load time
  - API response times
  - Component render times

### 3. Error Tracking
- **Global Error Handling**: Automatic capture of unhandled errors
- **Promise Rejection Tracking**: Catches unhandled promise rejections
- **Context-Aware Reporting**: Include component and action context
- **Severity Levels**: Info, warning, error, fatal classifications
- **React Integration**: Error boundary component

### 4. User Behavior Analytics
- **Automatic Page View Tracking**: SPA-aware page tracking
- **User Identification**: Track authenticated users
- **Conversion Tracking**: Goal-based conversion events
- **Session Analytics**: Duration, page views, events per session
- **Device Information**: OS, browser, viewport, device type

### 5. React Integration
- **Hooks**:
  - `useAnalytics`: Main analytics hook
  - `usePageTracking`: Automatic page view tracking
  - `useErrorTracking`: Error tracking integration
  - `usePerformanceTracking`: Component performance monitoring
- **Components**:
  - `AnalyticsProvider`: Initialize and configure analytics
  - `ErrorBoundary`: Catch and report React errors

## Architecture

### Event Flow
```
User Action → Analytics Manager → Event Buffer → Providers → Backend
                    ↓
              Session Manager
              Performance Monitor
              Error Tracker
```

### Components

#### AnalyticsManager
Central hub for all analytics operations:
- Manages providers
- Buffers events
- Tracks sessions
- Monitors performance
- Reports errors

#### EventBuffer
Batches events for efficient transmission:
- Configurable buffer size
- Auto-flush on interval
- Priority-based flushing
- Retry logic

#### SessionManager
Tracks user sessions:
- 30-minute timeout
- Device fingerprinting
- Entry/exit pages
- Activity monitoring

#### PerformanceMonitor
Collects performance metrics:
- Uses Performance Observer API
- Tracks Web Vitals
- Custom metric support
- Automatic reporting

#### ErrorTracker
Captures and reports errors:
- Global error handlers
- Promise rejection tracking
- Context enrichment
- Severity classification

## Usage Examples

### Basic Setup

```tsx
import { AnalyticsProvider } from '@/components/analytics';
import { analyticsManager } from '@/lib/analytics';

function App() {
  return (
    <AnalyticsProvider
      config={{
        enabled: true,
        debug: process.env.NODE_ENV === 'development',
        trackPageViews: true,
        trackPerformance: true,
        trackErrors: true,
        sampleRate: 1.0, // 100% of events
      }}
    >
      <YourApp />
    </AnalyticsProvider>
  );
}
```

### Track Custom Events

```tsx
import { useAnalytics } from '@/hooks/analytics';

function ProductPage() {
  const { track } = useAnalytics();

  const handleAddToCart = (product) => {
    track('add_to_cart', {
      productId: product.id,
      productName: product.name,
      price: product.price,
      category: product.category,
    });
  };

  return <button onClick={handleAddToCart}>Add to Cart</button>;
}
```

### Track Conversions

```tsx
import { useAnalytics } from '@/hooks/analytics';

function CheckoutPage() {
  const { trackConversion } = useAnalytics();

  const handlePurchase = (order) => {
    trackConversion('purchase', order.total, 'USD', {
      orderId: order.id,
      items: order.items,
    });
  };

  return <button onClick={handlePurchase}>Complete Purchase</button>;
}
```

### Identify Users

```tsx
import { useEffect } from 'react';
import { useAnalytics } from '@/hooks/analytics';
import { useAuth } from '@/hooks/useAuth';

function AuthWrapper() {
  const { identify } = useAnalytics();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      identify(user.id, {
        email: user.email,
        name: user.name,
        plan: user.plan,
      });
    }
  }, [user, identify]);

  return null;
}
```

### Error Boundary

```tsx
import { ErrorBoundary } from '@/components/analytics';

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.log('Error caught:', error);
      }}
    >
      <YourApp />
    </ErrorBoundary>
  );
}
```

### Performance Tracking

```tsx
import { usePerformanceTracking } from '@/hooks/analytics';

function HeavyComponent() {
  const { measureOperation } = usePerformanceTracking('HeavyComponent');

  const handleExpensiveOperation = () => {
    measureOperation('data_processing', () => {
      // Your expensive operation
      processLargeDataset();
    });
  };

  return <button onClick={handleExpensiveOperation}>Process</button>;
}
```

### Automatic Page Tracking

```tsx
import { usePageTracking } from '@/hooks/analytics';

function App() {
  // Automatically tracks page views on route changes
  usePageTracking();

  return <Router>{/* routes */}</Router>;
}
```

## Custom Analytics Provider

```typescript
import { AnalyticsProvider } from '@/lib/analytics/types';
import { analyticsManager } from '@/lib/analytics';

const myProvider: AnalyticsProvider = {
  name: 'MyAnalytics',
  track: async (event) => {
    await fetch('https://my-analytics.com/track', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  },
  identify: async (userId, traits) => {
    await fetch('https://my-analytics.com/identify', {
      method: 'POST',
      body: JSON.stringify({ userId, traits }),
    });
  },
  page: async (page, properties) => {
    await fetch('https://my-analytics.com/page', {
      method: 'POST',
      body: JSON.stringify({ page, properties }),
    });
  },
};

analyticsManager.addProvider(myProvider);
```

## Configuration Options

```typescript
interface AnalyticsConfig {
  enabled: boolean;              // Enable/disable analytics
  debug: boolean;                // Log events to console
  trackPageViews: boolean;       // Auto-track page views
  trackPerformance: boolean;     // Track performance metrics
  trackErrors: boolean;          // Track errors
  trackUserBehavior: boolean;    // Track user interactions
  sampleRate: number;            // 0-1, percentage of events to track
  bufferSize: number;            // Max events before auto-flush
  flushInterval: number;         // Auto-flush interval (ms)
  endpoint?: string;             // Custom endpoint for events
}
```

## Event Types

- `page_view`: Page navigation events
- `user_action`: User interactions (clicks, form submissions, etc.)
- `error`: Error events
- `performance`: Performance metrics
- `conversion`: Conversion/goal events
- `custom`: Custom events

## Event Priorities

- `low`: Non-critical events (e.g., performance metrics)
- `medium`: Standard events (e.g., user actions)
- `high`: Important events (e.g., page views, conversions)
- `critical`: Critical events (e.g., errors, immediately flushed)

## Best Practices

1. **Use Priorities**: Set appropriate priorities for events
2. **Sample Rate**: Use sampling for high-volume applications
3. **Buffer Size**: Adjust based on traffic patterns
4. **Error Context**: Always include relevant context with errors
5. **PII Protection**: Never track sensitive user information
6. **Performance**: Track performance metrics for critical pages
7. **Conversions**: Define clear conversion goals
8. **Testing**: Test analytics in development mode

## Browser Support

- Modern browsers with Performance Observer API
- Fallback for browsers without observer support
- IndexedDB for offline event storage
- LocalStorage for session persistence

## Future Enhancements

- [ ] A/B testing framework
- [ ] Heatmap generation
- [ ] Session replay
- [ ] Real-time dashboard
- [ ] Advanced funnel analysis
- [ ] Cohort analysis
- [ ] Revenue attribution
- [ ] Custom dimensions

## Dependencies

- uuid: Event ID generation
- React Router: Page tracking integration
- Performance Observer API: Web Vitals tracking

## Testing

Test analytics in development mode:

```typescript
analyticsManager.initialize({
  debug: true,
  enabled: true,
});
```

This will log all events to console for verification.
