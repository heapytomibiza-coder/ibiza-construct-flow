import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  context: {
    searchTerm?: string;
    location?: string;
    userHistory?: any[];
    availableServices: any[];
    availableProfessionals: any[];
    timeOfDay: number;
    dayOfWeek: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { context }: RequestBody = await req.json()

    if (!context) {
      return new Response(
        JSON.stringify({ error: 'Context is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Create AI prompt for recommendations
    const systemPrompt = `You are an AI recommendation engine for CS Ibiza Elite Network marketplace. Generate smart, personalized recommendations based on user context.

CONTEXT:
- Search term: ${context.searchTerm || 'None'}
- Location: ${context.location || 'Unknown'}
- Time: ${context.timeOfDay}:00 (0-23 hour format)
- Day: ${context.dayOfWeek} (0=Sunday, 6=Saturday)
- User history: ${context.userHistory?.length || 0} past interactions

AVAILABLE OPTIONS:
Services (${context.availableServices.length}): ${context.availableServices.map(s => `${s.title} (${s.category})`).join(', ')}
Professionals (${context.availableProfessionals.length}): ${context.availableProfessionals.map(p => `${p.full_name} (€${p.hourly_rate || 50}/hr)`).join(', ')}

RECOMMENDATION LOGIC:
1. Prioritize search term matches (0.9+ score)
2. Consider time-appropriate services (morning cleaning, evening events)
3. Factor in location proximity when available
4. Weight popular/highly-rated options
5. Consider user history patterns
6. Balance services vs professionals

SCORING CRITERIA:
- Search relevance: 0.8-1.0
- Time appropriateness: 0.7-0.9
- Location match: 0.6-0.8
- Popularity/rating: 0.5-0.7
- User history match: 0.8-0.95

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
}`

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
        temperature: 0.3, // Lower temperature for more consistent recommendations
      }),
    })

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.status}`)
    }

    const aiData = await aiResponse.json()
    const assistantMessage = aiData.choices[0]?.message?.content || ''

    // Parse AI response
    let recommendations;
    try {
      const parsed = JSON.parse(assistantMessage);
      recommendations = parsed.recommendations || [];
    } catch (parseError) {
      console.error('Failed to parse AI recommendations:', parseError);
      // Fallback to rule-based recommendations
      recommendations = generateFallbackRecommendations(context);
    }

    // Ensure recommendations have required fields and valid items
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
    )

  } catch (error) {
    console.error('AI Smart Recommendations Error:', error)
    
    // Generate fallback recommendations
    const fallbackRecs = generateFallbackRecommendations(
      (await req.json().catch(() => ({}))).context || {}
    );

    return new Response(
      JSON.stringify({ 
        recommendations: fallbackRecs,
        fallback: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

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
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Time-based recommendations
  if (timeOfDay >= 8 && timeOfDay < 12) {
    // Morning services
    const morningServices = availableServices.filter((service: any) =>
      service.title.toLowerCase().includes('cleaning') ||
      service.title.toLowerCase().includes('grocery') ||
      service.title.toLowerCase().includes('dog')
    ).slice(0, 1);

    morningServices.forEach((service: any) => {
      recommendations.push({
        id: 'morning_service',
        type: 'service',
        item: service,
        score: 0.75,
        reason: 'Perfect for morning hours',
        confidence: 0.7
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

  // Fill remaining slots with popular services
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