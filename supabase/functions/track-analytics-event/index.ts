import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const {
      event_name,
      event_category,
      event_properties,
      user_id,
      session_id,
      page_url
    } = await req.json();

    // Get IP and user agent from request
    const ip_address = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                       req.headers.get('x-real-ip') || 
                       'unknown';
    const user_agent = req.headers.get('user-agent') || 'unknown';

    // Parse user agent for device info
    const device_type = user_agent.includes('Mobile') ? 'mobile' : 
                       user_agent.includes('Tablet') ? 'tablet' : 'desktop';
    
    const browser = user_agent.includes('Chrome') ? 'Chrome' :
                   user_agent.includes('Firefox') ? 'Firefox' :
                   user_agent.includes('Safari') ? 'Safari' : 'Other';

    const os = user_agent.includes('Windows') ? 'Windows' :
               user_agent.includes('Mac') ? 'macOS' :
               user_agent.includes('Linux') ? 'Linux' :
               user_agent.includes('Android') ? 'Android' :
               user_agent.includes('iOS') ? 'iOS' : 'Other';

    // Insert analytics event
    const { error } = await supabaseClient
      .from('analytics_events')
      .insert({
        event_name,
        event_category,
        event_properties: event_properties || {},
        user_id: user_id || null,
        session_id,
        page_url,
        ip_address,
        user_agent,
        device_type,
        browser,
        os
      });

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error tracking event:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
