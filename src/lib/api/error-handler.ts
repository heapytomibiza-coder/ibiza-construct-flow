/**
 * API Error Handler
 * Phase 12: API Layer Consolidation
 * 
 * Centralized error handling for API calls
 */

import { toast } from '@/hooks/use-toast';
import { APIError } from './client';

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  onError?: (error: APIError) => void;
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: APIError): string {
  // Map common error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    '23505': 'This record already exists',
    '23503': 'Cannot delete: record is in use',
    '42P01': 'Database table not found',
    'PGRST116': 'No records found',
    'PGRST301': 'Invalid request format',
  };

  if (error.code && errorMessages[error.code]) {
    return errorMessages[error.code];
  }

  // Check for authentication errors
  if (error.message.includes('JWT') || error.message.includes('token')) {
    return 'Your session has expired. Please log in again.';
  }

  // Check for permission errors
  if (error.message.includes('permission') || error.message.includes('policy')) {
    return 'You do not have permission to perform this action.';
  }

  // Default to original message
  return error.message || 'An unexpected error occurred';
}

/**
 * Handle API errors with consistent behavior
 */
export function handleApiError(
  error: APIError,
  options: ErrorHandlerOptions = {}
): void {
  const {
    showToast = true,
    logError = true,
    onError,
  } = options;

  const message = getErrorMessage(error);

  if (logError) {
    console.error('[API Error]', {
      message: error.message,
      code: error.code,
      status: error.statusCode,
      details: error.details,
    });
  }

  if (showToast) {
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    });
  }

  if (onError) {
    onError(error);
  }
}

/**
 * Check if error is a specific type
 */
export function isAuthError(error: APIError): boolean {
  return (
    error.message.includes('JWT') ||
    error.message.includes('token') ||
    error.message.includes('authentication')
  );
}

export function isPermissionError(error: APIError): boolean {
  return (
    error.message.includes('permission') ||
    error.message.includes('policy') ||
    error.code === '42501'
  );
}

export function isNotFoundError(error: APIError): boolean {
  return error.code === 'PGRST116' || error.statusCode === 404;
}

export function isValidationError(error: APIError): boolean {
  return error.code === 'PGRST301' || error.code?.startsWith('23');
}
