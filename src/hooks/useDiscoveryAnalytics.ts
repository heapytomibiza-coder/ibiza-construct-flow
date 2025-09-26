import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

export interface DiscoveryEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId: string;
}

export const useDiscoveryAnalytics = () => {
  const { user } = useAuth();
  
  // Generate or get session ID
  const getSessionId = useCallback(() => {
    let sessionId = sessionStorage.getItem('discovery_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('discovery_session_id', sessionId);
    }
    return sessionId;
  }, []);

  const track = useCallback((event: string, properties: Record<string, any> = {}) => {
    const analyticsEvent: DiscoveryEvent = {
      event,
      properties: {
        ...properties,
        url: window.location.pathname,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date(),
      userId: user?.id,
      sessionId: getSessionId(),
    };

    // Store in localStorage for now (in production, send to analytics service)
    const existingEvents = JSON.parse(localStorage.getItem('discovery_analytics') || '[]');
    existingEvents.push(analyticsEvent);
    
    // Keep only last 100 events to prevent storage bloat
    if (existingEvents.length > 100) {
      existingEvents.splice(0, existingEvents.length - 100);
    }
    
    localStorage.setItem('discovery_analytics', JSON.stringify(existingEvents));

    // Log for development
    console.log('🔍 Discovery Analytics:', event, properties);
  }, [user?.id, getSessionId]);

  // Specific tracking methods
  const trackDiscoveryView = useCallback((mode: string, location?: any) => {
    track('discovery_view', {
      mode,
      hasLocation: !!location,
      locationArea: location?.address,
    });
  }, [track]);

  const trackSearch = useCallback((query: string, mode: string, resultsCount: number) => {
    track('discovery_search', {
      query,
      mode,
      resultsCount,
      queryLength: query.length,
    });
  }, [track]);

  const trackModeSwitch = useCallback((fromMode: string, toMode: string) => {
    track('discovery_mode_switch', {
      fromMode,
      toMode,
    });
  }, [track]);

  const trackItemClick = useCallback((type: 'service' | 'professional', itemId: string, position: number, searchQuery?: string) => {
    track('discovery_item_click', {
      type,
      itemId,
      position,
      hasSearchQuery: !!searchQuery,
      searchQuery,
    });
  }, [track]);

  const trackLocationUse = useCallback((action: 'enabled' | 'disabled' | 'error', area?: string) => {
    track('discovery_location', {
      action,
      area,
    });
  }, [track]);

  const trackSuggestionClick = useCallback((suggestionType: string, suggestion: string) => {
    track('discovery_suggestion_click', {
      suggestionType,
      suggestion,
    });
  }, [track]);

  const trackCrossPollination = useCallback((type: 'service' | 'professional', fromId: string, toId: string) => {
    track('discovery_cross_pollination', {
      type,
      fromId,
      toId,
    });
  }, [track]);

  const trackBookingStart = useCallback((fromType: 'service' | 'professional', itemId: string, mode: string) => {
    track('discovery_booking_start', {
      fromType,
      itemId,
      mode,
    });
  }, [track]);

  // Get analytics data for admin dashboard
  const getAnalyticsData = useCallback(() => {
    return JSON.parse(localStorage.getItem('discovery_analytics') || '[]') as DiscoveryEvent[];
  }, []);

  return {
    track,
    trackDiscoveryView,
    trackSearch,
    trackModeSwitch,
    trackItemClick,
    trackLocationUse,
    trackSuggestionClick,
    trackCrossPollination,
    trackBookingStart,
    getAnalyticsData,
  };
};
