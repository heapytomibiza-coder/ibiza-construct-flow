import { useEffect, useState } from 'react';
import { onCLS, onFCP, onLCP, onTTFB, onINP, Metric } from 'web-vitals';

export interface WebVitalsMetrics {
  CLS?: number;
  FCP?: number;
  LCP?: number;
  TTFB?: number;
  INP?: number;
}

/**
 * Hook to collect real Web Vitals metrics
 * Follows Google's Core Web Vitals standards
 */
export function useWebVitals(): WebVitalsMetrics {
  const [metrics, setMetrics] = useState<WebVitalsMetrics>({});

  useEffect(() => {
    const handleMetric = (metric: Metric) => {
      setMetrics(prev => ({
        ...prev,
        [metric.name]: metric.value
      }));
    };

    // Collect all Web Vitals
    onCLS(handleMetric);
    onFCP(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);
    onINP(handleMetric);
  }, []);

  return metrics;
}

/**
 * Get performance status based on Google's thresholds
 */
export function getPerformanceStatus(
  value: number, 
  goodThreshold: number, 
  poorThreshold: number
): 'good' | 'needs-improvement' | 'poor' {
  if (value <= goodThreshold) return 'good';
  if (value <= poorThreshold) return 'needs-improvement';
  return 'poor';
}

/**
 * Core Web Vitals thresholds from Google
 */
export const WEB_VITALS_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },   // Largest Contentful Paint (ms)
  FCP: { good: 1800, poor: 3000 },   // First Contentful Paint (ms)
  CLS: { good: 0.1, poor: 0.25 },    // Cumulative Layout Shift
  INP: { good: 200, poor: 500 },     // Interaction to Next Paint (ms)
  TTFB: { good: 800, poor: 1800 }    // Time to First Byte (ms)
};
