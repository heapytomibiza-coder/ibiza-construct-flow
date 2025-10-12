/**
 * Performance Metrics Collection
 * Phase 15: Performance Monitoring & Optimization
 * 
 * Comprehensive performance tracking with Web Vitals and custom metrics
 */

import { onCLS, onFID, onFCP, onLCP, onTTFB, onINP, Metric } from 'web-vitals';

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  inp?: number; // Interaction to Next Paint
  
  // Custom metrics
  routeChangeTime?: number;
  apiResponseTime?: number;
  bundleLoadTime?: number;
  
  // Context
  timestamp: number;
  route: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  connection?: string;
}

export type MetricHandler = (metric: Metric) => void;

/**
 * Performance thresholds based on Google's Web Vitals recommendations
 */
export const PERFORMANCE_THRESHOLDS = {
  // Core Web Vitals (good/needs improvement/poor)
  lcp: { good: 2500, poor: 4000 },      // ms
  fid: { good: 100, poor: 300 },        // ms
  cls: { good: 0.1, poor: 0.25 },       // score
  fcp: { good: 1800, poor: 3000 },      // ms
  ttfb: { good: 800, poor: 1800 },      // ms
  inp: { good: 200, poor: 500 },        // ms
  
  // Custom thresholds
  routeChange: { good: 200, poor: 500 },
  apiResponse: { good: 300, poor: 1000 },
  bundleLoad: { good: 1000, poor: 3000 },
} as const;

/**
 * Get performance rating
 */
export function getPerformanceRating(
  value: number,
  thresholds: { good: number; poor: number }
): 'good' | 'needs-improvement' | 'poor' {
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Get device type based on screen size
 */
function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Get connection type if available
 */
function getConnectionType(): string | undefined {
  const nav = navigator as any;
  return nav?.connection?.effectiveType || nav?.mozConnection?.effectiveType;
}

/**
 * Store for collected metrics
 */
class MetricsStore {
  private metrics: PerformanceMetrics = {
    timestamp: Date.now(),
    route: window.location.pathname,
    deviceType: getDeviceType(),
    connection: getConnectionType(),
  };
  
  private listeners: Set<(metrics: PerformanceMetrics) => void> = new Set();
  
  updateMetric<K extends keyof PerformanceMetrics>(key: K, value: PerformanceMetrics[K]) {
    this.metrics[key] = value;
    this.notifyListeners();
  }
  
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
  
  subscribe(listener: (metrics: PerformanceMetrics) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.getMetrics()));
  }
  
  reset() {
    this.metrics = {
      timestamp: Date.now(),
      route: window.location.pathname,
      deviceType: getDeviceType(),
      connection: getConnectionType(),
    };
    this.notifyListeners();
  }
}

export const metricsStore = new MetricsStore();

/**
 * Initialize Web Vitals tracking
 */
export function initWebVitals(
  onMetric?: (metric: Metric) => void
) {
  const handler: MetricHandler = (metric) => {
    // Update metrics store
    switch (metric.name) {
      case 'LCP':
        metricsStore.updateMetric('lcp', metric.value);
        break;
      case 'FID':
        metricsStore.updateMetric('fid', metric.value);
        break;
      case 'CLS':
        metricsStore.updateMetric('cls', metric.value);
        break;
      case 'FCP':
        metricsStore.updateMetric('fcp', metric.value);
        break;
      case 'TTFB':
        metricsStore.updateMetric('ttfb', metric.value);
        break;
      case 'INP':
        metricsStore.updateMetric('inp', metric.value);
        break;
    }
    
    // Call custom handler
    onMetric?.(metric);
    
    // Log in development
    if (import.meta.env.DEV) {
      const rating = getPerformanceRating(
        metric.value,
        PERFORMANCE_THRESHOLDS[metric.name.toLowerCase() as keyof typeof PERFORMANCE_THRESHOLDS] || 
        { good: 0, poor: Infinity }
      );
      
      console.log(
        `[Web Vitals] ${metric.name}:`,
        metric.value.toFixed(2),
        `(${rating})`
      );
    }
  };
  
  // Register Web Vitals observers
  onCLS(handler);
  onFID(handler);
  onFCP(handler);
  onLCP(handler);
  onTTFB(handler);
  onINP(handler);
}

/**
 * Measure route change performance
 */
export function measureRouteChange(route: string) {
  const start = performance.now();
  
  return () => {
    const duration = performance.now() - start;
    metricsStore.updateMetric('routeChangeTime', duration);
    
    if (import.meta.env.DEV) {
      const rating = getPerformanceRating(duration, PERFORMANCE_THRESHOLDS.routeChange);
      console.log(`[Route Change] ${route}: ${duration.toFixed(2)}ms (${rating})`);
    }
  };
}

/**
 * Measure API response time
 */
export function measureAPICall(endpoint: string) {
  const start = performance.now();
  
  return () => {
    const duration = performance.now() - start;
    metricsStore.updateMetric('apiResponseTime', duration);
    
    if (import.meta.env.DEV) {
      const rating = getPerformanceRating(duration, PERFORMANCE_THRESHOLDS.apiResponse);
      console.log(`[API Call] ${endpoint}: ${duration.toFixed(2)}ms (${rating})`);
    }
  };
}

/**
 * Get performance summary
 */
export function getPerformanceSummary() {
  const metrics = metricsStore.getMetrics();
  
  return {
    metrics,
    ratings: {
      lcp: metrics.lcp ? getPerformanceRating(metrics.lcp, PERFORMANCE_THRESHOLDS.lcp) : null,
      fid: metrics.fid ? getPerformanceRating(metrics.fid, PERFORMANCE_THRESHOLDS.fid) : null,
      cls: metrics.cls ? getPerformanceRating(metrics.cls, PERFORMANCE_THRESHOLDS.cls) : null,
      fcp: metrics.fcp ? getPerformanceRating(metrics.fcp, PERFORMANCE_THRESHOLDS.fcp) : null,
      ttfb: metrics.ttfb ? getPerformanceRating(metrics.ttfb, PERFORMANCE_THRESHOLDS.ttfb) : null,
      inp: metrics.inp ? getPerformanceRating(metrics.inp, PERFORMANCE_THRESHOLDS.inp) : null,
    },
    overall: calculateOverallScore(metrics),
  };
}

/**
 * Calculate overall performance score (0-100)
 */
function calculateOverallScore(metrics: PerformanceMetrics): number {
  const scores: number[] = [];
  
  if (metrics.lcp) {
    const rating = getPerformanceRating(metrics.lcp, PERFORMANCE_THRESHOLDS.lcp);
    scores.push(rating === 'good' ? 100 : rating === 'needs-improvement' ? 75 : 50);
  }
  
  if (metrics.fid) {
    const rating = getPerformanceRating(metrics.fid, PERFORMANCE_THRESHOLDS.fid);
    scores.push(rating === 'good' ? 100 : rating === 'needs-improvement' ? 75 : 50);
  }
  
  if (metrics.cls !== undefined) {
    const rating = getPerformanceRating(metrics.cls, PERFORMANCE_THRESHOLDS.cls);
    scores.push(rating === 'good' ? 100 : rating === 'needs-improvement' ? 75 : 50);
  }
  
  return scores.length > 0
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    : 0;
}
