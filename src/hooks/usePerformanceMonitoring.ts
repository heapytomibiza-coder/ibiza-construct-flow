import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';

export function usePerformanceMonitoring() {
  const location = useLocation();

  const logMetric = useCallback(async (
    metricName: string,
    metricValue: number,
    metricType: string,
    metadata: any = {}
  ) => {
    const client: any = supabase;
    const { data: { user } } = await client.auth.getUser();

    await client.from('performance_metrics').insert({
      metric_name: metricName,
      metric_value: metricValue,
      metric_type: metricType,
      page_path: location.pathname,
      user_id: user?.id || null,
      metadata
    });
  }, [location.pathname]);

  const logSlowQuery = useCallback(async (
    queryText: string,
    executionTime: number,
    tableName: string,
    queryParams: any = {}
  ) => {
    if (executionTime < 1000) return; // Only log queries > 1 second

    const client: any = supabase;
    const { data: { user } } = await client.auth.getUser();

    await client.from('slow_query_log').insert({
      query_text: queryText,
      execution_time_ms: executionTime,
      table_name: tableName,
      user_id: user?.id || null,
      query_params: queryParams,
      stack_trace: new Error().stack
    });
  }, []);

  // Monitor Web Vitals
  useEffect(() => {
    if (typeof window === 'undefined') return;

    import('web-vitals').then(({ onCLS, onFID, onLCP, onTTFB, onFCP }) => {
      onCLS((metric) => logMetric('cls', metric.value, 'cls', { delta: metric.delta }));
      onFID((metric) => logMetric('fid', metric.value, 'fid', { delta: metric.delta }));
      onLCP((metric) => logMetric('lcp', metric.value, 'lcp', { delta: metric.delta }));
      onTTFB((metric) => logMetric('ttfb', metric.value, 'ttfb', { delta: metric.delta }));
      onFCP((metric) => logMetric('fcp', metric.value, 'fcp', { delta: metric.delta }));
    });
  }, [logMetric]);

  return {
    logMetric,
    logSlowQuery
  };
}
