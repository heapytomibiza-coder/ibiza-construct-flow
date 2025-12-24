/**
 * Security Middleware
 * Phase 24: Advanced Security & Authorization System
 * 
 * Provides rate limiting, input validation, and security logging for edge functions
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";
import { z, ZodSchema } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Rate limit configurations
export const RATE_LIMITS = {
  // AI functions - prevent cost abuse
  AI_STANDARD: { maxRequests: 20, windowMinutes: 60, failOpen: true },
  AI_STRICT: { maxRequests: 10, windowMinutes: 60, failOpen: true },
  
  // Payment functions - fraud protection (FAIL CLOSED)
  PAYMENT_STANDARD: { maxRequests: 10, windowMinutes: 60, failOpen: false },
  PAYMENT_STRICT: { maxRequests: 5, windowMinutes: 60, failOpen: false },
  
  // Auth functions - brute force prevention (FAIL CLOSED)
  AUTH_LOGIN: { maxRequests: 10, windowMinutes: 15, failOpen: false },
  AUTH_REGISTER: { maxRequests: 5, windowMinutes: 60, failOpen: false },
  
  // General API
  API_STANDARD: { maxRequests: 100, windowMinutes: 60, failOpen: true },
  API_STRICT: { maxRequests: 30, windowMinutes: 60, failOpen: true },
} as const;

export type RateLimitPreset = keyof typeof RATE_LIMITS;

interface RateLimitConfig {
  maxRequests: number;
  windowMinutes: number;
  failOpen: boolean;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: number;
  retryAfter?: number;
}

/**
 * Check rate limit using database tracking
 * Supports fail-open (default for non-critical) and fail-closed (for payments/auth)
 */
export async function checkRateLimitDb(
  supabase: SupabaseClient,
  identifier: string,
  endpoint: string,
  preset: RateLimitPreset = 'API_STANDARD'
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[preset];
  const now = new Date();
  const windowStart = new Date(now.getTime() - config.windowMinutes * 60 * 1000);
  const resetAt = now.getTime() + config.windowMinutes * 60 * 1000;

  try {
    // Count requests in current window
    const { count, error: countError } = await supabase
      .from('rate_limit_tracking')
      .select('*', { count: 'exact', head: true })
      .eq('identifier', identifier)
      .eq('action', endpoint)
      .gte('created_at', windowStart.toISOString());

    if (countError) {
      console.error('[RateLimit] Count error:', countError);
      // Fail-open or fail-closed based on config
      if (config.failOpen) {
        return { allowed: true, remaining: config.maxRequests, limit: config.maxRequests, resetAt };
      } else {
        console.error('[RateLimit] FAIL-CLOSED: DB error on critical endpoint');
        return { allowed: false, remaining: 0, limit: config.maxRequests, resetAt, retryAfter: 60 };
      }
    }

    const currentCount = count || 0;

    if (currentCount >= config.maxRequests) {
      const { data: oldestRequest } = await supabase
        .from('rate_limit_tracking')
        .select('created_at')
        .eq('identifier', identifier)
        .eq('action', endpoint)
        .gte('created_at', windowStart.toISOString())
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      let retryAfter = config.windowMinutes * 60;
      if (oldestRequest) {
        const resetTime = new Date(oldestRequest.created_at).getTime() + config.windowMinutes * 60 * 1000;
        retryAfter = Math.ceil((resetTime - now.getTime()) / 1000);
      }

      console.warn(`[RateLimit] Exceeded for ${identifier} on ${endpoint}`);
      return {
        allowed: false,
        remaining: 0,
        limit: config.maxRequests,
        resetAt: now.getTime() + retryAfter * 1000,
        retryAfter,
      };
    }

    // Record this request
    await supabase.from('rate_limit_tracking').insert({
      identifier,
      action: endpoint,
      created_at: now.toISOString(),
    });

    // Cleanup old records (async, don't await)
    supabase
      .from('rate_limit_tracking')
      .delete()
      .eq('identifier', identifier)
      .eq('action', endpoint)
      .lt('created_at', windowStart.toISOString())
      .then(() => {});

    return {
      allowed: true,
      remaining: config.maxRequests - currentCount - 1,
      limit: config.maxRequests,
      resetAt,
    };
  } catch (error) {
    console.error('[RateLimit] Error:', error);
    // Fail-open or fail-closed based on config
    if (config.failOpen) {
      return { allowed: true, remaining: config.maxRequests, limit: config.maxRequests, resetAt };
    } else {
      console.error('[RateLimit] FAIL-CLOSED: Exception on critical endpoint');
      return { allowed: false, remaining: 0, limit: config.maxRequests, resetAt, retryAfter: 60 };
    }
  }
}

