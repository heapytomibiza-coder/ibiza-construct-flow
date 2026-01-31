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

// Batch processing schema - strict limits to prevent abuse
const batchSchema = z.object({
  limit: z.number().int().min(1).max(50).optional().default(50), // Cap batch size
}).optional();

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
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createServiceClient();
    
    // Rate limiting - AI_STRICT for batch operations (10/hr) - this is expensive
    const clientId = getClientIdentifier(req);
    const rateLimitResult = await checkRateLimitDb(supabase, clientId, 'sentiment-batch', 'AI_STRICT');
    
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult.retryAfter);
    }

    // Parse optional limit parameter
    let limit = 50;
    try {
      const body = await req.json();
      if (body?.limit && typeof body.limit === 'number') {
        limit = Math.min(Math.max(body.limit, 1), 50);
      }
    } catch {
      // No body or invalid JSON - use defaults
    }

    // Get messages without sentiment analysis (limit to batch size)
    const { data: existingSentiments } = await supabase
      .from('message_sentiments')
      .select('message_id');

    const existingIds = existingSentiments?.map(s => s.message_id) || [];

    // Build query for messages without sentiment
    let query = supabase
      .from('dispute_messages')
      .select('id, message')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (existingIds.length > 0) {
      query = query.not('id', 'in', `(${existingIds.join(',')})`);
    }

    const { data: messages, error: messagesError } = await query;

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
      JSON.stringify({ success: true, processed, batchSize: limit }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    logError('sentiment-batch', error as Error);
    return createErrorResponse(error as Error);
  }
});
