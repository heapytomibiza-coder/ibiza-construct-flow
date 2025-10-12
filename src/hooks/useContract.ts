import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Contract {
  id: string;
  job_id: string;
  tasker_id: string;
  client_id: string;
  agreed_amount: number;
  type: string;
  escrow_status: string;
  escrow_hold_period: number;
  start_at: string;
  end_at: string;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  contract_id: string;
  milestone_number: number;
  description: string;
  amount: number;
  currency: string;
  status: string;
  due_date?: string;
  completed_date?: string;
  approved_date?: string;
  created_at: string;
}

export const useContract = (jobId?: string) => {
  const queryClient = useQueryClient();

  // Fetch contract for a job
  const { data: contract, isLoading: contractLoading } = useQuery({
    queryKey: ['contract', jobId],
    queryFn: async () => {
      if (!jobId) return null;
      
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          professional:profiles!tasker_id(
            id,
            full_name,
            display_name,
            avatar_url
          ),
          milestones:escrow_milestones(*)
        `)
        .eq('job_id', jobId)
        .order('created_at', { ascending: false, foreignTable: 'escrow_milestones.milestone_number' })
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!jobId
  });

  // Split milestone into phases
  const splitMilestone = useMutation({
    mutationFn: async ({ contractId, phases }: { 
      contractId: string; 
      phases: Array<{ description: string; amount: number; due_date?: string }> 
    }) => {
      const { data, error } = await supabase.functions.invoke('split-milestones', {
        body: { contractId, phases }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Milestones created successfully');
      queryClient.invalidateQueries({ queryKey: ['contract'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create milestones');
    }
  });

  // Mark milestone as complete (professional)
  const completeMilestone = useMutation({
    mutationFn: async (milestoneId: string) => {
      const { error } = await supabase
        .from('escrow_milestones')
        .update({
          status: 'completed',
          completed_date: new Date().toISOString()
        })
        .eq('id', milestoneId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Milestone marked as complete');
      queryClient.invalidateQueries({ queryKey: ['contract'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to complete milestone');
    }
  });

  // Approve milestone (client)
  const approveMilestone = useMutation({
    mutationFn: async (milestoneId: string) => {
      const { error } = await supabase
        .from('escrow_milestones')
        .update({
          status: 'approved',
          approved_date: new Date().toISOString()
        })
        .eq('id', milestoneId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Milestone approved');
      queryClient.invalidateQueries({ queryKey: ['contract'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to approve milestone');
    }
  });

  return {
    contract,
    contractLoading,
    splitMilestone,
    completeMilestone,
    approveMilestone
  };
};
