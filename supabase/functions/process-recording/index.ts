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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { sessionId, recordingUrl, fileSize, duration } = await req.json();

    // Store recording information
    const { data: recording, error: recordingError } = await supabase
      .from('call_recordings')
      .insert({
        call_session_id: sessionId,
        recording_url: recordingUrl,
        file_size: fileSize,
        duration_seconds: duration,
        format: 'mp4',
        storage_path: recordingUrl,
        processed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (recordingError) throw recordingError;

    // Update call session with recording URL
    await supabase
      .from('call_sessions')
      .update({ recording_url: recordingUrl })
      .eq('id', sessionId);

    console.log(`Processed recording for session: ${sessionId}`);

    // Trigger transcription in background (fire and forget)
    fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/transcribe-call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
      },
      body: JSON.stringify({ sessionId, recordingUrl }),
    }).catch(err => console.error('Background transcription error:', err));

    return new Response(
      JSON.stringify({
        success: true,
        recordingId: recording.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing recording:', error);
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