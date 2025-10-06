import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ScheduledCall {
  id: string;
  host_id: string;
  participant_ids: string[];
  title: string;
  description?: string;
  scheduled_start: string;
  scheduled_end: string;
  call_session_id?: string;
  reminder_sent: boolean;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'missed';
  meeting_url?: string;
  created_at: string;
  updated_at: string;
}

export const useScheduledCalls = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: scheduledCalls, isLoading } = useQuery({
    queryKey: ['scheduled-calls'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('scheduled_calls')
        .select('*')
        .order('scheduled_start', { ascending: true });

      if (error) throw error;
      return data as ScheduledCall[];
    },
  });

  const createScheduledCall = useMutation({
    mutationFn: async (callData: Partial<ScheduledCall>) => {
      const { data, error } = await (supabase as any)
        .from('scheduled_calls')
        .insert(callData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-calls'] });
      toast({
        title: 'Success',
        description: 'Call scheduled successfully',
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

  const updateScheduledCall = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ScheduledCall> }) => {
      const { data, error } = await (supabase as any)
        .from('scheduled_calls')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-calls'] });
      toast({
        title: 'Success',
        description: 'Call updated successfully',
      });
    },
  });

  const cancelScheduledCall = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('scheduled_calls')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-calls'] });
      toast({
        title: 'Success',
        description: 'Call cancelled successfully',
      });
    },
  });

  const upcomingCalls = scheduledCalls?.filter(
    (call) => call.status === 'scheduled' && new Date(call.scheduled_start) > new Date()
  );

  return {
    scheduledCalls,
    upcomingCalls,
    isLoading,
    createScheduledCall: createScheduledCall.mutate,
    updateScheduledCall: updateScheduledCall.mutate,
    cancelScheduledCall: cancelScheduledCall.mutate,
    isCreating: createScheduledCall.isPending,
  };
};