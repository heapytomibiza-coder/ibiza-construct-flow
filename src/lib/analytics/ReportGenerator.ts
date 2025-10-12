/**
 * Report Generator
 * Phase 27: Analytics & Reporting System
 * 
 * Generates analytics reports and insights
 */

import { 
  AnalyticsReport, 
  AnalyticsEvent, 
  ReportType, 
  DateRange,
  AnalyticsFilter,
  ConversionFunnel,
  FunnelStep,
  RetentionCohort,
  RetentionData,
} from './types';
import { v4 as uuidv4 } from 'uuid';

export class ReportGenerator {
  /**
   * Generate report
   */
  generateReport(
    name: string,
    type: ReportType,
    events: AnalyticsEvent[],
    metrics: string[],
    dimensions: string[],
    dateRange: DateRange,
    filters?: AnalyticsFilter[]
  ): AnalyticsReport {
    let filteredEvents = this.filterEvents(events, dateRange, filters);
    let data: any[];

    switch (type) {
      case 'overview':
        data = this.generateOverview(filteredEvents);
        break;
      case 'user_behavior':
        data = this.generateUserBehavior(filteredEvents, dimensions);
        break;
      case 'conversion_funnel':
        data = this.generateConversionData(filteredEvents);
        break;
      case 'retention':
        data = this.generateRetentionData(filteredEvents);
        break;
      case 'performance':
        data = this.generatePerformanceData(filteredEvents);
        break;
      default:
        data = this.generateCustomReport(filteredEvents, metrics, dimensions);
    }

    return {
      id: uuidv4(),
      name,
      type,
      metrics,
      dimensions,
      filters,
      dateRange,
      data,
      generatedAt: new Date(),
    };
  }

  /**
   * Generate overview report
   */
  private generateOverview(events: AnalyticsEvent[]): any[] {
    const uniqueUsers = new Set(events.map(e => e.userId).filter(Boolean)).size;
    const uniqueSessions = new Set(events.map(e => e.sessionId)).size;
    const pageViews = events.filter(e => e.category === 'page_view').length;
    const conversions = events.filter(e => e.category === 'conversion').length;

    return [{
      totalEvents: events.length,
      uniqueUsers,
      uniqueSessions,
      pageViews,
      conversions,
      conversionRate: uniqueSessions > 0 ? (conversions / uniqueSessions) * 100 : 0,
      avgEventsPerSession: uniqueSessions > 0 ? events.length / uniqueSessions : 0,
    }];
  }

  /**
   * Generate user behavior report
   */
  private generateUserBehavior(events: AnalyticsEvent[], dimensions: string[]): any[] {
    const behavior: Record<string, any> = {};

    events.forEach(event => {
      const key = dimensions.map(dim => event.properties?.[dim] || 'unknown').join('|');
      
      if (!behavior[key]) {
        behavior[key] = {
          ...dimensions.reduce((acc, dim, i) => {
            acc[dim] = key.split('|')[i];
            return acc;
          }, {} as Record<string, any>),
          events: 0,
          users: new Set(),
          pageViews: 0,
          actions: 0,
        };
      }

      behavior[key].events++;
      if (event.userId) behavior[key].users.add(event.userId);
      if (event.category === 'page_view') behavior[key].pageViews++;
      if (event.category === 'user_action') behavior[key].actions++;
    });

    return Object.values(behavior).map(item => ({
      ...item,
      users: item.users.size,
    }));
  }

  /**
   * Generate conversion funnel
   */
  generateConversionFunnel(
    name: string,
    steps: Array<{ name: string; eventName: string }>,
    events: AnalyticsEvent[]
  ): ConversionFunnel {
    const funnelSteps: FunnelStep[] = [];
    let previousUsers = 0;

    steps.forEach((step, index) => {
      const stepEvents = events.filter(e => e.eventName === step.eventName);
      const users = new Set(stepEvents.map(e => e.userId).filter(Boolean)).size;
      
      const conversionRate = index === 0 ? 100 : previousUsers > 0 ? (users / previousUsers) * 100 : 0;
      const dropoffRate = 100 - conversionRate;

      funnelSteps.push({
        id: uuidv4(),
        name: step.name,
        eventName: step.eventName,
        users,
        conversionRate,
        dropoffRate,
      });

      previousUsers = users;
    });

    const totalUsers = funnelSteps[0]?.users || 0;
    const completedUsers = funnelSteps[funnelSteps.length - 1]?.users || 0;
    const completionRate = totalUsers > 0 ? (completedUsers / totalUsers) * 100 : 0;

    return {
      id: uuidv4(),
      name,
      steps: funnelSteps,
      totalUsers,
      completionRate,
    };
  }

  /**
   * Generate conversion data
   */
  private generateConversionData(events: AnalyticsEvent[]): any[] {
    const conversions = events.filter(e => e.category === 'conversion');
    const grouped: Record<string, any> = {};

    conversions.forEach(event => {
      const type = event.eventName;
      if (!grouped[type]) {
        grouped[type] = {
          type,
          count: 0,
          value: 0,
          users: new Set(),
        };
      }

      grouped[type].count++;
      grouped[type].value += event.properties?.value || 0;
      if (event.userId) grouped[type].users.add(event.userId);
    });

    return Object.values(grouped).map(item => ({
      ...item,
      users: item.users.size,
      avgValue: item.count > 0 ? item.value / item.count : 0,
    }));
  }

