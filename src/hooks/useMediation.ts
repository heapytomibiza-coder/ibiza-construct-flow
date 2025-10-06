import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

export interface DisputeResolution {
  id: string;
  dispute_id: string;
  resolution_type: string;
  details?: string;
  amount?: number;
  status: 'draft' | 'proposed' | 'agreed' | 'executed' | 'rejected';
  mediator_decision_reasoning?: string;
  fault_percentage_client?: number;
  fault_percentage_professional?: number;
  auto_execute_date?: string;
  appeal_deadline?: string;
  party_client_agreed?: boolean;
  party_professional_agreed?: boolean;
  agreement_finalized_at?: string;
  terms?: Record<string, any>;
  created_at: string;
}

export interface DisputeCounterProposal {
  id: string;
  dispute_id: string;
  parent_resolution_id?: string;
  proposer_id: string;
  terms: Record<string, any>;
  note?: string;
  status: 'open' | 'accepted' | 'rejected' | 'withdrawn';
  created_at: string;
}

export interface EnforcementLog {
  id: string;
  dispute_id: string;
  resolution_id?: string;
  action: string;
  details?: Record<string, any>;
  executed_by?: string;
  created_at: string;
}

export function useMediation(disputeId: string) {
  const qc = useQueryClient();

  const resolutions = useQuery({
    queryKey: ['disputes', disputeId, 'resolutions'],
    queryFn: async (): Promise<DisputeResolution[]> => {
      const { data, error } = await supabase
        .from('dispute_resolutions')
        .select('*')
        .eq('dispute_id', disputeId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as DisputeResolution[];
    }
  });

  const propose = useMutation({
    mutationFn: async (payload: Database['public']['Tables']['dispute_resolutions']['Insert']) => {
      const { data, error } = await supabase
        .from('dispute_resolutions')
        .insert({ 
          ...payload,
          dispute_id: disputeId
        })
        .select()
        .single();
      if (error) throw error;
      return data as DisputeResolution;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['disputes', disputeId, 'resolutions'] });
      qc.invalidateQueries({ queryKey: ['disputes', disputeId, 'resolution'] });
      toast.success('Resolution proposed successfully');
    },
    onError: (error) => {
      toast.error('Failed to propose resolution: ' + error.message);
    }
  });

  const agree = useMutation({
    mutationFn: async (side: 'client' | 'professional') => {
      const field = side === 'client' ? 'party_client_agreed' : 'party_professional_agreed';
      const { error } = await supabase.rpc('mark_party_agreement', {
        p_dispute_id: disputeId,
        p_field: field
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['disputes', disputeId, 'resolutions'] });
      qc.invalidateQueries({ queryKey: ['disputes', disputeId, 'resolution'] });
      toast.success('Agreement marked successfully');
    },
    onError: (error) => {
      toast.error('Failed to mark agreement: ' + error.message);
    }
  });

  const counters = useQuery({
    queryKey: ['disputes', disputeId, 'counterprops'],
    queryFn: async (): Promise<DisputeCounterProposal[]> => {
      const { data, error } = await supabase
        .from('dispute_counter_proposals')
        .select('*')
        .eq('dispute_id', disputeId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as DisputeCounterProposal[];
    }
  });

  const counter = useMutation({
    mutationFn: async (payload: Omit<DisputeCounterProposal, 'id' | 'created_at' | 'status'>) => {
      const { data, error } = await supabase
        .from('dispute_counter_proposals')
        .insert({ ...payload, status: 'open' })
        .select()
        .single();
      if (error) throw error;
      return data as DisputeCounterProposal;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['disputes', disputeId, 'counterprops'] });
      toast.success('Counter-proposal submitted');
    },
    onError: (error) => {
      toast.error('Failed to submit counter-proposal: ' + error.message);
    }
  });

  const enforcement = useQuery({
    queryKey: ['disputes', disputeId, 'enforcement'],
    queryFn: async (): Promise<EnforcementLog[]> => {
      const { data, error } = await supabase
        .from('resolution_enforcement_log')
        .select('*')
        .eq('dispute_id', disputeId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as EnforcementLog[];
    }
  });

  return { 
    resolutions, 
    propose, 
    agree, 
    counters, 
    counter, 
    enforcement,
    isLoading: resolutions.isLoading || counters.isLoading || enforcement.isLoading
  };
}
