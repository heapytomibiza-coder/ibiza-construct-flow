import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { getErrorMessage } from '../_shared/errorUtils.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobId, maxResults = 10 } = await req.json();

    if (!jobId) {
      throw new Error("Job ID is required");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("*, micro_services(*)")
      .eq("id", jobId)
      .single();

    if (jobError) throw jobError;

    // Get all active professionals
    const { data: professionals, error: proError } = await supabase
      .from("professional_profiles")
      .select("*, profiles(*)")
      .eq("is_active", true)
      .eq("verification_status", "verified");

    if (proError) throw proError;

    // Use Lovable AI to analyze and match
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const prompt = `You are an AI matching system for a professional services marketplace. Analyze the job and professionals, then provide matching scores.

Job Details:
- Title: ${job.title}
- Description: ${job.description || "N/A"}
- Service Type: ${job.micro_services?.name || "N/A"}
- Budget: ${job.budget_min || 0} - ${job.budget_max || 0}
- Location: ${JSON.stringify(job.location)}

Professionals (${professionals.length} total):
${professionals.slice(0, 20).map((p: any, i: number) => `
${i + 1}. ID: ${p.user_id}
   - Business Name: ${p.business_name || "N/A"}
   - Bio: ${p.bio?.substring(0, 200) || "N/A"}
   - Years Experience: ${p.years_experience || 0}
   - Hourly Rate: ${p.hourly_rate || 0}
   - Service Areas: ${p.service_areas?.join(", ") || "N/A"}
`).join("\n")}

Analyze each professional and provide a JSON response with the following structure:
{
  "matches": [
    {
      "professional_id": "uuid",
      "match_score": 85.5,
      "match_reasons": [
        {"reason": "Strong experience match", "weight": 0.3, "score": 90},
        {"reason": "Price within budget", "weight": 0.25, "score": 85}
      ],
      "skill_match_score": 90,
      "experience_match_score": 85,
      "price_match_score": 80,
      "location_match_score": 75
    }
  ]
}

Return only the top ${maxResults} matches, sorted by match_score descending.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: "You are an AI matching system. Always respond with valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      throw new Error("AI matching failed");
    }

    const aiData = await aiResponse.json();
    const analysis = JSON.parse(aiData.choices[0].message.content);

    // Store matching results in database
    const matchRecords = analysis.matches.map((match: any) => ({
      job_id: jobId,
      professional_id: match.professional_id,
      match_score: match.match_score,
      match_reasons: match.match_reasons,
      skill_match_score: match.skill_match_score || 0,
      experience_match_score: match.experience_match_score || 0,
      availability_match_score: match.availability_match_score || 0,
      price_match_score: match.price_match_score || 0,
      location_match_score: match.location_match_score || 0,
    }));

    const { error: insertError } = await supabase
      .from("ai_matching_results")
      .upsert(matchRecords, {
        onConflict: "job_id,professional_id",
      });

    if (insertError) {
      console.error("Error storing matches:", insertError);
    }

    return new Response(JSON.stringify({ matches: analysis.matches }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in smart-match-professionals:", error);
    return new Response(
      JSON.stringify({ error: getErrorMessage(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});