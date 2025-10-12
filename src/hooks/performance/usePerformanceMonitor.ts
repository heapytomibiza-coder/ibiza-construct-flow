/**
 * Performance Monitor Hook
 * Phase 15: Performance Monitoring & Optimization
 * 
 * React hook for monitoring performance metrics
 */

import { useEffect, useState } from 'react';
import {
  PerformanceMetrics,
  metricsStore,
  getPerformanceSummary,
  initWebVitals,
} from '@/lib/performance';
import { performanceReporter } from '@/lib/performance/reporter';

export interface PerformanceMonitorOptions {
  // Enable automatic reporting
  autoReport?: boolean;
  
  // Report to console
  logToConsole?: boolean;
}

/**
 * Hook to monitor application performance
 */
export function usePerformanceMonitor(options: PerformanceMonitorOptions = {}) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(metricsStore.getMetrics());
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    if (isInitialized) return;
    
    // Initialize Web Vitals tracking
    initWebVitals((metric) => {
      if (options.autoReport) {
        performanceReporter.reportWebVital(metric);
      }
      
      if (options.logToConsole) {
        console.log('[Web Vitals]', metric);
      }
    });
    
    setIsInitialized(true);
  }, [isInitialized, options.autoReport, options.logToConsole]);
  
  useEffect(() => {
    // Subscribe to metrics updates
    const unsubscribe = metricsStore.subscribe(setMetrics);
    return () => {
      unsubscribe();
    };
  }, []);
  
  const summary = getPerformanceSummary();
  
  return {
    metrics,
    summary,
    isInitialized,
  };
}
