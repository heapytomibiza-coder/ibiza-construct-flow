import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClientLogEvent {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  stack?: string;
  userAgent?: string;
  url?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    const logEvent: ClientLogEvent = await req.json();

    // Only store warn and error logs
    if (logEvent.level === 'warn' || logEvent.level === 'error') {
      const { error } = await supabase
        .from('client_logs')
        .insert({
          user_id: userId,
          level: logEvent.level,
          message: logEvent.message,
          context: logEvent.context || {},
          stack: logEvent.stack,
          user_agent: logEvent.userAgent,
          url: logEvent.url,
          created_at: logEvent.timestamp
        });

      if (error) {
        console.error('Failed to insert client log:', error);
      }
    }

    // For errors, also check if we need to alert admins
    if (logEvent.level === 'error') {
      await checkAndAlertAdmins(supabase, logEvent);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error logging client event:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function checkAndAlertAdmins(supabase: any, logEvent: ClientLogEvent) {
  // Count recent errors
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  
  const { count } = await supabase
    .from('client_logs')
    .select('*', { count: 'exact', head: true })
    .eq('level', 'error')
    .gte('created_at', fifteenMinutesAgo);

  // If more than 10 errors in 15 minutes, create alert
  if (count && count > 10) {
    await supabase
      .from('admin_alerts')
      .insert({
        alert_type: 'high_error_rate',
        severity: 'high',
        message: `High error rate detected: ${count} errors in the last 15 minutes`,
        metadata: {
          error_count: count,
          latest_error: logEvent
        }
      });
  }
}
