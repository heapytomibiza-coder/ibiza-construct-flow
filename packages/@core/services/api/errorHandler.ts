/**
 * Error Handler
 * @core - Centralized API error handling utilities
 * 
 * Pure error normalization and classification
 * Note: Toast display should be handled by consuming modules
 */

import { APIError } from '../../dto/common';

export interface ErrorHandlerOptions {
  logError?: boolean;
  onError?: (error: APIError) => void;
}

/**
 * Error code to user-friendly message mapping
 */
const errorMessages: Record<string, string> = {
  // PostgreSQL error codes
  '23505': 'This record already exists',
  '23503': 'Cannot delete: record is in use',
  '42P01': 'Database table not found',
  '42501': 'Permission denied',
  // PostgREST error codes
  'PGRST116': 'No records found',
  'PGRST301': 'Invalid request format',
  // Network errors
  'NETWORK_ERROR': 'No internet connection',
  'UNKNOWN_ERROR': 'An unexpected error occurred',
};

/**
 * Get user-friendly error message from APIError
 */
export function getErrorMessage(error: APIError): string {
  // Check error code mapping
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
 * Normalize any error to APIError
 */
export function normalizeError(error: unknown): APIError {
  if (error instanceof APIError) {
    return error;
  }

  if (error instanceof Error) {
    return new APIError(error.message);
  }

  // Supabase error shape
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const err = error as { message: string; status?: number; code?: string; details?: unknown };
    return new APIError(
      err.message,
      err.status,
      err.code,
      err.details
    );
  }

  // Network error check
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return new APIError('No internet connection', 0, 'NETWORK_ERROR');
  }

  // Generic fallback
  return new APIError('An unexpected error occurred', 500, 'UNKNOWN_ERROR');
}

/**
 * Handle API error with logging
 * Note: Toast display should be handled by the consuming module
 */
export function handleApiError(
  error: APIError,
  options: ErrorHandlerOptions = {}
): string {
  const { logError = true, onError } = options;

  const message = getErrorMessage(error);

  if (logError) {
    console.error('[API Error]', {
      message: error.message,
      code: error.code,
      status: error.statusCode,
      details: error.details,
    });
  }

  if (onError) {
    onError(error);
  }

  return message;
}

/**
 * Error type classification utilities
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
  return error.code === 'PGRST301' || error.code?.startsWith('23') || false;
}

export function isNetworkError(error: APIError): boolean {
  return error.code === 'NETWORK_ERROR';
}
