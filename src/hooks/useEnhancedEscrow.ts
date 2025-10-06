import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useEnhancedEscrow = (contractId?: string) => {
  // Fetch milestone progress
  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ['milestone-progress', contractId],
    queryFn: async () => {
      if (!contractId) return null;
      
      const { data, error } = await supabase.rpc('get_milestone_progress', {
        p_contract_id: contractId,
      });

      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!contractId,
  });

  // Fetch milestones eligible for auto-release
  const { data: autoReleaseMilestones } = useQuery({
    queryKey: ['auto-release-milestones'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('check_milestone_auto_release');
      if (error) throw error;
      return data;
    },
    refetchInterval: 60000, // Check every minute
  });

  // Fetch milestone approvals
  const { data: approvals } = useQuery({
    queryKey: ['milestone-approvals', contractId],
    queryFn: async () => {
      if (!contractId) return [];

      const { data: milestones } = await supabase
        .from('escrow_milestones')
        .select('id')
        .eq('contract_id', contractId);

      if (!milestones?.length) return [];

      const milestoneIds = milestones.map(m => m.id);

      const { data, error } = await supabase
        .from('milestone_approvals')
        .select(`
          *,
          profiles:approver_id (
            full_name,
            avatar_url
          )
        `)
        .in('milestone_id', milestoneIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!contractId,
  });

  // Fetch transfer logs
  const { data: transferLogs } = useQuery({
    queryKey: ['transfer-logs', contractId],
    queryFn: async () => {
      if (!contractId) return [];

      const { data: milestones } = await supabase
        .from('escrow_milestones')
        .select('id')
        .eq('contract_id', contractId);

      if (!milestones?.length) return [];

      const milestoneIds = milestones.map(m => m.id);

      const { data, error } = await supabase
        .from('escrow_transfer_logs')
        .select('*')
        .in('milestone_id', milestoneIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!contractId,
  });

  return {
    progress,
    progressLoading,
    autoReleaseMilestones,
    approvals,
    transferLogs,
  };
};
