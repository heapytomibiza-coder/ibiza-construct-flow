/**
 * Discovery Analytics API Adapter
 * Adapts localStorage and Supabase to contract-first API
 */

import { supabase } from '@/integrations/supabase/client';

export interface TrackEventRequest {
  sessionId: string;
  event: 'discovery_search' | 'discovery_mode_switch' | 'discovery_item_click' | 
         'discovery_location' | 'discovery_booking_start' | 'discovery_filter_change';
  properties: Record<string, any>;
  userId?: string;
  timestamp: string;
}

export interface GetMetricsRequest {
  startDate: string;
  endDate: string;
  eventTypes?: string[];
  groupBy?: 'day' | 'week' | 'month' | 'event';
}

export interface GetConversionFunnelRequest {
  startDate: string;
  endDate: string;
  funnelSteps?: string[];
}

export interface GetABTestResultsRequest {
  testName: string;
  startDate: string;
  endDate: string;
}

export interface GetTopSearchesRequest {
  startDate: string;
  endDate: string;
  limit?: number;
}

/**
 * Track analytics event
 */
export async function trackEvent(request: TrackEventRequest) {
  try {
    // Store in conversion_analytics table
    const { data, error } = await supabase
      .from('conversion_analytics')
      .insert([{
        session_id: request.sessionId,
        event_type: request.event,
        metadata: request.properties,
        user_id: request.userId,
        timestamp: request.timestamp,
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      eventId: data?.id || 'event_' + Date.now(),
      message: 'Event tracked successfully',
    };
  } catch (error) {
    console.error('Error tracking event:', error);
    throw error;
  }
}

/**
 * Get analytics metrics
 */
export async function getMetrics(request: GetMetricsRequest) {
  try {
    let query = supabase
      .from('conversion_analytics')
      .select('*')
      .gte('timestamp', request.startDate)
      .lte('timestamp', request.endDate);

    if (request.eventTypes?.length) {
      query = query.in('event_type', request.eventTypes);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Process data based on groupBy
    const events = data || [];
    const uniqueSessions = new Set(events.map(e => e.session_id)).size;

    // Group metrics
    const metrics = events.map(event => ({
      timestamp: event.timestamp,
      eventType: event.event_type,
      count: 1,
      uniqueSessions: uniqueSessions,
      metadata: event.metadata,
    }));

    return {
      metrics,
      summary: {
        totalEvents: events.length,
        uniqueSessions,
        dateRange: {
          start: request.startDate,
          end: request.endDate,
        },
      },
    };
  } catch (error) {
    console.error('Error getting metrics:', error);
    throw error;
  }
}

/**
 * Get conversion funnel data
 */
export async function getConversionFunnel(request: GetConversionFunnelRequest) {
  try {
    const { data, error } = await supabase
      .from('conversion_analytics')
      .select('*')
      .gte('timestamp', request.startDate)
      .lte('timestamp', request.endDate);

    if (error) throw error;

    const events = data || [];
    const funnelSteps = request.funnelSteps || [
      'discovery_search',
      'discovery_item_click',
      'discovery_booking_start'
    ];

    // Calculate funnel
    const funnel = funnelSteps.map((step, index) => {
      const count = events.filter(e => e.event_type === step).length;
      const previousCount = index > 0 
        ? events.filter(e => e.event_type === funnelSteps[index - 1]).length 
        : count;

      return {
        step,
        stepName: step.replace('discovery_', '').replace(/_/g, ' '),
        count,
        percentage: previousCount > 0 ? (count / previousCount) * 100 : 100,
        dropoff: index > 0 ? previousCount - count : 0,
        dropoffPercentage: index > 0 && previousCount > 0 
          ? ((previousCount - count) / previousCount) * 100 
          : 0,
      };
    });

    const totalSessions = new Set(events.map(e => e.session_id)).size;
    const conversions = events.filter(e => 
      e.event_type === funnelSteps[funnelSteps.length - 1]
    ).length;

    return {
      funnel,
      overallConversionRate: totalSessions > 0 ? (conversions / totalSessions) * 100 : 0,
      totalSessions,
      conversions,
    };
  } catch (error) {
    console.error('Error getting conversion funnel:', error);
    throw error;
  }
}

/**
 * Get A/B test results
 */
export async function getABTestResults(request: GetABTestResultsRequest) {
  try {
    const { data, error } = await supabase
      .from('conversion_analytics')
      .select('*')
      .gte('timestamp', request.startDate)
      .lte('timestamp', request.endDate)
      .eq('metadata->>testName', request.testName);

    if (error) throw error;

    const events = data || [];
    
    // Group by variant
    const variantData = events.reduce((acc, event) => {
      const variant = event.variant || 'control';
      if (!acc[variant]) {
        acc[variant] = { sessions: new Set(), conversions: 0 };
      }
      acc[variant].sessions.add(event.session_id);
      if (event.event_type === 'discovery_booking_start') {
        acc[variant].conversions++;
      }
      return acc;
    }, {} as Record<string, { sessions: Set<string>; conversions: number }>);

    const variants = Object.entries(variantData).map(([variant, data]) => ({
      variant,
      sessions: data.sessions.size,
      conversions: data.conversions,
      conversionRate: data.sessions.size > 0 
        ? (data.conversions / data.sessions.size) * 100 
        : 0,
    }));

    return {
      testName: request.testName,
      variants,
    };
  } catch (error) {
    console.error('Error getting A/B test results:', error);
    throw error;
  }
}

/**
 * Get top search queries
 */
export async function getTopSearches(request: GetTopSearchesRequest) {
  try {
    const { data, error } = await supabase
      .from('conversion_analytics')
      .select('*')
      .eq('event_type', 'discovery_search')
      .gte('timestamp', request.startDate)
      .lte('timestamp', request.endDate);

    if (error) throw error;

    const events = data || [];
    
    // Aggregate searches
    const searchCounts = events.reduce((acc, event) => {
      const metadata = event.metadata as Record<string, any> | null;
      const query = metadata?.query;
      if (query && typeof query === 'string') {
        acc[query] = (acc[query] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const searches = Object.entries(searchCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, request.limit || 10)
      .map(([query, count]) => ({
        query,
        count,
      }));

    return {
      searches,
      totalSearches: events.length,
      period: {
        start: request.startDate,
        end: request.endDate,
      },
    };
  } catch (error) {
    console.error('Error getting top searches:', error);
    throw error;
  }
}

export const discoveryAnalytics = {
  trackEvent,
  getMetrics,
  getConversionFunnel,
  getABTestResults,
  getTopSearches,
};
