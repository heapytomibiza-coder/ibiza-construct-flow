import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { validateRequestBody } from '../_shared/inputValidation.ts';
import { createErrorResponse, logError } from '../_shared/errorMapping.ts';
import { 
  checkRateLimitDb, 
  createRateLimitResponse, 
  getClientIdentifier,
  corsHeaders,
  handleCors,
  createServiceClient
} from '../_shared/securityMiddleware.ts';

// Strict schema with payload caps
const analyzeSchema = z.object({
  text: z.string().trim().min(1).max(5000), // Cap at 5k chars
  entityType: z.string().trim().min(1).max(100),
  entityId: z.string().uuid(),
});

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createServiceClient();
    
    // Rate limiting - AI_STANDARD (20/hr)
    const clientId = getClientIdentifier(req);
    const rateLimitResult = await checkRateLimitDb(supabase, clientId, 'analyze-sentiment', 'AI_STANDARD');
    
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult.retryAfter);
    }

    const { text, entityType, entityId } = await validateRequestBody(req, analyzeSchema);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("AI service unavailable");
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
      console.error("AI Gateway error:", aiResponse.status);
      throw new Error("AI sentiment analysis failed");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;
    
    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch {
      // Fallback if AI returns invalid JSON
      analysis = {
        sentiment_score: 0,
        sentiment_label: "neutral",
        emotions: { joy: 0, anger: 0, sadness: 0, fear: 0, surprise: 0, trust: 0 },
        key_phrases: []
      };
    }

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
    logError('analyze-sentiment', error as Error);
    return createErrorResponse(error as Error);
  }
});
