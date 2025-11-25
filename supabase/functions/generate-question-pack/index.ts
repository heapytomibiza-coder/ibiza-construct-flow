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
    const { category, subcategory, serviceName, notes } = await req.json();

    if (!category || !serviceName) {
      return new Response(
        JSON.stringify({ error: 'Category and service name are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are generating micro-service question packs for a job booking wizard.

OUTPUT FORMAT:
Return ONLY valid JSON, with this exact shape:

{
  "micro_slug": "kebab-case-service-name",
  "content": {
    "id": "generate-a-uuid",
    "category": "the-category",
    "subcategory": "optional-subcategory",
    "name": "Service Display Name",
    "slug": "service-slug",
    "i18nPrefix": "category.subcategory.slug",
    "questions": [
      {
        "key": "unique_snake_case_key",
        "type": "single",
        "i18nKey": "category.subcategory.slug.questions.unique_key.title",
        "required": true,
        "aiHint": "Brief explanation of why this question matters for scoping the job.",
        "options": [
          {
            "i18nKey": "category.subcategory.slug.questions.unique_key.options.option_value",
            "value": "option_value",
            "order": 0
          }
        ]
      }
    ],
    "question_order": ["q1_key", "q2_key"],
    "ai_prompt_template": "You are a [profession] specialising in [service]. Use the client's answers to describe [key aspects]. Produce a clear [service type] brief without mentioning logistics, dates, locations, or budget."
  }
}

CRITICAL RULES:
- Generate exactly 6-8 questions per service
- NO questions about: dates, budget, address, access, parking, contact info, timing, location
- Focus ONLY on technical + design scope: materials, performance, usage, finish level, complexity, existing conditions
- Options must be short and tile-friendly (2-5 words max per option)
- Each question should have 3-6 options
- Use "single" for radio-style questions (most common), "multi" for check-all-that-apply
- Make questions UNIQUE and specific to this exact service - no generic wording
- The aiHint should explain what the question helps determine for job scoping
- The ai_prompt_template should describe how to turn answers into a job brief
- Generate a valid UUID for the id field
- Use kebab-case for slugs and snake_case for keys
- Build i18nPrefix from category.subcategory.slug pattern
- NO trailing commas - must be valid JSON
- Options should be practical, real-world choices professionals would recognize

CURRENT SERVICE CONTEXT:
Category: ${category}
${subcategory ? `Subcategory: ${subcategory}` : ''}
Service: ${serviceName}
${notes ? `Additional Context: ${notes}` : ''}

Generate a question pack that a professional in this field would find useful for understanding exactly what work is needed.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate a question pack for: ${serviceName}` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON from the AI response
    let questionPack;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      questionPack = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("AI returned invalid JSON");
    }

    return new Response(
      JSON.stringify({ questionPack }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in generate-question-pack function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
