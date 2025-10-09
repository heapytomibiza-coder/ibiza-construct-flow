import { useEffect, useRef } from 'react';

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

export const useProfileAnalytics = (professionalId: string) => {
  const viewStartTime = useRef<number>(Date.now());
  const interactionCount = useRef<number>(0);

  const trackEvent = (event: AnalyticsEvent) => {
    // In production, this would send to your analytics service
    console.log('[Analytics]', {
      professionalId,
      timestamp: new Date().toISOString(),
      ...event
    });
  };

  const trackInteraction = (action: string, label?: string) => {
    interactionCount.current += 1;
    trackEvent({
      action,
      category: 'Profile Interaction',
      label
    });
  };

  const trackScroll = (depth: number) => {
    trackEvent({
      action: 'Scroll',
      category: 'User Engagement',
      value: Math.round(depth * 100)
    });
  };

  const trackTimeOnPage = () => {
    const timeSpent = Math.round((Date.now() - viewStartTime.current) / 1000);
    trackEvent({
      action: 'Time on Page',
      category: 'User Engagement',
      value: timeSpent
    });
  };

  useEffect(() => {
    // Track initial page view
    trackEvent({
      action: 'View Profile',
      category: 'Profile',
      label: professionalId
    });

    // Track scroll depth
    let maxScroll = 0;
    const handleScroll = () => {
      const scrollPercentage = 
        (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      
      if (scrollPercentage > maxScroll) {
        maxScroll = scrollPercentage;
        if (scrollPercentage >= 0.25 && scrollPercentage < 0.5) {
          trackScroll(0.25);
        } else if (scrollPercentage >= 0.5 && scrollPercentage < 0.75) {
          trackScroll(0.5);
        } else if (scrollPercentage >= 0.75 && scrollPercentage < 1) {
          trackScroll(0.75);
        } else if (scrollPercentage >= 1) {
          trackScroll(1);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Track time on page on unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
      trackTimeOnPage();
      
      // Track engagement summary
      trackEvent({
        action: 'Session Summary',
        category: 'User Engagement',
        value: interactionCount.current
      });
    };
  }, [professionalId]);

  return {
    trackInteraction,
    trackEvent
  };
};
