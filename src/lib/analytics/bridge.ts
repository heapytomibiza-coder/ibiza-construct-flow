/**
 * Analytics Bridge
 * Connects Phase 27 (EventTracker) with Phase 31 (Database Analytics)
 * 
 * This bridge ensures events tracked via EventTracker are also persisted
 * to the database via the Phase 31 analytics service.
 */

import { AnalyticsEvent, EventCategory } from './types';
import { analytics, AnalyticsEventPayload } from '../analytics';

/**
 * Map Phase 27 EventCategory to Phase 31 category strings
 */
function mapCategory(category: EventCategory): string {
  const categoryMap: Record<EventCategory, string> = {
    'page_view': 'navigation',
    'user_action': 'user_action',
    'conversion': 'conversion',
    'engagement': 'engagement',
    'error': 'error',
    'performance': 'performance',
    'custom': 'custom',
  };
  
  return categoryMap[category] || 'custom';
}

/**
 * Convert Phase 27 AnalyticsEvent to Phase 31 AnalyticsEventPayload
 */
export function convertToPhase31Event(event: AnalyticsEvent): AnalyticsEventPayload {
  return {
    category: mapCategory(event.category),
    action: event.eventName,
    label: event.properties?.label || event.properties?.path,
    value: event.properties?.value,
    metadata: {
      ...event.properties,
      sessionId: event.sessionId,
      userId: event.userId,
      source: event.source,
      eventId: event.id,
    },
    timestamp: event.timestamp,
  };
}

/**
 * Bridge function to persist event to database
 */
export function persistEventToDatabase(event: AnalyticsEvent): void {
  const payload = convertToPhase31Event(event);
  analytics.track(payload);
}

/**
 * Initialize bridge - subscribes to EventTracker and persists to database
 */
export function initializeAnalyticsBridge(eventTracker: any): void {
  // Subscribe to all events from EventTracker
  eventTracker.subscribe((event: AnalyticsEvent) => {
    persistEventToDatabase(event);
  });
}
