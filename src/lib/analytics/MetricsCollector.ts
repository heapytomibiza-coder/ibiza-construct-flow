/**
 * Metrics Collector
 * Phase 27: Analytics & Reporting System
 * 
 * Collects and aggregates metrics
 */

import { AnalyticsMetric } from './types';
import { v4 as uuidv4 } from 'uuid';

export class MetricsCollector {
  private metrics: Map<string, AnalyticsMetric[]> = new Map();
  private aggregationInterval: number = 60000; // 1 minute
  private intervalId?: NodeJS.Timeout;

  constructor(aggregationInterval?: number) {
    if (aggregationInterval) {
      this.aggregationInterval = aggregationInterval;
    }
  }

  /**
   * Record a metric
   */
  record(
    name: string,
    value: number,
    unit?: string,
    dimensions?: Record<string, any>
  ): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    this.metrics.get(name)!.push({
      name,
      value,
      unit,
      timestamp: new Date(),
      dimensions,
    });
  }

  /**
   * Increment a counter
   */
  increment(name: string, dimensions?: Record<string, any>): void {
    this.record(name, 1, 'count', dimensions);
  }

  /**
   * Record timing
   */
  timing(name: string, duration: number, dimensions?: Record<string, any>): void {
    this.record(name, duration, 'ms', dimensions);
  }

  /**
   * Record gauge
   */
  gauge(name: string, value: number, unit?: string, dimensions?: Record<string, any>): void {
    this.record(name, value, unit, dimensions);
  }

  /**
   * Get metrics
   */
  getMetrics(name: string): AnalyticsMetric[] {
    return this.metrics.get(name) || [];
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Map<string, AnalyticsMetric[]> {
    return new Map(this.metrics);
  }

  /**
   * Get metric summary
   */
  getSummary(name: string, start?: Date, end?: Date): MetricSummary | null {
    const metrics = this.getMetrics(name);
    
    let filtered = metrics;
    if (start) {
      filtered = filtered.filter(m => m.timestamp >= start);
    }
    if (end) {
      filtered = filtered.filter(m => m.timestamp <= end);
    }

    if (filtered.length === 0) return null;

    const values = filtered.map(m => m.value);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const sorted = [...values].sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];

    return {
      name,
      count: filtered.length,
      sum,
      avg,
      min,
      max,
      p50,
      p95,
      p99,
      unit: filtered[0].unit,
    };
  }

  /**
   * Get aggregated metrics by dimension
   */
  getAggregated(
    name: string,
    dimension: string,
    start?: Date,
    end?: Date
  ): Map<string, MetricSummary> {
    const metrics = this.getMetrics(name);
    
    let filtered = metrics;
    if (start) {
      filtered = filtered.filter(m => m.timestamp >= start);
    }
    if (end) {
      filtered = filtered.filter(m => m.timestamp <= end);
    }

    const grouped = new Map<string, AnalyticsMetric[]>();
    
    filtered.forEach(metric => {
      const key = metric.dimensions?.[dimension]?.toString() || 'unknown';
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(metric);
    });

    const result = new Map<string, MetricSummary>();
    
    grouped.forEach((metrics, key) => {
      const values = metrics.map(m => m.value);
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      const sorted = [...values].sort((a, b) => a - b);

      result.set(key, {
        name: `${name}:${key}`,
        count: metrics.length,
        sum,
        avg,
        min: Math.min(...values),
        max: Math.max(...values),
        p50: sorted[Math.floor(sorted.length * 0.5)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        p99: sorted[Math.floor(sorted.length * 0.99)],
        unit: metrics[0].unit,
      });
    });

    return result;
  }

  /**
   * Clear metrics
   */
  clear(name?: string): void {
    if (name) {
      this.metrics.delete(name);
    } else {
      this.metrics.clear();
    }
  }

  /**
   * Clear old metrics
   */
  clearOld(olderThan: Date): void {
    this.metrics.forEach((metrics, name) => {
      const filtered = metrics.filter(m => m.timestamp > olderThan);
      if (filtered.length > 0) {
        this.metrics.set(name, filtered);
      } else {
        this.metrics.delete(name);
      }
    });
  }

  /**
   * Start automatic cleanup
   */
  startAutoCleanup(maxAge: number = 24 * 60 * 60 * 1000): void {
    this.stopAutoCleanup();
    
    this.intervalId = setInterval(() => {
      const cutoff = new Date(Date.now() - maxAge);
      this.clearOld(cutoff);
    }, this.aggregationInterval);
  }

  /**
   * Stop automatic cleanup
   */
  stopAutoCleanup(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }
}

export interface MetricSummary {
  name: string;
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
  p50: number;
  p95: number;
  p99: number;
  unit?: string;
}

// Global metrics collector instance
export const metricsCollector = new MetricsCollector();
