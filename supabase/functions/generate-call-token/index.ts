import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { sessionId, roomId } = await req.json();

    // Verify user is participant in this session
    const { data: session, error } = await supabase
      .from('call_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) throw error;

    if (session.initiator_id !== user.id && !session.participants.includes(user.id)) {
      throw new Error('User is not authorized for this call');
    }

    // Generate a secure token (in production, integrate with Agora token generation)
    const token = `token_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Token expires in 24 hours
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    console.log(`Generated call token for user: ${user.id}, room: ${roomId}`);

    return new Response(
      JSON.stringify({
        success: true,
        token: token,
        roomId: roomId,
        userId: user.id,
        expiresAt: expiresAt.toISOString(),
        // In production, integrate with actual Agora API
        appId: 'demo_app_id',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error generating call token:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});