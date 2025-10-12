import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface JobQuote {
  id: string;
  job_id: string;
  professional_id: string;
  quote_amount: number;
  currency: string;
  estimated_duration_hours?: number;
  estimated_start_date?: string;
  proposal_message: string;
  attachments?: any[];
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  accepted_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface SubmitQuoteData {
  job_id: string;
  quote_amount: number;
  estimated_duration_hours?: number;
  estimated_start_date?: string;
  proposal_message: string;
  attachments?: any[];
}

export const useJobQuotes = (jobId?: string) => {
  const queryClient = useQueryClient();

  // Fetch quotes for a specific job
  const { data: quotes, isLoading } = useQuery({
    queryKey: ['job-quotes', jobId],
    queryFn: async () => {
      if (!jobId) return [];
      
      const { data, error } = await supabase
        .from('job_quotes')
        .select(`
          *,
          professional:profiles!professional_id(
            id,
            full_name,
            display_name,
            avatar_url
          )
        `)
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as any[];
    },
    enabled: !!jobId
  });

  // Submit a new quote
  const submitQuote = useMutation({
    mutationFn: async (quoteData: SubmitQuoteData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('job_quotes')
        .insert({
          ...quoteData,
          professional_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Quote submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['job-quotes'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit quote');
    }
  });

  // Accept a quote
  const acceptQuote = useMutation({
    mutationFn: async (quoteId: string) => {
      const { error } = await supabase
        .from('job_quotes')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', quoteId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Quote accepted');
      queryClient.invalidateQueries({ queryKey: ['job-quotes'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to accept quote');
    }
  });

  // Reject a quote
  const rejectQuote = useMutation({
    mutationFn: async ({ quoteId, reason }: { quoteId: string; reason?: string }) => {
      const { error } = await supabase
        .from('job_quotes')
        .update({
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          rejection_reason: reason
        })
        .eq('id', quoteId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Quote rejected');
      queryClient.invalidateQueries({ queryKey: ['job-quotes'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reject quote');
    }
  });

  // Withdraw a quote
  const withdrawQuote = useMutation({
    mutationFn: async (quoteId: string) => {
      const { error } = await supabase
        .from('job_quotes')
        .update({
          status: 'withdrawn'
        })
        .eq('id', quoteId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Quote withdrawn');
      queryClient.invalidateQueries({ queryKey: ['job-quotes'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to withdraw quote');
    }
  });

  return {
    quotes,
    isLoading,
    submitQuote,
    acceptQuote,
    rejectQuote,
    withdrawQuote
  };
};
