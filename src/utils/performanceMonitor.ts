import { supabase } from '@/integrations/supabase/client';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];

  // Web Vitals thresholds
  private thresholds = {
    FCP: { good: 1800, poor: 3000 },
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    TTFB: { good: 800, poor: 1800 },
  };

  init() {
    if (typeof window === 'undefined') return;

    // Observe Web Vitals
    this.observeWebVitals();
    
    // Monitor long tasks
    this.observeLongTasks();

    // Monitor resource loading
    this.observeResourceTiming();

    // Report metrics periodically
    this.startPeriodicReporting();
  }

  private observeWebVitals() {
    // First Contentful Paint (FCP)
    this.observePaintTiming('first-contentful-paint', 'FCP');

    // Largest Contentful Paint (LCP)
    this.observeLCP();

    // First Input Delay (FID)
    this.observeFID();

    // Cumulative Layout Shift (CLS)
    this.observeCLS();

    // Time to First Byte (TTFB)
    this.observeTTFB();
  }

  private observePaintTiming(name: string, metricName: string) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === name) {
          this.recordMetric(metricName, entry.startTime);
        }
      }
    });
    observer.observe({ entryTypes: ['paint'] });
  }

  private observeLCP() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      if (lastEntry) {
        this.recordMetric('LCP', lastEntry.renderTime || lastEntry.loadTime);
      }
    });
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  }

  private observeFID() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fidEntry = entry as any;
        this.recordMetric('FID', fidEntry.processingStart - fidEntry.startTime);
      }
    });
    observer.observe({ entryTypes: ['first-input'] });
  }

  private observeCLS() {
    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShift = entry as any;
        if (!layoutShift.hadRecentInput) {
          clsValue += layoutShift.value;
        }
      }
      this.recordMetric('CLS', clsValue);
    });
    observer.observe({ entryTypes: ['layout-shift'] });
  }

  private observeTTFB() {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as any;
    if (navigationEntry) {
      const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      this.recordMetric('TTFB', ttfb);
    }
  }

  private observeLongTasks() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.warn('Long task detected:', entry.duration, 'ms');
        this.recordMetric('LongTask', entry.duration);
      }
    });
    observer.observe({ entryTypes: ['longtask'] });
  }

  private observeResourceTiming() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resource = entry as PerformanceResourceTiming;
        if (resource.duration > 1000) {
          console.warn('Slow resource:', resource.name, resource.duration, 'ms');
        }
      }
    });
    observer.observe({ entryTypes: ['resource'] });
  }

  private recordMetric(name: string, value: number) {
    const threshold = this.thresholds[name as keyof typeof this.thresholds];
    let rating: 'good' | 'needs-improvement' | 'poor' = 'good';

    if (threshold) {
      if (value > threshold.poor) {
        rating = 'poor';
      } else if (value > threshold.good) {
        rating = 'needs-improvement';
      }
    }

    this.metrics.push({ name, value, rating });
  }

  private startPeriodicReporting() {
    // Report metrics every 30 seconds
    setInterval(() => {
      this.reportMetrics();
    }, 30000);

    // Report on page unload
    window.addEventListener('beforeunload', () => {
      this.reportMetrics();
    });
  }

  private async reportMetrics() {
    if (this.metrics.length === 0) return;

    const metricsToReport = [...this.metrics];
    this.metrics = []; // Clear after copying

    try {
      const { data: { user } } = await supabase.auth.getUser();

      await supabase.functions.invoke('track-analytics-event', {
        body: {
          event_name: 'performance_metrics',
          event_category: 'performance',
          event_properties: {
            metrics: metricsToReport,
            url: window.location.href,
            user_agent: navigator.userAgent,
          },
          user_id: user?.id,
          session_id: this.getSessionId(),
          page_url: window.location.href,
        },
      });
    } catch (error) {
      console.error('Failed to report performance metrics:', error);
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('perf_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('perf_session_id', sessionId);
    }
    return sessionId;
  }

  getMetrics(): PerformanceMetric[] {
    return this.metrics;
  }

  clearMetrics() {
    this.metrics = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();
