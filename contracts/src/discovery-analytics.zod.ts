/**
 * Discovery Analytics Contracts
 * Zod schemas for analytics event tracking and metrics collection
 */

import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

// Track Event Request/Response
export const TrackEventRequestSchema = z.object({
  sessionId: z.string().openapi({ example: 'session_123' }),
  event: z.enum([
    'discovery_search',
    'discovery_mode_switch',
    'discovery_item_click',
    'discovery_location',
    'discovery_booking_start',
    'discovery_filter_change',
  ]).openapi({ example: 'discovery_search' }),
  properties: z.record(z.string(), z.any()).openapi({ 
    example: { 
      query: 'plumber',
      location: 'Ibiza',
      timestamp: '2025-01-15T10:30:00Z' 
    } 
  }),
  userId: z.string().optional().openapi({ example: 'user_123' }),
  timestamp: z.string().openapi({ example: '2025-01-15T10:30:00Z' }),
}).openapi('TrackEventRequest');

export const TrackEventResponseSchema = z.object({
  success: z.boolean(),
  eventId: z.string().openapi({ example: 'event_123' }),
  message: z.string().openapi({ example: 'Event tracked successfully' }),
}).openapi('TrackEventResponse');

// Get Metrics Request/Response
export const GetMetricsRequestSchema = z.object({
  startDate: z.string().openapi({ example: '2025-01-01' }),
  endDate: z.string().openapi({ example: '2025-01-31' }),
  eventTypes: z.array(z.string()).optional().openapi({ 
    example: ['discovery_search', 'discovery_booking_start'] 
  }),
  groupBy: z.enum(['day', 'week', 'month', 'event']).optional().default('day'),
}).openapi('GetMetricsRequest');

export const MetricDataPointSchema = z.object({
  timestamp: z.string().openapi({ example: '2025-01-15' }),
  eventType: z.string().optional().openapi({ example: 'discovery_search' }),
  count: z.number().openapi({ example: 125 }),
  uniqueSessions: z.number().optional().openapi({ example: 87 }),
  metadata: z.record(z.string(), z.any()).optional(),
}).openapi('MetricDataPoint');

export const GetMetricsResponseSchema = z.object({
  metrics: z.array(MetricDataPointSchema),
  summary: z.object({
    totalEvents: z.number().openapi({ example: 1520 }),
    uniqueSessions: z.number().openapi({ example: 456 }),
    dateRange: z.object({
      start: z.string(),
      end: z.string(),
    }),
  }),
}).openapi('GetMetricsResponse');

// Get Conversion Funnel Request/Response
export const GetConversionFunnelRequestSchema = z.object({
  startDate: z.string().openapi({ example: '2025-01-01' }),
  endDate: z.string().openapi({ example: '2025-01-31' }),
  funnelSteps: z.array(z.string()).optional().openapi({
    example: ['discovery_search', 'discovery_item_click', 'discovery_booking_start']
  }),
}).openapi('GetConversionFunnelRequest');

export const FunnelStepSchema = z.object({
  step: z.string().openapi({ example: 'discovery_search' }),
  stepName: z.string().openapi({ example: 'Search' }),
  count: z.number().openapi({ example: 1000 }),
  percentage: z.number().openapi({ example: 100 }),
  dropoff: z.number().optional().openapi({ example: 200 }),
  dropoffPercentage: z.number().optional().openapi({ example: 20 }),
}).openapi('FunnelStep');

export const GetConversionFunnelResponseSchema = z.object({
  funnel: z.array(FunnelStepSchema),
  overallConversionRate: z.number().openapi({ example: 12.5 }),
  totalSessions: z.number().openapi({ example: 1000 }),
  conversions: z.number().openapi({ example: 125 }),
}).openapi('GetConversionFunnelResponse');

// Get A/B Test Results Request/Response
export const GetABTestResultsRequestSchema = z.object({
  testName: z.string().openapi({ example: 'search_ui_test' }),
  startDate: z.string().openapi({ example: '2025-01-01' }),
  endDate: z.string().openapi({ example: '2025-01-31' }),
}).openapi('GetABTestResultsRequest');

export const ABTestVariantSchema = z.object({
  variant: z.string().openapi({ example: 'control' }),
  sessions: z.number().openapi({ example: 500 }),
  conversions: z.number().openapi({ example: 65 }),
  conversionRate: z.number().openapi({ example: 13.0 }),
  averageTime: z.number().optional().openapi({ example: 45.5 }),
  bounceRate: z.number().optional().openapi({ example: 25.5 }),
}).openapi('ABTestVariant');

export const GetABTestResultsResponseSchema = z.object({
  testName: z.string(),
  variants: z.array(ABTestVariantSchema),
  winner: z.string().optional().openapi({ example: 'variant_a' }),
  confidence: z.number().optional().openapi({ example: 95.5 }),
  recommendation: z.string().optional().openapi({ 
    example: 'Variant A shows 15% improvement with 95% confidence' 
  }),
}).openapi('GetABTestResultsResponse');

// Get Top Searches Request/Response
export const GetTopSearchesRequestSchema = z.object({
  startDate: z.string().openapi({ example: '2025-01-01' }),
  endDate: z.string().openapi({ example: '2025-01-31' }),
  limit: z.number().optional().default(10).openapi({ example: 10 }),
}).openapi('GetTopSearchesRequest');

export const SearchQueryDataSchema = z.object({
  query: z.string().openapi({ example: 'plumber' }),
  count: z.number().openapi({ example: 125 }),
  clickThroughRate: z.number().optional().openapi({ example: 45.5 }),
  conversionRate: z.number().optional().openapi({ example: 12.5 }),
}).openapi('SearchQueryData');

export const GetTopSearchesResponseSchema = z.object({
  searches: z.array(SearchQueryDataSchema),
  totalSearches: z.number().openapi({ example: 1520 }),
  period: z.object({
    start: z.string(),
    end: z.string(),
  }),
}).openapi('GetTopSearchesResponse');
