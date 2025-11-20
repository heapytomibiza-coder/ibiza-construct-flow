# Phase 5: Monitoring, Logging & Data Migration

## Overview
Phase 5 implements monitoring, observability, and data migration capabilities for the UUID integration system.

## Components

### 1. UUID Lookup Logger (`src/lib/monitoring/uuidLookupLogger.ts`)

Tracks performance and success rates of UUID lookups in real-time.

#### Features
- ✅ Performance tracking (lookup time in ms)
- ✅ Success/failure rate monitoring
- ✅ Fallback usage tracking
- ✅ Automatic batching and analytics export
- ✅ Development console logging
- ✅ Recent events buffer for debugging

#### Usage

```typescript
import { uuidLookupLogger } from '@/lib/monitoring/uuidLookupLogger';

// Log successful lookup
uuidLookupLogger.logSuccess(
  'wall-painting',
  'uuid-123',
  25, // lookup time in ms
  false // fallback used?
);

// Log failed lookup
uuidLookupLogger.logFailure(
  'unknown-service',
  15,
  'Service not found'
);

// Get current metrics
const metrics = uuidLookupLogger.getMetrics();
console.log({
  totalLookups: metrics.totalLookups,
  successRate: (metrics.successfulLookups / metrics.totalLookups) * 100,
  avgTime: metrics.averageLookupTime,
  fallbackRate: metrics.fallbackRate
});
```

#### Metrics Tracked

```typescript
interface UUIDLookupMetrics {
  totalLookups: number;
  successfulLookups: number;
  failedLookups: number;
  averageLookupTime: number; // ms
  fallbackRate: number; // percentage
}
```

#### Analytics Integration

Events are automatically sent to `analytics_events` table:
- Event name: `uuid_lookup`
- Category: `wizard_flow`
- Batched in groups of 10
- Auto-flush on page unload

### 2. Migration System

#### Database Schema

**Table: `uuid_migration_log`**
```sql
CREATE TABLE public.uuid_migration_log (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES jobs(id),
  micro_slug TEXT NOT NULL,
  micro_uuid UUID,
  migration_status TEXT CHECK (status IN ('pending', 'success', 'failed', 'skipped')),
  error_message TEXT,
  migrated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
);
```

#### Migration Functions

##### 1. `migrate_job_uuids()`

Migrates existing jobs to include `micro_uuid` references.

```sql
-- Run migration
SELECT * FROM migrate_job_uuids();

-- Returns:
-- job_id | micro_slug | found_uuid | status
```

**Process:**
1. Find all jobs without `micro_uuid`
2. Look up UUID from `micro_services` table
3. Update job with found UUID
4. Log result to `uuid_migration_log`
5. Return migration status

**Status Values:**
- `success`: UUID found and job updated
- `skipped`: No matching micro_service found
- `failed`: Error during migration

##### 2. `get_uuid_migration_stats()`

Get migration progress statistics.

```sql
SELECT * FROM get_uuid_migration_stats();
```

**Returns:**
```typescript
{
  total_jobs: number;
  jobs_with_uuid: number;
  jobs_without_uuid: number;
  successful_migrations: number;
  failed_migrations: number;
  skipped_migrations: number;
  completion_percentage: number;
}
```

### 3. Monitoring Dashboard Queries

#### Check Lookup Performance

```sql
SELECT 
  event_properties->>'micro_slug' as service,
  COUNT(*) as lookups,
  AVG((event_properties->>'lookup_time_ms')::numeric) as avg_time_ms,
  SUM(CASE WHEN (event_properties->>'success')::boolean THEN 1 ELSE 0 END) as successful,
  SUM(CASE WHEN (event_properties->>'fallback_used')::boolean THEN 1 ELSE 0 END) as fallbacks
FROM analytics_events
WHERE event_name = 'uuid_lookup'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY service
ORDER BY lookups DESC;
```

#### Migration Progress

```sql
SELECT 
  migration_status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM uuid_migration_log
GROUP BY migration_status;
```

#### Failed Migrations by Error

```sql
SELECT 
  error_message,
  COUNT(*) as occurrences,
  array_agg(DISTINCT micro_slug) as affected_slugs
FROM uuid_migration_log
WHERE migration_status = 'failed'
GROUP BY error_message
ORDER BY occurrences DESC;
```

## Integration Points

### Wizard Flow

```
User selects service
       ↓
buildConstructionWizardQuestions()
       ↓
Start performance timer
       ↓
Query micro_services table
       ↓
Stop timer, calculate lookup time
       ↓
uuidLookupLogger.logSuccess/logFailure()
       ↓
Event buffered (up to 10 events)
       ↓
Batch flush to analytics_events
```

