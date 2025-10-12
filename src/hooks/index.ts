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

// Feature-specific hooks should be imported from their respective modules:
// - Calculator: '@/components/calculator/hooks'
// - Notifications: '@/components/notifications/hooks'
// - etc.
