/**
 * Professional Metrics Hook
 * Phase 11: Professional Tools & Insights
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type ProfessionalMetric = Database['public']['Tables']['professional_metrics']['Row'];
type ProfessionalInsight = Database['public']['Tables']['professional_insights']['Row'];
type RevenueForecast = Database['public']['Tables']['revenue_forecasts']['Row'];
type CompetitorBenchmark = Database['public']['Tables']['competitor_benchmarks']['Row'];

export const useProfessionalMetrics = (professionalId: string | undefined, dateRange?: { start: Date; end: Date }) => {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['professional-metrics', professionalId, dateRange],
    queryFn: async () => {
      if (!professionalId) return [];
      
      let query = supabase
        .from('professional_metrics')
        .select('*')
        .eq('professional_id', professionalId)
        .order('metric_date', { ascending: false });

      if (dateRange) {
        query = query
          .gte('metric_date', dateRange.start.toISOString().split('T')[0])
          .lte('metric_date', dateRange.end.toISOString().split('T')[0]);
      } else {
        query = query.limit(30);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ProfessionalMetric[];
    },
    enabled: !!professionalId,
  });

  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ['professional-insights', professionalId],
    queryFn: async () => {
      if (!professionalId) return [];
      
      const { data, error } = await supabase
        .from('professional_insights')
        .select('*')
        .eq('professional_id', professionalId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as ProfessionalInsight[];
    },
    enabled: !!professionalId,
  });

  const { data: forecasts, isLoading: forecastsLoading } = useQuery({
    queryKey: ['revenue-forecasts', professionalId],
    queryFn: async () => {
      if (!professionalId) return [];
      
      const { data, error } = await supabase
        .from('revenue_forecasts')
        .select('*')
        .eq('professional_id', professionalId)
        .order('forecast_date', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as RevenueForecast[];
    },
    enabled: !!professionalId,
  });

  const { data: benchmarks, isLoading: benchmarksLoading } = useQuery({
    queryKey: ['competitor-benchmarks', professionalId],
    queryFn: async () => {
      if (!professionalId) return [];
      
      const { data, error } = await supabase
        .from('competitor_benchmarks')
        .select('*')
        .eq('professional_id', professionalId)
        .order('benchmark_date', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as CompetitorBenchmark[];
    },
    enabled: !!professionalId,
  });

  return {
    metrics,
    insights,
    forecasts,
    benchmarks,
    isLoading: metricsLoading || insightsLoading || forecastsLoading || benchmarksLoading,
  };
};
