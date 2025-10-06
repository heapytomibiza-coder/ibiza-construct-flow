import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface RateLimitConfig {
  maxRequests: number;
  windowMinutes: number;
}

export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 100,
  windowMinutes: 60
};

export const STRICT_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 20,
  windowMinutes: 60
};

/**
 * Check rate limit for edge function requests
 */
export async function checkRateLimit(
  supabase: SupabaseClient,
  userId: string,
  endpoint: string,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT
): Promise<{ allowed: boolean; data?: any }> {
  try {
    const { data, error } = await supabase.rpc('check_api_rate_limit', {
      p_user_id: userId,
      p_endpoint: endpoint,
      p_max_requests: config.maxRequests,
      p_window_minutes: config.windowMinutes
    });

    if (error) {
      console.error('Rate limit check failed:', error);
      // Fail open - allow request but log the error
      return { allowed: true };
    }

    return { allowed: data.allowed, data };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Fail open - allow request but log the error
    return { allowed: true };
  }
}

/**
 * Log security event from edge function
 */
export async function logSecurityEvent(
  supabase: SupabaseClient,
  eventType: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  userId?: string,
  ipAddress?: string,
  eventData?: Record<string, any>
): Promise<void> {
  try {
    await supabase.rpc('log_security_event', {
      p_event_type: eventType,
      p_severity: severity,
      p_user_id: userId || null,
      p_ip_address: ipAddress || null,
      p_event_data: eventData || {}
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}
