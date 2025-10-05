import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Milestone {
  id: string;
  contract_id: string;
  payment_id?: string | null;
  milestone_number: number;
  title: string;
  description: string | null;
  amount: number;
  status: string;
  due_date: string | null;
  completed_date: string | null;
  released_by?: string | null;
  released_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const useEscrow = (jobId?: string) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) {
      setLoading(false);
      return;
    }

    const fetchMilestones = async () => {
      const { data: contractData } = await supabase
        .from('contracts')
        .select('id')
        .eq('job_id', jobId)
        .single();

      if (!contractData) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('escrow_milestones')
        .select('*')
        .eq('contract_id', contractData.id)
        .order('milestone_number', { ascending: true });

      if (error) {
        console.error('Error fetching milestones:', error);
      } else {
        setMilestones(data || []);
      }
      setLoading(false);
    };

    fetchMilestones();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('milestones-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'escrow_milestones'
        },
        () => {
          fetchMilestones();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [jobId]);

  const releaseMilestone = useCallback(async (milestoneId: string, notes?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('release-escrow', {
        body: { milestoneId, notes }
      });

      if (error) throw error;

      toast.success('Milestone released successfully');
      return data;
    } catch (error: any) {
      console.error('Error releasing milestone:', error);
      toast.error(error.message || 'Failed to release milestone');
      throw error;
    }
  }, []);

  const createMilestone = useCallback(async (
    contractId: string,
    milestoneData: {
      milestone_number: number;
      title: string;
      description?: string;
      amount: number;
      status?: string;
      due_date?: string;
    }
  ) => {
    try {
      const { data, error } = await supabase
        .from('escrow_milestones')
        .insert({
          contract_id: contractId,
          milestone_number: milestoneData.milestone_number,
          title: milestoneData.title,
          description: milestoneData.description || null,
          amount: milestoneData.amount,
          status: milestoneData.status || 'pending',
          due_date: milestoneData.due_date || null
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Milestone created');
      return data;
    } catch (error: any) {
      console.error('Error creating milestone:', error);
      toast.error('Failed to create milestone');
      throw error;
    }
  }, []);

  const getMilestoneProgress = useCallback(() => {
    const total = milestones.length;
    const completed = milestones.filter(m => m.status === 'completed').length;
    const totalAmount = milestones.reduce((sum, m) => sum + m.amount, 0);
    const completedAmount = milestones
      .filter(m => m.status === 'completed')
      .reduce((sum, m) => sum + m.amount, 0);

    return {
      total,
      completed,
      percentage: total > 0 ? (completed / total) * 100 : 0,
      totalAmount,
      completedAmount,
      remainingAmount: totalAmount - completedAmount
    };
  }, [milestones]);

  return {
    milestones,
    loading,
    releaseMilestone,
    createMilestone,
    progress: getMilestoneProgress()
  };
};
