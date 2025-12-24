import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { validateRequestBody } from '../_shared/inputValidation.ts';
import { createErrorResponse, logError } from '../_shared/errorMapping.ts';
import { checkRateLimitDb, createRateLimitResponse, getClientIdentifier, createServiceClient, corsHeaders, handleCors } from '../_shared/securityMiddleware.ts';

const requestSchema = z.object({
  context: z.object({
    searchTerm: z.string().max(200).optional(),
    location: z.string().max(200).optional(),
    userHistory: z.array(z.any()).optional(),
    availableServices: z.array(z.any()).default([]),
    availableProfessionals: z.array(z.any()).default([]),
    timeOfDay: z.number().int().min(0).max(23).default(12),
    dayOfWeek: z.number().int().min(0).max(6).default(0),
  }),
});

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createServiceClient();

    // Rate limiting - AI_STANDARD (20/hr)
    const clientId = getClientIdentifier(req);
    const rateLimit = await checkRateLimitDb(supabase, clientId, 'ai-smart-recommendations', 'AI_STANDARD');
    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit.retryAfter);
    }

    const { context } = await validateRequestBody(req, requestSchema);

    // Create AI prompt for recommendations
    const systemPrompt = `You are an AI recommendation engine for CS Ibiza Elite Network marketplace. Generate smart, personalized recommendations based on user context.

CONTEXT:
- Search term: ${context.searchTerm || 'None'}
- Location: ${context.location || 'Unknown'}
- Time: ${context.timeOfDay}:00 (0-23 hour format)
- Day: ${context.dayOfWeek} (0=Sunday, 6=Saturday)
- User history: ${context.userHistory?.length || 0} past interactions

AVAILABLE OPTIONS:
Services (${(context.availableServices || []).length}): ${(context.availableServices || []).map((s: any) => `${s.title} (${s.category})`).join(', ')}
Professionals (${(context.availableProfessionals || []).length}): ${(context.availableProfessionals || []).map((p: any) => `${p.full_name} (€${p.hourly_rate || 50}/hr)`).join(', ')}

Generate exactly 4 recommendations. Return as JSON array with:
{
  "recommendations": [
    {
      "id": "unique_id",
      "type": "service" | "professional",
      "item": {original_item_object},
      "score": 0.0-1.0,
      "reason": "brief_explanation",
      "confidence": 0.0-1.0
    }
  ]
}`;

    // Call AI for intelligent recommendations
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Generate 4 smart recommendations based on the context provided.' }
        ],
        max_tokens: 2000,
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const assistantMessage = aiData.choices[0]?.message?.content || '';

    // Parse AI response
    let recommendations;
    try {
      const parsed = JSON.parse(assistantMessage);
      recommendations = parsed.recommendations || [];
    } catch (parseError) {
      console.error('Failed to parse AI recommendations:', parseError);
      recommendations = generateFallbackRecommendations(context);
    }

    // Ensure recommendations have required fields
    const validRecommendations = recommendations
      .filter((rec: any) => rec.item && (rec.type === 'service' || rec.type === 'professional'))
      .slice(0, 4)
      .map((rec: any, index: number) => ({
        ...rec,
        id: rec.id || `rec_${index}`,
        score: Math.min(Math.max(rec.score || 0.5, 0), 1),
        confidence: Math.min(Math.max(rec.confidence || 0.5, 0), 1),
        reason: rec.reason || 'Recommended for you'
      }));

    return new Response(
      JSON.stringify({ recommendations: validRecommendations }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    logError('ai-smart-recommendations', error as Error);
    return createErrorResponse(error as Error);
  }
});

interface Recommendation {
  id: string;
  type: 'service' | 'professional';
  item: any;
  score: number;
  reason: string;
  confidence: number;
}

function generateFallbackRecommendations(context: any): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const { availableServices = [], availableProfessionals = [], timeOfDay = 12, searchTerm = '' } = context;

  // Search-based recommendations
  if (searchTerm) {
    const searchMatches = availableServices.filter((service: any) => 
      service.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category?.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 2);

    searchMatches.forEach((service: any, index: number) => {
      recommendations.push({
        id: `search_${index}`,
        type: 'service',
        item: service,
        score: 0.9 - (index * 0.1),
        reason: 'Matches your search',
        confidence: 0.85
      });
    });
  }

  // Add popular professionals
  const topProfessionals = availableProfessionals
    .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 2);

  topProfessionals.forEach((professional: any, index: number) => {
    recommendations.push({
      id: `top_pro_${index}`,
      type: 'professional',
      item: professional,
      score: 0.8 - (index * 0.1),
      reason: 'Highly rated professional',
      confidence: 0.75
    });
  });

  // Fill remaining slots
  while (recommendations.length < 4 && availableServices.length > 0) {
    const remainingServices = availableServices.filter((service: any) =>
      !recommendations.some(rec => rec.type === 'service' && rec.item.id === service.id)
    );

    if (remainingServices.length === 0) break;

    const service = remainingServices[0];
    recommendations.push({
      id: `fill_${recommendations.length}`,
      type: 'service',
      item: service,
      score: 0.6,
      reason: 'Popular service in Ibiza',
      confidence: 0.6
    });
  }

  return recommendations.slice(0, 4);
}
