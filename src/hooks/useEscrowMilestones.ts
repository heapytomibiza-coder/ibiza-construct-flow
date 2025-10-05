import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EscrowMilestone {
  id: string;
  contract_id: string;
  milestone_number: number;
  title: string;
  description?: string;
  amount: number;
  due_date?: string;
  status: string;
  completed_date?: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejected_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface EscrowTransaction {
  id: string;
  milestone_id: string;
  payment_id?: string;
  transaction_type: string;
  amount: number;
  status: string;
  initiated_by: string;
  completed_at?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export const useEscrowMilestones = (contractId?: string) => {
  const [milestones, setMilestones] = useState<EscrowMilestone[]>([]);
  const [transactions, setTransactions] = useState<EscrowTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMilestones = useCallback(async () => {
    if (!contractId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('escrow_milestones')
        .select('*')
        .eq('contract_id', contractId)
        .order('milestone_number', { ascending: true });

      if (error) throw error;
      setMilestones(data || []);
    } catch (error) {
      console.error('Error fetching milestones:', error);
      toast.error('Failed to load milestones');
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  const fetchTransactions = useCallback(async () => {
    if (!contractId) return;

    try {
      const { data: milestonesData } = await supabase
        .from('escrow_milestones')
        .select('id')
        .eq('contract_id', contractId);

      if (!milestonesData?.length) return;

      const milestoneIds = milestonesData.map(m => m.id);

      const { data, error } = await supabase
        .from('escrow_transactions')
        .select('*')
        .in('milestone_id', milestoneIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  }, [contractId]);

  useEffect(() => {
    fetchMilestones();
    fetchTransactions();

    if (!contractId) return;

    // Subscribe to realtime updates
    const milestonesChannel = supabase
      .channel('escrow-milestones')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'escrow_milestones',
          filter: `contract_id=eq.${contractId}`
        },
        () => {
          fetchMilestones();
        }
      )
      .subscribe();

    const transactionsChannel = supabase
      .channel('escrow-transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'escrow_transactions'
        },
        () => {
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(milestonesChannel);
      supabase.removeChannel(transactionsChannel);
    };
  }, [contractId, fetchMilestones, fetchTransactions]);

  const createMilestone = async (milestoneData: Partial<EscrowMilestone>) => {
    try {
      const { data, error } = await supabase
        .from('escrow_milestones')
        .insert([{
          contract_id: contractId,
          milestone_number: milestoneData.milestone_number || 1,
          title: milestoneData.title || '',
          description: milestoneData.description,
          amount: milestoneData.amount || 0,
          due_date: milestoneData.due_date,
          status: 'pending',
        }])
        .select()
        .single();

      if (error) throw error;
      toast.success('Milestone created');
      return data;
    } catch (error) {
      console.error('Error creating milestone:', error);
      toast.error('Failed to create milestone');
      throw error;
    }
  };

  const updateMilestone = async (milestoneId: string, updates: Partial<EscrowMilestone>) => {
    try {
      const { data, error } = await supabase
        .from('escrow_milestones')
        .update(updates)
        .eq('id', milestoneId)
        .select()
        .single();

      if (error) throw error;
      toast.success('Milestone updated');
      return data;
    } catch (error) {
      console.error('Error updating milestone:', error);
      toast.error('Failed to update milestone');
      throw error;
    }
  };

  const approveMilestone = async (milestoneId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('escrow_milestones')
        .update({
          status: 'completed',
          completed_date: new Date().toISOString(),
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', milestoneId)
        .select()
        .single();

      if (error) throw error;
      toast.success('Milestone approved - payment will be released');
      return data;
    } catch (error) {
      console.error('Error approving milestone:', error);
      toast.error('Failed to approve milestone');
      throw error;
    }
  };

  const rejectMilestone = async (milestoneId: string, reason: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('escrow_milestones')
        .update({
          rejected_by: user.id,
          rejected_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq('id', milestoneId)
        .select()
        .single();

      if (error) throw error;
      toast.success('Milestone rejected');
      return data;
    } catch (error) {
      console.error('Error rejecting milestone:', error);
      toast.error('Failed to reject milestone');
      throw error;
    }
  };

  return {
    milestones,
    transactions,
    loading,
    createMilestone,
    updateMilestone,
    approveMilestone,
    rejectMilestone,
    refetch: () => {
      fetchMilestones();
      fetchTransactions();
    }
  };
};
