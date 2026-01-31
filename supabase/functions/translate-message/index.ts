import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
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
const translateSchema = z.object({
  text: z.string().trim().min(1).max(5000), // Cap at 5k chars
  sourceLang: z.string().max(10).optional(),
  targetLang: z.string().min(2).max(10),
});

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createServiceClient();
    
    // Rate limiting - AI_STANDARD (20/hr)
    const clientId = getClientIdentifier(req);
    const rateLimitResult = await checkRateLimitDb(supabase, clientId, 'translate-message', 'AI_STANDARD');
    
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult.retryAfter);
    }

    const { text, sourceLang, targetLang } = await validateRequestBody(req, translateSchema);

    // Use Lovable AI for translation
    const lovableAiUrl = 'https://ai.gateway.lovable.dev/v1/chat/completions';
    const lovableAiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableAiKey) {
      console.error('Lovable AI credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Translation service not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create translation prompt
    const translationPrompt = `Translate the following text from ${sourceLang || 'detected language'} to ${targetLang}. 
Only provide the translation, no explanations or additional text.

Text to translate:
${text}`;

    const response = await fetch(lovableAiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${lovableAiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: translationPrompt,
          },
        ],
        temperature: 0.3, // Low temperature for consistent translations
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.error('Lovable AI error:', response.status);
      throw new Error('Translation request failed');
    }

    const data = await response.json();
    const translatedText = data.choices?.[0]?.message?.content?.trim();

    if (!translatedText) {
      throw new Error('No translation received');
    }

    return new Response(
      JSON.stringify({
        translatedText,
        sourceLang: sourceLang || 'auto',
        targetLang,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    logError('translate-message', error as Error);
    return createErrorResponse(error as Error);
  }
});
