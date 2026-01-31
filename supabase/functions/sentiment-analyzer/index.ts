import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
const sentimentSchema = z.object({
  textContent: z.string().trim().min(1).max(5000), // Cap at 5k chars
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
    const rateLimitResult = await checkRateLimitDb(supabase, clientId, 'sentiment-analyzer', 'AI_STANDARD');
    
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult.retryAfter);
    }

    const { textContent, entityType, entityId } = await validateRequestBody(req, sentimentSchema);

    console.log(`Analyzing sentiment for ${entityType}: ${entityId}`);

    const startTime = Date.now();

    // Use Lovable AI for sentiment analysis
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('AI service unavailable');
    }

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

    if (!response.ok) {
      console.error('AI Gateway error:', response.status);
      throw new Error('Sentiment analysis failed');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch {
      // Fallback if AI returns non-JSON
      analysis = {
        sentiment: 'neutral',
        confidence: 0.5,
        scores: { positive: 0.33, negative: 0.33, neutral: 0.34 },
        keyPhrases: []
      };
    }

    // Store sentiment analysis
    const { data: sentimentRecord, error } = await supabase
      .from('sentiment_analysis')
      .insert({
        entity_type: entityType,
        entity_id: entityId,
        text_content: textContent.substring(0, 1000), // Store truncated version
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
        id: sentimentRecord?.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    logError('sentiment-analyzer', error as Error);
    return createErrorResponse(error as Error);
  }
});
