import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ProfessionalSubscription {
  id: string;
  professional_id: string;
  tier: 'basic' | 'pro' | 'premium';
  stripe_product_id: string;
  stripe_payment_intent_id: string | null;
  amount: number;
  currency: string;
  status: 'active' | 'expired' | 'cancelled';
  started_at: string;
  expires_at: string;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  subscription: ProfessionalSubscription | null;
  commissionRate: number;
  tier: string;
}

// LAUNCH MODE: Grant all professionals premium access until paid version is enabled
const LAUNCH_MODE_FREE_ACCESS = true;

export function useProfessionalSubscription() {
  const queryClient = useQueryClient();

  // Check subscription status
  const { data: subscriptionStatus, isLoading, refetch } = useQuery({
    queryKey: ['professional-subscription'],
    queryFn: async () => {
      // LAUNCH MODE: Skip network call, return premium status
      if (LAUNCH_MODE_FREE_ACCESS) {
        return {
          hasActiveSubscription: true,
          subscription: null,
          commissionRate: 0.08, // Premium rate
          tier: 'premium',
        } as SubscriptionStatus;
      }
      
      const { data, error } = await supabase.functions.invoke('check-professional-subscription');
      
      if (error) throw error;
      return data as SubscriptionStatus;
    },
  });

  // Create subscription payment
  const createSubscriptionPayment = useMutation({
    mutationFn: async ({ priceId, tier }: { priceId: string; tier: string }) => {
      const { data, error } = await supabase.functions.invoke('create-subscription-payment', {
        body: { priceId, tier },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, '_blank');
        toast.success('Redirecting to payment...');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create payment');
    },
  });

  // Verify subscription payment
  const verifySubscriptionPayment = useMutation({
    mutationFn: async ({ sessionId, tier }: { sessionId: string; tier: string }) => {
      const { data, error } = await supabase.functions.invoke('verify-subscription-payment', {
        body: { sessionId, tier },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-subscription'] });
      toast.success('Subscription activated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to verify payment');
    },
  });

  return {
    subscriptionStatus,
    isLoading,
    refetch,
    createSubscriptionPayment: createSubscriptionPayment.mutate,
    verifySubscriptionPayment: verifySubscriptionPayment.mutate,
    isCreatingPayment: createSubscriptionPayment.isPending,
    isVerifyingPayment: verifySubscriptionPayment.isPending,
  };
}
