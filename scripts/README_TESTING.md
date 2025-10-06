# Sprint 15.4 Testing Guide

## Quick Start

### 1. Seed Demo Data
Run in Supabase SQL Editor:
```sql
-- Execute: scripts/seed_sprint_154_demo.sql
-- This creates:
--   - 1 dispute (2 days old)
--   - 5 messages (negative sentiment, 8h gap)
--   - Message sentiments (3 negative in last 5)
--   - Quality score < 60 for professional
--   - Audit trail entries
```

**Copy the Dispute UUID from the output!**

### 2. Trigger Edge Functions

#### Option A: Using curl
Replace `kcncrtayycwdwrxcgler` with your project ref:

```bash
# Process sentiment analysis
curl -X POST https://kcncrtayycwdwrxcgler.supabase.co/functions/v1/sentiment-batch \
  -H 'Content-Type: application/json' \
  -d '{}'

# Recalculate quality scores
curl -X POST https://kcncrtayycwdwrxcgler.supabase.co/functions/v1/quality-recalculate \
  -H 'Content-Type: application/json' \
  -d '{}'

# Generate early warnings
curl -X POST https://kcncrtayycwdwrxcgler.supabase.co/functions/v1/early-warning-monitor \
  -H 'Content-Type: application/json' \
  -d '{}'
```

#### Option B: Using Admin UI
Add `<AdminSeedTestButtons />` to your admin dashboard and click the buttons.

### 3. Verify Results

```sql
-- Check warnings (should have 2-3: slow_response, negative_sentiment, maybe repeat_offender)
SELECT * FROM public.early_warnings 
ORDER BY created_at DESC 
LIMIT 10;

-- Check KPIs
SELECT * FROM public.mv_dispute_kpis 
ORDER BY day DESC 
LIMIT 7;

-- Check quality scores
SELECT user_id, score, breakdown 
FROM public.quality_scores 
WHERE score < 60 OR score >= 80
ORDER BY last_recalculated_at DESC;

-- Check message sentiments
SELECT ms.*, dm.message 
FROM public.message_sentiments ms
JOIN public.dispute_messages dm ON dm.id = ms.message_id
ORDER BY ms.computed_at DESC 
LIMIT 10;
```

### 4. Test UI

1. **Feature Flag**: Enable `analytics_v1` in Feature Flags Manager
2. **Navigate**: Go to `/admin/analytics/disputes`
3. **Verify**:
   - KPI cards show data
   - Early Warning Panel shows warnings
   - Export buttons work (CSV/JSON)
4. **Navigate**: Go to dispute details page
5. **Verify**:
   - Quality badges appear for client/pro
   - Audit Log tab shows timeline
   - Feedback prompt appears on resolution

### 5. Cleanup

Replace `REPLACE_WITH_SEEDED_DISPUTE_ID` with your UUID:

```sql
-- Execute: scripts/cleanup_sprint_154_demo.sql
DO $$
DECLARE
  v_dispute uuid := 'PASTE_YOUR_UUID_HERE';
BEGIN
  DELETE FROM public.early_warnings WHERE dispute_id = v_dispute;
  DELETE FROM public.case_audit_trail WHERE dispute_id = v_dispute;
  DELETE FROM public.dispute_outcomes WHERE dispute_id = v_dispute;
  DELETE FROM public.dispute_messages WHERE dispute_id = v_dispute;
  DELETE FROM public.message_sentiments WHERE message_id IN (
    SELECT id FROM public.dispute_messages WHERE dispute_id = v_dispute
  );
  DELETE FROM public.disputes WHERE id = v_dispute;
  
  PERFORM public.refresh_analytics_views();
  RAISE NOTICE 'Cleaned seed dispute %', v_dispute;
END $$;
```

## Expected Warnings

After running the edge functions, you should see:

1. **slow_response (professional)**
   - Last message from client: 8h ago
   - Professional hasn't replied
   - Threshold: 6h for professionals

2. **negative_sentiment**
   - 3 negative messages in last 5
   - Average sentiment ≤ -0.35

