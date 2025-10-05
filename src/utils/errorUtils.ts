/**
 * Error handling utilities
 * Centralized error classification, user-friendly messages, and retry logic
 */

export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  PERMISSION = 'PERMISSION',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN'
}

export interface AppError {
  type: ErrorType;
  message: string;
  userMessage: string;
  originalError?: Error;
  retryable: boolean;
  statusCode?: number;
}

/**
 * Classify error and return user-friendly information
 */
export const classifyError = (error: unknown): AppError => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Network errors
    if (message.includes('network') || message.includes('fetch') || message.includes('offline')) {
      return {
        type: ErrorType.NETWORK,
        message: error.message,
        userMessage: 'Unable to connect. Please check your internet connection.',
        originalError: error,
        retryable: true
      };
    }
    
    // Auth errors
    if (message.includes('auth') || message.includes('unauthorized') || message.includes('token')) {
      return {
        type: ErrorType.AUTH,
        message: error.message,
        userMessage: 'Your session has expired. Please sign in again.',
        originalError: error,
        retryable: false,
        statusCode: 401
      };
    }
    
    // Validation errors
    if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
      return {
        type: ErrorType.VALIDATION,
        message: error.message,
        userMessage: 'Please check your input and try again.',
        originalError: error,
        retryable: false,
        statusCode: 400
      };
    }
    
    // Not found errors
    if (message.includes('not found') || message.includes('404')) {
      return {
        type: ErrorType.NOT_FOUND,
        message: error.message,
        userMessage: 'The requested resource was not found.',
        originalError: error,
        retryable: false,
        statusCode: 404
      };
    }
    
    // Permission errors
    if (message.includes('permission') || message.includes('forbidden') || message.includes('403')) {
      return {
        type: ErrorType.PERMISSION,
        message: error.message,
        userMessage: 'You don\'t have permission to perform this action.',
        originalError: error,
        retryable: false,
        statusCode: 403
      };
    }
    
    // Server errors
    if (message.includes('server') || message.includes('500') || message.includes('internal')) {
      return {
        type: ErrorType.SERVER,
        message: error.message,
        userMessage: 'Something went wrong on our end. Please try again later.',
        originalError: error,
        retryable: true,
        statusCode: 500
      };
    }
  }
  
  // Unknown error
  return {
    type: ErrorType.UNKNOWN,
    message: String(error),
    userMessage: 'An unexpected error occurred. Please try again.',
    originalError: error instanceof Error ? error : undefined,
    retryable: true
  };
};

/**
 * Get user-friendly error message
 */
export const getUserErrorMessage = (error: unknown): string => {
  const classified = classifyError(error);
  return classified.userMessage;
};

/**
 * Check if error is retryable
 */
export const isRetryable = (error: unknown): boolean => {
  const classified = classifyError(error);
  return classified.retryable;
};

/**
 * Retry function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
    onRetry?: (attempt: number, error: unknown) => void;
  } = {}
): Promise<T> => {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    onRetry
  } = options;

  let lastError: unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry if error is not retryable
      if (!isRetryable(error)) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelay * Math.pow(backoffMultiplier, attempt),
        maxDelay
      );
      
      // Call retry callback
      if (onRetry) {
        onRetry(attempt + 1, error);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Error logger for production monitoring
 */
export const logError = (error: unknown, context?: Record<string, any>) => {
  const classified = classifyError(error);
  
  const logData = {
    type: classified.type,
    message: classified.message,
    userMessage: classified.userMessage,
    statusCode: classified.statusCode,
    timestamp: new Date().toISOString(),
    context,
    stack: classified.originalError?.stack
  };
  
  // Console log in development
  if (process.env.NODE_ENV === 'development') {
    console.error('🔴 Error logged:', logData);
  }
  
  // In production, send to monitoring service
  // Example: Sentry.captureException(error, { extra: logData });
  
  return logData;
};

/**
 * Create a safe async handler that catches errors
 */
export const safeAsync = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: {
    onError?: (error: unknown) => void;
    fallbackValue?: R;
  } = {}
) => {
  return async (...args: T): Promise<R | undefined> => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error, { functionName: fn.name, arguments: args });
      
      if (options.onError) {
        options.onError(error);
      }
      
      return options.fallbackValue;
    }
  };
};
