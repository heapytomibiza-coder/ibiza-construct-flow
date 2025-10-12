/**
 * Event Tracker
 * Phase 27: Analytics & Reporting System
 * 
 * Tracks user events and interactions
 */

import { AnalyticsEvent, EventCategory, AnalyticsConfig } from './types';
import { v4 as uuidv4 } from 'uuid';

export class EventTracker {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private config: AnalyticsConfig;
  private eventListeners: Array<(event: AnalyticsEvent) => void> = [];

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.sessionId = uuidv4();
    this.config = {
      trackPageViews: true,
      trackUserActions: true,
      trackPerformance: true,
      trackErrors: true,
      sampleRate: 1.0,
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      ...config,
    };

    this.initializeTracking();
  }

  /**
   * Initialize automatic tracking
   */
  private initializeTracking(): void {
    if (typeof window === 'undefined') return;

    // Track page views
    if (this.config.trackPageViews) {
      this.trackPageView();
      window.addEventListener('popstate', () => this.trackPageView());
    }

    // Track errors
    if (this.config.trackErrors) {
      window.addEventListener('error', (event) => {
        this.track('error', 'error', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.track('unhandled_rejection', 'error', {
          reason: event.reason,
        });
      });
    }

    // Track performance
    if (this.config.trackPerformance) {
      window.addEventListener('load', () => {
        setTimeout(() => this.trackPerformance(), 0);
      });
    }
  }

  /**
   * Track a custom event
   */
  track(
    eventName: string,
    category: EventCategory = 'user_action',
    properties?: Record<string, any>,
    userId?: string
  ): AnalyticsEvent {
    // Apply sampling rate
    if (Math.random() > this.config.sampleRate) {
      return {} as AnalyticsEvent;
    }

    const event: AnalyticsEvent = {
      id: uuidv4(),
      userId,
      sessionId: this.sessionId,
      eventName,
      category,
      properties,
      timestamp: Date.now(),
      source: 'web',
    };

    this.events.push(event);
    this.notifyListeners(event);

    return event;
  }

  /**
   * Track page view
   */
  trackPageView(path?: string): void {
    if (typeof window === 'undefined') return;

    const pagePath = path || window.location.pathname;
    
    // Check if path should be excluded
    if (this.config.excludePaths?.some(excluded => pagePath.startsWith(excluded))) {
      return;
    }

    this.track('page_view', 'page_view', {
      path: pagePath,
      search: window.location.search,
      hash: window.location.hash,
      referrer: document.referrer,
      title: document.title,
    });
  }

  /**
   * Track user action
   */
  trackAction(
    action: string,
    properties?: Record<string, any>,
    userId?: string
  ): void {
    this.track(action, 'user_action', properties, userId);
  }

  /**
   * Track conversion
   */
  trackConversion(
    conversionType: string,
    value?: number,
    properties?: Record<string, any>,
    userId?: string
  ): void {
    this.track(conversionType, 'conversion', {
      ...properties,
      value,
    }, userId);
  }

  /**
   * Track engagement
   */
  trackEngagement(
    metric: string,
    value: number,
    properties?: Record<string, any>,
    userId?: string
  ): void {
    this.track(metric, 'engagement', {
      ...properties,
      value,
    }, userId);
  }

  /**
   * Track performance metrics
   */
  private trackPerformance(): void {
    if (typeof window === 'undefined' || !window.performance) return;

    const perfData = window.performance.timing;
    const navigation = window.performance.getEntriesByType('navigation')[0] as any;

    this.track('performance_metrics', 'performance', {
      pageLoadTime: perfData.loadEventEnd - perfData.navigationStart,
      domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
      timeToInteractive: navigation?.domInteractive || 0,
      firstPaint: this.getFirstPaint(),
      dnsTime: perfData.domainLookupEnd - perfData.domainLookupStart,
      tcpTime: perfData.connectEnd - perfData.connectStart,
      requestTime: perfData.responseEnd - perfData.requestStart,
      renderTime: perfData.domComplete - perfData.domLoading,
    });
  }

  /**
   * Get first paint timing
   */
  private getFirstPaint(): number | undefined {
    if (typeof window === 'undefined') return undefined;

    const paintEntries = window.performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return firstPaint?.startTime;
  }

  /**
   * Get all events
   */
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  /**
   * Get events by category
   */
  getEventsByCategory(category: EventCategory): AnalyticsEvent[] {
    return this.events.filter(event => event.category === category);
  }

  /**
   * Get events by user
   */
  getEventsByUser(userId: string): AnalyticsEvent[] {
    return this.events.filter(event => event.userId === userId);
  }

  /**
   * Get events in time range
   */
  getEventsInRange(start: Date, end: Date): AnalyticsEvent[] {
    const startTime = start.getTime();
    const endTime = end.getTime();
    return this.events.filter(
      event => event.timestamp >= startTime && event.timestamp <= endTime
    );
  }

  /**
   * Subscribe to events
   */
  subscribe(listener: (event: AnalyticsEvent) => void): () => void {
    this.eventListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.eventListeners = this.eventListeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify listeners
   */
  private notifyListeners(event: AnalyticsEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in analytics listener:', error);
      }
    });
  }

  /**
   * Clear events
   */
  clear(): void {
    this.events = [];
  }

  /**
   * Get session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Reset session
   */
  resetSession(): void {
    this.sessionId = uuidv4();
  }

  /**
   * Update config
   */
  updateConfig(config: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Global event tracker instance
export const eventTracker = new EventTracker();
