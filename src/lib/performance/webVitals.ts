/**
 * Web Vitals tracking and performance monitoring
 * Phase 6: Performance Optimization
 */

import { onCLS, onFID, onFCP, onLCP, onTTFB, Metric } from 'web-vitals';

export type WebVitalsMetric = {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
};

// Thresholds based on web.dev recommendations
const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
};

const getRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
};

const sendToAnalytics = (metric: WebVitalsMetric) => {
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log('📊 Web Vital:', metric);
  }
  
  // In production, send to analytics service
  // This could be Google Analytics, custom endpoint, etc.
  if (import.meta.env.PROD) {
    // Example: Send to custom analytics endpoint
    navigator.sendBeacon?.('/api/analytics', JSON.stringify(metric));
  }
};

export const initWebVitals = () => {
  const handleMetric = (metric: Metric) => {
    const webVital: WebVitalsMetric = {
      name: metric.name,
      value: metric.value,
      rating: getRating(metric.name, metric.value),
      timestamp: Date.now(),
    };
    
    sendToAnalytics(webVital);
  };

  // Track all Core Web Vitals
  onCLS(handleMetric);
  onFID(handleMetric);
  onFCP(handleMetric);
  onLCP(handleMetric);
  onTTFB(handleMetric);
};

export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const duration = performance.now() - start;
  
  if (import.meta.env.DEV) {
    console.log(`⚡ ${name}: ${duration.toFixed(2)}ms`);
  }
  
  return duration;
};

export const measureAsync = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  
  if (import.meta.env.DEV) {
    console.log(`⚡ ${name}: ${duration.toFixed(2)}ms`);
  }
  
  return result;
};
