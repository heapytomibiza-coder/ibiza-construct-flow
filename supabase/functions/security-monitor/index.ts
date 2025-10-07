import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const { action, data } = await req.json();

    switch (action) {
      case 'log_event':
        await supabaseClient.from('security_events').insert({
          user_id: user.id,
          event_type: data.event_type,
          event_category: data.event_category,
          severity: data.severity || 'low',
          event_data: data.event_data || {},
        });
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
        await supabaseClient
          .from('active_sessions')
          .delete()
          .eq('id', data.session_id)
          .eq('user_id', user.id);
        break;

      default:
        throw new Error('Invalid action');
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
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

  const uniqueIPs = new Set(recentSessions?.map(s => s.ip_address) || []);

  return {
    failed_login_attempts: failedLogins?.length || 0,
    unique_ips_24h: uniqueIPs.size,
    suspicious: (failedLogins?.length || 0) > 5 || uniqueIPs.size > 3,
  };
}
