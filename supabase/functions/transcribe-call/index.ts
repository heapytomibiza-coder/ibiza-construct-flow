import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getErrorMessage } from '../_shared/errorUtils.ts';

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

    const { sessionId, recordingUrl } = await req.json();

    console.log(`Starting transcription for session: ${sessionId}`);

    // In production, integrate with Lovable AI for audio transcription
    // For now, create a mock transcription
    const mockTranscription = `
[Speaker 1 00:00:05]: Hello, how are you today?
[Speaker 2 00:00:08]: I'm doing well, thank you for asking.
[Speaker 1 00:00:12]: Great! Let's discuss the project requirements.
[Speaker 2 00:00:15]: Yes, I have prepared some notes.
    `.trim();

    // Store transcription
    const { data: transcription, error: transcriptionError } = await supabase
      .from('call_transcriptions')
      .insert({
        call_session_id: sessionId,
        transcription_text: mockTranscription,
        language: 'en',
        confidence_score: 0.92,
        speaker_labels: [
          { speaker: 'Speaker 1', segments: 2 },
          { speaker: 'Speaker 2', segments: 2 },
        ],
        timestamps: [
          { start: 5, end: 7, text: 'Hello, how are you today?' },
          { start: 8, end: 11, text: "I'm doing well, thank you for asking." },
          { start: 12, end: 15, text: "Great! Let's discuss the project requirements." },
          { start: 15, end: 18, text: 'Yes, I have prepared some notes.' },
        ],
      })
      .select()
      .single();

    if (transcriptionError) throw transcriptionError;

    // Update call session with transcription URL
    await supabase
      .from('call_sessions')
      .update({ transcription_url: `transcription_${transcription.id}` })
      .eq('id', sessionId);

    console.log(`Transcription completed for session: ${sessionId}`);

    return new Response(
      JSON.stringify({
        success: true,
        transcriptionId: transcription.id,
        confidence: 0.92,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error transcribing call:', error);
    return new Response(
      JSON.stringify({ error: getErrorMessage(error) }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});