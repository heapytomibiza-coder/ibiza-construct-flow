import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Contract {
  id: string;
  job_id: string;
  client_id: string;
  tasker_id: string;
  agreed_amount: number;
  type: string;
  escrow_status: string;
  start_at: string | null;
  end_at: string | null;
  created_at: string;
  updated_at: string;
  client?: {
    full_name: string;
  };
  tasker?: {
    full_name: string;
  };
  job?: {
    title: string;
  };
}

interface UseContractsParams {
  userId?: string;
  userRole?: 'client' | 'professional';
}

export const useContracts = ({ userId, userRole }: UseContractsParams) => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchContracts();
    setupRealtimeSubscription();
  }, [userId, userRole]);

  const fetchContracts = async () => {
    if (!userId) return;

    try {
      let query = supabase
        .from('contracts')
        .select(`
          *,
          client:profiles!contracts_client_id_fkey(full_name),
          tasker:profiles!contracts_tasker_id_fkey(full_name),
          job:jobs(title)
        `)
        .order('created_at', { ascending: false });

      if (userRole === 'client') {
        query = query.eq('client_id', userId);
      } else if (userRole === 'professional') {
        query = query.eq('tasker_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const transformedData = (data || []).map((item: any) => ({
        ...item,
        client: item.client?.[0] || undefined,
        tasker: item.tasker?.[0] || undefined,
        job: item.job?.[0] || undefined,
      }));
      
      setContracts(transformedData as Contract[]);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      toast.error('Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('contracts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contracts',
          filter: userRole === 'client' 
            ? `client_id=eq.${userId}`
            : `tasker_id=eq.${userId}`
        },
        () => {
          fetchContracts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const createContract = async (contractData: {
    job_id: string;
    client_id: string;
    tasker_id: string;
    agreed_amount: number;
    type?: string;
  }) => {
    const { data, error } = await supabase
      .from('contracts')
      .insert({
        ...contractData,
        type: contractData.type || 'fixed',
        escrow_status: 'none',
      })
      .select()
      .single();

    if (error) throw error;
    
    toast.success('Contract created successfully!');
    return data;
  };

  return {
    contracts,
    loading,
    createContract,
    refetch: fetchContracts,
  };
};