  /**
   * Generate retention cohorts
   */
  generateRetentionCohorts(
    events: AnalyticsEvent[],
    cohortSize: number = 7 // days
  ): RetentionCohort[] {
    const cohorts: Map<string, RetentionCohort> = new Map();
    const userFirstSeen: Map<string, number> = new Map();

    // Find first seen date for each user
    events.forEach(event => {
      if (!event.userId) return;
      const existing = userFirstSeen.get(event.userId);
      if (!existing || event.timestamp < existing) {
        userFirstSeen.set(event.userId, event.timestamp);
      }
    });

    // Group users into cohorts
    userFirstSeen.forEach((firstSeen, userId) => {
      const cohortDate = this.getCohortDate(firstSeen, cohortSize);
      const cohortKey = cohortDate.toISOString();

      if (!cohorts.has(cohortKey)) {
        cohorts.set(cohortKey, {
          cohortDate,
          cohortSize: 0,
          retentionData: [],
        });
      }

      cohorts.get(cohortKey)!.cohortSize++;
    });

    return Array.from(cohorts.values());
  }

  /**
   * Generate retention data
   */
  private generateRetentionData(events: AnalyticsEvent[]): any[] {
    const cohorts = this.generateRetentionCohorts(events);
    return cohorts.map(cohort => ({
      cohortDate: cohort.cohortDate,
      cohortSize: cohort.cohortSize,
      retention: cohort.retentionData,
    }));
  }

  /**
   * Generate performance data
   */
  private generatePerformanceData(events: AnalyticsEvent[]): any[] {
    const perfEvents = events.filter(e => e.category === 'performance');
    
    if (perfEvents.length === 0) return [];

    const metrics: Record<string, number[]> = {};

    perfEvents.forEach(event => {
      Object.entries(event.properties || {}).forEach(([key, value]) => {
        if (typeof value === 'number') {
          if (!metrics[key]) metrics[key] = [];
          metrics[key].push(value);
        }
      });
    });

    return Object.entries(metrics).map(([metric, values]) => ({
      metric,
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      p50: this.percentile(values, 50),
      p95: this.percentile(values, 95),
      p99: this.percentile(values, 99),
    }));
  }

  /**
   * Generate custom report
   */
  private generateCustomReport(
    events: AnalyticsEvent[],
    metrics: string[],
    dimensions: string[]
  ): any[] {
    const grouped: Record<string, any> = {};

    events.forEach(event => {
      const key = dimensions.map(dim => event.properties?.[dim] || 'unknown').join('|');
      
      if (!grouped[key]) {
        grouped[key] = {
          ...dimensions.reduce((acc, dim, i) => {
            acc[dim] = key.split('|')[i];
            return acc;
          }, {} as Record<string, any>),
          count: 0,
        };
      }

      grouped[key].count++;
      
      metrics.forEach(metric => {
        if (!grouped[key][metric]) grouped[key][metric] = 0;
        grouped[key][metric] += event.properties?.[metric] || 0;
      });
    });

    return Object.values(grouped);
  }

  /**
   * Filter events
   */
  private filterEvents(
    events: AnalyticsEvent[],
    dateRange: DateRange,
    filters?: AnalyticsFilter[]
  ): AnalyticsEvent[] {
    const startTime = dateRange.start.getTime();
    const endTime = dateRange.end.getTime();
    let filtered = events.filter(
      event => event.timestamp >= startTime && event.timestamp <= endTime
    );

    if (filters) {
      filtered = filtered.filter(event => this.matchesFilters(event, filters));
    }

    return filtered;
  }

  /**
   * Check if event matches filters
   */
  private matchesFilters(event: AnalyticsEvent, filters: AnalyticsFilter[]): boolean {
    return filters.every(filter => {
      const value = (event.properties as any)?.[filter.field];
      
      switch (filter.operator) {
        case 'eq': return value === filter.value;
        case 'ne': return value !== filter.value;
        case 'gt': return value > filter.value;
        case 'lt': return value < filter.value;
        case 'gte': return value >= filter.value;
        case 'lte': return value <= filter.value;
        case 'in': return Array.isArray(filter.value) && filter.value.includes(value);
        case 'contains': 
          return typeof value === 'string' && value.includes(filter.value);
        default: return false;
      }
    });
  }

  /**
   * Get cohort date
   */
  private getCohortDate(timestamp: number, cohortSize: number): Date {
    const date = new Date(timestamp);
    const cohortDate = new Date(date);
    cohortDate.setDate(cohortDate.getDate() - (cohortDate.getDate() % cohortSize));
    cohortDate.setHours(0, 0, 0, 0);
    return cohortDate;
  }

  /**
   * Calculate percentile
   */
  private percentile(values: number[], p: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index];
  }
}

// Global report generator instance
export const reportGenerator = new ReportGenerator();
