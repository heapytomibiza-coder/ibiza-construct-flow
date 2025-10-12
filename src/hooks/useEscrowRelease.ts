import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FundEscrowParams {
  jobId: string;
  amount: number;
  currency?: string;
  paymentMethodId?: string;
}

interface ReleaseMilestoneParams {
  milestoneId: string;
  notes?: string;
  review?: {
    rating: number;
    title?: string;
    comment?: string;
  };
  override?: boolean;
}

interface RefundEscrowParams {
  milestoneId: string;
  reason: string;
  amount?: number; // Partial refund support
}

export const useEscrowRelease = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);

  /**
   * Fund escrow - holds payment in escrow account
   * Creates holding account entry linked to job
   */
  const fundEscrow = async ({ jobId, amount, currency = 'EUR', paymentMethodId }: FundEscrowParams) => {
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('fund-escrow', {
        body: { jobId, amount, currency, paymentMethodId }
      });

      if (error) throw error;

      toast({
        title: "Escrow funded successfully",
        description: `€${amount.toFixed(2)} secured in escrow for this job.`
      });

      return data;
    } catch (error: any) {
      console.error('Error funding escrow:', error);
      toast({
        variant: "destructive",
        title: "Failed to fund escrow",
        description: error.message || "An error occurred while securing the funds."
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Release escrow - releases funds to professional
   * Requires: job completion + client approval OR admin override
   */
  const releaseMilestone = async ({ milestoneId, notes, review, override }: ReleaseMilestoneParams) => {
    setIsReleasing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('release-escrow', {
        body: { milestoneId, notes, review, override }
      });

      if (error) throw error;

      toast({
        title: "Escrow funds released",
        description: "The funds have been released to the professional."
      });

      return data;
    } catch (error: any) {
      console.error('Error releasing escrow:', error);
      toast({
        variant: "destructive",
        title: "Failed to release escrow",
        description: error.message || "An error occurred while releasing the funds."
      });
      throw error;
    } finally {
      setIsReleasing(false);
    }
  };

  /**
   * Refund escrow - returns funds to client
   * Used when job is cancelled or disputed
   */
  const refundEscrow = async ({ milestoneId, reason, amount }: RefundEscrowParams) => {
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('refund-escrow', {
        body: { milestoneId, reason, amount }
      });

      if (error) throw error;

      toast({
        title: "Escrow refund processed",
        description: amount 
          ? `€${amount.toFixed(2)} refunded to client.`
          : "Full amount refunded to client."
      });

      return data;
    } catch (error: any) {
      console.error('Error refunding escrow:', error);
      toast({
        variant: "destructive",
        title: "Failed to process refund",
        description: error.message || "An error occurred while processing the refund."
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Get escrow balance for a job
   */
  const getEscrowBalance = async (jobId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('get-escrow-balance', {
        body: { jobId }
      });

      if (error) throw error;
      return data?.balance || 0;
    } catch (error: any) {
      console.error('Error fetching escrow balance:', error);
      return 0;
    }
  };

  return {
    fundEscrow,
    releaseMilestone,
    refundEscrow,
    getEscrowBalance,
    isProcessing,
    isReleasing
  };
};
