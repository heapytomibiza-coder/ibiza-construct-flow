import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export const useOfferNegotiation = (offerId?: string) => {
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!offerId) {
      setLoading(false);
      return;
    }

    const fetchNegotiations = async () => {
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

      if (error) {
        console.error('Error fetching negotiations:', error);
      } else {
        setNegotiations(data || []);
      }
      setLoading(false);
    };

    fetchNegotiations();

    // Subscribe to real-time updates
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
          fetchNegotiations();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [offerId]);

  const sendCounterOffer = useCallback(async (
    proposedAmount: number,
    message: string,
    proposedTerms?: any
  ) => {
    if (!offerId) throw new Error('No offer ID provided');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('offer_negotiations')
      .insert({
        offer_id: offerId,
        sender_id: user.id,
        proposed_amount: proposedAmount,
        message,
        proposed_terms: proposedTerms || {},
        status: 'countered'
      });

    if (error) throw error;
  }, [offerId]);

  const acceptNegotiation = useCallback(async (negotiationId: string) => {
    const { error: updateError } = await supabase
      .from('offer_negotiations')
      .update({ status: 'accepted' })
      .eq('id', negotiationId);

    if (updateError) throw updateError;

    // Update the original offer with the accepted terms
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
  }, [negotiations, offerId]);

  const declineNegotiation = useCallback(async (negotiationId: string) => {
    const { error } = await supabase
      .from('offer_negotiations')
      .update({ status: 'declined' })
      .eq('id', negotiationId);

    if (error) throw error;
  }, []);

  return {
    negotiations,
    loading,
    sendCounterOffer,
    acceptNegotiation,
    declineNegotiation,
    latestOffer: negotiations[negotiations.length - 1]
  };
};
