/**
 * Analytics Types
 * Phase 22: Advanced Analytics & Monitoring System
 */

export type EventType = 
  | 'page_view'
  | 'user_action'
  | 'error'
  | 'performance'
  | 'conversion'
  | 'custom';

export type EventPriority = 'low' | 'medium' | 'high' | 'critical';

export interface AnalyticsEvent {
  id: string;
  type: EventType;
  name: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
  properties?: Record<string, any>;
  metadata?: {
    userAgent?: string;
    url?: string;
    referrer?: string;
    viewport?: { width: number; height: number };
    deviceType?: 'mobile' | 'tablet' | 'desktop';
    os?: string;
    browser?: string;
  };
  priority: EventPriority;
}

export interface PerformanceMetrics {
  id: string;
  timestamp: number;
  sessionId: string;
  metrics: {
    // Core Web Vitals
    fcp?: number; // First Contentful Paint
    lcp?: number; // Largest Contentful Paint
    fid?: number; // First Input Delay
    cls?: number; // Cumulative Layout Shift
    ttfb?: number; // Time to First Byte
    
    // Custom metrics
    domReady?: number;
    windowLoad?: number;
    apiResponseTime?: number;
    componentRenderTime?: number;
  };
  page: string;
  userAgent: string;
}

export interface ErrorReport {
  id: string;
  timestamp: number;
  sessionId: string;
  userId?: string;
  error: {
    message: string;
    stack?: string;
    type: string;
    filename?: string;
    lineno?: number;
    colno?: number;
  };
  context?: {
    component?: string;
    action?: string;
    state?: Record<string, any>;
  };
  severity: 'info' | 'warning' | 'error' | 'fatal';
  handled: boolean;
}

export interface UserSession {
  id: string;
  userId?: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  pageViews: number;
  events: number;
  referrer?: string;
  entryPage: string;
  exitPage?: string;
  deviceInfo: {
    type: 'mobile' | 'tablet' | 'desktop';
    os: string;
    browser: string;
    viewport: { width: number; height: number };
  };
}

export interface ConversionEvent {
  id: string;
  timestamp: number;
  sessionId: string;
  userId?: string;
  goal: string;
  value?: number;
  currency?: string;
  properties?: Record<string, any>;
}

export interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  trackPageViews: boolean;
  trackPerformance: boolean;
  trackErrors: boolean;
  trackUserBehavior: boolean;
  sampleRate: number; // 0-1
  bufferSize: number;
  flushInterval: number; // ms
  endpoint?: string;
}

export interface AnalyticsProvider {
  name: string;
  track: (event: AnalyticsEvent) => Promise<void>;
  identify?: (userId: string, traits?: Record<string, any>) => Promise<void>;
  page?: (page: string, properties?: Record<string, any>) => Promise<void>;
}
