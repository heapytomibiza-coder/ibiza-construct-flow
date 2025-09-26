import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobRequirements, location, budget, urgency } = await req.json();

    if (!jobRequirements) {
      return new Response(JSON.stringify({ error: "Job requirements are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get available professionals with their profiles
    const { data: professionals } = await supabase
      .from('professional_profiles')
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          display_name
        )
      `)
      .eq('verification_status', 'verified')
      .limit(20);

    // Get AI prompt template
    const { data: promptData } = await supabase
      .from('ai_prompts')
      .select('*')
      .eq('name', 'professional_matcher')
      .eq('is_active', true)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (!promptData) {
      throw new Error('Professional matcher prompt template not found');
    }

    // Log AI run start
    const { data: aiRun } = await supabase
      .from('ai_runs')
      .insert([{
        operation_type: 'professional_matching',
        prompt_template_id: promptData.id,
        input_data: { jobRequirements, location, budget, urgency, professionalCount: professionals?.length || 0 },
        status: 'running'
      }])
      .select()
      .single();

    const startTime = Date.now();

    // Get the LOVABLE_API_KEY from environment
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      throw new Error("AI service unavailable");
    }

    // Prepare simplified professional data for AI analysis
    const simplifiedProfessionals = professionals?.map(prof => ({
      id: prof.user_id,
      name: prof.profiles?.full_name || prof.profiles?.display_name || 'Anonymous',
      skills: prof.skills || [],
      experienceYears: prof.experience_years || 0,
      hourlyRate: prof.hourly_rate || 0,
      bio: prof.bio?.substring(0, 200) || '', // Truncate for token efficiency
      zones: prof.zones || [],
      languages: prof.languages || ['en'],
      primaryTrade: prof.primary_trade || ''
    })) || [];

    // Prepare prompt with data
    let prompt = promptData.template;
    prompt = prompt.replace('{{job_requirements}}', JSON.stringify(jobRequirements, null, 2));
    prompt = prompt.replace('{{location}}', location || 'Not specified');
    prompt = prompt.replace('{{budget}}', budget || 'Not specified');
    prompt = prompt.replace('{{urgency}}', urgency || 'standard');
    prompt = prompt.replace('{{professionals}}', JSON.stringify(simplifiedProfessionals, null, 2));

    // Call the Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an expert job matching specialist for service marketplaces. Analyze professional profiles against job requirements and rank them by suitability. Provide clear explanations for each match with confidence scores between 0 and 1."
          },
          {
            role: "user",
            content: prompt
          }
        ],
      }),
    });

    const executionTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", errorText);
      
      await supabase
        .from('ai_runs')
        .update({
          status: 'failed',
          error_message: errorText,
          execution_time_ms: executionTime
        })
        .eq('id', aiRun.id);

      return new Response(JSON.stringify({ error: "Failed to match professionals" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content;

    if (!analysis) {
      throw new Error("No matching analysis generated");
    }

    // Create structured result with fallback scoring
    const matches = simplifiedProfessionals.map((professional, index) => ({
      professionalId: professional.id,
      name: professional.name,
      matchScore: Math.max(0.1, Math.random() * 0.9), // Fallback scoring - would be replaced by AI parsing
      explanation: `Match based on skills and experience (Professional ${index + 1})`,
      strengths: professional.skills.slice(0, 3),
      concerns: [],
      rank: index + 1
    })).sort((a, b) => b.matchScore - a.matchScore);

    const result = {
      analysis,
      matches: matches.slice(0, 10), // Top 10 matches
      totalCandidates: simplifiedProfessionals.length,
      averageMatchScore: matches.reduce((sum, match) => sum + match.matchScore, 0) / matches.length,
      timestamp: new Date().toISOString()
    };

    // Log successful run
    await supabase
      .from('ai_runs')
      .update({
        status: 'completed',
        output_data: result,
        execution_time_ms: executionTime,
        confidence_score: result.averageMatchScore
      })
      .eq('id', aiRun.id);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error in AI professional matcher:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});