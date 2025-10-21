/**
 * Analytics Hook
 * Phase 27: Analytics & Reporting System
 * 
 * Main hook for analytics tracking
 */

import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { eventTracker } from '@/lib/analytics/index';
import { EventCategory } from '@/lib/analytics/types';

export function useAnalytics() {
  const location = useLocation();
  const { user } = useAuth();

  // Track page views automatically
  useEffect(() => {
    eventTracker.trackPageView(location.pathname);
  }, [location.pathname]);

  // Track event
  const track = useCallback((
    eventName: string,
    category?: EventCategory,
    properties?: Record<string, any>
  ) => {
    eventTracker.track(eventName, category, properties, user?.id);
  }, [user?.id]);

  // Track action
  const trackAction = useCallback((
    action: string,
    properties?: Record<string, any>
  ) => {
    eventTracker.trackAction(action, properties, user?.id);
  }, [user?.id]);

  // Track conversion
  const trackConversion = useCallback((
    conversionType: string,
    value?: number,
    properties?: Record<string, any>
  ) => {
    eventTracker.trackConversion(conversionType, value, properties, user?.id);
  }, [user?.id]);

  // Track engagement
  const trackEngagement = useCallback((
    metric: string,
    value: number,
    properties?: Record<string, any>
  ) => {
    eventTracker.trackEngagement(metric, value, properties, user?.id);
  }, [user?.id]);

  return {
    track,
    trackAction,
    trackConversion,
    trackEngagement,
  };
}
