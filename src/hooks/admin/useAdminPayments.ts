import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PaymentStatistics {
  total_transactions: number;
  total_amount: number;
  pending_refunds: number;
  active_disputes: number;
  failed_transactions: number;
}

export function useAdminPayments() {
  const queryClient = useQueryClient();

  // Fetch payment statistics
  const { data: statistics, isLoading: loadingStats } = useQuery({
    queryKey: ['admin-payment-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_payment_statistics');
      if (error) throw error;
      return data as PaymentStatistics;
    },
  });

  // Fetch all transactions with filters
  const fetchTransactions = async (filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    let query = supabase
      .from('payment_transactions')
      .select('*, profiles!payment_transactions_user_id_fkey(display_name, full_name)')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  };

  // Fetch pending refund requests
  const { data: pendingRefunds, isLoading: loadingRefunds } = useQuery({
    queryKey: ['admin-pending-refunds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('refund_requests')
        .select(`
          *,
          requestedBy:profiles!refund_requests_requested_by_fkey(display_name, full_name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Approve refund
  const approveRefund = useMutation({
    mutationFn: async ({ refundId, notes }: { refundId: string; notes?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('refund_requests')
        .update({
          status: 'approved',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: notes,
        })
        .eq('id', refundId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-refunds'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payment-stats'] });
      toast.success('Refund approved successfully');
    },
    onError: () => {
      toast.error('Failed to approve refund');
    },
  });

  // Reject refund
  const rejectRefund = useMutation({
    mutationFn: async ({ refundId, notes }: { refundId: string; notes: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('refund_requests')
        .update({
          status: 'rejected',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: notes,
        })
        .eq('id', refundId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-refunds'] });
      toast.success('Refund rejected');
    },
    onError: () => {
      toast.error('Failed to reject refund');
    },
  });

  // Fetch active disputes
  const { data: activeDisputes, isLoading: loadingDisputes } = useQuery({
    queryKey: ['admin-active-disputes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('disputes')
        .select(`
          *,
          createdBy:profiles!disputes_created_by_fkey(display_name, full_name),
          disputedAgainst:profiles!disputes_disputed_against_fkey(display_name, full_name),
          job:jobs(title)
        `)
        .in('status', ['open', 'in_progress'])
        .order('created_at', { ascending: false});
      
      if (error) throw error;
      return data;
    },
  });

  // Update dispute status
  const updateDispute = useMutation({
    mutationFn: async ({ 
      disputeId, 
      status, 
      resolutionNotes, 
      resolutionAmount 
    }: { 
      disputeId: string; 
      status: string;
      resolutionNotes?: string;
      resolutionAmount?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const updates: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'resolved') {
        updates.resolved_by = user?.id;
        updates.resolved_at = new Date().toISOString();
        updates.resolution_notes = resolutionNotes;
        updates.resolution_amount = resolutionAmount;
      }

      const { data, error } = await supabase
        .from('disputes')
        .update(updates)
        .eq('id', disputeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-active-disputes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payment-stats'] });
      toast.success('Dispute updated successfully');
    },
    onError: () => {
      toast.error('Failed to update dispute');
    },
  });

  return {
    statistics,
    loadingStats,
    pendingRefunds,
    loadingRefunds,
    activeDisputes,
    loadingDisputes,
    fetchTransactions,
    approveRefund,
    rejectRefund,
    updateDispute,
  };
}
