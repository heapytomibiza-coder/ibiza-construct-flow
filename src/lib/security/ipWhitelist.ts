import { supabase } from "@/integrations/supabase/client";

/**
 * Check if the current IP address is whitelisted for admin access
 * Note: IP detection in browser is limited. For production, implement this on edge functions.
 */
export async function isIpWhitelisted(ipAddress: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('is_ip_whitelisted' as any, {
      p_ip_address: ipAddress
    }) as { data: boolean | null; error: any };

    if (error) {
      console.error('IP whitelist check failed:', error);
      // Fail closed for security - deny access if check fails
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('IP whitelist check error:', error);
    return false;
  }
}

/**
 * Get the user's IP address (client-side approximation)
 * Note: This is not reliable for security. Use edge functions for real IP detection.
 */
export async function getUserIpAddress(): Promise<string | null> {
  try {
    // Use a public IP detection service
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Failed to get IP address:', error);
    return null;
  }
}

/**
 * Log admin access attempt
 */
export async function logAdminAccessAttempt(
  success: boolean,
  reason?: string
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const ipAddress = await getUserIpAddress();

    await supabase.rpc('log_admin_access_attempt' as any, {
      p_user_id: user.id,
      p_ip_address: ipAddress,
      p_success: success,
      p_reason: reason
    });
  } catch (error) {
    console.error('Failed to log admin access attempt:', error);
  }
}
