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
    const { serviceType, category, subcategory, questions } = await req.json();

    if (!serviceType || !questions) {
      return new Response(JSON.stringify({ error: "Service type and questions are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize Supabase client for logging
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get AI prompt template
    const { data: promptData } = await supabase
      .from('ai_prompts')
      .select('*')
      .eq('name', 'question_logic_tester')
      .eq('is_active', true)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (!promptData) {
      throw new Error('Question tester prompt template not found');
    }

    // Log AI run start
    const { data: aiRun } = await supabase
      .from('ai_runs')
      .insert([{
        operation_type: 'question_logic_test',
        prompt_template_id: promptData.id,
        input_data: { serviceType, category, subcategory, questions },
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

    // Prepare prompt with data
    let prompt = promptData.template;
    prompt = prompt.replace('{{service_type}}', serviceType);
    prompt = prompt.replace('{{category}}', category || 'N/A');
    prompt = prompt.replace('{{subcategory}}', subcategory || 'N/A');
    prompt = prompt.replace('{{questions}}', JSON.stringify(questions, null, 2));

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
            content: "You are an expert UX researcher and service configuration specialist. Analyze question flows for logical consistency, user experience, and completeness. Provide specific, actionable recommendations."
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
      
      // Log failed run
      await supabase
        .from('ai_runs')
        .update({
          status: 'failed',
          error_message: errorText,
          execution_time_ms: executionTime
        })
        .eq('id', aiRun.id);

      return new Response(JSON.stringify({ error: "Failed to analyze questions" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content;

    if (!analysis) {
      throw new Error("No analysis generated");
    }

    // Parse analysis for structured response
    const result = {
      analysis,
      recommendations: [], // Could be enhanced to extract specific recommendations
      score: 0.8, // Could be enhanced with actual scoring logic
      issues: [], // Could be enhanced to extract specific issues
      timestamp: new Date().toISOString()
    };

    // Log successful run
    await supabase
      .from('ai_runs')
      .update({
        status: 'completed',
        output_data: result,
        execution_time_ms: executionTime,
        confidence_score: result.score
      })
      .eq('id', aiRun.id);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in AI question tester:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});