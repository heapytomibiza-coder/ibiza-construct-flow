import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

interface Negotiation {
  id: string;
  offer_id: string;
  sender_id: string;
  message: string | null;
  proposed_amount: number | null;
  proposed_terms: any;
  status: string;
  created_at: string;
  sender?: {
    id: string;
    full_name: string | null;
  };
}

const NEGOTIATIONS_QUERY_KEY = (offerId: string) => ['negotiations', offerId];

export const useOptimisticOffers = (offerId?: string) => {
  const queryClient = useQueryClient();

  // Fetch negotiations
  const { data: negotiations = [], isLoading } = useQuery({
    queryKey: offerId ? NEGOTIATIONS_QUERY_KEY(offerId) : ['negotiations', 'none'],
    queryFn: async () => {
      if (!offerId) return [];
      
      const { data, error } = await supabase
        .from('offer_negotiations')
        .select(`
          *,
          sender:profiles!sender_id (
            id,
            full_name
          )
        `)
        .eq('offer_id', offerId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Negotiation[];
    },
    enabled: !!offerId,
    staleTime: 1000 * 60 * 2,
  });

  // Real-time subscription
  useEffect(() => {
    if (!offerId) return;

    const channel = supabase
      .channel(`negotiations:${offerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'offer_negotiations',
          filter: `offer_id=eq.${offerId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: NEGOTIATIONS_QUERY_KEY(offerId) });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [offerId, queryClient]);

  // Send counter offer with optimistic update
  const sendCounterMutation = useMutation({
    mutationFn: async ({ 
      proposedAmount, 
      message, 
      proposedTerms 
    }: { 
      proposedAmount: number; 
      message: string; 
      proposedTerms?: any;
    }) => {
      if (!offerId) throw new Error('No offer ID provided');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('offer_negotiations')
        .insert({
          offer_id: offerId,
          sender_id: user.id,
          proposed_amount: proposedAmount,
          message,
          proposed_terms: proposedTerms || {},
          status: 'countered'
        })
        .select(`
          *,
          sender:profiles!sender_id (
            id,
            full_name
          )
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ proposedAmount, message, proposedTerms }) => {
      if (!offerId) return;
      
      await queryClient.cancelQueries({ queryKey: NEGOTIATIONS_QUERY_KEY(offerId) });

      const previousNegotiations = queryClient.getQueryData<Negotiation[]>(
        NEGOTIATIONS_QUERY_KEY(offerId)
      );

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Optimistically add new negotiation
      const optimisticNegotiation: Negotiation = {
        id: `temp-${Date.now()}`,
        offer_id: offerId,
        sender_id: user?.id || '',
        message,
        proposed_amount: proposedAmount,
        proposed_terms: proposedTerms || {},
        status: 'countered',
        created_at: new Date().toISOString(),
        sender: {
          id: user?.id || '',
          full_name: null, // Will be filled in from response
        }
      };

      queryClient.setQueryData<Negotiation[]>(
        NEGOTIATIONS_QUERY_KEY(offerId),
        (old = []) => [...old, optimisticNegotiation]
      );

      return { previousNegotiations };
    },
    onError: (err, variables, context) => {
      if (offerId && context?.previousNegotiations) {
        queryClient.setQueryData(NEGOTIATIONS_QUERY_KEY(offerId), context.previousNegotiations);
      }
    },
    onSettled: () => {
      if (offerId) {
        queryClient.invalidateQueries({ queryKey: NEGOTIATIONS_QUERY_KEY(offerId) });
      }
    },
  });

  // Accept negotiation with optimistic update
  const acceptMutation = useMutation({
    mutationFn: async (negotiationId: string) => {
      const { error: updateError } = await supabase
        .from('offer_negotiations')
        .update({ status: 'accepted' })
        .eq('id', negotiationId);

      if (updateError) throw updateError;

      // Update the original offer
      const negotiation = negotiations.find(n => n.id === negotiationId);
      if (negotiation?.proposed_amount && offerId) {
        const { error: offerError } = await supabase
          .from('offers')
          .update({ 
            amount: negotiation.proposed_amount,
            status: 'accepted'
          })
          .eq('id', offerId);

        if (offerError) throw offerError;
      }

      return negotiationId;
    },
    onMutate: async (negotiationId) => {
      if (!offerId) return;
      
      await queryClient.cancelQueries({ queryKey: NEGOTIATIONS_QUERY_KEY(offerId) });

      const previousNegotiations = queryClient.getQueryData<Negotiation[]>(
        NEGOTIATIONS_QUERY_KEY(offerId)
      );

      queryClient.setQueryData<Negotiation[]>(
        NEGOTIATIONS_QUERY_KEY(offerId),
        (old = []) => 
          old.map(neg => 
            neg.id === negotiationId 
              ? { ...neg, status: 'accepted' }
              : neg
          )
      );

      return { previousNegotiations };
    },
    onError: (err, variables, context) => {
      if (offerId && context?.previousNegotiations) {
        queryClient.setQueryData(NEGOTIATIONS_QUERY_KEY(offerId), context.previousNegotiations);
      }
    },
    onSettled: () => {
      if (offerId) {
        queryClient.invalidateQueries({ queryKey: NEGOTIATIONS_QUERY_KEY(offerId) });
      }
    },
  });

  // Decline negotiation
  const declineMutation = useMutation({
    mutationFn: async (negotiationId: string) => {
      const { error } = await supabase
        .from('offer_negotiations')
        .update({ status: 'declined' })
        .eq('id', negotiationId);

      if (error) throw error;
      return negotiationId;
    },
    onSuccess: () => {
      if (offerId) {
        queryClient.invalidateQueries({ queryKey: NEGOTIATIONS_QUERY_KEY(offerId) });
      }
    },
  });

  return {
    negotiations,
    loading: isLoading,
    sendCounterOffer: (proposedAmount: number, message: string, proposedTerms?: any) =>
      sendCounterMutation.mutateAsync({ proposedAmount, message, proposedTerms }),
    acceptNegotiation: acceptMutation.mutateAsync,
    declineNegotiation: declineMutation.mutateAsync,
    latestOffer: negotiations[negotiations.length - 1],
  };
};

// Prefetch function for hover
export const prefetchNegotiations = (queryClient: any, offerId: string) => {
  queryClient.prefetchQuery({
    queryKey: NEGOTIATIONS_QUERY_KEY(offerId),
    queryFn: async () => {
      const { data } = await supabase
        .from('offer_negotiations')
        .select(`
          *,
          sender:profiles!sender_id (
            id,
            full_name
          )
        `)
        .eq('offer_id', offerId)
        .order('created_at', { ascending: true });
      return data;
    },
    staleTime: 1000 * 60 * 2,
  });
};
