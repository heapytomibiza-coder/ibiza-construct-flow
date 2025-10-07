import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SmartSuggestion {
  id: string;
  user_id: string;
  suggestion_type: 'response' | 'action' | 'improvement' | 'warning';
  context_type: string;
  context_id?: string;
  suggestion_text: string;
  reasoning?: string;
  confidence_score?: number;
  status: 'pending' | 'accepted' | 'rejected' | 'dismissed';
  applied_at?: string;
  created_at: string;
}

export const useSmartSuggestions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['smart-suggestions'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('smart_suggestions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as SmartSuggestion[];
    },
  });

  const updateSuggestionStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: SmartSuggestion['status'] }) => {
      const updates: any = { status };
      if (status === 'accepted') {
        updates.applied_at = new Date().toISOString();
      }

      const { error } = await (supabase as any)
        .from('smart_suggestions')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smart-suggestions'] });
      toast({
        title: 'Success',
        description: 'Suggestion updated',
      });
    },
  });

  const pendingSuggestions = suggestions?.filter((s) => s.status === 'pending');

  return {
    suggestions,
    pendingSuggestions,
    isLoading,
    updateSuggestionStatus: updateSuggestionStatus.mutate,
    isUpdating: updateSuggestionStatus.isPending,
  };
};