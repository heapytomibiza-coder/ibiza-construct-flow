/**
 * Performance Monitor
 * Phase 31: Advanced Monitoring & Observability System
 * 
 * Monitors application performance metrics
 */

import { PerformanceMetric, Trace, Span } from './types';
import { metricsCollector } from './MetricsCollector';

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private traces: Map<string, Trace> = new Map();
  private activeSpans: Map<string, Span> = new Map();

  private constructor() {
    // Setup web vitals tracking if available
    if (typeof window !== 'undefined') {
      this.setupWebVitals();
    }
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Start measuring performance
  start(name: string, category: PerformanceMetric['category'] = 'interaction'): string {
    const id = `perf-${Date.now()}-${Math.random()}`;
    const startTime = new Date();

    // Create initial metric entry
    const metric: PerformanceMetric = {
      id,
      name,
      duration: 0,
      startTime,
      endTime: startTime,
      category,
    };

    this.metrics.push(metric);
    return id;
  }

  // End performance measurement
  end(id: string, metadata?: Record<string, any>): PerformanceMetric | undefined {
    const metric = this.metrics.find(m => m.id === id);
    if (!metric) return undefined;

    metric.endTime = new Date();
    metric.duration = metric.endTime.getTime() - metric.startTime.getTime();
    metric.metadata = metadata;

    // Record metric
    metricsCollector.histogram(
      `performance.${metric.category}.${metric.name}`,
      metric.duration,
      { category: metric.category }
    );

    return metric;
  }

  // Measure function execution
  async measure<T>(
    name: string,
    fn: () => Promise<T> | T,
    category: PerformanceMetric['category'] = 'interaction'
  ): Promise<T> {
    const id = this.start(name, category);
    try {
      const result = await fn();
      this.end(id);
      return result;
    } catch (error) {
      this.end(id, { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  // Start trace
  startTrace(name: string, metadata?: Record<string, any>): string {
    const trace: Trace = {
      id: `trace-${Date.now()}-${Math.random()}`,
      name,
      startTime: new Date(),
      spans: [],
      status: 'pending',
      metadata,
    };

    this.traces.set(trace.id, trace);
    return trace.id;
  }

  // End trace
  endTrace(traceId: string, status: 'completed' | 'failed' = 'completed'): Trace | undefined {
    const trace = this.traces.get(traceId);
    if (!trace) return undefined;

    trace.endTime = new Date();
    trace.duration = trace.endTime.getTime() - trace.startTime.getTime();
    trace.status = status;

    return trace;
  }

  // Start span within trace
  startSpan(traceId: string, name: string, parentId?: string): string {
    const span: Span = {
      id: `span-${Date.now()}-${Math.random()}`,
      traceId,
      parentId,
      name,
      startTime: new Date(),
      logs: [],
    };

    const trace = this.traces.get(traceId);
    if (trace) {
      trace.spans.push(span);
    }

    this.activeSpans.set(span.id, span);
    return span.id;
  }

  // End span
  endSpan(spanId: string, tags?: Record<string, string>): Span | undefined {
    const span = this.activeSpans.get(spanId);
    if (!span) return undefined;

    span.endTime = new Date();
    span.duration = span.endTime.getTime() - span.startTime.getTime();
    span.tags = tags;

    this.activeSpans.delete(spanId);
    return span;
  }

  // Get performance metrics
  getMetrics(category?: PerformanceMetric['category']): PerformanceMetric[] {
    if (!category) return this.metrics;
    return this.metrics.filter(m => m.category === category);
  }

  // Get traces
  getTraces(): Trace[] {
    return Array.from(this.traces.values());
  }

  // Get average duration
  getAverageDuration(name: string, category?: PerformanceMetric['category']): number {
    const metrics = this.metrics.filter(
      m => m.name === name && (!category || m.category === category)
    );

    if (metrics.length === 0) return 0;

    const total = metrics.reduce((sum, m) => sum + m.duration, 0);
    return total / metrics.length;
  }

  // Get slowest operations
  getSlowest(limit: number = 10, category?: PerformanceMetric['category']): PerformanceMetric[] {
    const metrics = category ? this.getMetrics(category) : this.metrics;
    return metrics
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  // Clear metrics
  clear(): void {
    this.metrics = [];
    this.traces.clear();
    this.activeSpans.clear();
  }

  // Setup web vitals tracking
  private setupWebVitals(): void {
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      this.observeMetric('largest-contentful-paint', (entry: any) => {
        metricsCollector.gauge('web_vitals.lcp', entry.renderTime || entry.loadTime);
      });

      // First Input Delay (FID)
      this.observeMetric('first-input', (entry: any) => {
        metricsCollector.gauge('web_vitals.fid', entry.processingStart - entry.startTime);
      });

      // Cumulative Layout Shift (CLS)
      this.observeMetric('layout-shift', (entry: any) => {
        if (!entry.hadRecentInput) {
          metricsCollector.increment('web_vitals.cls', entry.value);
        }
      });
    }
  }

  // Observe performance metric
  private observeMetric(type: string, callback: (entry: any) => void): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          callback(entry);
        }
      });
      observer.observe({ type, buffered: true });
    } catch (e) {
      // Observer not supported
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
