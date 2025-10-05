import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { selections, serviceType, locale = 'en' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build prompt based on user selections
    const prompt = `Generate a professional job description in ${locale === 'es' ? 'Spanish' : 'English'} based on these selections:

Service Type: ${serviceType}
Materials: ${selections.materials?.join(', ') || 'Not specified'}
Finish: ${selections.finish || 'Not specified'}
Quantity: ${selections.quantity || 'Not specified'} ${selections.unit || ''}
Location: ${selections.location || 'Not specified'}
Timeline: ${selections.timeline || 'Not specified'}
Budget Range: ${selections.budget || 'Not specified'}

Requirements:
1. Write a clear, professional job description (3-4 sentences)
2. Include the scope of work
3. Mention materials and specifications
4. State the timeline expectations
5. Be specific and actionable
6. Return ONLY the description text, no additional formatting

Output the job description directly without any JSON wrapper or additional text.`;

    // Call Lovable AI
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
            content: 'You are a professional job description writer specializing in construction and home services. Write clear, concise descriptions that attract qualified professionals.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const description = data.choices[0].message.content.trim();

    // Also generate title if not provided
    const titleResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: `Generate a concise job title (5-8 words) for this job in ${locale === 'es' ? 'Spanish' : 'English'}: ${description}. Return ONLY the title, nothing else.`
          }
        ],
        temperature: 0.5,
        max_tokens: 50,
      }),
    });

    const titleData = await titleResponse.json();
    const title = titleData.choices[0].message.content.trim();

    return new Response(JSON.stringify({
      title,
      description,
      confidence: 0.85,
      suggestions: {
        materials: selections.materials,
        timeline: selections.timeline,
        estimatedBudget: selections.budget
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Job description generation error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate description'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
