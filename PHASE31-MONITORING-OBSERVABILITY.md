# Phase 31: Advanced Monitoring & Observability System

Complete monitoring and observability infrastructure for application health, performance tracking, and alerting.

## Features

### 1. Metrics Collection (`MetricsCollector`)
- **Metric Types**: Counter, Gauge, Histogram, Summary
- **Aggregation**: Sum, Average, Min, Max, Count
- **Labels & Metadata**: Rich metric tagging
- **Retention**: Automatic cleanup of old metrics
- **Export**: Export metrics for external systems

### 2. Log Aggregation (`LogAggregator`)
- **Log Levels**: Debug, Info, Warn, Error, Fatal
- **Context**: Rich contextual information
- **Search & Filter**: Query logs by level, time, content
- **Retention**: Automatic log cleanup
- **Console Integration**: Development console logging

### 3. Performance Monitoring (`PerformanceMonitor`)
- **Duration Tracking**: Measure operation timing
- **Distributed Tracing**: Trace requests across services
- **Spans**: Break down traces into spans
- **Web Vitals**: LCP, FID, CLS tracking
- **Slowest Operations**: Identify bottlenecks

### 4. Alert Management (`AlertManager`)
- **Conditions**: Flexible alert conditions
- **Actions**: Email, Webhook, Notification, Log
- **Severity Levels**: Low, Medium, High, Critical
- **Auto-Resolution**: Detect when issues resolve
- **Alert History**: Track triggered and resolved alerts

## Usage Examples

### Metrics Collection

```typescript
import { useMetrics } from '@/hooks';

function MyComponent() {
  const { increment, gauge, histogram, getMetrics } = useMetrics();

  // Register metric configuration
  useEffect(() => {
    registerMetric({
      name: 'page_views',
      type: 'counter',
      description: 'Number of page views',
      unit: 'count',
    });
  }, []);

  // Track page view
  const trackPageView = () => {
    increment('page_views', 1, { page: 'home' });
  };

  // Track response time
  const trackResponseTime = (duration: number) => {
    histogram('api_response_time', duration, { endpoint: '/api/users' });
  };

  // Get metrics
  const metrics = getMetrics('page_views', {
    start: new Date(Date.now() - 3600000), // Last hour
    end: new Date(),
  });

  return <div>{/* Component UI */}</div>;
}
```

### Logging

```typescript
import { useLogger } from '@/hooks';

function MyComponent() {
  const { info, error, warn, getLogs } = useLogger();

  const handleAction = async () => {
    info('User action started', { userId: '123', action: 'submit' });

    try {
      await submitData();
      info('Action completed successfully');
    } catch (err) {
      error('Action failed', err as Error, { userId: '123' });
    }
  };

  // Get recent errors
  const errors = getErrors(10);

  return <div>{/* Component UI */}</div>;
}
```

### Performance Monitoring

```typescript
import { usePerformance } from '@/hooks';

function MyComponent() {
  const { measure, startTrace, endTrace, startSpan, endSpan } = usePerformance();

  const performComplexOperation = async () => {
    // Measure function execution
    const result = await measure('complex_operation', async () => {
      return await doSomething();
    });

    return result;
  };

  const tracedOperation = async () => {
    // Start distributed trace
    const traceId = startTrace('user_workflow');

    // Add spans
    const span1 = startSpan(traceId, 'fetch_data');
    await fetchData();
    endSpan(span1);

    const span2 = startSpan(traceId, 'process_data');
    await processData();
    endSpan(span2);

    endTrace(traceId, 'completed');
  };

  return <div>{/* Component UI */}</div>;
}
```

### Alert Management

```typescript
import { useAlerts } from '@/hooks';

function MonitoringDashboard() {
  const {
    alerts,
    createAlert,
    updateAlert,
    startMonitoring,
    stopMonitoring,
  } = useAlerts();

  useEffect(() => {
    // Create alert for high error rate
    createAlert(
      'High Error Rate',
      {
        metric: 'errors.count',
        operator: 'gt',
        threshold: 10,
        duration: 300, // 5 minutes
        aggregation: 'sum',
      },
      [
        {
          type: 'email',
          config: { recipient: 'admin@example.com' },
          enabled: true,
        },
        {
          type: 'webhook',
          config: { url: 'https://hooks.slack.com/...' },
          enabled: true,
        },
      ],
      {
        severity: 'high',
        description: 'Alert when error count exceeds threshold',
      }
    );

    // Start monitoring
    startMonitoring();

    return () => stopMonitoring();
  }, []);

  return (
    <div>
      <h2>Active Alerts</h2>
      {alerts.map(alert => (
        <div key={alert.id}>
          <h3>{alert.name}</h3>
          <p>Severity: {alert.severity}</p>
          <p>Status: {alert.status}</p>
        </div>
      ))}
    </div>
  );
}
```

