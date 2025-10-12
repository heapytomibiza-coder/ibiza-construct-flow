# Phase 27: Analytics & Reporting System

Comprehensive analytics and reporting infrastructure for tracking user behavior, system performance, and business metrics.

## Features Implemented

### 1. Event Tracking System
- **Automatic Tracking**
  - Page views with full path tracking
  - Error tracking (errors & unhandled rejections)
  - Performance metrics collection
  - User interaction tracking

- **Custom Event Tracking**
  - User actions and conversions
  - Engagement metrics
  - Custom event properties
  - Event categorization

- **Event Management**
  - Event filtering and querying
  - Time-based event retrieval
  - User-specific event tracking
  - Session management

### 2. Report Generation
- **Report Types**
  - Overview reports (key metrics summary)
  - User behavior analysis
  - Conversion funnels
  - Retention cohorts
  - Performance reports
  - Custom reports

- **Report Features**
  - Flexible date ranges
  - Multi-dimensional analysis
  - Filter support
  - Automatic generation
  - Data aggregation

### 3. Metrics Collection
- **Metric Types**
  - Counters (increment-only)
  - Timings (duration tracking)
  - Gauges (point-in-time values)
  - Custom metrics

- **Aggregation Features**
  - Statistical summaries (avg, min, max, percentiles)
  - Dimensional grouping
  - Time-based aggregation
  - Automatic cleanup

### 4. React Integration
- **Analytics Hooks**
  - `useAnalytics` - Main tracking hook
  - `useReports` - Report generation
  - `useMetrics` - Metrics collection

- **Features**
  - Automatic page view tracking
  - User context integration
  - Performance timing utilities
  - Simple API

## File Structure

```
src/
├── lib/
│   └── analytics/
│       ├── types.ts                  # TypeScript types
│       ├── EventTracker.ts           # Event tracking engine
│       ├── ReportGenerator.ts        # Report generation
│       ├── MetricsCollector.ts       # Metrics collection
│       └── index.ts                  # Module exports
└── hooks/
    └── analytics/
        ├── useAnalytics.ts           # Main analytics hook
        ├── useReports.ts             # Reports management hook
        ├── useMetrics.ts             # Metrics hook
        └── index.ts                  # Hook exports
```

## Core Types

### AnalyticsEvent
```typescript
interface AnalyticsEvent {
  id: string;
  userId?: string;
  sessionId: string;
  eventName: string;
  category: EventCategory;
  properties?: Record<string, any>;
  timestamp: Date;
  source: EventSource;
}
```

### AnalyticsReport
```typescript
interface AnalyticsReport {
  id: string;
  name: string;
  type: ReportType;
  metrics: string[];
  dimensions: string[];
  filters?: AnalyticsFilter[];
  dateRange: DateRange;
  data: any[];
  generatedAt: Date;
}
```

### ConversionFunnel
```typescript
interface ConversionFunnel {
  id: string;
  name: string;
  steps: FunnelStep[];
  totalUsers: number;
  completionRate: number;
}
```

## Usage Examples

### Basic Event Tracking

```typescript
import { useAnalytics } from '@/hooks/analytics';

function MyComponent() {
  const { track, trackAction, trackConversion } = useAnalytics();

  const handleClick = () => {
    trackAction('button_clicked', {
      buttonId: 'submit',
      page: 'checkout'
    });
  };

  const handlePurchase = (amount: number) => {
    trackConversion('purchase_completed', amount, {
      items: 3,
      currency: 'USD'
    });
  };

  return (
    <button onClick={handleClick}>
      Submit Order
    </button>
  );
}
```

### Report Generation

```typescript
import { useReports } from '@/hooks/analytics';

function AnalyticsDashboard() {
  const { generateReport, generateFunnel, reports } = useReports();

  const createOverviewReport = () => {
    const report = generateReport(
      'Daily Overview',
      'overview',
      ['totalEvents', 'uniqueUsers'],
      ['date'],
      {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        end: new Date(),
        preset: 'last_7_days'
      }
    );
  };

  const createFunnel = () => {
    const funnel = generateFunnel(
      'Checkout Funnel',
      [
        { name: 'View Product', eventName: 'product_view' },
        { name: 'Add to Cart', eventName: 'add_to_cart' },
        { name: 'Checkout', eventName: 'checkout_start' },
        { name: 'Purchase', eventName: 'purchase_completed' }
      ]
    );
    
    console.log('Completion rate:', funnel.completionRate);
  };

  return (
    <div>
      <button onClick={createOverviewReport}>
        Generate Overview
      </button>
      <button onClick={createFunnel}>
        Analyze Funnel
      </button>
    </div>
  );
}
```

