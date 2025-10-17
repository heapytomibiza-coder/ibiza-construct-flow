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
    const { microNames, category, subcategory } = await req.json();

    if (!microNames || !Array.isArray(microNames) || microNames.length === 0) {
      return new Response(JSON.stringify({ error: "microNames array is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build context about all selected services
    const servicesContext = microNames.length === 1 
      ? `the service: "${microNames[0]}"`
      : `multiple services: ${microNames.map(n => `"${n}"`).join(", ")}`;

    const prompt = `You are an expert project consultant for building and renovation services in Ibiza, Spain.

A client has selected ${servicesContext} under the category "${category}" > "${subcategory}".

Generate 8-12 highly specific, contextual questions that will help professionals understand the COMPLETE scope of this project. Your questions should:

1. **Address the combination of services** - Ask questions that consider how these services work together or affect each other
2. **Uncover project scope** - Understand the full picture, not just individual services
3. **Identify dependencies** - Ask about timing, sequencing, and coordination between different trades
4. **Be Ibiza-specific** - Consider local regulations, climate challenges (salt air, humidity), and property types common in Ibiza
5. **Get technical details** - Ask specific questions that professionals need for accurate quotes
6. **Understand existing conditions** - Property age, current state, access constraints
7. **Clarify expectations** - Quality standards, timeline flexibility, budget awareness

Question types to use:
- "radio": For yes/no or exclusive single choices
- "checkbox": For multiple selections (2-5 options)
- "textarea": For detailed descriptions
- "text": For short text inputs

Return ONLY a valid JSON array with this structure:
[
  {
    "id": "descriptive_id",
    "type": "radio|checkbox|textarea|text",
    "label": "Clear, specific question",
    "required": true|false,
    "options": ["option1", "option2"] // only for radio/checkbox types
  }
]

Focus on questions that give professionals a complete, clear picture of the project scope and requirements.`;

    console.log("Generating contextual questions for:", microNames);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: "You are an expert building services consultant in Ibiza. Generate contextual, technical questions that help professionals understand complete project scope. Always return valid JSON arrays."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please contact support." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      console.error("No response from AI");
      throw new Error("No response from AI");
    }

    // Extract JSON from response (AI might wrap it in markdown code blocks)
    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
    const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
    const questions = JSON.parse(jsonString);

    // Validate structure
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Invalid questions format from AI");
    }

    console.log(`Generated ${questions.length} contextual questions`);

    return new Response(JSON.stringify({ 
      questions,
      source: 'ai_contextual'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error generating contextual questions:", error);
    
    // Return fallback questions
    const fallbackQuestions = [
      {
        id: 'project_description',
        type: 'textarea',
        label: 'Please describe your project in detail',
        required: true
      },
      {
        id: 'property_type',
        type: 'radio',
        label: 'What type of property is this for?',
        required: true,
        options: ['House', 'Apartment', 'Villa', 'Commercial', 'Other']
      },
      {
        id: 'timeline',
        type: 'radio',
        label: 'When do you need this completed?',
        required: true,
        options: ['ASAP', 'Within 1 week', 'Within 1 month', 'Flexible']
      },
      {
        id: 'existing_conditions',
        type: 'textarea',
        label: 'Describe any existing conditions or issues we should know about',
        required: false
      },
      {
        id: 'budget_awareness',
        type: 'radio',
        label: 'Do you have a budget range in mind?',
        required: false,
        options: ['Under €1,000', '€1,000-€5,000', '€5,000-€15,000', 'Over €15,000', 'Need quote first']
      }
    ];

    return new Response(JSON.stringify({ 
      questions: fallbackQuestions,
      source: 'fallback',
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
