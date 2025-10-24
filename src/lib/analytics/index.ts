/**
 * Analytics Module Exports
 * Phase 27: Analytics & Reporting System
 * 
 * This module provides in-memory analytics tracking and reporting.
 * Events are automatically persisted to the database via the bridge.
 */

export * from './types';
export { EventTracker, eventTracker } from './EventTracker';
export { ReportGenerator, reportGenerator } from './ReportGenerator';
export { MetricsCollector, metricsCollector } from './MetricsCollector';
export { initializeAnalyticsBridge, persistEventToDatabase } from './bridge';

// Re-export Phase 31 analytics service for convenience
export { analytics } from '../analytics';
