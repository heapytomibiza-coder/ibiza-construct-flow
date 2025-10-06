import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, entityType, entityId } = await req.json();

    if (!text || !entityType || !entityId) {
      throw new Error("Text, entityType, and entityId are required");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const prompt = `Analyze the sentiment and emotions of the following text. Provide a detailed analysis.

Text to analyze:
"${text}"

Provide a JSON response with this exact structure:
{
  "sentiment_score": -0.5,  // Range from -1 (very negative) to 1 (very positive)
  "sentiment_label": "negative",  // One of: "positive", "negative", "neutral"
  "emotions": {
    "joy": 0.1,
    "anger": 0.6,
    "sadness": 0.3,
    "fear": 0.2,
    "surprise": 0.1,
    "trust": 0.4
  },
  "key_phrases": ["phrase1", "phrase2", "phrase3"]
}

Analyze the emotional tone, positivity/negativity, and extract key meaningful phrases.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a sentiment analysis AI. Always respond with valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      throw new Error("AI sentiment analysis failed");
    }

    const aiData = await aiResponse.json();
    const analysis = JSON.parse(aiData.choices[0].message.content);

    // Store sentiment analysis
    const { data: sentimentRecord, error: insertError } = await supabase
      .from("ai_sentiment_analysis")
      .insert({
        entity_type: entityType,
        entity_id: entityId,
        sentiment_score: analysis.sentiment_score,
        sentiment_label: analysis.sentiment_label,
        emotions: analysis.emotions,
        key_phrases: analysis.key_phrases,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error storing sentiment:", insertError);
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-sentiment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});