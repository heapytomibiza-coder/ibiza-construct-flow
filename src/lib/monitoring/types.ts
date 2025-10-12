/**
 * Monitoring Types
 * Phase 31: Advanced Monitoring & Observability System
 */

export type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type MonitoringStatus = 'active' | 'paused' | 'disabled';

export interface Metric {
  id: string;
  name: string;
  type: MetricType;
  value: number;
  unit?: string;
  labels?: Record<string, string>;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface MetricConfig {
  name: string;
  type: MetricType;
  description?: string;
  unit?: string;
  labels?: string[];
  aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
  retention?: number; // days
}

export interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  timestamp: Date;
  source?: string;
  context?: Record<string, any>;
  error?: Error;
  userId?: string;
  sessionId?: string;
  traceId?: string;
}

export interface PerformanceMetric {
  id: string;
  name: string;
  duration: number;
  startTime: Date;
  endTime: Date;
  category: 'api' | 'render' | 'interaction' | 'resource';
  metadata?: Record<string, any>;
}

export interface Alert {
  id: string;
  name: string;
  description?: string;
  severity: AlertSeverity;
  condition: AlertCondition;
  actions: AlertAction[];
  enabled: boolean;
  status: MonitoringStatus;
  createdAt: Date;
  triggeredAt?: Date;
  resolvedAt?: Date;
  metadata?: Record<string, any>;
}

export interface AlertCondition {
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'ne';
  threshold: number;
  duration?: number; // seconds
  aggregation?: 'avg' | 'sum' | 'min' | 'max';
}

export interface AlertAction {
  type: 'email' | 'webhook' | 'notification' | 'log';
  config: Record<string, any>;
  enabled: boolean;
}

export interface MonitoringDashboard {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  layout?: DashboardLayout;
  refreshInterval?: number; // seconds
  createdAt: Date;
  updatedAt?: Date;
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'log' | 'alert' | 'table';
  title: string;
  config: WidgetConfig;
  position: { x: number; y: number; w: number; h: number };
}

export interface WidgetConfig {
  metrics?: string[];
  timeRange?: TimeRange;
  chartType?: 'line' | 'bar' | 'pie' | 'area';
  filters?: Record<string, any>;
  limit?: number;
}

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface DashboardLayout {
  columns: number;
  rowHeight: number;
  margin?: [number, number];
}

export interface Trace {
  id: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  spans: Span[];
  status: 'pending' | 'completed' | 'failed';
  metadata?: Record<string, any>;
}

export interface Span {
  id: string;
  traceId: string;
  parentId?: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  tags?: Record<string, string>;
  logs?: SpanLog[];
}

export interface SpanLog {
  timestamp: Date;
  fields: Record<string, any>;
}

export interface HealthCheck {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  checks: {
    [key: string]: {
      status: 'pass' | 'warn' | 'fail';
      message?: string;
      duration?: number;
    };
  };
}

export interface MonitoringConfig {
  enabled: boolean;
  metricsRetention?: number; // days
  logsRetention?: number; // days
  tracesRetention?: number; // days
  samplingRate?: number; // 0-1
  batchSize?: number;
  flushInterval?: number; // ms
}
