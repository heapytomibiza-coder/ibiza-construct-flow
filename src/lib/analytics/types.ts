/**
 * Analytics Types
 * Phase 27: Analytics & Reporting System
 */

export interface AnalyticsEvent {
  id: string;
  userId?: string;
  sessionId: string;
  eventName: string;
  category: EventCategory;
  properties?: Record<string, any>;
  timestamp: number;
  source: EventSource;
}

export type EventCategory = 
  | 'page_view'
  | 'user_action'
  | 'conversion'
  | 'engagement'
  | 'error'
  | 'performance'
  | 'custom';

export type EventSource = 'web' | 'mobile' | 'api' | 'system';

export interface AnalyticsMetric {
  name: string;
  value: number;
  unit?: string;
  timestamp: Date;
  dimensions?: Record<string, any>;
}

export interface AnalyticsReport {
  id: string;
  name: string;
  description?: string;
  type: ReportType;
  metrics: string[];
  dimensions: string[];
  filters?: AnalyticsFilter[];
  dateRange: DateRange;
  data: any[];
  generatedAt: Date;
}

export type ReportType = 
  | 'overview'
  | 'user_behavior'
  | 'conversion_funnel'
  | 'retention'
  | 'performance'
  | 'custom';

export interface AnalyticsFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'contains';
  value: any;
}

export interface DateRange {
  start: Date;
  end: Date;
  preset?: DateRangePreset;
}

export type DateRangePreset = 
  | 'today'
  | 'yesterday'
  | 'last_7_days'
  | 'last_30_days'
  | 'this_month'
  | 'last_month'
  | 'custom';

export interface ConversionFunnel {
  id: string;
  name: string;
  steps: FunnelStep[];
  totalUsers: number;
  completionRate: number;
}

export interface FunnelStep {
  id: string;
  name: string;
  eventName: string;
  users: number;
  conversionRate: number;
  dropoffRate: number;
}

export interface RetentionCohort {
  cohortDate: Date;
  cohortSize: number;
  retentionData: RetentionData[];
}

export interface RetentionData {
  period: number;
  users: number;
  percentage: number;
}

export interface AnalyticsConfig {
  trackPageViews: boolean;
  trackUserActions: boolean;
  trackPerformance: boolean;
  trackErrors: boolean;
  sampleRate: number;
  sessionTimeout: number;
  excludePaths?: string[];
}
