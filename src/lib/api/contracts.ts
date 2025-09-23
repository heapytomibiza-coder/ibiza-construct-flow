import { supabase } from '@/integrations/supabase/client';
import type { Contract, ApiResponse } from './types';

export const contracts = {
  async createFromOffer(offerId: string): Promise<ApiResponse<Contract>> {
    try {
      // First get the accepted offer
      const { data: offer, error: offerError } = await supabase
        .from('offers')
        .select('*')
        .eq('id', offerId)
        .eq('status', 'accepted')
        .single();

      if (offerError) return { error: offerError.message };

      // Get the job to find client_id
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('client_id')
        .eq('id', offer.job_id)
        .single();

      if (jobError) return { error: jobError.message };

      // Create contract
      const contractData = {
        job_id: offer.job_id,
        tasker_id: offer.tasker_id,
        client_id: job.client_id,
        type: offer.type,
        agreed_amount: offer.amount,
        escrow_status: 'none' as const
      };

      const { data, error } = await supabase
        .from('contracts')
        .insert(contractData)
        .select()
        .single();

      if (error) return { error: error.message };

      // Update job status to assigned
      await supabase
        .from('jobs')
        .update({ status: 'assigned' })
        .eq('id', offer.job_id);

      const contract: Contract = {
        id: data.id,
        jobId: data.job_id,
        taskerId: data.tasker_id,
        clientId: data.client_id,
        type: data.type as Contract['type'],
        agreedAmount: data.agreed_amount,
        escrowStatus: data.escrow_status as Contract['escrowStatus'],
        startAt: data.start_at,
        endAt: data.end_at
      };

      return { data: contract };
    } catch (error) {
      return { error: 'Failed to create contract' };
    }
  },

  async getContract(contractId: string): Promise<ApiResponse<Contract>> {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', contractId)
        .single();

      if (error) return { error: error.message };

      const contract: Contract = {
        id: data.id,
        jobId: data.job_id,
        taskerId: data.tasker_id,
        clientId: data.client_id,
        type: data.type as Contract['type'],
        agreedAmount: data.agreed_amount,
        escrowStatus: data.escrow_status as Contract['escrowStatus'],
        startAt: data.start_at,
        endAt: data.end_at
      };

      return { data: contract };
    } catch (error) {
      return { error: 'Failed to fetch contract' };
    }
  },

  async getContractsByUser(userId: string): Promise<ApiResponse<Contract[]>> {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .or(`client_id.eq.${userId},tasker_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) return { error: error.message };

      const contracts: Contract[] = data.map(item => ({
        id: item.id,
        jobId: item.job_id,
        taskerId: item.tasker_id,
        clientId: item.client_id,
        type: item.type as Contract['type'],
        agreedAmount: item.agreed_amount,
        escrowStatus: item.escrow_status as Contract['escrowStatus'],
        startAt: item.start_at,
        endAt: item.end_at
      }));

      return { data: contracts };
    } catch (error) {
      return { error: 'Failed to fetch user contracts' };
    }
  },

  async markInProgress(contractId: string): Promise<ApiResponse<Contract>> {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .update({ 
          start_at: new Date().toISOString()
        })
        .eq('id', contractId)
        .select()
        .single();

      if (error) return { error: error.message };

      // Update job status
      await supabase
        .from('jobs')
        .update({ status: 'in_progress' })
        .eq('id', data.job_id);

      const contract: Contract = {
        id: data.id,
        jobId: data.job_id,
        taskerId: data.tasker_id,
        clientId: data.client_id,
        type: data.type as Contract['type'],
        agreedAmount: data.agreed_amount,
        escrowStatus: data.escrow_status as Contract['escrowStatus'],
        startAt: data.start_at,
        endAt: data.end_at
      };

      return { data: contract };
    } catch (error) {
      return { error: 'Failed to mark contract in progress' };
    }
  },

  async submitCompletion(contractId: string): Promise<ApiResponse<Contract>> {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .update({ 
          end_at: new Date().toISOString()
        })
        .eq('id', contractId)
        .select()
        .single();

      if (error) return { error: error.message };

      // Update job status
      await supabase
        .from('jobs')
        .update({ status: 'complete_pending' })
        .eq('id', data.job_id);

      const contract: Contract = {
        id: data.id,
        jobId: data.job_id,
        taskerId: data.tasker_id,
        clientId: data.client_id,
        type: data.type as Contract['type'],
        agreedAmount: data.agreed_amount,
        escrowStatus: data.escrow_status as Contract['escrowStatus'],
        startAt: data.start_at,
        endAt: data.end_at
      };

      return { data: contract };
    } catch (error) {
      return { error: 'Failed to submit completion' };
    }
  }
};