3. **repeat_offender** (if quality < 60)
   - Professional quality score: 55
   - Threshold: 60

## Troubleshooting

### No warnings generated
- Check edge function logs in Supabase dashboard
- Verify `verify_jwt = false` in `supabase/config.toml`
- Ensure seed script ran successfully
- Run `SELECT * FROM disputes WHERE status = 'open'` to verify dispute exists

### KPIs not showing
- Run `SELECT public.refresh_analytics_views();`
- Check materialized views: `SELECT * FROM mv_dispute_kpis;`
- Verify dispute has correct timestamps

### Quality scores not updating
- Check `quality-recalculate` function logs
- Verify `quality_scores` table has data
- Run manually: `SELECT public.recalculate_quality_score('USER_UUID');`

### Sentiment not analyzing
- Check `sentiment-batch` function logs
- Verify `message_sentiments` table exists
- Check message content has negative keywords

## Cron Job Setup (Production)

To enable automatic monitoring, set up cron jobs in Supabase:

```sql
-- Run scripts/cron_setup.sql (requires service role key)

-- Verify jobs are scheduled:
SELECT * FROM cron.job;

-- Check job execution logs:
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 20;
```

## Manual Testing Scenarios

### Scenario 1: Inactivity Warning
1. Seed dispute
2. Wait 8+ hours (or adjust seed timestamps)
3. Run `early-warning-monitor`
4. Verify `slow_response` warning

### Scenario 2: Negative Sentiment
1. Seed dispute with negative messages
2. Run `sentiment-batch`
3. Run `early-warning-monitor`
4. Verify `negative_sentiment` warning

### Scenario 3: Quality Score Impact
1. Lower a user's quality score: `UPDATE quality_scores SET score = 45 WHERE user_id = '...'`
2. Create dispute with that user
3. Run `early-warning-monitor`
4. Verify `repeat_offender` warning

### Scenario 4: Post-Resolution Feedback
1. Seed dispute
2. Update status: `UPDATE disputes SET status = 'resolved' WHERE id = '...'`
3. Open dispute details page as a party
4. Verify feedback prompt appears
5. Submit feedback
6. Check `dispute_feedback` table

## Performance Testing

```sql
-- Generate 100 disputes
DO $$
BEGIN
  FOR i IN 1..100 LOOP
    INSERT INTO disputes (title, description, created_by, disputed_against, status, created_at)
    SELECT 
      'Load Test Dispute ' || i,
      'Testing performance',
      (SELECT id FROM auth.users LIMIT 1),
      (SELECT id FROM auth.users LIMIT 1 OFFSET 1),
      'open',
      now() - (random() * interval '30 days');
  END LOOP;
END $$;

-- Refresh views
SELECT public.refresh_analytics_views();

-- Test dashboard load time (should be < 2s)
SELECT * FROM mv_dispute_kpis;

-- Test warning generation (should process < 10s)
-- Run early-warning-monitor and check logs
```

## CI/CD Integration

Add to your test suite:

```bash
#!/bin/bash
# test_sprint_154.sh

echo "Seeding demo data..."
psql $DATABASE_URL -f scripts/seed_sprint_154_demo.sql

echo "Running edge functions..."
curl -X POST $SUPABASE_URL/functions/v1/sentiment-batch
curl -X POST $SUPABASE_URL/functions/v1/quality-recalculate
curl -X POST $SUPABASE_URL/functions/v1/early-warning-monitor

echo "Verifying warnings..."
WARNINGS=$(psql $DATABASE_URL -t -c "SELECT COUNT(*) FROM early_warnings WHERE created_at > now() - interval '1 minute'")

if [ "$WARNINGS" -lt 2 ]; then
  echo "❌ Expected at least 2 warnings, got $WARNINGS"
  exit 1
fi

echo "✅ All tests passed"
exit 0
```

## Support

For issues:
1. Check edge function logs
2. Review RLS policies
3. Verify cron job status
4. Check `docs/SPRINT_15_4.md` for known limitations
