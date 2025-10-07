import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AIRecommendation {
  id: string;
  user_id: string;
  recommendation_type: string;
  entity_type: string;
  entity_id?: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  data: any;
  confidence_score?: number;
  recommendation_score?: number;
  reasoning?: string;
  action_data?: any;
  expires_at?: string;
  viewed_at?: string;
  actioned_at?: string;
  created_at: string;
}

export const useAIRecommendations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['ai-recommendations'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('ai_recommendations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as AIRecommendation[];
    },
  });

  const generateRecommendations = useMutation({
    mutationFn: async ({ recommendationType, jobId }: { recommendationType: string; jobId?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('ai-recommendation-engine', {
        body: { userId: user.id, jobId, recommendationType }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations'] });
      toast({
        title: 'Success',
        description: 'AI recommendations generated successfully',
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

  const markAsViewed = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('ai_recommendations')
        .update({ viewed_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations'] });
    },
  });

  const activeRecommendations = recommendations?.filter(
    (rec) => rec.status === 'pending' && (!rec.expires_at || new Date(rec.expires_at) > new Date())
  );

  const highPriorityRecommendations = activeRecommendations?.filter(
    (rec) => rec.priority === 'high'
  );

  return {
    recommendations,
    activeRecommendations,
    highPriorityRecommendations,
    isLoading,
    generateRecommendations: generateRecommendations.mutate,
    markAsViewed: markAsViewed.mutate,
    isGenerating: generateRecommendations.isPending,
  };
};