## Direct Library Usage

```typescript
import {
  metricsCollector,
  logger,
  performanceMonitor,
  alertManager,
} from '@/lib/monitoring';

// Metrics
metricsCollector.increment('api_calls', 1);
metricsCollector.gauge('active_users', 42);
metricsCollector.histogram('request_duration', 125);

// Logging
logger.info('Application started');
logger.error('Database connection failed', new Error('Connection timeout'));
logger.warn('Deprecated API used', { endpoint: '/v1/users' });

// Performance
const perfId = performanceMonitor.start('data_fetch', 'api');
await fetchData();
performanceMonitor.end(perfId);

// Alerts
alertManager.create(
  'Low Disk Space',
  { metric: 'disk.usage', operator: 'gt', threshold: 90 },
  [{ type: 'notification', config: {}, enabled: true }]
);
alertManager.startMonitoring();
```

## Architecture

### Metrics Flow
```
Component → useMetrics Hook → MetricsCollector → Storage
                                    ↓
                              Aggregation & Analysis
```

### Logging Flow
```
Component → useLogger Hook → LogAggregator → Console/Storage
                                  ↓
                            Search & Filter
```

### Performance Flow
```
Component → usePerformance Hook → PerformanceMonitor → Metrics
                                        ↓
                                  Traces & Spans
```

### Alert Flow
```
MetricsCollector → AlertManager → Condition Check → Actions
                        ↓
                  Email/Webhook/Notification
```

## Best Practices

### 1. Metric Naming
```typescript
// Use dot notation and clear names
metricsCollector.increment('api.requests.success');
metricsCollector.increment('api.requests.failure');
metricsCollector.histogram('api.response_time.ms');
```

### 2. Contextual Logging
```typescript
// Always include context
logger.info('User login', {
  userId: user.id,
  method: 'google',
  timestamp: new Date(),
});
```

### 3. Performance Measurement
```typescript
// Measure critical paths
const result = await performanceMonitor.measure(
  'checkout_process',
  async () => await processCheckout(),
  'api'
);
```

### 4. Alert Configuration
```typescript
// Set appropriate thresholds and durations
createAlert(
  'API Latency',
  {
    metric: 'api.response_time',
    operator: 'gt',
    threshold: 1000, // 1 second
    duration: 300, // Sustained for 5 minutes
    aggregation: 'avg',
  },
  actions,
  { severity: 'medium' }
);
```

## Integration Points

- **React Query**: Track API performance and errors
- **Error Boundaries**: Automatic error logging
- **Route Changes**: Performance tracking
- **API Calls**: Request/response metrics
- **User Actions**: Interaction tracking

## Types

```typescript
// Metric types
type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary';

// Log levels
type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

// Alert severity
type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

// Performance categories
type PerformanceCategory = 'api' | 'render' | 'interaction' | 'resource';
```

## Development vs Production

### Development
- Console logging enabled
- All log levels visible
- No metric batching
- Detailed traces

### Production
- Console logging disabled
- Error/Warn levels only
- Metric batching enabled
- Sampled traces

## Monitoring Dashboard

Create a monitoring dashboard:

```typescript
function MonitoringDashboard() {
  const { getMetrics } = useMetrics();
  const { getLogs } = useLogger();
  const { getMetrics: getPerfMetrics } = usePerformance();
  const { alerts } = useAlerts();

  return (
    <div className="grid grid-cols-2 gap-4">
      <MetricsChart metrics={getMetrics('api_calls')} />
      <ErrorLog logs={getLogs({ level: 'error', limit: 100 })} />
      <PerformanceChart metrics={getPerfMetrics('api')} />
      <AlertsList alerts={alerts} />
    </div>
  );
}
```

## Files Created

### Library
- `src/lib/monitoring/types.ts` - Type definitions
- `src/lib/monitoring/MetricsCollector.ts` - Metrics collection
- `src/lib/monitoring/LogAggregator.ts` - Log aggregation
- `src/lib/monitoring/PerformanceMonitor.ts` - Performance tracking
- `src/lib/monitoring/AlertManager.ts` - Alert management
- `src/lib/monitoring/index.ts` - Module exports

### Hooks
- `src/hooks/monitoring/useMetrics.ts` - Metrics hook
- `src/hooks/monitoring/useLogger.ts` - Logger hook
- `src/hooks/monitoring/usePerformance.ts` - Performance hook
- `src/hooks/monitoring/useAlerts.ts` - Alerts hook
- `src/hooks/monitoring/index.ts` - Module exports

## Next Steps

1. **Integrate with Backend**: Send metrics/logs to backend
2. **Create Dashboards**: Build monitoring dashboards
3. **Set Up Alerts**: Configure production alerts
4. **Add Visualizations**: Create charts and graphs
5. **Export Data**: Export to external monitoring tools
