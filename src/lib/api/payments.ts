/**
 * @deprecated This file is deprecated. Use contract-first hooks instead.
 * 
 * Migration guide:
 * ```typescript
 * // Old:
 * import { payments } from '@/lib/api/payments';
 * const result = await payments.fundEscrow(contractId);
 * 
 * // New:
 * import { useFundEscrow } from '@contracts/clients/payments';
 * const { mutate: fundEscrow } = useFundEscrow();
 * fundEscrow(contractId);
 * ```
 * 
 * @see packages/@contracts/clients/payments.ts for new implementation
 */

import { supabase } from '@/integrations/supabase/client';
import type { Contract, ApiResponse } from './types';

export const payments = {
  async fundEscrow(contractId: string): Promise<ApiResponse<Contract>> {
    try {
      // In a real implementation, this would integrate with Stripe or similar
      // For now, just update the escrow status
      const { data, error } = await supabase
        .from('contracts')
        .update({ escrow_status: 'funded' })
        .eq('id', contractId)
        .select()
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
      return { error: 'Failed to fund escrow' };
    }
  },

  async releaseEscrow(contractId: string): Promise<ApiResponse<Contract>> {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .update({ escrow_status: 'released' })
        .eq('id', contractId)
        .select()
        .single();

      if (error) return { error: error.message };

      // Update job status to complete
      await supabase
        .from('jobs')
        .update({ status: 'complete' })
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
      return { error: 'Failed to release escrow' };
    }
  },

  async refundEscrow(contractId: string): Promise<ApiResponse<Contract>> {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .update({ escrow_status: 'refunded' })
        .eq('id', contractId)
        .select()
        .single();

      if (error) return { error: error.message };

      // Update job status to cancelled
      await supabase
        .from('jobs')
        .update({ status: 'cancelled' })
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
      return { error: 'Failed to refund escrow' };
    }
  },

  async getEscrowBalance(userId: string): Promise<ApiResponse<number>> {
    try {
      // Sum all funded escrow amounts for user as client
      const { data, error } = await supabase
        .from('contracts')
        .select('agreed_amount')
        .eq('client_id', userId)
        .eq('escrow_status', 'funded');

      if (error) return { error: error.message };

      const total = data.reduce((sum, contract) => sum + Number(contract.agreed_amount), 0);
      return { data: total };
    } catch (error) {
      return { error: 'Failed to get escrow balance' };
    }
  },

  async getPendingPayments(userId: string): Promise<ApiResponse<Contract[]>> {
    try {
      // Get contracts where user is tasker and payment is due
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('tasker_id', userId)
        .eq('escrow_status', 'funded')
        .not('end_at', 'is', null)
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
      return { error: 'Failed to get pending payments' };
    }
  }
};