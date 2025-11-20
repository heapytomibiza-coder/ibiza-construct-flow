# Phase 6: Production Readiness & Error Handling

## Overview
Phase 6 implements production-grade error handling, caching, retry logic, and circuit breakers for the UUID integration system.

## Components

### 1. Error Handling (`src/lib/errors/UUIDLookupError.ts`)

#### Custom Error Classes

```typescript
// Specific error types for UUID lookup
class UUIDLookupError extends Error
class MicroServiceNotFoundError extends UUIDLookupError
class DatabaseConnectionError extends UUIDLookupError
class InvalidSlugError extends UUIDLookupError
```

#### Error Recovery Utilities

```typescript
import { UUIDErrorRecovery } from '@/lib/errors/UUIDLookupError';

// Check if error is recoverable
if (UUIDErrorRecovery.isRecoverable(error)) {
  // Use fallback strategy
}

// Get user-friendly message
const message = UUIDErrorRecovery.getUserMessage(error);
toast.info(message);

// Get recovery action
const action = UUIDErrorRecovery.getRecoveryAction(error);
// Returns: 'retry' | 'fallback' | 'abort'
```

### 2. Retry Logic (`src/lib/utils/uuidLookupRetry.ts`)

#### Exponential Backoff

```typescript
import { retryUUIDLookup } from '@/lib/utils/uuidLookupRetry';

const result = await retryUUIDLookup(
  async () => {
    // Your lookup operation
    return await database.query();
  },
  {
    maxRetries: 3,
    initialDelayMs: 100,
    maxDelayMs: 2000,
    backoffMultiplier: 2
  },
  (attempt, error) => {
    console.log(`Retry attempt ${attempt}:`, error);
  }
);
```

**Retry Schedule:**
- Attempt 1: Immediate
- Attempt 2: 100ms delay
- Attempt 3: 200ms delay
- Attempt 4: 400ms delay (capped at maxDelayMs)

**Retryable Errors:**
- Network errors (ECONNREFUSED, ENOTFOUND)
- Timeout errors
- Database lock/busy errors
- Connection failures

**Non-Retryable Errors:**
- Invalid input (400-level errors)
- Authentication failures
- Permission errors
- Data validation errors

#### Circuit Breaker

```typescript
import { uuidLookupCircuitBreaker } from '@/lib/utils/uuidLookupRetry';

// Automatically opens after 5 failures
const result = await uuidLookupCircuitBreaker.execute(async () => {
  return await lookupOperation();
});

// Check circuit breaker state
const { state, failures } = uuidLookupCircuitBreaker.getState();
console.log(`Circuit breaker: ${state}, failures: ${failures}`);

// Reset manually if needed
uuidLookupCircuitBreaker.reset();
```

**Circuit States:**
- **Closed**: Normal operation, requests pass through
- **Open**: Too many failures, requests immediately rejected
- **Half-Open**: Testing recovery, limited requests allowed

**Configuration:**
- Failure Threshold: 5 consecutive failures
- Reset Timeout: 60 seconds
- Auto-recovery after timeout

### 3. Caching (`src/lib/cache/microServiceCache.ts`)

#### In-Memory Cache

```typescript
import { microServiceCache } from '@/lib/cache/microServiceCache';

// Get from cache
const uuid = microServiceCache.get('wall-painting');

// Set in cache
microServiceCache.set('wall-painting', 'uuid-123');

// Check if cached
if (microServiceCache.has('wall-painting')) {
  // Use cached value
}

// Clear cache
microServiceCache.clear();

// Get statistics
const stats = microServiceCache.getStats();
console.log({
  size: stats.size,
  maxSize: stats.maxSize,
  ttl: stats.ttlMs / 60000 + ' minutes'
});
```

**Cache Configuration:**
- TTL: 30 minutes (configurable)
- Max Size: 100 entries (LRU eviction)
- Auto-cleanup: Every 5 minutes

**Cache Warming:**
```typescript
// Warm up cache on app start
await microServiceCache.warmUp([
  { slug: 'wall-painting', uuid: 'uuid-1' },
  { slug: 'floor-installation', uuid: 'uuid-2' },
  // ... common services
]);
```

### 4. Integrated Lookup Flow

The complete lookup flow in `buildConstructionWizardQuestions`:

