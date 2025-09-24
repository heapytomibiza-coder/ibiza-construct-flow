import { useEffect } from 'react';
import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

export const useWebVitals = () => {
  useEffect(() => {
    const sendToAnalytics = (metric: WebVitalsMetric) => {
      // Send to analytics service or console for development
      console.log('[Web Vitals]', {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        id: metric.id
      });

      // TODO: Replace with actual analytics service
      // analytics.track('web_vital', {
      //   metric_name: metric.name,
      //   value: metric.value,
      //   rating: metric.rating,
      //   page: window.location.pathname
      // });
    };

    // Measure Core Web Vitals
    onCLS(sendToAnalytics);
    onFCP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
    onINP(sendToAnalytics);
  }, []);
};