### Job Submission

```
Wizard submits job
       ↓
Uses micro_uuid from lookup
       ↓
Inserts into jobs table
       ↓
{
  micro_id: 'wall-painting',  // slug for compatibility
  micro_uuid: 'uuid-123'      // UUID reference
}
```

## Operational Procedures

### Daily Monitoring

```bash
# Check UUID lookup health
SELECT * FROM get_uuid_migration_stats();

# Review slow lookups (> 100ms)
SELECT 
  event_properties->>'micro_slug' as service,
  (event_properties->>'lookup_time_ms')::numeric as time_ms
FROM analytics_events
WHERE event_name = 'uuid_lookup'
  AND (event_properties->>'lookup_time_ms')::numeric > 100
ORDER BY time_ms DESC
LIMIT 20;
```

### Migration Workflow

1. **Backup Database**
   ```sql
   -- Take snapshot before migration
   ```

2. **Run Migration**
   ```sql
   SELECT * FROM migrate_job_uuids();
   ```

3. **Verify Results**
   ```sql
   SELECT * FROM get_uuid_migration_stats();
   ```

4. **Review Failures**
   ```sql
   SELECT * FROM uuid_migration_log
   WHERE migration_status IN ('failed', 'skipped')
   ORDER BY created_at DESC;
   ```

5. **Fix Issues**
   - Add missing micro_services entries
   - Re-run migration for failed jobs

### Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Lookup Time (avg) | > 50ms | > 100ms |
| Failure Rate | > 5% | > 10% |
| Fallback Rate | > 20% | > 40% |
| Migration Failures | > 5% | > 10% |

## Performance Optimization

### Database Indexes

```sql
-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_micro_services_slug 
  ON micro_services(slug);

CREATE INDEX IF NOT EXISTS idx_jobs_micro_uuid 
  ON jobs(micro_uuid);

CREATE INDEX IF NOT EXISTS idx_uuid_migration_log_status 
  ON uuid_migration_log(migration_status);
```

### Caching Strategy

```typescript
// Consider adding micro_services cache
const microCache = new Map<string, string>();

async function lookupWithCache(slug: string): Promise<string | null> {
  if (microCache.has(slug)) {
    return microCache.get(slug) || null;
  }
  
  const uuid = await lookupFromDatabase(slug);
  if (uuid) {
    microCache.set(slug, uuid);
  }
  
  return uuid;
}
```

## Troubleshooting

### High Lookup Times

**Symptoms**: Average lookup time > 100ms

**Causes**:
1. Missing database index on `slug`
2. Network latency
3. Database under load

**Solutions**:
```sql
-- Check index exists
SELECT * FROM pg_indexes 
WHERE tablename = 'micro_services';

-- Rebuild index if needed
REINDEX TABLE micro_services;

-- Check table stats
ANALYZE micro_services;
```

### High Fallback Rate

**Symptoms**: Fallback rate > 40%

**Causes**:
1. Missing micro_services entries
2. Slug mismatch between systems
3. Recent data not migrated

**Solutions**:
```sql
-- Find missing services
SELECT DISTINCT micro_id 
FROM jobs 
WHERE micro_uuid IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM micro_services 
    WHERE slug = jobs.micro_id
  );

-- Seed missing entries
-- Use seeding script from Phase 1
```

### Migration Failures

**Symptoms**: Failed migrations in log

**Investigation**:
```sql
SELECT 
  error_message,
  COUNT(*) as count,
  array_agg(job_id) as failed_jobs
FROM uuid_migration_log
WHERE migration_status = 'failed'
GROUP BY error_message;
```

**Common Errors**:
- Foreign key constraint: Check `micro_services` table
- Permission denied: Check RLS policies
- Timeout: Batch process in smaller chunks

## Future Enhancements

### Phase 6 Recommendations

1. **Real-time Monitoring Dashboard**
   - Live metrics display
   - Alert visualization
   - Trend analysis

2. **Automated Migration**
   - Scheduled background job
   - Auto-retry failed migrations
   - Progress notifications

3. **Performance Optimizations**
   - In-memory cache for frequent lookups
   - Batch UUID resolution
   - Preload common services

4. **Advanced Analytics**
   - Lookup patterns by time of day
   - Geographic performance analysis
   - User journey correlation

## Documentation References

- [UUID Integration Tests](./testing/PHASE4_UUID_INTEGRATION.md)
- [Database Schema](../supabase/migrations/)
- [Analytics Events](../src/integrations/supabase/types.ts)
- [Construction Question Blocks](../src/lib/data/constructionQuestionBlocks.ts)