```
User selects service
       ↓
Check in-memory cache
       ↓
   Cache hit? ────→ YES ────→ Return cached UUID
       │                            ↓
       NO                    Log cache hit
       ↓                            ↓
Circuit breaker check            Success
       ↓
   Open? ────→ YES ────→ Use fallback
       │                       (slug only)
       NO
       ↓
Query database with retry
       ↓
Success? ────→ YES ────→ Cache result
       │                       ↓
       NO                 Return UUID
       ↓
Determine recovery action
       ↓
   Recoverable? ────→ YES ────→ Use fallback
       │                            ↓
       NO                      Continue
       ↓
   Throw error
```

## Error Scenarios & Handling

### Scenario 1: Service Not in Database

**Situation**: User selects valid service, but UUID not in `micro_services` table

**Handling:**
```typescript
catch (MicroServiceNotFoundError) {
  // Use slug-only fallback
  microUuid = null;
  fallbackUsed = true;
  // Job can still be created with micro_id (slug)
}
```

**User Experience**: Seamless, no error shown

### Scenario 2: Database Connection Failure

**Situation**: Network issue or database down

**Handling:**
```typescript
catch (DatabaseConnectionError) {
  // Retry with exponential backoff (up to 3 times)
  // If all retries fail, use fallback
  microUuid = null;
  toast.info('Connection issue detected. Your request will be processed.');
}
```

**User Experience**: Brief notification, request continues

### Scenario 3: Circuit Breaker Open

**Situation**: Too many consecutive failures detected

**Handling:**
```typescript
if (circuitBreaker.state === 'open') {
  // Skip database lookup, use fallback immediately
  microUuid = null;
  fallbackUsed = true;
}
```

**User Experience**: Fast failover, no delays

### Scenario 4: Invalid Slug Format

**Situation**: Malformed or invalid service slug

**Handling:**
```typescript
catch (InvalidSlugError) {
  // Non-recoverable, show error
  toast.error('Invalid service selected. Please try again.');
  // Prevent job submission
}
```

**User Experience**: Clear error message, must re-select

## Performance Metrics

### Target Performance

| Metric | Target | Alert Threshold |
|--------|--------|----------------|
| Cache Hit Rate | > 70% | < 50% |
| Avg Lookup Time (cache) | < 1ms | > 5ms |
| Avg Lookup Time (DB) | < 50ms | > 100ms |
| Success Rate | > 95% | < 90% |
| Fallback Rate | < 10% | > 20% |
| Circuit Breaker Opens | < 1/hour | > 5/hour |

### Monitoring Queries

#### Cache Performance
```typescript
const stats = microServiceCache.getStats();
const hitRate = (cacheHits / totalLookups) * 100;
console.log(`Cache hit rate: ${hitRate.toFixed(1)}%`);
```

#### Lookup Performance
```typescript
import { uuidLookupLogger } from '@/lib/monitoring/uuidLookupLogger';

const metrics = uuidLookupLogger.getMetrics();
console.log({
  avgTime: metrics.averageLookupTime,
  successRate: (metrics.successfulLookups / metrics.totalLookups) * 100,
  fallbackRate: metrics.fallbackRate
});
```

#### Circuit Breaker Status
```typescript
const cbState = uuidLookupCircuitBreaker.getState();
console.log({
  state: cbState.state,
  consecutiveFailures: cbState.failures,
  lastFailure: new Date(cbState.lastFailureTime)
});
```

## Production Deployment Checklist

### Pre-Deployment

- [ ] Run migration to add `micro_uuid` field to jobs table
- [ ] Seed `micro_services` table with all service UUIDs
- [ ] Run backfill migration for existing jobs
- [ ] Verify migration completion (100%)
- [ ] Test UUID lookup with cache
- [ ] Test retry logic with network failures
- [ ] Test circuit breaker behavior
- [ ] Review error logs for edge cases

### Post-Deployment Monitoring

**First 24 Hours:**
- [ ] Monitor cache hit rate (target > 70%)
- [ ] Check average lookup times (target < 50ms)
- [ ] Review fallback usage (target < 10%)
- [ ] Watch for circuit breaker opens
- [ ] Check error logs for unexpected failures

**First Week:**
- [ ] Analyze lookup patterns by service
- [ ] Identify services needing cache warming
- [ ] Review retry attempt statistics
- [ ] Optimize cache TTL if needed
- [ ] Tune circuit breaker thresholds

