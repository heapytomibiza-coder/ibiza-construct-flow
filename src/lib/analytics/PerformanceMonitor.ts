/**
 * Performance Monitor
 * Phase 22: Advanced Analytics & Monitoring System
 * 
 * Monitors and reports web vitals and custom performance metrics
 */

import { PerformanceMetrics } from './types';
import { v4 as uuidv4 } from 'uuid';

export class PerformanceMonitor {
  private sessionId: string;
  private observer: PerformanceObserver | null = null;
  private metrics: PerformanceMetrics['metrics'] = {};
  private onMetrics: (metrics: PerformanceMetrics) => void;

  constructor(sessionId: string, onMetrics: (metrics: PerformanceMetrics) => void) {
    this.sessionId = sessionId;
    this.onMetrics = onMetrics;
    this.initializeObservers();
    this.captureNavigationTiming();
  }

  private initializeObservers(): void {
    if ('PerformanceObserver' in window) {
      // Observe paint timing
      this.observePaintTiming();
      // Observe largest contentful paint
      this.observeLCP();
      // Observe first input delay
      this.observeFID();
      // Observe cumulative layout shift
      this.observeCLS();
    }
  }

  private observePaintTiming(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime;
            this.reportMetrics();
          }
        }
      });
      observer.observe({ entryTypes: ['paint'] });
    } catch (error) {
      console.error('Failed to observe paint timing:', error);
    }
  }

  private observeLCP(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
        this.reportMetrics();
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      console.error('Failed to observe LCP:', error);
    }
  }

  private observeFID(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.metrics.fid = (entry as any).processingStart - entry.startTime;
          this.reportMetrics();
        }
      });
      observer.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      console.error('Failed to observe FID:', error);
    }
  }

  private observeCLS(): void {
    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            this.metrics.cls = clsValue;
            this.reportMetrics();
          }
        }
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.error('Failed to observe CLS:', error);
    }
  }

  private captureNavigationTiming(): void {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as any;
        if (navigation) {
          this.metrics.ttfb = navigation.responseStart - navigation.requestStart;
          this.metrics.domReady = navigation.domContentLoadedEventEnd - navigation.fetchStart;
          this.metrics.windowLoad = navigation.loadEventEnd - navigation.fetchStart;
          this.reportMetrics();
        }
      }, 0);
    });
  }

  measureAPICall(name: string, duration: number): void {
    if (!this.metrics.apiResponseTime) {
      this.metrics.apiResponseTime = duration;
    } else {
      // Running average
      this.metrics.apiResponseTime = (this.metrics.apiResponseTime + duration) / 2;
    }
    this.reportMetrics();
  }

  measureComponentRender(name: string, duration: number): void {
    if (!this.metrics.componentRenderTime) {
      this.metrics.componentRenderTime = duration;
    } else {
      // Running average
      this.metrics.componentRenderTime = (this.metrics.componentRenderTime + duration) / 2;
    }
    this.reportMetrics();
  }

  private reportMetrics(): void {
    const report: PerformanceMetrics = {
      id: uuidv4(),
      timestamp: Date.now(),
      sessionId: this.sessionId,
      metrics: { ...this.metrics },
      page: window.location.pathname,
      userAgent: navigator.userAgent,
    };

    this.onMetrics(report);
  }

  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
