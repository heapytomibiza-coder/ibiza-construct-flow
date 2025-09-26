import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper functions
function createMicroCategoryId(serviceType: string, category: string, subcategory: string): string {
  return `${serviceType}-${category}-${subcategory}`.toLowerCase().replace(/\s+/g, '-');
}

function validateQuestions(questions: any): boolean {
  if (!Array.isArray(questions) || questions.length < 3) return false;
  
  return questions.every(q => 
    q.id && 
    q.label && 
    q.type && 
    typeof q.required === 'boolean' &&
    Array.isArray(q.options) && 
    q.options.length >= 2
  );
}

async function getMinimalFallback(serviceType: string): Promise<any[]> {
  return [
    {
      id: "description",
      type: "text",
      label: `Describe your ${serviceType} needs`,
      required: true,
      options: []
    },
    {
      id: "timeline",
      type: "radio",
      label: "When do you need this completed?",
      required: true,
      options: ["ASAP", "Within 1 week", "Within 1 month", "Flexible"]
    },
    {
      id: "budget",
      type: "radio", 
      label: "What's your budget range?",
      required: false,
      options: ["Under €100", "€100-€500", "€500-€1000", "€1000+"]
    }
  ];
}

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

    const microCategoryId = createMicroCategoryId(serviceType, category, subcategory);
    console.log("Processing questions for micro category:", microCategoryId);

    // 1. Try to load from snapshot first (instant response)
    const { data: snapshot } = await supabase
      .from('micro_questions_snapshot')
      .select('questions_json')
      .eq('micro_category_id', microCategoryId)
      .single();

    if (snapshot) {
      console.log("Returning questions from snapshot");
      return new Response(JSON.stringify({ 
        questions: snapshot.questions_json,
        source: 'snapshot'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. No snapshot exists - try AI generation with timeout
    console.log("No snapshot found, attempting AI generation");

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      console.log("LOVABLE_API_KEY not configured, returning minimal fallback");
      const fallbackQuestions = await getMinimalFallback(serviceType);
      return new Response(JSON.stringify({ 
        questions: fallbackQuestions,
        source: 'minimal_fallback'
      }), {
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

    console.log("Attempting AI generation for:", { serviceType, category, subcategory });

    // 3. Try AI generation with 8-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    let aiQuestions;
    try {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
        signal: controller.signal,
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
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

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI Gateway error:", response.status, errorText);
        throw new Error(`AI Gateway error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content;

      if (!aiResponse) {
        console.error("No response from AI", data);
        throw new Error("No response from AI");
      }

      // Parse the JSON response from AI
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
      aiQuestions = JSON.parse(jsonString);

      // Validate questions
      if (!validateQuestions(aiQuestions)) {
        throw new Error("Invalid AI questions format");
      }

      console.log("AI generated valid questions:", aiQuestions.length);

      // 4. Save successful AI response to snapshot
      await supabase
        .from('micro_questions_snapshot')
        .upsert({
          micro_category_id: microCategoryId,
          questions_json: aiQuestions,
          version: 1,
          schema_rev: 1
        });

      // Log successful AI run
      await supabase
        .from('micro_questions_ai_runs')
        .insert({
          micro_category_id: microCategoryId,
          prompt_hash: `${serviceType}-${category}-${subcategory}`,
          model: "google/gemini-2.5-flash",
          raw_response: aiQuestions,
          status: 'success'
        });

      console.log("AI questions saved to snapshot");
      
      return new Response(JSON.stringify({ 
        questions: aiQuestions,
        source: 'ai_generated'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } catch (aiError) {
      clearTimeout(timeoutId);
      console.error("AI generation failed:", aiError);
      
      // Log failed AI run
      await supabase
        .from('micro_questions_ai_runs')
        .insert({
          micro_category_id: microCategoryId,
          prompt_hash: `${serviceType}-${category}-${subcategory}`,
          model: "google/gemini-2.5-flash",
          raw_response: null,
          status: 'failed',
          error: String(aiError)
        });

      // 5. Return minimal fallback questions
      console.log("Returning minimal fallback questions");
      const fallbackQuestions = await getMinimalFallback(serviceType);
      
      return new Response(JSON.stringify({ 
        questions: fallbackQuestions,
        source: 'minimal_fallback'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error generating questions:", error);
    
    // Last resort fallback
    try {
      const { serviceType } = await req.json();
      const fallbackQuestions = await getMinimalFallback(serviceType || 'service');
      
      return new Response(JSON.stringify({ 
        questions: fallbackQuestions,
        source: 'error_fallback'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch {
      return new Response(JSON.stringify({ 
        error: "Internal server error", 
        fallback: true 
      }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }
});