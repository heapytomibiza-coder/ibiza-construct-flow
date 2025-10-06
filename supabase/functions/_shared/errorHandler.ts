/**
 * Error handling utility for Edge Functions
 * Provides consistent error tracking and response formatting
 */

interface ErrorLogOptions {
  functionName: string;
  requestData?: Record<string, any>;
  userId?: string;
  severity?: 'warning' | 'error' | 'critical';
}

/**
 * Log edge function error to monitoring table
 */
export async function logEdgeFunctionError(
  supabaseClient: any,
  error: Error,
  options: ErrorLogOptions
): Promise<void> {
  try {
    await supabaseClient.rpc('log_edge_function_error', {
      p_function_name: options.functionName,
      p_error_message: error.message,
      p_error_stack: error.stack,
      p_request_data: options.requestData || {},
      p_user_id: options.userId,
      p_severity: options.severity || 'error',
    });
  } catch (logError) {
    // Don't throw if logging fails, just log to console
    console.error('Failed to log error:', logError);
  }
}

/**
 * Wrap edge function with error tracking
 */
export function withErrorTracking(
  handler: (req: Request) => Promise<Response>,
  functionName: string
) {
  return async (req: Request): Promise<Response> => {
    try {
      return await handler(req);
    } catch (error: any) {
      console.error(`Error in ${functionName}:`, error);
      
      // Try to extract user ID from request
      let userId: string | undefined;
      try {
        const authHeader = req.headers.get('Authorization');
        if (authHeader) {
          // You can extract user ID from JWT token if needed
          // For now, we'll leave it undefined
        }
      } catch {}

      // Log error (don't await to avoid blocking response)
      logEdgeFunctionError(
        // Note: You'll need to pass supabase client here in actual implementation
        null,
        error,
        {
          functionName,
          requestData: {
            method: req.method,
            url: req.url,
          },
          userId,
          severity: 'error',
        }
      );

      return new Response(
        JSON.stringify({
          error: error.message || 'Internal server error',
          code: 'INTERNAL_ERROR',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  };
}

/**
 * Standard error response formatter
 */
export function errorResponse(
  message: string,
  status: number = 500,
  code?: string
): Response {
  return new Response(
    JSON.stringify({
      error: message,
      code: code || 'ERROR',
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Validation error response
 */
export function validationError(message: string): Response {
  return errorResponse(message, 400, 'VALIDATION_ERROR');
}

/**
 * Authentication error response
 */
export function authError(message: string = 'Unauthorized'): Response {
  return errorResponse(message, 401, 'AUTH_ERROR');
}

/**
 * Rate limit error response
 */
export function rateLimitError(): Response {
  return errorResponse(
    'Rate limit exceeded. Please try again later.',
    429,
    'RATE_LIMIT_EXCEEDED'
  );
}
