import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSentimentAnalysis = (entityType?: string, entityId?: string) => {
  const { toast } = useToast();

  const { data: sentimentData, isLoading } = useQuery({
    queryKey: ['sentiment-analysis', entityType, entityId],
    queryFn: async () => {
      if (!entityType || !entityId) return null;

      const { data, error } = await (supabase as any)
        .from('sentiment_analysis')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!entityType && !!entityId,
  });

  const analyzeSentiment = useMutation({
    mutationFn: async ({ textContent, entityType, entityId }: {
      textContent: string;
      entityType: string;
      entityId: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('sentiment-analyzer', {
        body: { textContent, entityType, entityId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Sentiment analysis completed',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    sentimentData,
    isLoading,
    analyzeSentiment: analyzeSentiment.mutate,
    isAnalyzing: analyzeSentiment.isPending,
  };
};