### Configuration Tuning

#### Cache Settings
```typescript
// Adjust based on usage patterns
const cache = new MicroServiceCache(
  30, // TTL in minutes (increase for stable services)
  200  // Max size (increase for high-traffic apps)
);
```

#### Retry Settings
```typescript
// Adjust based on database latency
const retryConfig = {
  maxRetries: 3,       // Reduce for fast-fail
  initialDelayMs: 100, // Increase for high-latency
  maxDelayMs: 2000,    // Cap total retry time
  backoffMultiplier: 2 // 2x backoff per attempt
};
```

#### Circuit Breaker Settings
```typescript
// Adjust based on failure patterns
const circuitBreaker = new CircuitBreaker(
  5,     // Failures before opening (increase for tolerance)
  60000  // Reset timeout ms (decrease for faster recovery)
);
```

## Troubleshooting

### High Fallback Rate (> 20%)

**Diagnosis:**
```sql
-- Check for missing micro_services entries
SELECT DISTINCT j.micro_id
FROM jobs j
LEFT JOIN micro_services ms ON ms.slug = j.micro_id
WHERE ms.id IS NULL;
```

**Solution:**
1. Add missing entries to `micro_services` table
2. Re-run migration for affected jobs
3. Monitor fallback rate improvement

### Circuit Breaker Constantly Opening

**Diagnosis:**
```typescript
const { failures, state } = uuidLookupCircuitBreaker.getState();
console.log(`Failures: ${failures}, State: ${state}`);
```

**Possible Causes:**
- Database performance issues
- Network connectivity problems
- Too aggressive failure threshold

**Solutions:**
1. Check database health
2. Increase circuit breaker threshold
3. Investigate network latency
4. Consider read replicas for lookups

### Low Cache Hit Rate (< 50%)

**Diagnosis:**
```typescript
const stats = microServiceCache.getStats();
console.log('Cache stats:', stats);
```

**Possible Causes:**
- Cache TTL too short
- Cache size too small
- High variety of services

**Solutions:**
1. Increase cache TTL (30min → 60min)
2. Increase max cache size
3. Implement cache warming on startup
4. Identify and prioritize common services

### Slow Lookup Times (> 100ms)

**Diagnosis:**
```sql
-- Check for missing indexes
SELECT * FROM pg_indexes 
WHERE tablename = 'micro_services';

-- Check query performance
EXPLAIN ANALYZE
SELECT id FROM micro_services 
WHERE slug = 'wall-painting';
```

**Solutions:**
1. Ensure index on `slug` column exists
2. Run `ANALYZE micro_services`
3. Consider database connection pooling
4. Check network latency to database

## Best Practices

### 1. Always Use Fallback Strategy

```typescript
// ✅ GOOD: Graceful degradation
try {
  uuid = await lookupUUID(slug);
} catch (error) {
  if (UUIDErrorRecovery.isRecoverable(error)) {
    // Continue with slug-only
    uuid = null;
  } else {
    throw error;
  }
}

// ❌ BAD: Fail hard on lookup errors
uuid = await lookupUUID(slug); // Throws, breaks flow
```

### 2. Log All UUID Lookup Events

```typescript
// ✅ GOOD: Comprehensive logging
uuidLookupLogger.logSuccess(slug, uuid, time, fallback);

// ❌ BAD: Silent failures
// No logging, can't diagnose issues
```

### 3. Use Circuit Breaker for External Calls

```typescript
// ✅ GOOD: Protected with circuit breaker
await uuidLookupCircuitBreaker.execute(async () => {
  return await databaseLookup();
});

// ❌ BAD: Unprotected repeated failures
for (let i = 0; i < 100; i++) {
  await databaseLookup(); // Hammers failing database
}
```

### 4. Cache Frequently Accessed Services

```typescript
// ✅ GOOD: Check cache first
const cached = cache.get(slug);
if (cached) return cached;

// ❌ BAD: Always hit database
return await database.query(); // Slow, wasteful
```

## Documentation References

- [Error Classes](../src/lib/errors/UUIDLookupError.ts)
- [Retry Logic](../src/lib/utils/uuidLookupRetry.ts)
- [Caching System](../src/lib/cache/microServiceCache.ts)
- [Monitoring](./PHASE5_MONITORING_MIGRATION.md)
- [Testing](./testing/PHASE4_UUID_INTEGRATION.md)