### Metrics Collection

```typescript
import { useMetrics } from '@/hooks/analytics';

function ApiComponent() {
  const { increment, timing, timeAsync } = useMetrics();

  const fetchData = async () => {
    increment('api_calls', { endpoint: '/users' });
    
    const data = await timeAsync(
      'api_latency',
      async () => {
        const response = await fetch('/api/users');
        return response.json();
      },
      { endpoint: '/users' }
    );

    return data;
  };

  return <div>...</div>;
}
```

### Performance Tracking

```typescript
import { useMetrics } from '@/hooks/analytics';

function DataProcessor() {
  const { timeExecution, gauge } = useMetrics();

  const processData = (data: any[]) => {
    return timeExecution(
      'data_processing',
      () => {
        // Processing logic
        const result = data.map(item => transform(item));
        
        gauge('processed_items', result.length);
        
        return result;
      },
      { dataType: 'users' }
    );
  };

  return <div>...</div>;
}
```

## Architecture

### Event Flow
```
User Action → EventTracker → Event Storage → Analysis
                    ↓
              Listeners → External Systems
```

### Report Generation
```
Events → Filters → Aggregation → Report Data
   ↓         ↓          ↓
DateRange  Dimensions  Metrics
```

### Metrics Pipeline
```
Metric Recording → Time-based Aggregation → Statistical Analysis
                          ↓
                    Auto Cleanup
```

## Event Categories

- **page_view** - Page navigation events
- **user_action** - User interactions
- **conversion** - Goal completions
- **engagement** - User engagement metrics
- **error** - Error tracking
- **performance** - Performance metrics
- **custom** - Custom event types

## Report Types

1. **Overview** - Key metrics summary
2. **User Behavior** - User action analysis
3. **Conversion Funnel** - Multi-step conversion tracking
4. **Retention** - User retention cohorts
5. **Performance** - System performance metrics
6. **Custom** - Flexible custom reports

## Configuration

```typescript
const config: AnalyticsConfig = {
  trackPageViews: true,
  trackUserActions: true,
  trackPerformance: true,
  trackErrors: true,
  samplingRate: 1.0,          // 100% sampling
  sessionTimeout: 1800000,    // 30 minutes
  excludePaths: ['/admin']    // Paths to exclude
};
```

## Best Practices

1. **Event Naming**
   - Use descriptive, consistent names
   - Follow naming convention (snake_case)
   - Include context in properties

2. **Performance**
   - Use sampling for high-volume events
   - Implement automatic cleanup
   - Batch event processing

3. **Privacy**
   - Don't track sensitive data
   - Respect user preferences
   - Implement data retention policies

4. **Metrics**
   - Choose appropriate metric types
   - Use dimensions for grouping
   - Monitor storage usage

5. **Reports**
   - Define clear date ranges
   - Use appropriate filters
   - Cache frequently-used reports

## Integration Points

- **Authentication** - User context tracking
- **Routing** - Automatic page views
- **Error Handling** - Error tracking
- **Performance** - Web Vitals
- **External Services** - Event forwarding

## Future Enhancements

1. **Real-time Analytics**
   - WebSocket-based streaming
   - Live dashboards
   - Real-time alerts

2. **Advanced Visualizations**
   - Interactive charts
   - Heatmaps
   - Journey mapping

3. **Machine Learning**
   - Anomaly detection
   - Predictive analytics
   - User segmentation

4. **Integration**
   - Export to external platforms
   - Data warehouse integration
   - BI tool connectors

## Dependencies

- `uuid` - Unique ID generation
- `react-router-dom` - Page tracking
- React hooks - Component integration
- TypeScript - Type safety
