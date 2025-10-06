import { supabase } from "@/integrations/supabase/client";

export interface RateLimitResult {
  allowed: boolean;
  remaining?: number;
  reset_at?: string;
  blocked_until?: string;
  retry_after?: number;
  reason?: string;
}

/**
 * Check rate limit for the current user on a specific endpoint
 */
export async function checkRateLimit(
  endpoint: string,
  maxRequests: number = 100,
  windowMinutes: number = 60
): Promise<RateLimitResult> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { allowed: false, reason: 'unauthenticated' };
    }

    const { data, error } = await supabase.rpc('check_api_rate_limit' as any, {
      p_user_id: user.id,
      p_endpoint: endpoint,
      p_max_requests: maxRequests,
      p_window_minutes: windowMinutes
    }) as { data: RateLimitResult | null; error: any };

    if (error) {
      console.error('Rate limit check failed:', error);
      // Fail open - allow request but log the error
      return { allowed: true };
    }

    return data as RateLimitResult;
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Fail open - allow request but log the error
    return { allowed: true };
  }
}

/**
 * Higher-order function to wrap API calls with rate limiting
 */
export function withRateLimit<T>(
  endpoint: string,
  fn: () => Promise<T>,
  options?: { maxRequests?: number; windowMinutes?: number }
): () => Promise<T> {
  return async () => {
    const rateLimitResult = await checkRateLimit(
      endpoint,
      options?.maxRequests,
      options?.windowMinutes
    );

    if (!rateLimitResult.allowed) {
      throw new Error(
        `Rate limit exceeded. ${
          rateLimitResult.blocked_until
            ? `Try again after ${new Date(rateLimitResult.blocked_until).toLocaleTimeString()}`
            : 'Please try again later'
        }`
      );
    }

    return fn();
  };
}
