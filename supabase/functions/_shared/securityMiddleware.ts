/**
 * Security Middleware
 * Phase 24: Advanced Security & Authorization System
 * 
 * Provides rate limiting, input validation, and security logging for edge functions
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";

// Rate limit configurations
export const RATE_LIMITS = {
  // AI functions - prevent cost abuse
  AI_STANDARD: { maxRequests: 20, windowMinutes: 60 },
  AI_STRICT: { maxRequests: 10, windowMinutes: 60 },
  
  // Payment functions - fraud protection
  PAYMENT_STANDARD: { maxRequests: 10, windowMinutes: 60 },
  PAYMENT_STRICT: { maxRequests: 5, windowMinutes: 60 },
  
  // Auth functions - brute force prevention
  AUTH_LOGIN: { maxRequests: 10, windowMinutes: 15 },
  AUTH_REGISTER: { maxRequests: 5, windowMinutes: 60 },
  
  // General API
  API_STANDARD: { maxRequests: 100, windowMinutes: 60 },
  API_STRICT: { maxRequests: 30, windowMinutes: 60 },
} as const;

export type RateLimitPreset = keyof typeof RATE_LIMITS;

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

/**
 * Check rate limit using database tracking
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
      return { allowed: true, remaining: config.maxRequests, resetAt: now.getTime() + config.windowMinutes * 60 * 1000 };
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
      resetAt: now.getTime() + config.windowMinutes * 60 * 1000,
    };
  } catch (error) {
    console.error('[RateLimit] Error:', error);
    return { allowed: true, remaining: config.maxRequests, resetAt: now.getTime() + config.windowMinutes * 60 * 1000 };
  }
}

/**
 * Create rate limit response
 */
export function createRateLimitResponse(retryAfter: number = 60): Response {
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
