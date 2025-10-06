/**
 * Analytics & Event Tracking
 * Track user behavior and custom events
 */

export interface TrackingEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp: Date;
}

export interface PageView {
  path: string;
  title: string;
  referrer: string;
  timestamp: Date;
}

class Analytics {
  private enabled = import.meta.env.PROD;
  private userId?: string;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  /**
   * Initialize analytics with user ID
   */
  identify(userId: string, traits?: Record<string, any>): void {
    this.userId = userId;
    
    if (!this.enabled) return;

    // Send identify event to your analytics service
    this.sendEvent('user_identified', {
      userId,
      traits,
      sessionId: this.sessionId,
    });
  }

  /**
   * Track a custom event
   */
  track(eventName: string, properties?: Record<string, any>): void {
    const event: TrackingEvent = {
      name: eventName,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        userId: this.userId,
      },
      userId: this.userId,
      timestamp: new Date(),
    };

    if (import.meta.env.DEV) {
      console.log('[Analytics]', event);
    }

    if (!this.enabled) return;

    this.sendEvent(eventName, event.properties);
  }

  /**
   * Track a page view
   */
  page(path?: string, title?: string): void {
    const pageView: PageView = {
      path: path || window.location.pathname,
      title: title || document.title,
      referrer: document.referrer,
      timestamp: new Date(),
    };

    this.track('page_viewed', pageView);
  }

  /**
   * Track conversion events
   */
  conversion(conversionName: string, value?: number): void {
    this.track('conversion', {
      conversionName,
      value,
    });
  }

  /**
   * Track errors
   */
  error(errorMessage: string, metadata?: Record<string, any>): void {
    this.track('error_occurred', {
      errorMessage,
      ...metadata,
    });
  }

  /**
   * Send event to analytics service
   */
  private sendEvent(eventName: string, properties?: Record<string, any>): void {
    // Implement your analytics service integration here
    // Examples: Google Analytics, Mixpanel, Amplitude, PostHog
    
    if (!this.enabled) return;

    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: eventName,
        properties,
        timestamp: new Date().toISOString(),
      }),
    }).catch(console.error);
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}

// Singleton instance
export const analytics = new Analytics();

/**
 * React hook for analytics
 */
export function useAnalytics() {
  return {
    track: analytics.track.bind(analytics),
    page: analytics.page.bind(analytics),
    identify: analytics.identify.bind(analytics),
    conversion: analytics.conversion.bind(analytics),
  };
}

/**
 * Track navigation
 */
export function setupNavigationTracking(): void {
  // Track initial page view
  analytics.page();

  // Track route changes
  let lastPath = window.location.pathname;
  const observer = new MutationObserver(() => {
    const currentPath = window.location.pathname;
    if (currentPath !== lastPath) {
      lastPath = currentPath;
      analytics.page();
    }
  });

  observer.observe(document, { subtree: true, childList: true });
}
