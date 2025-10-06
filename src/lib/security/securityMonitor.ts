import { supabase } from "@/integrations/supabase/client";

export type SecurityEventType = 
  | 'failed_login'
  | 'suspicious_activity'
  | 'unauthorized_access'
  | 'rate_limit_exceeded'
  | 'ip_blocked'
  | 'privilege_escalation_attempt'
  | 'data_breach_attempt';

export type SecurityEventSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface LogSecurityEventParams {
  eventType: SecurityEventType;
  severity: SecurityEventSeverity;
  eventData?: Record<string, any>;
}

/**
 * Log a security event for monitoring and alerting
 */
export async function logSecurityEvent(
  params: LogSecurityEventParams
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get IP address if available
    let ipAddress: string | null = null;
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      ipAddress = data.ip;
    } catch {
      // IP detection failed, continue without it
    }

    await supabase.rpc('log_security_event' as any, {
      p_event_type: params.eventType,
      p_severity: params.severity,
      p_user_id: user?.id || null,
      p_ip_address: ipAddress,
      p_event_data: params.eventData || {}
    });

    // For critical events, also log to console immediately
    if (params.severity === 'critical' || params.severity === 'high') {
      console.error('🚨 Security Event:', {
        type: params.eventType,
        severity: params.severity,
        userId: user?.id,
        data: params.eventData
      });
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
 * Monitor for suspicious patterns in user behavior
 */
export function monitorSuspiciousActivity(
  userId: string,
  action: string
): void {
  // This is a placeholder for more sophisticated monitoring
  // In production, this would integrate with your monitoring service
  const suspiciousPatterns = {
    rapidRequests: 0,
    failedAttempts: 0,
    lastActivity: Date.now()
  };

  // Store in session storage for client-side tracking
  const key = `security_monitor_${userId}`;
  const stored = sessionStorage.getItem(key);
  
  if (stored) {
    const data = JSON.parse(stored);
    const timeSinceLastActivity = Date.now() - data.lastActivity;
    
    // Check for rapid requests (more than 10 per second)
    if (timeSinceLastActivity < 100) {
      data.rapidRequests++;
      
      if (data.rapidRequests > 100) {
        logSecurityEvent({
          eventType: 'suspicious_activity',
          severity: 'high',
          eventData: {
            pattern: 'rapid_requests',
            count: data.rapidRequests,
            action
          }
        });
      }
    } else {
      data.rapidRequests = 0;
    }
    
    data.lastActivity = Date.now();
    sessionStorage.setItem(key, JSON.stringify(data));
  } else {
    sessionStorage.setItem(key, JSON.stringify(suspiciousPatterns));
  }
}
