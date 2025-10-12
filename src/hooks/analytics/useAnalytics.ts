/**
 * Analytics Hook
 * Phase 22: Advanced Analytics & Monitoring System
 * 
 * React hook for tracking analytics events
 */

import { useCallback, useEffect } from 'react';
import { analyticsManager } from '@/lib/analytics';
import { EventType, EventPriority } from '@/lib/analytics/types';

export function useAnalytics() {
  const track = useCallback((
    eventName: string,
    properties?: Record<string, any>,
    type: EventType = 'user_action',
    priority: EventPriority = 'medium'
  ) => {
    analyticsManager.track(eventName, properties, type, priority);
  }, []);

  const trackPageView = useCallback((
    page?: string,
    properties?: Record<string, any>
  ) => {
    analyticsManager.trackPageView(page, properties);
  }, []);

  const trackConversion = useCallback((
    goal: string,
    value?: number,
    currency?: string,
    properties?: Record<string, any>
  ) => {
    analyticsManager.trackConversion(goal, value, currency, properties);
  }, []);

  const identify = useCallback((
    userId: string,
    traits?: Record<string, any>
  ) => {
    analyticsManager.identify(userId, traits);
  }, []);

  const captureError = useCallback((
    error: Error,
    context?: any
  ) => {
    analyticsManager.captureError(error, context);
  }, []);

  return {
    track,
    trackPageView,
    trackConversion,
    identify,
    captureError,
  };
}
