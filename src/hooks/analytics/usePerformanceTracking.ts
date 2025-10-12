/**
 * Performance Tracking Hook
 * Phase 22: Advanced Analytics & Monitoring System
 * 
 * Track component render performance
 */

import { useEffect, useRef } from 'react';
import { analyticsManager } from '@/lib/analytics';

export function usePerformanceTracking(componentName: string) {
  const renderStartTime = useRef<number>(performance.now());

  useEffect(() => {
    const renderEndTime = performance.now();
    const renderDuration = renderEndTime - renderStartTime.current;

    analyticsManager.track('component_render', {
      component: componentName,
      duration: renderDuration,
    }, 'performance', 'low');
  }, [componentName]);

  const measureOperation = (operationName: string, fn: () => void | Promise<void>) => {
    const startTime = performance.now();
    const result = fn();

    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = performance.now() - startTime;
        analyticsManager.track('async_operation', {
          operation: operationName,
          component: componentName,
          duration,
        }, 'performance', 'low');
      });
    } else {
      const duration = performance.now() - startTime;
      analyticsManager.track('sync_operation', {
        operation: operationName,
        component: componentName,
        duration,
      }, 'performance', 'low');
      return result;
    }
  };

  return {
    measureOperation,
  };
}
