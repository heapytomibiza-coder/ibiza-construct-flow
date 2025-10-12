# Phase 29: Advanced Integration & API Management System

Comprehensive integration and API management infrastructure for connecting external services, managing webhooks, and building API clients with retry logic, rate limiting, and transformation.

## Features Implemented

### 1. Integration Management
- **CRUD Operations**
  - Create, read, update, delete integrations
  - Status management (active, inactive, error, configuring, testing)
  - Enable/disable integrations
  - Import/export functionality

- **Integration Features**
  - Multiple integration types (REST, GraphQL, Webhooks, etc.)
  - Provider-based organization
  - Credential management
  - Configuration schemas
  - Health monitoring

### 2. API Client
- **HTTP Methods**
  - GET, POST, PUT, PATCH, DELETE support
  - Custom headers and query parameters
  - Request/response body handling
  - Timeout management

- **Advanced Features**
  - Automatic retry with backoff strategies
  - Rate limiting (sliding/fixed window)
  - Request/response transformation
  - Error handling and classification
  - Request queuing

### 3. Webhook Handler
- **Webhook Management**
  - Subscription creation and management
  - Event routing and processing
  - Signature verification
  - Event history tracking

- **Event Processing**
  - Asynchronous event handling
  - Event handlers registration
  - Retry failed events
  - Filter by integration/type

### 4. Metrics & Logging
- **Integration Metrics**
  - Request counts (total, successful, failed)
  - Response time tracking
  - Success/error rates
  - Last activity tracking

- **Logging System**
  - Multi-level logging (debug, info, warn, error)
  - Integration-specific logs
  - Log filtering and search
  - Automatic log rotation

### 5. React Integration
- **Integration Hooks**
  - `useIntegration` - Integration management
  - `useWebhook` - Webhook handling

- **Features**
  - User context integration
  - Loading states
  - Real-time updates
  - Error handling

## File Structure

```
src/
├── lib/
│   └── integration/
│       ├── types.ts                # TypeScript types
│       ├── IntegrationManager.ts   # Integration lifecycle
│       ├── APIClient.ts            # HTTP client with features
│       ├── WebhookHandler.ts       # Webhook processing
│       └── index.ts                # Module exports
└── hooks/
    └── integration/
        ├── useIntegration.ts       # Integration management hook
        ├── useWebhook.ts           # Webhook hook
        └── index.ts                # Hook exports
```

## Core Types

### Integration
```typescript
interface Integration {
  id: string;
  name: string;
  type: IntegrationType;
  provider: string;
  config: IntegrationConfig;
  status: IntegrationStatus;
  enabled: boolean;
  credentials?: IntegrationCredentials;
  createdAt: Date;
}
```

### APIEndpoint
```typescript
interface APIEndpoint {
  id: string;
  integrationId: string;
  name: string;
  method: HTTPMethod;
  path: string;
  params?: EndpointParam[];
  auth?: AuthConfig;
}
```

### WebhookEvent
```typescript
interface WebhookEvent {
  id: string;
  integrationId: string;
  event: string;
  payload: any;
  headers: Record<string, string>;
  timestamp: Date;
  processed: boolean;
}
```

## Usage Examples

### Creating an Integration

```typescript
import { useIntegration } from '@/hooks/integration';

function IntegrationSetup() {
  const { createIntegration, testIntegration } = useIntegration();

  const handleCreate = () => {
    const integration = createIntegration({
      name: 'Stripe Payment Gateway',
      description: 'Process payments via Stripe',
      type: 'rest_api',
      provider: 'stripe',
      config: {
        baseUrl: 'https://api.stripe.com',
        apiVersion: 'v1',
        timeout: 30000,
        retryConfig: {
          maxAttempts: 3,
          backoffStrategy: 'exponential',
          initialDelay: 1000,
          maxDelay: 10000,
          retryOn: [429, 500, 502, 503],
        },
        rateLimit: {
          maxRequests: 100,
          windowMs: 60000,
          strategy: 'sliding',
        },
      },
      status: 'configuring',
      enabled: false,
      credentials: {
        type: 'api_key',
        data: {
          key: 'sk_test_...',
        },
      },
    });

    // Test the integration
    testIntegration(integration.id);
  };

  return (
    <button onClick={handleCreate}>Create Integration</button>
  );
}
```

