import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';

let sessionId: string | null = null;

const getSessionId = () => {
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  return sessionId;
};

export const useEventTracking = () => {
  const location = useLocation();

  // Track page views
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  const trackEvent = async (
    eventName: string,
    category?: string,
    properties?: Record<string, any>
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.functions.invoke('track-analytics-event', {
        body: {
          event_name: eventName,
          event_category: category || 'general',
          event_properties: properties || {},
          user_id: user?.id,
          session_id: getSessionId(),
          page_url: window.location.href
        }
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  };

  const trackPageView = async (page: string) => {
    await trackEvent('page_view', 'navigation', { page });
  };

  const trackUserAction = async (action: string, details?: Record<string, any>) => {
    await trackEvent(action, 'user_action', details);
  };

  const trackConversion = async (conversionType: string, value?: number) => {
    await trackEvent('conversion', 'conversion', { 
      conversion_type: conversionType,
      value 
    });
  };

  return {
    trackEvent,
    trackPageView,
    trackUserAction,
    trackConversion
  };
};
