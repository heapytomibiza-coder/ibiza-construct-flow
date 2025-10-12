import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProfessionalJobQuote {
  id: string;
  job_id: string;
  quote_amount: number;
  currency: string;
  estimated_duration_hours?: number;
  estimated_start_date?: string;
  proposal_message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  created_at: string;
  updated_at: string;
  job: {
    id: string;
    title: string;
    description: string;
    status: string;
    client_id: string;
    client?: {
      full_name: string;
      display_name: string;
      avatar_url?: string;
    }[];
  };
}

export const useProfessionalJobQuotes = (professionalId: string) => {
  const queryClient = useQueryClient();

  // Fetch all quotes submitted by this professional
  const { data: quotes, isLoading } = useQuery({
    queryKey: ['professional-job-quotes', professionalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_quotes')
        .select(`
          id,
          job_id,
          quote_amount,
          currency,
          estimated_duration_hours,
          estimated_start_date,
          proposal_message,
          status,
          created_at,
          updated_at,
          job:jobs!job_id (
            id,
            title,
            description,
            status,
            client_id,
            client:profiles!client_id (
              full_name,
              display_name,
              avatar_url
            )
          )
        `)
        .eq('professional_id', professionalId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ProfessionalJobQuote[];
    },
    enabled: !!professionalId
  });

  // Submit a new quote
  const submitQuote = useMutation({
    mutationFn: async (data: {
      job_id: string;
      quote_amount: number;
      estimated_duration_hours?: number;
      estimated_start_date?: string;
      proposal_message: string;
    }) => {
      const { data: result, error } = await supabase
        .from('job_quotes')
        .insert({
          ...data,
          professional_id: professionalId
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success('Quote submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['professional-job-quotes', professionalId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit quote');
    }
  });

  // Withdraw a quote
  const withdrawQuote = useMutation({
    mutationFn: async (quoteId: string) => {
      const { error } = await supabase
        .from('job_quotes')
        .update({ status: 'withdrawn' })
        .eq('id', quoteId)
        .eq('professional_id', professionalId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Quote withdrawn');
      queryClient.invalidateQueries({ queryKey: ['professional-job-quotes', professionalId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to withdraw quote');
    }
  });

  return {
    quotes: quotes || [],
    isLoading,
    submitQuote,
    withdrawQuote
  };
};
