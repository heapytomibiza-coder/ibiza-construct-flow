import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const { serviceType, category, subcategory, existingAnswers } = await req.json();

    if (!serviceType) {
      return new Response(JSON.stringify({ error: "Service type is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create context-aware prompt for question generation
    const prompt = `Generate 3-5 specific, actionable multiple choice questions for a ${serviceType} service in ${category} > ${subcategory}.

Context: ${existingAnswers ? `User has already answered: ${JSON.stringify(existingAnswers)}` : 'This is the initial set of questions.'}

Requirements:
1. Questions should be specific to this exact service type
2. Each question should have 3-5 realistic options
3. Focus on details that affect pricing, timeline, and professional requirements
4. Avoid generic questions - be service-specific
5. Include technical specifications, materials, scope, or complexity as relevant

Return a JSON array with this exact structure:
[
  {
    "id": "unique_question_id",
    "type": "radio",
    "label": "Question text?",
    "required": true,
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"]
  }
]

Focus on questions that help professionals:
- Understand the scope and complexity
- Estimate time and materials needed
- Determine if they have the right expertise
- Quote accurately and competitively`;

    console.log("Generating questions for:", { serviceType, category, subcategory });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "system",
            content: "You are an expert at generating contextual, professional service questions. Always return valid JSON arrays with the exact structure requested. Be specific and actionable.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI Gateway error:", await response.text());
      return new Response(JSON.stringify({ error: "Failed to generate questions" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      console.error("No response from AI", data);
      return new Response(JSON.stringify({ error: "No response from AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse the JSON response from AI
    let questions;
    try {
      // Extract JSON from response (in case AI wraps it in markdown)
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
      questions = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError, aiResponse);
      return new Response(JSON.stringify({ error: "Invalid AI response format" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Generated questions:", questions);

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating questions:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});