/**
 * Performance Hook
 * Phase 31: Advanced Monitoring & Observability System
 * 
 * Hook for performance monitoring
 */

import { useCallback } from 'react';
import { performanceMonitor, PerformanceMetric, Trace } from '@/lib/monitoring';

export function usePerformance() {
  // Start measurement
  const start = useCallback((
    name: string,
    category: PerformanceMetric['category'] = 'interaction'
  ): string => {
    return performanceMonitor.start(name, category);
  }, []);

  // End measurement
  const end = useCallback((
    id: string,
    metadata?: Record<string, any>
  ): PerformanceMetric | undefined => {
    return performanceMonitor.end(id, metadata);
  }, []);

  // Measure function
  const measure = useCallback(async <T>(
    name: string,
    fn: () => Promise<T> | T,
    category: PerformanceMetric['category'] = 'interaction'
  ): Promise<T> => {
    return performanceMonitor.measure(name, fn, category);
  }, []);

  // Tracing
  const startTrace = useCallback((
    name: string,
    metadata?: Record<string, any>
  ): string => {
    return performanceMonitor.startTrace(name, metadata);
  }, []);

  const endTrace = useCallback((
    traceId: string,
    status: 'completed' | 'failed' = 'completed'
  ): Trace | undefined => {
    return performanceMonitor.endTrace(traceId, status);
  }, []);

  const startSpan = useCallback((
    traceId: string,
    name: string,
    parentId?: string
  ): string => {
    return performanceMonitor.startSpan(traceId, name, parentId);
  }, []);

  const endSpan = useCallback((
    spanId: string,
    tags?: Record<string, string>
  ) => {
    return performanceMonitor.endSpan(spanId, tags);
  }, []);

  // Get metrics
  const getMetrics = useCallback((
    category?: PerformanceMetric['category']
  ): PerformanceMetric[] => {
    return performanceMonitor.getMetrics(category);
  }, []);

  const getTraces = useCallback((): Trace[] => {
    return performanceMonitor.getTraces();
  }, []);

  const getAverageDuration = useCallback((
    name: string,
    category?: PerformanceMetric['category']
  ): number => {
    return performanceMonitor.getAverageDuration(name, category);
  }, []);

  const getSlowest = useCallback((
    limit: number = 10,
    category?: PerformanceMetric['category']
  ): PerformanceMetric[] => {
    return performanceMonitor.getSlowest(limit, category);
  }, []);

  // Clear
  const clear = useCallback(() => {
    performanceMonitor.clear();
  }, []);

  return {
    start,
    end,
    measure,
    startTrace,
    endTrace,
    startSpan,
    endSpan,
    getMetrics,
    getTraces,
    getAverageDuration,
    getSlowest,
    clear,
  };
}
