/**
 * Analytics Provider Component
 * Phase 22: Advanced Analytics & Monitoring System
 * 
 * Initializes analytics and provides context
 */

import { ReactNode, useEffect } from 'react';
import { analyticsManager } from '@/lib/analytics';
import { AnalyticsConfig } from '@/lib/analytics/types';
import { useAuth } from '@/hooks/useAuth';

interface AnalyticsProviderProps {
  children: ReactNode;
  config?: Partial<AnalyticsConfig>;
}

export function AnalyticsProvider({ children, config }: AnalyticsProviderProps) {
  const { user } = useAuth();

  useEffect(() => {
    // Initialize analytics
    analyticsManager.initialize(config);

    return () => {
      analyticsManager.destroy();
    };
  }, [config]);

  useEffect(() => {
    // Identify user when authenticated
    if (user?.id) {
      analyticsManager.identify(user.id, {
        email: user.email,
        // Add other user traits as needed
      });
    }
  }, [user]);

  return <>{children}</>;
}
