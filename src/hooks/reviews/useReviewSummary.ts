import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ReviewSummary {
  id: string;
  professional_id: string;
  micro_service_id: string | null;
  summary_text: string;
  key_strengths: string[];
  common_praise: string[];
  areas_mentioned: string[];
  reviews_analyzed: number;
  confidence_score: number;
  last_generated_at: string;
  version: number;
  is_active: boolean;
}

export const useReviewSummary = (professionalId: string, microServiceId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch active summary
  const { data: summary, isLoading } = useQuery({
    queryKey: ['review-summary', professionalId, microServiceId],
    queryFn: async () => {
      let query = supabase
        .from('review_summaries')
        .select('*')
        .eq('professional_id', professionalId)
        .eq('is_active', true)
        .order('version', { ascending: false })
        .limit(1);

      if (microServiceId) {
        query = query.eq('micro_service_id', microServiceId);
      } else {
        query = query.is('micro_service_id', null);
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      return data as ReviewSummary | null;
    },
    enabled: !!professionalId,
  });

  // Generate new summary
  const generateSummary = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-review-summary', {
        body: {
          professionalId,
          microServiceId: microServiceId || null,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['review-summary', professionalId] 
      });
      toast({
        title: 'Success',
        description: 'Review summary generated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate summary',
        variant: 'destructive',
      });
    },
  });

  return {
    summary,
    isLoading,
    generateSummary,
    isGenerating: generateSummary.isPending,
  };
};
