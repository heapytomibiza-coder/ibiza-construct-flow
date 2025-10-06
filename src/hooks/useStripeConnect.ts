import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

export const useStripeConnect = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch professional's Stripe Connect account status
  const { data: stripeAccount, isLoading: accountLoading, refetch } = useQuery({
    queryKey: ['stripe-connect-account'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('professional_stripe_accounts')
        .select('*')
        .eq('professional_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  const setupStripeConnect = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('setup-stripe-connect');

      if (error) throw error;

      // Open Stripe Connect onboarding in new window
      if (data.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Stripe Connect Setup",
          description: "Complete your payment account setup in the new window.",
        });
      }

      return data;
    } catch (error: any) {
      console.error('Error setting up Stripe Connect:', error);
      toast({
        variant: "destructive",
        title: "Setup Failed",
        description: error.message || "Failed to setup Stripe Connect",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAccountStatus = async () => {
    await refetch();
  };

  return {
    stripeAccount,
    accountLoading,
    isLoading,
    setupStripeConnect,
    refreshAccountStatus,
    isAccountActive: stripeAccount?.account_status === 'active',
    isAccountSetup: !!stripeAccount,
  };
};