/**
 * Create rate limit response with standard headers
 * Accepts either RateLimitResult or just retryAfter number for backward compatibility
 */
export function createRateLimitResponse(resultOrRetryAfter: RateLimitResult | number = 60): Response {
  const isResult = typeof resultOrRetryAfter === 'object';
  const retryAfter = isResult ? (resultOrRetryAfter.retryAfter || 60) : resultOrRetryAfter;
  const limit = isResult ? resultOrRetryAfter.limit : 0;
  const remaining = isResult ? resultOrRetryAfter.remaining : 0;
  const resetAt = isResult ? resultOrRetryAfter.resetAt : Date.now() + 60000;
  
  return new Response(
    JSON.stringify({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
        retryAfter,
      },
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': Math.floor(resetAt / 1000).toString(),
      },
    }
  );
}

/**
 * Get client identifier (user ID or IP)
 */
export function getClientIdentifier(req: Request, userId?: string): string {
  if (userId) return userId;
  
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
             req.headers.get('cf-connecting-ip') ||
             req.headers.get('x-real-ip') ||
             'unknown';
  return `ip:${ip}`;
}

/**
 * Log security event
 */
export async function logSecurityEvent(
  supabase: SupabaseClient,
  eventType: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  userId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    await supabase.from('security_events').insert({
      event_type: eventType,
      severity,
      user_id: userId || null,
      event_data: metadata || {},
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Security] Failed to log event:', error);
  }
}

/**
 * Create authenticated supabase client
 */
export function createAuthenticatedClient(authHeader: string | null) {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: authHeader ? { Authorization: authHeader } : {} } }
  );
}

/**
 * Create service role supabase client
 */
export function createServiceClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
}

/**
 * Standard CORS headers
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Handle CORS preflight
 */
export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

/**
 * Validate request body with Zod schema
 */
export async function validateRequestBody<T>(
  req: Request,
  schema: ZodSchema<T>
): Promise<T> {
  const body = await req.json().catch(() => ({}));
  const result = schema.safeParse(body);
  
  if (!result.success) {
    const errors = result.error.flatten();
    throw new ValidationError('Invalid request body', errors);
  }
  
  return result.data;
}

/**
 * Custom validation error
 */
export class ValidationError extends Error {
  public errors: any;
  
  constructor(message: string, errors: any) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Create safe error response (no internal details leaked)
 */
export function createErrorResponse(
  error: unknown,
  requestId?: string
): Response {
  // Log full error server-side
  console.error('[EdgeFunctionError]', {
    requestId,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });

  // Handle validation errors
  if (error instanceof ValidationError) {
    return new Response(
      JSON.stringify({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.errors,
        },
        requestId,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // Handle known errors
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('unauthorized') || message.includes('not authenticated')) {
      return new Response(
        JSON.stringify({
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
          requestId,
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (message.includes('forbidden') || message.includes('not allowed')) {
      return new Response(
        JSON.stringify({
          error: { code: 'FORBIDDEN', message: 'Access denied' },
          requestId,
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (message.includes('not found')) {
      return new Response(
        JSON.stringify({
          error: { code: 'NOT_FOUND', message: 'Resource not found' },
          requestId,
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Generic error - don't leak details
  return new Response(
    JSON.stringify({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Something went wrong. Please try again.',
      },
      requestId,
    }),
    {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Log error with context (server-side only)
 */
export function logError(
  functionName: string,
  error: unknown,
  context?: Record<string, any>
): void {
  console.error(`[${functionName}] Error:`, {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  });
}

/**
 * Generate unique request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
}
