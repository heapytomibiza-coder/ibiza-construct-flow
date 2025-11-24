/**
 * API Hooks Module
 * Phase 12: API Client Standardization & React Query Integration
 * 
 * Centralized exports for standardized API hooks
 */

export { useApiQuery } from './useApiQuery';
export { useApiMutation } from './useApiMutation';

// Export error handler utilities
export {
  handleApiError,
  getErrorMessage,
  isAuthError,
  isPermissionError,
  isNotFoundError,
  isValidationError,
} from '@/lib/api/error-handler';
