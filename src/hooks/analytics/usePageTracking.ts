/**
 * Page Tracking Hook
 * Phase 22: Advanced Analytics & Monitoring System
 * 
 * Automatically tracks page views
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsManager } from '@/lib/analytics';

export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    analyticsManager.trackPageView(location.pathname + location.search, {
      referrer: document.referrer,
    });
  }, [location]);
}
