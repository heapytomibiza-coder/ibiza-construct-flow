import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EscrowContract {
  id: string;
  job_id: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export interface EscrowMilestone {
  id: string;
  title: string;
  amount: number;
  status: string;
  due_date?: string;
  description?: string;
  milestone_number?: number;
  completed_date?: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejected_at?: string;
  rejection_reason?: string;
  auto_release_date?: string;
  approval_deadline?: string;
  deliverables?: any[];
  metadata?: Record<string, any>;
}

export function useEscrow(jobId?: string) {
  const [contract, setContract] = useState<EscrowContract | null>(null);
  const [milestones, setMilestones] = useState<EscrowMilestone[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (jobId) {
      fetchEscrowData();
    }
  }, [jobId]);

  const fetchEscrowData = async () => {
    if (!jobId) return;
    
    setLoading(true);
    try {
      const { data: contractData, error: contractError } = await supabase
        .from('escrow_contracts' as any)
        .select('*')
        .eq('job_id', jobId)
        .single();

      if (contractError) throw contractError;
      setContract(contractData as any);

      if (contractData) {
        const { data: milestonesData, error: milestonesError } = await supabase
          .from('escrow_milestones')
          .select('*')
          .eq('contract_id', (contractData as any).id)
          .order('milestone_number', { ascending: true });

        if (milestonesError) throw milestonesError;
        setMilestones(milestonesData || []);
      }
    } catch (error) {
      console.error('Error fetching escrow data:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveMilestone = async (milestoneId: string) => {
    try {
      const { error } = await supabase
        .from('escrow_milestones')
        .update({ 
          status: 'completed',
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq('id', milestoneId);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Milestone approved',
      });
      
      await fetchEscrowData();
    } catch (error) {
      console.error('Error approving milestone:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve milestone',
        variant: 'destructive',
      });
    }
  };

  const releaseFunds = async (milestoneId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('process-escrow-release', {
        body: { milestone_id: milestoneId },
      });

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Funds released successfully',
      });
      
      await fetchEscrowData();
      return data;
    } catch (error) {
      console.error('Error releasing funds:', error);
      toast({
        title: 'Error',
        description: 'Failed to release funds',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const getMilestoneProgress = async (contractId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_milestone_progress', {
        p_contract_id: contractId,
      });

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error getting milestone progress:', error);
      return null;
    }
  };

  const releaseMilestone = releaseFunds;

  const createMilestone = async (milestone: Partial<EscrowMilestone> & { contract_id: string }) => {
    try {
      const { error } = await supabase
        .from('escrow_milestones')
        .insert([milestone as any]);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Milestone created',
      });
      
      await fetchEscrowData();
    } catch (error) {
      console.error('Error creating milestone:', error);
      toast({
        title: 'Error',
        description: 'Failed to create milestone',
        variant: 'destructive',
      });
    }
  };

  const rejectMilestone = async (milestoneId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('escrow_milestones')
        .update({ 
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          rejected_by: (await supabase.auth.getUser()).data.user?.id,
          rejection_reason: reason,
        })
        .eq('id', milestoneId);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Milestone rejected',
      });
      
      await fetchEscrowData();
    } catch (error) {
      console.error('Error rejecting milestone:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject milestone',
        variant: 'destructive',
      });
    }
  };

  const progress = {
    total: milestones.length,
    completed: milestones.filter(m => m.status === 'completed' || m.status === 'released').length,
    percentage: milestones.length > 0 
      ? (milestones.filter(m => m.status === 'completed' || m.status === 'released').length / milestones.length) * 100 
      : 0,
    totalAmount: milestones.reduce((sum, m) => sum + m.amount, 0),
    completedAmount: milestones.filter(m => m.status === 'completed' || m.status === 'released').reduce((sum, m) => sum + m.amount, 0),
    remainingAmount: milestones.filter(m => m.status !== 'completed' && m.status !== 'released').reduce((sum, m) => sum + m.amount, 0),
  };

  return {
    contract,
    milestones,
    loading,
    fetchEscrowData,
    approveMilestone,
    releaseFunds,
    releaseMilestone,
    getMilestoneProgress,
    createMilestone,
    rejectMilestone,
    releaseEscrow: releaseFunds,
    progress,
  };
}
