/**
 * Metrics Collector
 * Phase 31: Advanced Monitoring & Observability System
 * 
 * Collects and aggregates application metrics
 */

import { Metric, MetricConfig, MetricType } from './types';

export class MetricsCollector {
  private static instance: MetricsCollector;
  private metrics: Map<string, Metric[]> = new Map();
  private configs: Map<string, MetricConfig> = new Map();

  private constructor() {}

  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  // Register metric configuration
  registerMetric(config: MetricConfig): void {
    this.configs.set(config.name, config);
  }

  // Record a metric value
  record(
    name: string,
    value: number,
    labels?: Record<string, string>,
    metadata?: Record<string, any>
  ): Metric {
    const config = this.configs.get(name);
    
    const metric: Metric = {
      id: `${name}-${Date.now()}-${Math.random()}`,
      name,
      type: config?.type || 'gauge',
      value,
      unit: config?.unit,
      labels,
      timestamp: new Date(),
      metadata,
    };

    // Store metric
    const existing = this.metrics.get(name) || [];
    existing.push(metric);
    this.metrics.set(name, existing);

    // Apply retention
    this.applyRetention(name);

    return metric;
  }

  // Increment counter
  increment(name: string, value: number = 1, labels?: Record<string, string>): Metric {
    const existing = this.getLatest(name);
    const newValue = existing ? existing.value + value : value;
    return this.record(name, newValue, labels);
  }

  // Set gauge value
  gauge(name: string, value: number, labels?: Record<string, string>): Metric {
    return this.record(name, value, labels);
  }

  // Record histogram value
  histogram(name: string, value: number, labels?: Record<string, string>): Metric {
    return this.record(name, value, labels);
  }

  // Get metrics by name
  getMetrics(name: string, timeRange?: { start: Date; end: Date }): Metric[] {
    const metrics = this.metrics.get(name) || [];
    
    if (!timeRange) {
      return metrics;
    }

    return metrics.filter(
      m => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
    );
  }

  // Get latest metric value
  getLatest(name: string): Metric | undefined {
    const metrics = this.metrics.get(name) || [];
    return metrics[metrics.length - 1];
  }

  // Get all metrics
  getAllMetrics(): Map<string, Metric[]> {
    return new Map(this.metrics);
  }

  // Aggregate metrics
  aggregate(
    name: string,
    aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count',
    timeRange?: { start: Date; end: Date }
  ): number {
    const metrics = this.getMetrics(name, timeRange);
    
    if (metrics.length === 0) {
      return 0;
    }

    const values = metrics.map(m => m.value);

    switch (aggregation) {
      case 'sum':
        return values.reduce((a, b) => a + b, 0);
      case 'avg':
        return values.reduce((a, b) => a + b, 0) / values.length;
      case 'min':
        return Math.min(...values);
      case 'max':
        return Math.max(...values);
      case 'count':
        return values.length;
      default:
        return 0;
    }
  }

  // Clear metrics
  clear(name?: string): void {
    if (name) {
      this.metrics.delete(name);
    } else {
      this.metrics.clear();
    }
  }

  // Apply retention policy
  private applyRetention(name: string): void {
    const config = this.configs.get(name);
    if (!config?.retention) return;

    const metrics = this.metrics.get(name) || [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - config.retention);

    const filtered = metrics.filter(m => m.timestamp >= cutoff);
    this.metrics.set(name, filtered);
  }

  // Export metrics
  export(): Record<string, any> {
    const exported: Record<string, any> = {};
    
    this.metrics.forEach((metrics, name) => {
      exported[name] = metrics.map(m => ({
        value: m.value,
        labels: m.labels,
        timestamp: m.timestamp.toISOString(),
      }));
    });

    return exported;
  }
}

export const metricsCollector = MetricsCollector.getInstance();
