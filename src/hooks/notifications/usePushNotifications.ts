import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// VAPID public key - this should match the one in your edge function
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

export const usePushNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPushSupported, setIsPushSupported] = useState(false);
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window;
      setIsPushSupported(supported);
      
      if (supported && 'Notification' in window) {
        setPermission(Notification.permission);
      }
    };

    checkSupport();
  }, []);

  // Check if user has an active subscription
  useEffect(() => {
    if (!user?.id || !isPushSupported) return;

    const checkSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          // Check if subscription exists in database
          const { data } = await supabase
            .from('push_subscriptions')
            .select('id')
            .eq('user_id', user.id)
            .eq('endpoint', subscription.endpoint)
            .eq('is_active', true)
            .maybeSingle();

          setIsPushEnabled(!!data);
        } else {
          setIsPushEnabled(false);
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        setIsPushEnabled(false);
      }
    };

    checkSubscription();
  }, [user?.id, isPushSupported]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!isPushSupported) {
      toast({
        title: 'Not Supported',
        description: 'Push notifications are not supported in your browser',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        return true;
      } else if (result === 'denied') {
        toast({
          title: 'Permission Denied',
          description: 'You have blocked notifications. Please enable them in your browser settings.',
          variant: 'destructive',
        });
      }
      
      return false;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  }, [isPushSupported, toast]);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!user?.id) {
      toast({
        title: 'Not Authenticated',
        description: 'Please sign in to enable push notifications',
        variant: 'destructive',
      });
      return false;
    }

    if (!VAPID_PUBLIC_KEY) {
      toast({
        title: 'Configuration Error',
        description: 'Push notifications are not configured on this server',
        variant: 'destructive',
      });
      return false;
    }

    setIsSubscribing(true);

    try {
      // Request permission first
      const hasPermission = permission === 'granted' || await requestPermission();
      if (!hasPermission) {
        setIsSubscribing(false);
        return false;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      await navigator.serviceWorker.ready;

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });

      // Get subscription details
      const subscriptionJSON = subscription.toJSON();
      
      // Get device/browser info
      const userAgent = navigator.userAgent;
      const deviceType = /Mobile|Android|iPhone/i.test(userAgent) ? 'mobile' : 'desktop';
      const browser = getBrowserName(userAgent);

      // Save to database
      const { error } = await supabase.from('push_subscriptions').upsert({
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh_key: subscriptionJSON.keys?.p256dh || '',
        auth_key: subscriptionJSON.keys?.auth || '',
        user_agent: userAgent,
        device_type: deviceType,
        browser,
        is_active: true,
        last_used_at: new Date().toISOString(),
      });

      if (error) throw error;

      setIsPushEnabled(true);
      toast({
        title: 'Success',
        description: 'Push notifications enabled successfully',
      });

      return true;
    } catch (error: any) {
      console.error('Error subscribing to push:', error);
      toast({
        title: 'Subscription Failed',
        description: error.message || 'Failed to enable push notifications',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSubscribing(false);
    }
  }, [user?.id, permission, requestPermission, toast]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!user?.id) return false;

    setIsSubscribing(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Deactivate in database
        await supabase
          .from('push_subscriptions')
          .update({ is_active: false })
          .eq('user_id', user.id)
          .eq('endpoint', subscription.endpoint);
      }

      setIsPushEnabled(false);
      toast({
        title: 'Success',
        description: 'Push notifications disabled',
      });

      return true;
    } catch (error: any) {
      console.error('Error unsubscribing:', error);
      toast({
        title: 'Error',
        description: 'Failed to disable push notifications',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSubscribing(false);
    }
  }, [user?.id, toast]);

  return {
    isPushSupported,
    isPushEnabled,
    isSubscribing,
    permission,
    subscribe,
    unsubscribe,
    requestPermission,
  };
};

// Helper function to convert base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Helper to get browser name
function getBrowserName(userAgent: string): string {
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown';
}
