import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { serverClient } from "../_shared/client.ts";
import { getErrorMessage } from '../_shared/errorUtils.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function quickSentimentRule(text: string): { label: string; score: number; confidence: number } {
  const t = text.toLowerCase();
  
  const negative = ["terrible", "awful", "unacceptable", "scam", "fraud", "angry", "disgusting", "worst", "horrible", "hate"];
  const positive = ["excellent", "great", "perfect", "satisfied", "amazing", "brilliant", "helpful", "thanks", "wonderful", "fantastic"];

  const negCount = negative.filter(k => t.includes(k)).length;
  const posCount = positive.filter(k => t.includes(k)).length;

  if (negCount > posCount && negCount > 0) {
    return { label: "negative", score: -0.6, confidence: 0.8 };
  }
  if (posCount > negCount && posCount > 0) {
    return { label: "positive", score: 0.6, confidence: 0.8 };
  }
  
  return { label: "neutral", score: 0.0, confidence: 0.6 };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = serverClient(req);

    // Get messages without sentiment analysis (limit to recent 500)
    const { data: messages, error: messagesError } = await supabase
      .from('dispute_messages')
      .select('id, message')
      .is('id', 'not.in.(select message_id from message_sentiments)')
      .order('created_at', { ascending: false })
      .limit(500);

    if (messagesError) throw messagesError;

    let processed = 0;
    for (const msg of messages || []) {
      const { label, score, confidence } = quickSentimentRule(msg.message || '');
      
      const { error: insertError } = await supabase
        .from('message_sentiments')
        .insert({
          message_id: msg.id,
          sentiment: score,
          label,
          confidence,
        });

      if (!insertError) {
        processed++;
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Sentiment batch error:', error);
    return new Response(
      JSON.stringify({ error: getErrorMessage(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
