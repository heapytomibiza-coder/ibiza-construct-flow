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

Generate 6-10 highly specific, contextual questions that will help professionals understand the COMPLETE scope of this project. 

IMPORTANT: This is a mobile-first wizard designed for EASE OF USE. Questions should be QUICK TO ANSWER with minimal typing.

Your questions MUST:
1. **Use ONLY selection-based question types** - radio or checkbox ONLY. NO text or textarea questions.
2. **Provide comprehensive options** - Give 3-6 clear options that cover most scenarios
3. **Include "Other" or "Not sure" options** - Always give users an escape option
4. **Be Ibiza-specific** - Consider local climate (salt air, humidity), property types, and regulations
5. **Get technical details** - Ask specific questions professionals need for accurate quotes
6. **Understand existing conditions** - Property age, current state, access constraints

Question types to use:
- "radio": For single-choice questions (3-6 options)
- "checkbox": For multiple selections (3-6 options)

NEVER use "text" or "textarea" types - users should only need to tap options, not type.

Return ONLY a valid JSON array with this structure:
[
  {
    "id": "descriptive_id",
    "type": "radio|checkbox",
    "label": "Clear, specific question",
    "required": true|false,
    "options": ["Option 1", "Option 2", "Option 3", "Not sure / Other"]
  }
]

Focus on questions that give professionals a complete, clear picture through easy tap-based selections.`;

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
            content: "You are an expert building services consultant in Ibiza. Generate contextual, technical questions that help professionals understand complete project scope. ONLY use radio or checkbox question types - NO text/textarea. Always return valid JSON arrays."
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
    let questions = JSON.parse(jsonString);

    // Validate structure
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Invalid questions format from AI");
    }

    // Filter out any text/textarea questions that AI might have generated anyway
    questions = questions.filter((q: any) => 
      q.type === 'radio' || q.type === 'checkbox'
    );

    // Ensure all questions have options
    questions = questions.filter((q: any) => 
      Array.isArray(q.options) && q.options.length >= 2
    );

    if (questions.length === 0) {
      throw new Error("No valid selection-based questions generated");
    }

    console.log(`Generated ${questions.length} contextual questions (selection-based only)`);

    return new Response(JSON.stringify({ 
      questions,
      source: 'ai_contextual'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error generating contextual questions:", error);
    
    // Return fallback questions - ALL selection-based, NO typing required
    const fallbackQuestions = [
      {
        id: 'property_type',
        type: 'radio',
        label: 'What type of property is this for?',
        required: true,
        options: ['House', 'Apartment', 'Villa', 'Commercial property', 'Other']
      },
      {
        id: 'project_scope',
        type: 'radio',
        label: 'How would you describe the size of this project?',
        required: true,
        options: ['Small / minor repair', 'Medium / single room or area', 'Large / multiple areas', 'Full property / major project']
      },
      {
        id: 'current_condition',
        type: 'radio',
        label: 'What is the current condition of the area?',
        required: true,
        options: ['New / empty space', 'Good condition, minor updates needed', 'Needs moderate work', 'Poor condition, major work required', 'Not sure']
      },
      {
        id: 'timeline',
        type: 'radio',
        label: 'When do you need this completed?',
        required: true,
        options: ['ASAP / Emergency', 'Within 2 weeks', 'Within 1 month', 'Within 3 months', 'Flexible timing']
      },
      {
        id: 'budget_awareness',
        type: 'radio',
        label: 'Do you have a budget range in mind?',
        required: false,
        options: ['Under €1,000', '€1,000-€5,000', '€5,000-€15,000', 'Over €15,000', 'Need quote first']
      },
      {
        id: 'access_constraints',
        type: 'radio',
        label: 'Are there any access constraints for the work?',
        required: false,
        options: ['Easy access, no issues', 'Limited parking nearby', 'Narrow entrance or stairs', 'Restricted hours / noise rules', 'Not sure']
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
