# Sprint 15.4 — Analytics, Prevention & Quality Control

## Overview
Comprehensive dispute analytics, early warning system, quality scoring, audit trails, and post-resolution feedback.

## Core Components

### 1. Dispute Analytics Dashboard
- **Location**: `/admin/analytics/disputes`
- **Components**: `DisputeAnalyticsDashboard`, `EarlyWarningPanel`
- **Features**: KPI tracking, trend visualization, CSV/PDF exports
- **Access**: Admin-only (feature flag: `analytics_v1`)

### 2. Early Warning System
- **Triggers**: Inactivity >12h (client) / >6h (pro), sentiment ≤ -0.35, deadline breach
- **Monitor**: Edge function runs every 15 minutes
- **Resolution**: Admins can mark warnings as resolved
- **Storage**: `early_warnings` table with RLS

### 3. Quality Scoring
- **Calculation**: Hourly recalculation via edge function
- **Factors**: Response time, cooperation score, outcome impact, escalations
- **Visibility**: Private (user + admin only)
- **Access**: Feature flag `quality_score_private`

### 4. Audit Trail
- **Tracking**: Status changes, messages, evidence uploads, resolution events
- **Display**: Timeline view in dispute details
- **Security**: Parties + admin can view

### 5. Post-Resolution Feedback
- **Trigger**: When dispute status = 'resolved'
- **Metrics**: Fairness (1-5), Professionalism (1-5), Comments
- **Storage**: `dispute_feedback` table

## Data Architecture

### Tables
- `dispute_outcomes` - Final dispute resolutions
- `case_audit_trail` - Event tracking
- `quality_scores` - User quality metrics
- `early_warnings` - Risk flags
- `message_sentiments` - Sentiment analysis
- `dispute_feedback` - Post-resolution surveys

### Materialized Views
- `mv_dispute_kpis` - Aggregate metrics
- `mv_user_dispute_stats` - Per-user stats

### RPC Functions
- `get_dispute_kpis()` - Dashboard KPIs
- `list_early_warnings()` - Active warnings
- `resolve_warning(id)` - Mark resolved
- `get_my_quality()` - User quality score
- `is_feature_on(key)` - Feature flag check

## Security Model

### RLS Policies
- **Admin Override**: Admins bypass most restrictions
- **Party Access**: Dispute parties see their own data
- **Quality Scores**: Owner + admin only
- **Sentiment Analysis**: Admin-only

### Feature Flags
- `analytics_v1` - Controls dashboard access (OFF by default)
- `quality_score_private` - Controls quality score visibility (ON by default)
- `early_warning_monitor` - Controls background monitoring (OFF by default)

## Operations

### Cron Jobs
```sql
-- Hourly at :00
quality-recalculate-hourly

-- Every 15 minutes
early-warning-monitor-15m

-- Every 10 minutes
sentiment-batch-10m

-- Mondays 06:00 UTC (08:00 Madrid)
weekly-insights-digest
```

### Setup
1. Enable extensions: `pg_cron`, `pg_net`
2. Set service role key:
   ```sql
   ALTER DATABASE postgres SET app.settings.service_role_key = '<KEY>';
   SELECT pg_reload_conf();
   ```
3. Verify jobs: `SELECT * FROM cron.job;`

## Frontend Integration

### Routes
- `/admin/analytics/disputes` - Main dashboard
- `/admin/warnings` - Standalone warnings page (future)

### Components
- `DisputeAnalyticsDashboard` - KPI cards + trends
- `EarlyWarningPanel` - Warning list with actions
- `QualityScoreDetail` - User quality breakdown
- `CaseAuditViewer` - Audit trail display
- `FeedbackPrompt` - Post-resolution survey

### Hooks
- `useDisputeAnalytics()` - Load KPIs + warnings
- `useFeatureFlag(key)` - Check single flag
- `useFeatureFlags()` - Manage all flags (admin)

## Testing Checklist

