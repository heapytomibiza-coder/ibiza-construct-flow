import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { SubscriptionTier, getSubscriptionTier } from '@/lib/subscriptionTiers';

interface SubscriptionStatus {
  subscribed: boolean;
  tier: SubscriptionTier;
  product_id: string | null;
  subscription_end: string | null;
  loading: boolean;
  error: string | null;
}

// LAUNCH MODE: Grant all users premium access until paid version is enabled
// To restore paid subscriptions: set LAUNCH_MODE_FREE_ACCESS = false
const LAUNCH_MODE_FREE_ACCESS = true;

export const useSubscription = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    subscribed: LAUNCH_MODE_FREE_ACCESS ? true : false,
    tier: LAUNCH_MODE_FREE_ACCESS ? 'premium' : 'basic',
    product_id: null,
    subscription_end: null,
    loading: false,
    error: null
  });

  const checkSubscription = async () => {
    // LAUNCH MODE: Skip subscription check, everyone has premium
    if (LAUNCH_MODE_FREE_ACCESS) {
      setStatus({
        subscribed: true,
        tier: 'premium',
        product_id: null,
        subscription_end: null,
        loading: false,
        error: null
      });
      return;
    }
    
    if (!user) {
      setStatus({
        subscribed: false,
        tier: 'basic',
        product_id: null,
        subscription_end: null,
        loading: false,
        error: null
      });
      return;
    }

    try {
      setStatus(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase.functions.invoke('check-subscription');

      if (error) throw error;

      setStatus({
        subscribed: data.subscribed || false,
        tier: data.tier || 'basic',
        product_id: data.product_id || null,
        subscription_end: data.subscription_end || null,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to check subscription'
      }));
    }
  };

  const createCheckout = async (priceId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      throw error;
    }
  };

  const openCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      throw error;
    }
  };

  // Check subscription on mount and when user changes
  useEffect(() => {
    checkSubscription();
  }, [user]);

  // Refresh subscription status every minute
  useEffect(() => {
    const interval = setInterval(() => {
      checkSubscription();
    }, 60000);

    return () => clearInterval(interval);
  }, [user]);

  return {
    ...status,
    checkSubscription,
    createCheckout,
    openCustomerPortal
  };
};
