import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const { contentType, input, entityId } = await req.json();

    if (!contentType || !input) {
      throw new Error("contentType and input are required");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (contentType) {
      case "job_description":
        systemPrompt = "You are an expert at writing professional job descriptions for service marketplace platforms.";
        userPrompt = `Create a compelling job description based on these details:
Service: ${input.service || "N/A"}
Budget: ${input.budget || "N/A"}
Location: ${input.location || "N/A"}
Requirements: ${input.requirements || "N/A"}
Additional details: ${input.details || "N/A"}

Write a clear, professional job description that will attract quality professionals. Include:
- Brief overview
- Specific requirements
- Scope of work
- Any special considerations`;
        break;

      case "profile_bio":
        systemPrompt = "You are an expert at writing professional bios for service professionals.";
        userPrompt = `Create a compelling professional bio based on these details:
Skills: ${input.skills?.join(", ") || "N/A"}
Experience: ${input.experience || "N/A"}
Specialties: ${input.specialties || "N/A"}
Achievements: ${input.achievements || "N/A"}

Write a professional, engaging bio (150-200 words) that highlights expertise and builds trust.`;
        break;

      case "review_response":
        systemPrompt = "You are an expert at crafting professional responses to customer reviews.";
        userPrompt = `Write a professional response to this review:
Rating: ${input.rating}/5
Review: "${input.reviewText}"
Context: ${input.context || "N/A"}

Write a ${input.rating >= 4 ? "grateful and appreciative" : "professional and solution-oriented"} response that maintains professionalism.`;
        break;

      case "message":
        systemPrompt = "You are an expert at writing professional messages for business communication.";
        userPrompt = `Write a professional message for this context:
Purpose: ${input.purpose || "N/A"}
Recipient: ${input.recipient || "professional"}
Key points: ${input.keyPoints || "N/A"}
Tone: ${input.tone || "professional and friendly"}

Write a clear, concise message.`;
        break;

      default:
        throw new Error("Invalid content type");
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      throw new Error("AI content generation failed");
    }

    const aiData = await aiResponse.json();
    const generatedContent = aiData.choices[0].message.content;

    // Store generated content
    const serviceSupabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: contentRecord, error: insertError } = await serviceSupabase
      .from("ai_generated_content")
      .insert({
        user_id: user.id,
        content_type: contentType,
        original_input: input,
        generated_content: generatedContent,
        model_used: "google/gemini-2.5-flash",
        entity_id: entityId,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error storing content:", insertError);
    }

    return new Response(
      JSON.stringify({
        content: generatedContent,
        contentId: contentRecord?.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-ai-content:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});