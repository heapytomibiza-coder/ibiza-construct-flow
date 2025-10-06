import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useWebVitals, getPerformanceStatus, WEB_VITALS_THRESHOLDS } from '@/hooks/useWebVitals';

// Mock web-vitals
vi.mock('web-vitals', () => ({
  onCLS: vi.fn((callback) => {
    callback({ name: 'CLS', value: 0.05 });
  }),
  onFCP: vi.fn((callback) => {
    callback({ name: 'FCP', value: 1500 });
  }),
  onLCP: vi.fn((callback) => {
    callback({ name: 'LCP', value: 2000 });
  }),
  onTTFB: vi.fn((callback) => {
    callback({ name: 'TTFB', value: 500 });
  }),
  onINP: vi.fn((callback) => {
    callback({ name: 'INP', value: 150 });
  }),
}));

describe('useWebVitals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('collects web vitals metrics', async () => {
    const { result } = renderHook(() => useWebVitals());

    // Wait a bit for metrics to be collected
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(result.current.CLS).toBeDefined();
    expect(result.current.FCP).toBeDefined();
    expect(result.current.LCP).toBeDefined();
    expect(result.current.TTFB).toBeDefined();
    expect(result.current.INP).toBeDefined();

    expect(result.current.CLS).toBe(0.05);
    expect(result.current.FCP).toBe(1500);
    expect(result.current.LCP).toBe(2000);
    expect(result.current.TTFB).toBe(500);
    expect(result.current.INP).toBe(150);
  });
});

describe('getPerformanceStatus', () => {
  it('returns "good" for values within good threshold', () => {
    const status = getPerformanceStatus(
      1000,
      WEB_VITALS_THRESHOLDS.FCP.good,
      WEB_VITALS_THRESHOLDS.FCP.poor
    );
    expect(status).toBe('good');
  });

  it('returns "needs-improvement" for values between thresholds', () => {
    const status = getPerformanceStatus(
      2000,
      WEB_VITALS_THRESHOLDS.FCP.good,
      WEB_VITALS_THRESHOLDS.FCP.poor
    );
    expect(status).toBe('needs-improvement');
  });

  it('returns "poor" for values above poor threshold', () => {
    const status = getPerformanceStatus(
      3500,
      WEB_VITALS_THRESHOLDS.FCP.good,
      WEB_VITALS_THRESHOLDS.FCP.poor
    );
    expect(status).toBe('poor');
  });
});