### Using API Client

```typescript
import { APIClient } from '@/lib/integration';

// Create client
const client = new APIClient({
  baseUrl: 'https://api.example.com',
  headers: {
    'Authorization': 'Bearer token',
    'Content-Type': 'application/json',
  },
  retryConfig: {
    maxAttempts: 3,
    backoffStrategy: 'exponential',
    initialDelay: 1000,
    maxDelay: 10000,
  },
  rateLimit: {
    maxRequests: 50,
    windowMs: 60000,
    strategy: 'sliding',
  },
  transformers: {
    request: (data) => ({
      ...data,
      timestamp: Date.now(),
    }),
    response: (data) => ({
      ...data,
      receivedAt: Date.now(),
    }),
  },
});

// Make requests
async function fetchData() {
  try {
    // GET request
    const users = await client.get('/users', {
      params: { page: 1, limit: 10 },
    });

    // POST request
    const newUser = await client.post('/users', {
      name: 'John Doe',
      email: 'john@example.com',
    });

    // PUT request
    const updated = await client.put(`/users/${newUser.body.id}`, {
      name: 'Jane Doe',
    });

    console.log('Response:', updated.body);
    console.log('Duration:', updated.duration, 'ms');
  } catch (error) {
    console.error('API Error:', error);
  }
}
```

### Webhook Management

```typescript
import { useWebhook } from '@/hooks/integration';

function WebhookManager() {
  const {
    createSubscription,
    handleWebhook,
    subscribe,
    events,
  } = useWebhook();

  // Create webhook subscription
  const setupWebhook = () => {
    createSubscription({
      integrationId: 'stripe-integration',
      events: [
        'payment.succeeded',
        'payment.failed',
        'subscription.created',
      ],
      url: 'https://myapp.com/webhooks/stripe',
      secret: 'whsec_...',
      active: true,
    });
  };

  // Subscribe to webhook events
  useEffect(() => {
    const unsubscribe = subscribe('payment.succeeded', async (event) => {
      console.log('Payment succeeded:', event.payload);
      
      // Process payment
      await processPayment(event.payload);
    });

    return unsubscribe;
  }, [subscribe]);

  // Handle incoming webhook
  const handleIncomingWebhook = async (req: Request) => {
    const body = await req.json();
    const headers = Object.fromEntries(req.headers);

    await handleWebhook(
      'stripe-integration',
      body.type,
      body.data,
      headers
    );
  };

  return (
    <div>
      <button onClick={setupWebhook}>Setup Webhook</button>
      <div>
        <h3>Recent Events: {events.length}</h3>
        {events.map(event => (
          <div key={event.id}>
            {event.event} - {event.processed ? 'Processed' : 'Pending'}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Request Transformation

```typescript
const client = new APIClient({
  baseUrl: 'https://api.example.com',
  transformers: {
    // Transform outgoing requests
    request: (data) => {
      // Convert dates to ISO strings
      const transformed = { ...data };
      Object.keys(transformed).forEach(key => {
        if (transformed[key] instanceof Date) {
          transformed[key] = transformed[key].toISOString();
        }
      });
      return transformed;
    },
    
    // Transform incoming responses
    response: (data) => {
      // Convert ISO strings back to dates
      const transformed = { ...data };
      Object.keys(transformed).forEach(key => {
        if (typeof transformed[key] === 'string' && 
            transformed[key].match(/^\d{4}-\d{2}-\d{2}T/)) {
          transformed[key] = new Date(transformed[key]);
        }
      });
      return transformed;
    },
  },
});
```

### Rate Limiting & Retry

```typescript
const client = new APIClient({
  baseUrl: 'https://api.example.com',
  
  // Rate limiting configuration
  rateLimit: {
    maxRequests: 100,      // 100 requests
    windowMs: 60000,       // per minute
    strategy: 'sliding',   // sliding window
  },
  
  // Retry configuration
  retryConfig: {
    maxAttempts: 3,              // Retry up to 3 times
    backoffStrategy: 'exponential', // 1s, 2s, 4s
    initialDelay: 1000,          // Start with 1 second
    maxDelay: 10000,             // Cap at 10 seconds
    retryOn: [429, 500, 502, 503], // Retry on these status codes
  },
});

