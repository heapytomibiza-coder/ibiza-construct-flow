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

    const { participantIds, callType, conversationId } = await req.json();

    // Create room ID
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Create call session
    const { data: session, error } = await supabase
      .from('call_sessions')
      .insert({
        room_id: roomId,
        initiator_id: user.id,
        participants: participantIds || [],
        call_type: callType || 'video',
        status: 'waiting',
        conversation_id: conversationId,
        provider: 'agora',
        provider_session_id: roomId,
        metadata: {
          created_via: 'api',
          timestamp: new Date().toISOString(),
        }
      })
      .select()
      .single();

    if (error) throw error;

    console.log(`Created video room: ${roomId} for user: ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        sessionId: session.id,
        roomId: roomId,
        provider: 'agora'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating video room:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});