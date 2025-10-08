import { supabase } from "@/integrations/supabase/client";

export type SecurityEventType = 
  | 'failed_login'
  | 'suspicious_activity'
  | 'unauthorized_access'
  | 'rate_limit_exceeded'
  | 'ip_blocked'
  | 'privilege_escalation_attempt'
  | 'data_breach_attempt'
  | 'profile_updated'
  | 'role_assigned'
  | 'role_removed'
  | 'admin_access_attempt';

export type SecurityEventSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface LogSecurityEventParams {
  eventType: SecurityEventType;
  severity?: SecurityEventSeverity;
  category?: string;
  metadata?: Record<string, any>;
}

/**
 * Log a security event using server-side function
 */
export async function logSecurityEvent(
  params: LogSecurityEventParams
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Call server-side logging function
    const { error } = await supabase.rpc('log_security_event' as any, {
      p_user_id: user?.id || null,
      p_event_type: params.eventType,
      p_severity: params.severity || 'medium',
      p_details: {
        category: params.category || 'security',
        ...(params.metadata || {}),
        timestamp: new Date().toISOString(),
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server'
      }
    } as any);

    if (error) {
      console.error('Failed to log security event:', error);
    }

    // Log critical/high events to console for immediate visibility
    if (params.severity === 'critical' || params.severity === 'high') {
      console.warn(`🚨 [Security Alert] ${params.eventType}:`, params.metadata);
    }
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

/**
 * Check if user requires 2FA (for admins)
 */
export async function requiresTwoFactor(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('admin_requires_2fa' as any, {
      p_user_id: userId
    }) as { data: boolean | null; error: any };

    if (error) {
      console.error('2FA check failed:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('2FA check error:', error);
    return false;
  }
}

/**
 * Monitor for suspicious activity using server-side rate limiting
 */
export async function monitorSuspiciousActivity(
  userId: string,
  action: string
): Promise<void> {
  try {
    // Check rate limit using server-side function
    const { data, error } = await supabase.rpc('check_rate_limit' as any, {
      p_user_id: userId,
      p_action: action,
      p_limit: 50,  // 50 requests
      p_window_sec: 60  // per minute
    } as any) as { data: boolean | null; error: any };

    if (error) {
      console.error('Rate limit check failed:', error);
      return;
    }

    // If rate limit exceeded (function returns false), log suspicious activity
    if (data === false) {
      await logSecurityEvent({
        eventType: 'rate_limit_exceeded',
        severity: 'high',
        category: 'behavior',
        metadata: {
          userId,
          action,
          pattern: 'rate_limit_exceeded',
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('Failed to monitor suspicious activity:', error);
  }
}
