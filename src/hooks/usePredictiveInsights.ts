import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PredictiveInsight {
  id: string;
  insight_type: 'demand_forecast' | 'churn_risk' | 'price_optimization' | 'booking_likelihood';
  entity_type: string;
  entity_id?: string;
  prediction_value?: number;
  prediction_data: any;
  confidence_score?: number;
  factors?: any[];
  valid_until?: string;
  created_at: string;
}

export const usePredictiveInsights = (insightType?: string) => {
  const { data: insights, isLoading } = useQuery({
    queryKey: ['predictive-insights', insightType],
    queryFn: async () => {
      let query = (supabase as any)
        .from('predictive_insights')
        .select('*')
        .order('created_at', { ascending: false });

      if (insightType) {
        query = query.eq('insight_type', insightType);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;
      return data as PredictiveInsight[];
    },
  });

  const validInsights = insights?.filter(
    (insight) => !insight.valid_until || new Date(insight.valid_until) > new Date()
  );

  const getInsightsByType = (type: PredictiveInsight['insight_type']) => {
    return validInsights?.filter((insight) => insight.insight_type === type);
  };

  return {
    insights,
    validInsights,
    isLoading,
    getInsightsByType,
  };
};