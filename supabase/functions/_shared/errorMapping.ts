/**
 * Error Mapping Utilities
 * Security: Maps internal errors to safe user-facing messages
 */

export enum ErrorCode {
  // Authentication errors
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  AUTH_INVALID = 'AUTH_INVALID',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  
  // Validation errors
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  
  // Operation errors
  OPERATION_FAILED = 'OPERATION_FAILED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // System errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

interface ErrorMapping {
  code: ErrorCode;
  message: string;
  statusCode: number;
}

const errorMappings: Record<string, ErrorMapping> = {
  // Auth errors
  'JWT expired': {
    code: ErrorCode.AUTH_INVALID,
    message: 'Your session has expired. Please sign in again.',
    statusCode: 401,
  },
  'Invalid JWT': {
    code: ErrorCode.AUTH_INVALID,
    message: 'Authentication failed. Please sign in again.',
    statusCode: 401,
  },
  'User not found': {
    code: ErrorCode.NOT_FOUND,
    message: 'User not found.',
    statusCode: 404,
  },
  
  // Database errors
  'duplicate key value': {
    code: ErrorCode.ALREADY_EXISTS,
    message: 'This record already exists.',
    statusCode: 409,
  },
  'foreign key constraint': {
    code: ErrorCode.VALIDATION_FAILED,
    message: 'Invalid reference to related data.',
    statusCode: 400,
  },
  'violates not-null constraint': {
    code: ErrorCode.VALIDATION_FAILED,
    message: 'Required field is missing.',
    statusCode: 400,
  },
  
  // Permission errors
  'permission denied': {
    code: ErrorCode.PERMISSION_DENIED,
    message: 'You do not have permission to perform this action.',
    statusCode: 403,
  },
  'new row violates row-level security': {
    code: ErrorCode.PERMISSION_DENIED,
    message: 'Access denied.',
    statusCode: 403,
  },
};

/**
 * Map internal error to safe user-facing error
 */
export function mapError(error: Error): ErrorMapping {
  const errorMessage = error.message.toLowerCase();
  
  // Check for known error patterns
  for (const [pattern, mapping] of Object.entries(errorMappings)) {
    if (errorMessage.includes(pattern.toLowerCase())) {
      return mapping;
    }
  }
  
  // Default to internal error (don't expose details)
  return {
    code: ErrorCode.INTERNAL_ERROR,
    message: 'An unexpected error occurred. Please try again later.',
    statusCode: 500,
  };
}

/**
 * Create safe error response
 */
export function createErrorResponse(error: Error, includeDetails: boolean = false): Response {
  const mapping = mapError(error);
  
  const body: any = {
    error: {
      code: mapping.code,
      message: mapping.message,
    },
  };
  
  // Only include details in development
  if (includeDetails && Deno.env.get('ENVIRONMENT') === 'development') {
    body.error.details = error.message;
    body.error.stack = error.stack;
  }
  
  return new Response(
    JSON.stringify(body),
    {
      status: mapping.statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

/**
 * Safe error logger (logs internally without exposing to user)
 */
export function logError(context: string, error: Error, metadata?: Record<string, any>): void {
  console.error(`[${context}]`, {
    message: error.message,
    name: error.name,
    stack: error.stack,
    metadata,
    timestamp: new Date().toISOString(),
  });
}
