/**
 * Analytics Manager
 * Phase 22: Advanced Analytics & Monitoring System
 * 
 * Central manager for all analytics functionality
 */

import { 
  AnalyticsEvent, 
  AnalyticsConfig, 
  AnalyticsProvider,
  PerformanceMetrics,
  ErrorReport,
  ConversionEvent,
  EventType,
  EventPriority
} from './types';
import { EventBuffer } from './EventBuffer';
import { SessionManager } from './SessionManager';
import { PerformanceMonitor } from './PerformanceMonitor';
import { ErrorTracker } from './ErrorTracker';
import { v4 as uuidv4 } from 'uuid';

class AnalyticsManager {
  private config: AnalyticsConfig;
  private providers: AnalyticsProvider[] = [];
  private eventBuffer: EventBuffer;
  private sessionManager: SessionManager;
  private performanceMonitor: PerformanceMonitor | null = null;
  private errorTracker: ErrorTracker;
  private initialized: boolean = false;

  constructor() {
    this.config = {
      enabled: true,
      debug: false,
      trackPageViews: true,
      trackPerformance: true,
      trackErrors: true,
      trackUserBehavior: true,
      sampleRate: 1,
      bufferSize: 50,
      flushInterval: 5000,
    };

    this.sessionManager = new SessionManager();
    
    this.eventBuffer = new EventBuffer(
      this.config.bufferSize,
      this.config.flushInterval,
      this.flushEvents.bind(this)
    );

    this.errorTracker = new ErrorTracker(
      this.sessionManager.getSessionId(),
      this.handleError.bind(this)
    );

    if (this.config.trackPerformance) {
      this.performanceMonitor = new PerformanceMonitor(
        this.sessionManager.getSessionId(),
        this.handlePerformanceMetrics.bind(this)
      );
    }
  }

  initialize(config?: Partial<AnalyticsConfig>): void {
    if (this.initialized) return;

    this.config = { ...this.config, ...config };
    this.initialized = true;

    if (this.config.trackPageViews) {
      this.trackPageView();
      this.setupPageViewTracking();
    }

    if (this.config.debug) {
      console.log('[Analytics] Initialized with config:', this.config);
    }
  }

  private setupPageViewTracking(): void {
    // Track initial page view
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this.trackPageView();
    };

    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      this.trackPageView();
    };

    window.addEventListener('popstate', () => {
      this.trackPageView();
    });
  }

  addProvider(provider: AnalyticsProvider): void {
    this.providers.push(provider);
    if (this.config.debug) {
      console.log(`[Analytics] Added provider: ${provider.name}`);
    }
  }

  track(
    eventName: string,
    properties?: Record<string, any>,
    type: EventType = 'user_action',
    priority: EventPriority = 'medium'
  ): void {
    if (!this.shouldTrack()) return;

    const event: AnalyticsEvent = {
      id: uuidv4(),
      type,
      name: eventName,
      timestamp: Date.now(),
      sessionId: this.sessionManager.getSessionId(),
      userId: this.sessionManager.getSession()?.userId,
      properties,
      metadata: this.getMetadata(),
      priority,
    };

    this.eventBuffer.add(event);
    this.sessionManager.incrementEvent();

    if (this.config.debug) {
      console.log('[Analytics] Event tracked:', event);
    }
  }

  trackPageView(page?: string, properties?: Record<string, any>): void {
    const currentPage = page || window.location.pathname;
    
    this.track('page_view', {
      page: currentPage,
      title: document.title,
      ...properties,
    }, 'page_view', 'high');

    this.sessionManager.incrementPageView();

    // Notify providers
    this.providers.forEach(provider => {
      if (provider.page) {
        provider.page(currentPage, properties);
      }
    });
  }

  trackConversion(
    goal: string,
    value?: number,
    currency?: string,
    properties?: Record<string, any>
  ): void {
    const event: ConversionEvent = {
      id: uuidv4(),
      timestamp: Date.now(),
      sessionId: this.sessionManager.getSessionId(),
      userId: this.sessionManager.getSession()?.userId,
      goal,
      value,
      currency,
      properties,
    };

    this.track(`conversion_${goal}`, {
      ...event,
      ...properties,
    }, 'conversion', 'high');
  }

  identify(userId: string, traits?: Record<string, any>): void {
    this.sessionManager.setUserId(userId);
    this.errorTracker.setUserId(userId);

    this.providers.forEach(provider => {
      if (provider.identify) {
        provider.identify(userId, traits);
      }
    });

    if (this.config.debug) {
      console.log('[Analytics] User identified:', userId, traits);
    }
  }

  captureError(error: Error, context?: any): void {
    this.errorTracker.captureException(error, 'error', context);
  }

  private handleError(report: ErrorReport): void {
    this.track('error', report, 'error', 'high');
  }

  private handlePerformanceMetrics(metrics: PerformanceMetrics): void {
    this.track('performance', metrics, 'performance', 'low');
  }

  private async flushEvents(events: AnalyticsEvent[]): Promise<void> {
    // Send to all providers
    await Promise.all(
      this.providers.map(provider =>
        Promise.all(
          events.map(event => 
            provider.track(event).catch(err => {
              console.error(`Provider ${provider.name} failed:`, err);
            })
          )
        )
      )
    );

    // Send to custom endpoint if configured
    if (this.config.endpoint) {
      try {
        await fetch(this.config.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events }),
        });
      } catch (error) {
        console.error('Failed to send events to endpoint:', error);
      }
    }
  }

  private getMetadata() {
    return {
      userAgent: navigator.userAgent,
      url: window.location.href,
      referrer: document.referrer,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      deviceType: this.sessionManager.getSession()?.deviceInfo.type,
      os: this.sessionManager.getSession()?.deviceInfo.os,
      browser: this.sessionManager.getSession()?.deviceInfo.browser,
    };
  }

  private shouldTrack(): boolean {
    if (!this.config.enabled || !this.initialized) return false;
    return Math.random() < this.config.sampleRate;
  }

  flush(): Promise<void> {
    return this.eventBuffer.flush();
  }

  destroy(): void {
    this.eventBuffer.destroy();
    this.sessionManager.destroy();
    this.performanceMonitor?.destroy();
    this.initialized = false;
  }
}

export const analyticsManager = new AnalyticsManager();
