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

    const { textContent, entityType, entityId } = await req.json();

    if (!textContent || !entityType || !entityId) {
      throw new Error('Missing required fields');
    }

    console.log(`Analyzing sentiment for ${entityType}: ${entityId}`);

    const startTime = Date.now();

    // Use Lovable AI for sentiment analysis
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a sentiment analysis expert. Analyze text and return sentiment (positive/negative/neutral/mixed), confidence score (0-1), detailed scores for each sentiment, and key phrases.'
          },
          {
            role: 'user',
            content: `Analyze this text: "${textContent}"\n\nReturn as JSON: {"sentiment": "positive|negative|neutral|mixed", "confidence": 0.95, "scores": {"positive": 0.8, "negative": 0.1, "neutral": 0.1}, "keyPhrases": ["phrase1", "phrase2"]}`
          }
        ],
      }),
    });

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);

    // Store sentiment analysis
    const { data: sentimentRecord, error } = await supabase
      .from('sentiment_analysis')
      .insert({
        entity_type: entityType,
        entity_id: entityId,
        text_content: textContent,
        sentiment: analysis.sentiment,
        confidence_score: analysis.confidence,
        sentiment_scores: analysis.scores,
        key_phrases: analysis.keyPhrases,
      })
      .select()
      .single();

    if (error) throw error;

    const executionTime = Date.now() - startTime;

    // Log automation
    await supabase.from('ai_automation_logs').insert({
      automation_type: 'sentiment_analysis',
      entity_type: entityType,
      entity_id: entityId,
      action_taken: `Analyzed sentiment: ${analysis.sentiment}`,
      input_data: { textLength: textContent.length },
      output_data: { sentiment: analysis.sentiment, confidence: analysis.confidence },
      success: true,
      execution_time_ms: executionTime,
    });

    console.log(`Sentiment analysis completed in ${executionTime}ms: ${analysis.sentiment}`);

    return new Response(
      JSON.stringify({
        success: true,
        sentiment: analysis.sentiment,
        confidence: analysis.confidence,
        scores: analysis.scores,
        keyPhrases: analysis.keyPhrases,
        id: sentimentRecord.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return new Response(
      JSON.stringify({ error: getErrorMessage(error) }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});