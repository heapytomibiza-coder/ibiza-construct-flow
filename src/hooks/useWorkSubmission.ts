import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useWorkSubmission(contractId?: string) {
  const queryClient = useQueryClient();

  // Fetch work submissions for a contract
  const { data: submissions, isLoading } = useQuery({
    queryKey: ['work-submissions', contractId],
    queryFn: async () => {
      if (!contractId) return [];
      
      const { data, error } = await supabase
        .from('work_submissions')
        .select('*')
        .eq('contract_id', contractId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!contractId,
  });

  // Submit work
  const submitWork = useMutation({
    mutationFn: async ({ 
      contractId, 
      notes, 
      attachments 
    }: { 
      contractId: string; 
      notes: string; 
      attachments?: any[] 
    }) => {
      const { data, error } = await supabase.functions.invoke('submit-work', {
        body: { contractId, notes, attachments },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-submissions', contractId] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast.success('Work submitted for review');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit work');
    },
  });

  // Approve/reject work
  const reviewWork = useMutation({
    mutationFn: async ({ 
      submissionId, 
      approved, 
      reviewNotes 
    }: { 
      submissionId: string; 
      approved: boolean; 
      reviewNotes?: string 
    }) => {
      const { data, error } = await supabase.functions.invoke('approve-work', {
        body: { submissionId, approved, reviewNotes },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['work-submissions', contractId] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast.success(data.approved ? 'Work approved!' : 'Revision requested');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to review work');
    },
  });

  // Release escrow
  const releaseEscrow = useMutation({
    mutationFn: async (contractId: string) => {
      const { data, error } = await supabase.functions.invoke('simple-release-escrow', {
        body: { contractId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['work-submissions', contractId] });
      toast.success('Payment released to professional');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to release payment');
    },
  });

  return {
    submissions,
    isLoading,
    submitWork: submitWork.mutate,
    reviewWork: reviewWork.mutate,
    releaseEscrow: releaseEscrow.mutate,
    isSubmitting: submitWork.isPending,
    isReviewing: reviewWork.isPending,
    isReleasing: releaseEscrow.isPending,
  };
}
