import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { validateRequestBody, commonSchemas } from '../_shared/inputValidation.ts';
import { createErrorResponse, logError } from '../_shared/errorMapping.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const securityMonitorSchema = z.object({
  action: z.enum(['log_event', 'get_events', 'check_suspicious_activity', 'get_active_sessions', 'revoke_session']),
  data: z.object({
    event_type: z.string().trim().min(1).max(100).optional(),
    event_category: z.string().trim().min(1).max(100).optional(),
    severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    event_data: z.record(z.any()).optional(),
    session_id: commonSchemas.uuid.optional(),
  }).optional(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { action, data } = await validateRequestBody(req, securityMonitorSchema);

    switch (action) {
      case 'log_event':
        if (data) {
          await supabaseClient.from('security_events').insert({
            user_id: user.id,
            event_type: data.event_type || 'unknown',
            event_category: data.event_category || 'unknown',
            severity: data.severity || 'low',
            event_data: data.event_data || {},
          });
        }
        break;

      case 'get_events':
        const { data: events } = await supabaseClient
          .from('security_events')
          .select('*')
          .eq('user_id', user.id)
          .order('detected_at', { ascending: false })
          .limit(50);

        return new Response(
          JSON.stringify({ events, success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'check_suspicious_activity':
        const suspicious = await detectSuspiciousActivity(supabaseClient, user.id);
        return new Response(
          JSON.stringify({ suspicious, success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'get_active_sessions':
        const { data: sessions } = await supabaseClient
          .from('active_sessions')
          .select('*')
          .eq('user_id', user.id)
          .gt('expires_at', new Date().toISOString());

        return new Response(
          JSON.stringify({ sessions, success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'revoke_session':
        if (data?.session_id) {
          await supabaseClient
            .from('active_sessions')
            .delete()
            .eq('id', data.session_id)
            .eq('user_id', user.id);
        }
        break;

      default:
        throw new Error('Invalid action');
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    logError('security-monitor', error);
    return createErrorResponse(error);
  }
});

async function detectSuspiciousActivity(supabaseClient: any, userId: string) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  // Check for multiple failed login attempts
  const { data: failedLogins } = await supabaseClient
    .from('security_audit_log')
    .select('*')
    .eq('user_id', userId)
    .eq('action', 'login_attempt')
    .eq('result', 'failure')
    .gte('created_at', oneHourAgo);

  // Check for unusual IP addresses
  const { data: recentSessions } = await supabaseClient
    .from('active_sessions')
    .select('ip_address')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  const uniqueIPs = new Set(recentSessions?.map((s: any) => s.ip_address) || []);

  return {
    failed_login_attempts: failedLogins?.length || 0,
    unique_ips_24h: uniqueIPs.size,
    suspicious: (failedLogins?.length || 0) > 5 || uniqueIPs.size > 3,
  };
}
