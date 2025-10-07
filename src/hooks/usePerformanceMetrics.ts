import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PerformanceMetric {
  id: string;
  metric_type: string;
  metric_value: number;
  metric_unit: string;
  period_start: string;
  period_end: string;
  metadata: any;
  created_at: string;
}

export const usePerformanceMetrics = (dateRange?: { start: string; end: string }) => {
  const queryClient = useQueryClient();

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['performance-metrics', dateRange],
    queryFn: async () => {
      let query = (supabase as any)
        .from('performance_metrics')
        .select('*')
        .order('created_at', { ascending: false });

      if (dateRange) {
        query = query
          .gte('period_start', dateRange.start)
          .lte('period_end', dateRange.end);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PerformanceMetric[];
    },
  });

  const addMetric = useMutation({
    mutationFn: async (metric: Omit<PerformanceMetric, 'id' | 'created_at'>) => {
      const { data, error } = await (supabase as any)
        .from('performance_metrics')
        .insert(metric)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-metrics'] });
    },
  });

  const generateReport = useMutation({
    mutationFn: async (dateRange: { start: string; end: string }) => {
      const { data, error } = await supabase.functions.invoke('report-generator', {
        body: {
          reportType: 'performance',
          dateRange,
        },
      });

      if (error) throw error;
      return data;
    },
  });

  const metricsByType = metrics?.reduce((acc, m) => {
    if (!acc[m.metric_type]) {
      acc[m.metric_type] = [];
    }
    acc[m.metric_type].push(m);
    return acc;
  }, {} as Record<string, PerformanceMetric[]>);

  return {
    metrics,
    metricsByType,
    isLoading,
    addMetric: addMetric.mutate,
    generateReport: generateReport.mutateAsync,
  };
};
