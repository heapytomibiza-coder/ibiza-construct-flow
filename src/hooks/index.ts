/**
 * Centralized Hook Exports
 * Phase 4-15: Hook & State Management Consolidation
 * 
 * This file provides a single entry point for all custom hooks
 * organized by domain/feature area
 */

// Authentication & Authorization
export { useAuth } from './useAuth';
export { useAdminCheck } from './useAdminCheck';

// UI & Utilities
export { useToast, toast } from './use-toast';

// Admin Hooks
export * from './admin';

// Shared Utilities
export * from './shared';

// Phase 12: API Hooks
export * from './api';

// Phase 13: Store Hooks
export * from './stores';

// Phase 15: Performance Hooks
export * from './performance';

// Phase 16: i18n Hooks
export * from './i18n';

// Phase 17: Search Hooks
// Renamed to avoid conflicts with Phase 26
export * from './search';

// Phase 18: Collaboration Hooks
export * from './collaboration';

// Phase 19: Form Hooks
export * from './forms';

// Phase 20: WebSocket Hooks
export * from './websocket';

// Phase 21: Cache Hooks
export * from './cache';

// Phase 22: Analytics Hooks
export * from './analytics';

// Phase 24: Security Hooks
export * from './security';

// Phase 25: Notification Hooks  
export { useNotifications as useNotificationsList, useNotificationPreferences } from './notifications';

// Phase 28: Workflow Hooks
export { useWorkflow, useAutomation } from './workflow';

// Phase 29: Integration Hooks
export { useIntegration, useWebhook } from './integration';

// Phase 30: AI Hooks
export { useAI, useConversation, usePrompt } from './ai';

// Phase 31: Monitoring Hooks
export { useMetrics, useLogger, usePerformance, useAlerts } from './monitoring';

// Phase 32: Feature Flags Hooks
export { useFeatureFlags, useFeatureFlag, useABTest, useConfig } from './features';

// Feature-specific hooks should be imported from their respective modules:
// - Calculator: '@/components/calculator/hooks'
// - Notifications: '@/components/notifications/hooks'
// - etc.
