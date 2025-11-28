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
    const { questions } = await req.json();
    
    if (!questions || !Array.isArray(questions)) {
      return new Response(
        JSON.stringify({ error: 'Questions array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a professional service questionnaire writer for TM Direct Ibiza, a premium construction and home services platform.

Transform the provided questions into a professional "hybrid" style:
- Clear, client-friendly question text (not too long, not too casual)
- Clean, readable option tiles (short phrases, proper capitalization)
- Professional tone without being overly formal
- No slang, no abbreviations like "ASAP" (use "As soon as possible")
- Focus on clarity and professionalism

CRITICAL: Return ONLY a valid JSON array with this exact structure:
[
  {
    "key": "original_key",
    "question": "Rewritten professional question?",
    "options": ["Option 1", "Option 2", "Option 3"]
  }
]

Example transformation:
Input: "Wall size?" with options ["Small", "Med", "Big"]
Output: {
  "key": "wall_size",
  "question": "What is the approximate size of the wall?",
  "options": ["Small wall (under 10m²)", "Medium wall (10-25m²)", "Large wall (over 25m²)"]
}

Return ONLY the JSON array, no markdown formatting, no explanation.`;

    const userPrompt = `Transform these questions into professional hybrid style:\n\n${JSON.stringify(questions, null, 2)}`;

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
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
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
    let standardizedQuestions;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      standardizedQuestions = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("AI returned invalid JSON");
    }

    if (!Array.isArray(standardizedQuestions)) {
      throw new Error("AI response is not an array");
    }

    return new Response(
      JSON.stringify({ standardizedQuestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in standardize-question-tone function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
