/**
 * Error Tracking Hook
 * Phase 22: Advanced Analytics & Monitoring System
 * 
 * React error boundary integration
 */

import { useEffect } from 'react';
import { analyticsManager } from '@/lib/analytics';

export function useErrorTracking() {
  useEffect(() => {
    const handleError = (error: Error, errorInfo: any) => {
      analyticsManager.captureError(error, {
        componentStack: errorInfo?.componentStack,
      });
    };

    return () => {
      // Cleanup if needed
    };
  }, []);

  return {
    captureError: (error: Error, context?: any) => {
      analyticsManager.captureError(error, context);
    },
  };
}
