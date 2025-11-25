/**
 * Professional Actions Hook
 * Phase 11: Professional Tools & Insights
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useProfessionalActions = () => {
  const queryClient = useQueryClient();

  const markInsightAsRead = useMutation({
    mutationFn: async (insightId: string) => {
      const { error } = await supabase
        .from('professional_insights')
        .update({ is_read: true })
        .eq('id', insightId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-insights'] });
    },
    onError: (error) => {
      console.error('Error marking insight as read:', error);
      toast.error('Failed to update insight');
    },
  });

  return {
    markInsightAsRead,
  };
};