### Security
- [ ] Non-admin cannot access analytics dashboard
- [ ] Users can only see their own quality scores
- [ ] Sentiment data is admin-only
- [ ] Feature flags require admin to toggle

### Functionality
- [ ] KPIs load and display correctly
- [ ] Warnings generate on inactivity/sentiment/deadlines
- [ ] Quality scores recalculate hourly
- [ ] Audit log captures all events
- [ ] Feedback prompt appears on resolution
- [ ] CSV export works
- [ ] PDF export stub returns JSON

### Performance
- [ ] Dashboard loads in <2s
- [ ] Real-time updates propagate in <5s
- [ ] Cron jobs execute on schedule
- [ ] No N+1 queries in analytics

## Rollout Plan

### Phase 1 (Current)
1. Deploy storage security + feature flags v2 ✅
2. Deploy edge functions ✅
3. Add routes + guards ✅
4. Integrate components ✅
5. Configure cron jobs ⚠️ (requires manual service key setup)

### Phase 2 (Next Sprint)
1. Enable `analytics_v1` for admins
2. Test end-to-end with seeded data
3. Monitor edge function performance
4. Gather admin feedback
5. Iterate on UI/UX

### Phase 3 (Future)
1. Add trend charts (line/bar graphs)
2. Implement quality score distribution histogram
3. Add email notifications for urgent warnings
4. Create public analytics API for partners
5. Build mobile-optimized views

## Decisions Log

### Why Keyword-Based Sentiment?
- No external API costs/latency
- Good enough for MVP (simple negative/positive/neutral)
- Can upgrade to ML later without schema changes

### Why Private Quality Scores?
- Avoid gamification/anxiety
- Focus on self-improvement
- Admins need visibility for mediation

### Why Conservative Warning Thresholds?
- Reduce false positives
- Client: 12h (gives breathing room)
- Professional: 6h (paid service, faster expected)
- Sentiment: ≤ -0.35 (clear negative signal)

### Why Hourly Quality Recalculation?
- Balance freshness vs. DB load
- Near real-time for admins
- Users don't need instant updates

## Success Metrics

### Week 1
- 100% admin adoption (all admins view dashboard once)
- <5 false positive warnings
- Zero security incidents

### Month 1
- 50% reduction in avg resolution time
- 80% feedback completion rate
- Quality scores correlate with dispute outcomes (r > 0.6)

### Quarter 1
- 30% fewer escalations due to early intervention
- 90% admin satisfaction with analytics
- Platform NPS +15 points

## Known Limitations

1. **Sentiment Analysis**: Simple keyword matching (no context awareness)
2. **Quality Score**: Backward-looking (doesn't predict future behavior)
3. **PDF Export**: Currently returns JSON (needs formatting)
4. **Mobile UI**: Not optimized for small screens
5. **Real-time**: 15-min delay on warnings (not instant)

## Future Enhancements

- [ ] ML-based sentiment analysis (integrate OpenAI/Anthropic)
- [ ] Predictive quality scoring (forecast dispute likelihood)
- [ ] Automated mediation suggestions (AI-powered)
- [ ] Multi-language sentiment support
- [ ] Custom warning rules per admin
- [ ] Quality score leaderboard (opt-in for professionals)
- [ ] Export to Excel with charts
- [ ] Slack/Discord webhook notifications

## Support

### Troubleshooting
- **Cron jobs not running**: Check service role key is set
- **Quality scores not updating**: Verify `quality-recalculate` function logs
- **Warnings not appearing**: Check `early-warning-monitor` logs + thresholds
- **Feature flags not working**: Clear browser cache, check RLS policies

### Logs
- Edge functions: Supabase dashboard → Functions → Logs
- Cron jobs: `SELECT * FROM cron.job_run_details ORDER BY start_time DESC;`
- RLS violations: `SELECT * FROM postgres_logs WHERE error_severity = 'ERROR';`

### Contacts
- Backend: [Team Lead]
- Frontend: [Team Lead]
- Security: [Security Team]
- Product: [Product Owner]
