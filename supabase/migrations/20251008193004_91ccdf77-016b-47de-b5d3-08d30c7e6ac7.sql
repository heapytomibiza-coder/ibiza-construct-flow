-- Enable realtime for analytics_events table
ALTER PUBLICATION supabase_realtime ADD TABLE public.analytics_events;

-- Create index for faster realtime queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_realtime 
ON public.analytics_events(created_at DESC, event_name);

-- Create materialized view for live KPIs
CREATE MATERIALIZED VIEW IF NOT EXISTS public.analytics_live_kpis AS
SELECT
  COUNT(*) FILTER (WHERE event_name = 'wizard_step_viewed') as wizard_starts,
  COUNT(*) FILTER (WHERE event_name = 'wizard_abandoned') as abandonments,
  COUNT(*) FILTER (WHERE event_name = 'form_validation_error') as validation_errors,
  COUNT(*) FILTER (WHERE event_name = 'form_field_focused') as field_focuses,
  COUNT(DISTINCT session_id) as active_sessions,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '5 minutes') as events_last_5min,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour') as events_last_hour
FROM public.analytics_events
WHERE created_at > NOW() - INTERVAL '1 hour';

-- Create index for materialized view refresh (without predicate)
CREATE INDEX IF NOT EXISTS idx_analytics_live_kpis_refresh 
ON public.analytics_events(created_at DESC);

-- Schedule materialized view refresh every 30 seconds
SELECT cron.schedule(
  'refresh-analytics-live-kpis',
  '*/30 * * * * *',
  $$REFRESH MATERIALIZED VIEW public.analytics_live_kpis;$$
);

-- Enable realtime for ux_health_checks table
ALTER PUBLICATION supabase_realtime ADD TABLE public.ux_health_checks;

-- Create index for ux_health_checks realtime queries (without predicate)
CREATE INDEX IF NOT EXISTS idx_ux_health_checks_realtime 
ON public.ux_health_checks(detected_at DESC, severity);