/**
 * API Module Exports
 * Phase 12: API Client Standardization
 */

export * from './client';
export * from './queryClient';
export * from './customInstance';

// Export error handler utilities
export {
  handleApiError,
  getErrorMessage,
  isAuthError,
  isPermissionError,
  isNotFoundError,
  isValidationError,
} from './error-handler';
export type { ErrorHandlerOptions } from './error-handler';
