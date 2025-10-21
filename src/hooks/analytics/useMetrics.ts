/**
 * Metrics Hook
 * Phase 27: Analytics & Reporting System
 * 
 * Hook for collecting and analyzing metrics
 */

import { useCallback, useEffect } from 'react';
import { metricsCollector } from '@/lib/analytics/index';
import { MetricSummary } from '@/lib/analytics/MetricsCollector';

export function useMetrics() {
  // Start auto cleanup on mount
  useEffect(() => {
    metricsCollector.startAutoCleanup();
    return () => metricsCollector.stopAutoCleanup();
  }, []);

  // Record metric
  const record = useCallback((
    name: string,
    value: number,
    unit?: string,
    dimensions?: Record<string, any>
  ) => {
    metricsCollector.record(name, value, unit, dimensions);
  }, []);

  // Increment counter
  const increment = useCallback((
    name: string,
    dimensions?: Record<string, any>
  ) => {
    metricsCollector.increment(name, dimensions);
  }, []);

  // Record timing
  const timing = useCallback((
    name: string,
    duration: number,
    dimensions?: Record<string, any>
  ) => {
    metricsCollector.timing(name, duration, dimensions);
  }, []);

  // Record gauge
  const gauge = useCallback((
    name: string,
    value: number,
    unit?: string,
    dimensions?: Record<string, any>
  ) => {
    metricsCollector.gauge(name, value, unit, dimensions);
  }, []);

  // Get summary
  const getSummary = useCallback((
    name: string,
    start?: Date,
    end?: Date
  ): MetricSummary | null => {
    return metricsCollector.getSummary(name, start, end);
  }, []);

  // Get aggregated metrics
  const getAggregated = useCallback((
    name: string,
    dimension: string,
    start?: Date,
    end?: Date
  ): Map<string, MetricSummary> => {
    return metricsCollector.getAggregated(name, dimension, start, end);
  }, []);

  // Time execution
  const timeExecution = useCallback(<T,>(
    name: string,
    fn: () => T,
    dimensions?: Record<string, any>
  ): T => {
    const start = performance.now();
    try {
      return fn();
    } finally {
      const duration = performance.now() - start;
      timing(name, duration, dimensions);
    }
  }, [timing]);

  // Time async execution
  const timeAsync = useCallback(async <T,>(
    name: string,
    fn: () => Promise<T>,
    dimensions?: Record<string, any>
  ): Promise<T> => {
    const start = performance.now();
    try {
      return await fn();
    } finally {
      const duration = performance.now() - start;
      timing(name, duration, dimensions);
    }
  }, [timing]);

  return {
    record,
    increment,
    timing,
    gauge,
    getSummary,
    getAggregated,
    timeExecution,
    timeAsync,
  };
}
