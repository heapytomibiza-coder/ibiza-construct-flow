/**
 * Performance Reporter
 * Phase 15: Performance Monitoring & Optimization
 * 
 * Report performance metrics to analytics and monitoring services
 */

import { Metric } from 'web-vitals';
import { PerformanceMetrics } from './metrics';

export interface ReporterConfig {
  // Analytics endpoint
  endpoint?: string;
  
  // Sampling rate (0-1, e.g., 0.1 = 10% of sessions)
  sampleRate?: number;
  
  // Enable console logging
  debug?: boolean;
  
  // Custom dimensions
  customDimensions?: Record<string, string | number>;
}

/**
 * Performance reporter class
 */
export class PerformanceReporter {
  private config: ReporterConfig;
  private sessionId: string;
  private metricsQueue: any[] = [];
  private flushTimeout?: ReturnType<typeof setTimeout>;
  
  constructor(config: ReporterConfig = {}) {
    this.config = {
      sampleRate: 1, // 100% by default
      debug: import.meta.env.DEV,
      ...config,
    };
    
    this.sessionId = this.generateSessionId();
    
    // Send queued metrics on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.flush();
        }
      });
    }
  }
  
  /**
   * Report a Web Vital metric
   */
  reportWebVital(metric: Metric) {
    if (!this.shouldSample()) return;
    
    this.queueMetric({
      type: 'web-vital',
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      ...this.getCommonFields(),
    });
    
    if (this.config.debug) {
      console.log('[Performance] Web Vital:', metric);
    }
  }
  
  /**
   * Report custom performance metric
   */
  reportCustomMetric(name: string, value: number, metadata?: Record<string, any>) {
    if (!this.shouldSample()) return;
    
    this.queueMetric({
      type: 'custom',
      name,
      value,
      ...metadata,
      ...this.getCommonFields(),
    });
    
    if (this.config.debug) {
      console.log('[Performance] Custom Metric:', { name, value, ...metadata });
    }
  }
  
  /**
   * Report route change
   */
  reportRouteChange(from: string, to: string, duration: number) {
    if (!this.shouldSample()) return;
    
    this.queueMetric({
      type: 'route-change',
      from,
      to,
      duration,
      ...this.getCommonFields(),
    });
    
    if (this.config.debug) {
      console.log('[Performance] Route Change:', { from, to, duration });
    }
  }
  
  /**
   * Report resource timing
   */
  reportResourceTiming(resource: PerformanceResourceTiming) {
    if (!this.shouldSample()) return;
    
    // Only report slow resources (> 500ms)
    if (resource.duration < 500) return;
    
    this.queueMetric({
      type: 'resource',
      name: resource.name,
      duration: resource.duration,
      size: resource.transferSize,
      initiatorType: resource.initiatorType,
      ...this.getCommonFields(),
    });
  }
  
  /**
   * Get common fields for all metrics
   */
  private getCommonFields() {
    return {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      url: window.location.pathname,
      userAgent: navigator.userAgent,
      connection: (navigator as any)?.connection?.effectiveType,
      ...this.config.customDimensions,
    };
  }
  
  /**
   * Queue metric for batching
   */
  private queueMetric(metric: any) {
    this.metricsQueue.push(metric);
    
    // Auto-flush after 10 metrics or 5 seconds
    if (this.metricsQueue.length >= 10) {
      this.flush();
    } else if (!this.flushTimeout) {
      this.flushTimeout = setTimeout(() => this.flush(), 5000);
    }
  }
  
  /**
   * Flush metrics to endpoint
   */
  private flush() {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = undefined;
    }
    
    if (this.metricsQueue.length === 0) return;
    
    const metrics = [...this.metricsQueue];
    this.metricsQueue = [];
    
    // Send to endpoint if configured
    if (this.config.endpoint) {
      this.sendToEndpoint(metrics);
    }
    
    // Log to console in debug mode
    if (this.config.debug) {
      console.log('[Performance] Flushed metrics:', metrics);
    }
  }
  
  /**
   * Send metrics to analytics endpoint
   */
  private async sendToEndpoint(metrics: any[]) {
    try {
      const response = await fetch(this.config.endpoint!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics }),
        // Use keepalive for requests on page unload
        keepalive: true,
      });
      
      if (!response.ok) {
        console.error('[Performance] Failed to send metrics:', response.statusText);
      }
    } catch (error) {
      console.error('[Performance] Error sending metrics:', error);
    }
  }
  
  /**
   * Check if this session should be sampled
   */
  private shouldSample(): boolean {
    return Math.random() < (this.config.sampleRate || 1);
  }
  
  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}

/**
 * Global reporter instance
 */
export const performanceReporter = new PerformanceReporter({
  // Configure endpoint in production
  endpoint: import.meta.env.PROD ? '/api/analytics/performance' : undefined,
  sampleRate: import.meta.env.PROD ? 0.1 : 1, // 10% in prod, 100% in dev
  debug: import.meta.env.DEV,
});
