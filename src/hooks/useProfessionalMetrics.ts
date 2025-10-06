import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProfessionalMetrics {
  id: string;
  professional_id: string;
  period_start: string;
  period_end: string;
  total_jobs: number;
  completed_jobs: number;
  completion_rate: number;
  average_rating: number;
  total_revenue: number;
  average_response_time: number;
  client_satisfaction_score: number;
  quality_score: number;
  reliability_score: number;
  communication_score: number;
  overall_score: number;
  rank_in_category?: number;
  metadata: Record<string, any>;
  calculated_at: string;
}

export const useProfessionalMetrics = (professionalId?: string) => {
  const [metrics, setMetrics] = useState<ProfessionalMetrics[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<ProfessionalMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!professionalId) {
      setLoading(false);
      return;
    }

    fetchMetrics();
  }, [professionalId]);

  const fetchMetrics = async () => {
    if (!professionalId) return;

    try {
      // Fetch historical metrics
      const { data: allMetrics, error: allError } = await (supabase as any)
        .from('professional_performance_metrics')
        .select('*')
        .eq('professional_id', professionalId)
        .order('period_start', { ascending: false })
        .limit(12);

      if (!allError && allMetrics) {
        setMetrics(allMetrics);
        setCurrentMetrics(allMetrics[0] || null);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = async (startDate: string, endDate: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('calculate-professional-metrics', {
        body: {
          professional_id: professionalId,
          start_date: startDate,
          end_date: endDate
        }
      });

      if (error) throw error;
      
      await fetchMetrics();
      return data;
    } catch (error) {
      console.error('Error calculating metrics:', error);
      throw error;
    }
  };

  return {
    metrics,
    currentMetrics,
    loading,
    calculateMetrics,
    refresh: fetchMetrics
  };
};
