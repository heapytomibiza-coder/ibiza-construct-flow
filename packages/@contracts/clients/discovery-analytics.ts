/**
 * React Query hooks for Discovery Analytics API
 * Phase 10: Extended API coverage
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import { apiFetch } from './_http';

export interface DiscoveryEvent {
  event_type: 'search' | 'filter' | 'view' | 'click' | 'booking_start' | 'booking_complete';
  service_slug?: string;
  user_id?: string;
  session_id: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

export interface DiscoveryMetrics {
  total_searches: number;
  total_views: number;
  total_bookings: number;
  conversion_rate: number;
  popular_services: Array<{ slug: string; count: number }>;
  popular_filters: Array<{ filter: string; count: number }>;
  avg_time_to_booking_s: number;
}

export interface TrendingService {
  slug: string;
  name: string;
  category: string;
  trend_score: number;
  views_30d: number;
  bookings_30d: number;
}

// Track discovery event
export function useTrackDiscoveryEvent() {
  return useMutation({
    mutationFn: (event: DiscoveryEvent) =>
      apiFetch<{ ok: true }>('/analytics/discovery/track', {
        method: 'POST',
        body: event,
      }),
  });
}

// Get discovery metrics
export function useDiscoveryMetrics(period: '7d' | '30d' | '90d' = '30d') {
  return useQuery({
    queryKey: ['discovery', 'metrics', period],
    queryFn: () =>
      apiFetch<DiscoveryMetrics>('/analytics/discovery/metrics', {
        query: { period },
      }),
  });
}

// Get trending services
export function useTrendingServices(limit: number = 10) {
  return useQuery({
    queryKey: ['discovery', 'trending', limit],
    queryFn: () =>
      apiFetch<TrendingService[]>('/analytics/discovery/trending', {
        query: { limit },
      }),
  });
}

// Get service performance
export function useServicePerformance(slug: string, period: '7d' | '30d' | '90d' = '30d') {
  return useQuery({
    queryKey: ['discovery', 'service', slug, period],
    queryFn: () =>
      apiFetch<{
        slug: string;
        views: number;
        clicks: number;
        bookings: number;
        conversion_rate: number;
        avg_view_duration_s: number;
      }>('/analytics/discovery/service', {
        query: { slug, period },
      }),
    enabled: !!slug,
  });
}
