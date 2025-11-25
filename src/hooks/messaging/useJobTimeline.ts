import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { JobTimelineEvent } from '@/types/messaging';

export const useJobTimeline = (jobId: string | null | undefined) => {
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['job-timeline', jobId],
    queryFn: async () => {
      if (!jobId) return [];
      
      const { data, error } = await supabase
        .from('job_timeline_events')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as JobTimelineEvent[];
    },
    enabled: !!jobId,
  });

  const addEvent = useMutation({
    mutationFn: async (event: Omit<JobTimelineEvent, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('job_timeline_events')
        .insert(event)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-timeline', jobId] });
    },
  });

  return { events, isLoading, addEvent };
};
