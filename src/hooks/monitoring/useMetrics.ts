/**
 * Metrics Hook
 * Phase 31: Advanced Monitoring & Observability System
 * 
 * Hook for collecting and querying metrics
 */

import { useCallback } from 'react';
import { metricsCollector, Metric, MetricConfig } from '@/lib/monitoring';

export function useMetrics() {
  // Register metric configuration
  const registerMetric = useCallback((config: MetricConfig) => {
    metricsCollector.registerMetric(config);
  }, []);

  // Record metric
  const record = useCallback((
    name: string,
    value: number,
    labels?: Record<string, string>,
    metadata?: Record<string, any>
  ): Metric => {
    return metricsCollector.record(name, value, labels, metadata);
  }, []);

  // Increment counter
  const increment = useCallback((
    name: string,
    value: number = 1,
    labels?: Record<string, string>
  ): Metric => {
    return metricsCollector.increment(name, value, labels);
  }, []);

  // Set gauge
  const gauge = useCallback((
    name: string,
    value: number,
    labels?: Record<string, string>
  ): Metric => {
    return metricsCollector.gauge(name, value, labels);
  }, []);

  // Record histogram
  const histogram = useCallback((
    name: string,
    value: number,
    labels?: Record<string, string>
  ): Metric => {
    return metricsCollector.histogram(name, value, labels);
  }, []);

  // Get metrics
  const getMetrics = useCallback((
    name: string,
    timeRange?: { start: Date; end: Date }
  ): Metric[] => {
    return metricsCollector.getMetrics(name, timeRange);
  }, []);

  // Get latest metric
  const getLatest = useCallback((name: string): Metric | undefined => {
    return metricsCollector.getLatest(name);
  }, []);

  // Aggregate metrics
  const aggregate = useCallback((
    name: string,
    aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count',
    timeRange?: { start: Date; end: Date }
  ): number => {
    return metricsCollector.aggregate(name, aggregation, timeRange);
  }, []);

  // Clear metrics
  const clear = useCallback((name?: string) => {
    metricsCollector.clear(name);
  }, []);

  return {
    registerMetric,
    record,
    increment,
    gauge,
    histogram,
    getMetrics,
    getLatest,
    aggregate,
    clear,
  };
}
