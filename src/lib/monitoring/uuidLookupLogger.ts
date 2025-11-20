/**
 * UUID Lookup Logger
 * Phase 5: Monitoring & Observability
 * 
 * Tracks UUID lookup performance and success rates
 */

import { supabase } from '@/integrations/supabase/client';

export interface UUIDLookupEvent {
  microSlug: string;
  success: boolean;
  microUuid: string | null;
  lookupTimeMs: number;
  fallbackUsed: boolean;
  errorMessage?: string;
  timestamp: string;
}

export interface UUIDLookupMetrics {
  totalLookups: number;
  successfulLookups: number;
  failedLookups: number;
  averageLookupTime: number;
  fallbackRate: number;
}

class UUIDLookupLogger {
  private events: UUIDLookupEvent[] = [];
  private readonly MAX_EVENTS = 100;
  private readonly BATCH_SIZE = 10;

  /**
   * Log a UUID lookup event
   */
  logLookup(event: Omit<UUIDLookupEvent, 'timestamp'>): void {
    const fullEvent: UUIDLookupEvent = {
      ...event,
      timestamp: new Date().toISOString()
    };

    this.events.push(fullEvent);

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('[UUID Lookup]', {
        slug: event.microSlug,
        uuid: event.microUuid,
        time: `${event.lookupTimeMs}ms`,
        fallback: event.fallbackUsed,
        success: event.success
      });
    }

    // Trim events if exceeding max
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }

    // Batch send to analytics if enough events
    if (this.events.length >= this.BATCH_SIZE) {
      this.flushEvents();
    }
  }

  /**
   * Log successful UUID lookup
   */
  logSuccess(microSlug: string, microUuid: string, lookupTimeMs: number, fallbackUsed: boolean): void {
    this.logLookup({
      microSlug,
      microUuid,
      lookupTimeMs,
      fallbackUsed,
      success: true
    });
  }

  /**
   * Log failed UUID lookup
   */
  logFailure(microSlug: string, lookupTimeMs: number, errorMessage: string): void {
    this.logLookup({
      microSlug,
      microUuid: null,
      lookupTimeMs,
      fallbackUsed: false,
      success: false,
      errorMessage
    });
  }

  /**
   * Get current metrics
   */
  getMetrics(): UUIDLookupMetrics {
    const total = this.events.length;
    const successful = this.events.filter(e => e.success).length;
    const failed = total - successful;
    const avgTime = total > 0
      ? this.events.reduce((sum, e) => sum + e.lookupTimeMs, 0) / total
      : 0;
    const fallbackCount = this.events.filter(e => e.fallbackUsed).length;

    return {
      totalLookups: total,
      successfulLookups: successful,
      failedLookups: failed,
      averageLookupTime: Math.round(avgTime),
      fallbackRate: total > 0 ? (fallbackCount / total) * 100 : 0
    };
  }

  /**
   * Send events to analytics
   */
  private async flushEvents(): Promise<void> {
    if (this.events.length === 0) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Send to analytics_events table
      const analyticsEvents = this.events.map(event => ({
        event_name: 'uuid_lookup',
        event_category: 'wizard_flow',
        session_id: this.getSessionId(),
        user_id: user?.id || null,
        event_properties: {
          micro_slug: event.microSlug,
          micro_uuid: event.microUuid,
          lookup_time_ms: event.lookupTimeMs,
          fallback_used: event.fallbackUsed,
          success: event.success,
          error_message: event.errorMessage
        }
      }));

      await supabase
        .from('analytics_events')
        .insert(analyticsEvents);

      // Clear sent events
      this.events = [];
    } catch (error) {
      console.error('Failed to flush UUID lookup events:', error);
    }
  }

  /**
   * Get or create session ID
   */
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Get recent events for debugging
   */
  getRecentEvents(count: number = 10): UUIDLookupEvent[] {
    return this.events.slice(-count);
  }

  /**
   * Clear all events
   */
  clear(): void {
    this.events = [];
  }

  /**
   * Force flush all pending events
   */
  async flush(): Promise<void> {
    await this.flushEvents();
  }
}

// Export singleton instance
export const uuidLookupLogger = new UUIDLookupLogger();

// Flush events before page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    uuidLookupLogger.flush();
  });
}
