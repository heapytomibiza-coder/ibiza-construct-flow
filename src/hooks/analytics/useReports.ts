/**
 * Reports Hook
 * Phase 27: Analytics & Reporting System
 * 
 * Hook for generating and managing reports
 */

import { useState, useCallback } from 'react';
import { 
  AnalyticsReport, 
  ReportType, 
  DateRange,
  AnalyticsFilter,
  ConversionFunnel,
} from '@/lib/analytics/types';
import { reportGenerator, eventTracker } from '@/lib/analytics/index';

export function useReports() {
  const [reports, setReports] = useState<AnalyticsReport[]>([]);
  const [loading, setLoading] = useState(false);

  // Generate report
  const generateReport = useCallback((
    name: string,
    type: ReportType,
    metrics: string[],
    dimensions: string[],
    dateRange: DateRange,
    filters?: AnalyticsFilter[]
  ) => {
    setLoading(true);
    try {
      const events = eventTracker.getEventsInRange(dateRange.start, dateRange.end);
      const report = reportGenerator.generateReport(
        name,
        type,
        events,
        metrics,
        dimensions,
        dateRange,
        filters
      );
      
      setReports(prev => [...prev, report]);
      return report;
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate conversion funnel
  const generateFunnel = useCallback((
    name: string,
    steps: Array<{ name: string; eventName: string }>,
    dateRange?: DateRange
  ): ConversionFunnel => {
    const events = dateRange 
      ? eventTracker.getEventsInRange(dateRange.start, dateRange.end)
      : eventTracker.getEvents();
    
    return reportGenerator.generateConversionFunnel(name, steps, events);
  }, []);

  // Delete report
  const deleteReport = useCallback((reportId: string) => {
    setReports(prev => prev.filter(r => r.id !== reportId));
  }, []);

  // Clear all reports
  const clearReports = useCallback(() => {
    setReports([]);
  }, []);

  return {
    reports,
    loading,
    generateReport,
    generateFunnel,
    deleteReport,
    clearReports,
  };
}
