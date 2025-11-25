import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type CounterProposal = Database['public']['Tables']['counter_proposals']['Row'];

export function useCounterProposals(disputeId: string) {
  const [proposals, setProposals] = useState<CounterProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadProposals = async () => {
    try {
      const { data, error } = await supabase
        .from('counter_proposals')
        .select('*')
        .eq('dispute_id', disputeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProposals((data || []) as CounterProposal[]);
    } catch (error: any) {
      toast({
        title: 'Error loading proposals',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProposals();

    const channel = supabase
      .channel(`counter_proposals:${disputeId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'counter_proposals',
          filter: `dispute_id=eq.${disputeId}`,
        },
        () => loadProposals()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [disputeId]);

  const createProposal = async (proposalData: Database['public']['Tables']['counter_proposals']['Insert']) => {
    try {
      const { data, error } = await supabase
        .from('counter_proposals')
        .insert({
          ...proposalData,
          dispute_id: disputeId,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Proposal sent',
        description: 'Your counter-proposal has been submitted.',
      });

      return data;
    } catch (error: any) {
      toast({
        title: 'Error creating proposal',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const respondToProposal = async (
    proposalId: string,
    status: 'accepted' | 'rejected',
    notes?: string
  ) => {
    try {
      const { error } = await supabase
        .from('counter_proposals')
        .update({
          status,
          responded_at: new Date().toISOString(),
          response_notes: notes,
        })
        .eq('id', proposalId);

      if (error) throw error;

      toast({
        title: status === 'accepted' ? 'Proposal accepted' : 'Proposal rejected',
        description: `You have ${status} the counter-proposal.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error responding to proposal',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    proposals,
    loading,
    createProposal,
    respondToProposal,
    refresh: loadProposals,
  };
}