// Requests will automatically be rate limited and retried
const response = await client.get('/data');
```

### Integration Metrics

```typescript
import { useIntegration } from '@/hooks/integration';

function IntegrationDashboard({ integrationId }: { integrationId: string }) {
  const { getMetrics, getLogs } = useIntegration();

  const metrics = getMetrics(integrationId);
  const logs = getLogs(integrationId, 50);

  return (
    <div>
      <h2>Integration Metrics</h2>
      {metrics && (
        <div>
          <div>Total Requests: {metrics.totalRequests}</div>
          <div>Success Rate: {metrics.successRate.toFixed(2)}%</div>
          <div>Error Rate: {metrics.errorRate.toFixed(2)}%</div>
          <div>Avg Response Time: {metrics.averageResponseTime.toFixed(0)}ms</div>
        </div>
      )}

      <h2>Recent Logs</h2>
      {logs.map(log => (
        <div key={log.id}>
          [{log.level}] {log.message}
        </div>
      ))}
    </div>
  );
}
```

## Architecture

### Request Flow
```
Client → Rate Limiter → Transformer → HTTP Request → Retry Logic → Response
           ↓              ↓              ↓              ↓            ↓
       Queue Wait    Transform      Network      Backoff      Transform
```

### Webhook Flow
```
Incoming → Signature Verify → Event Storage → Handler Matching → Processing
              ↓                    ↓                ↓               ↓
          Validation          Persistence      Priority       Async Exec
```

### Integration Lifecycle
```
Create → Configure → Test → Activate → Monitor → Maintain
   ↓         ↓        ↓        ↓         ↓         ↓
 Setup   Credentials API    Enable   Metrics   Update
```

## Integration Types

1. **rest_api** - RESTful API integration
2. **graphql** - GraphQL API integration
3. **webhook** - Webhook-based integration
4. **database** - Database connection
5. **storage** - File storage service
6. **messaging** - Message queue/pub-sub
7. **payment** - Payment gateway
8. **email** - Email service
9. **sms** - SMS service
10. **analytics** - Analytics platform
11. **crm** - CRM system
12. **custom** - Custom integration

## Best Practices

1. **Configuration**
   - Store credentials securely
   - Use environment variables
   - Version API configurations
   - Document requirements

2. **Error Handling**
   - Classify errors properly
   - Implement retry logic
   - Log errors with context
   - Notify on critical failures

3. **Rate Limiting**
   - Respect provider limits
   - Implement backoff strategies
   - Queue requests when needed
   - Monitor usage patterns

4. **Security**
   - Encrypt credentials
   - Verify webhook signatures
   - Use HTTPS for all requests
   - Rotate API keys regularly

5. **Monitoring**
   - Track success rates
   - Monitor response times
   - Alert on failures
   - Review logs regularly

## Integration Points

- **Authentication** - Credential management
- **Workflow** - Integration in workflows
- **Analytics** - Usage tracking
- **Notifications** - Error alerts
- **Logging** - Audit trail

## Future Enhancements

1. **Enhanced Features**
   - GraphQL client support
   - WebSocket connections
   - Batch operations
   - Caching layer

2. **Developer Experience**
   - Integration marketplace
   - Visual API builder
   - Testing sandbox
   - Documentation generator

3. **Management**
   - Version control
   - Deployment pipelines
   - Environment management
   - Team collaboration

4. **Monitoring**
   - Real-time dashboards
   - Alert configuration
   - Performance profiling
   - Usage analytics

## Dependencies

- `uuid` - Unique ID generation
- React hooks - Component integration
- TypeScript - Type safety
