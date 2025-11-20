import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data: { user } } = await supabase.auth.getUser(
      req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
    );

    if (!user) {
      throw new Error('Unauthorized');
    }

    const { userId, jobId, recommendationType } = await req.json();

    console.log(`Generating ${recommendationType} recommendations for user: ${userId}`);

    const startTime = Date.now();

    // Get user context
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('*, user_roles(role)')
      .eq('id', userId)
      .single();

    let recommendations: any[] = [];

    if (recommendationType === 'professional_match' && jobId) {
      // Get job details
      const { data: job } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      // Get professionals with relevant skills
      const { data: professionals } = await supabase
        .from('professional_profiles')
        .select('*, profiles(*)')
        .eq('is_active', true)
        .limit(50);

      // Use Lovable AI to score matches
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: 'You are an expert matchmaking system. Analyze job requirements and professional profiles to provide match scores and reasoning.'
            },
            {
              role: 'user',
              content: `Job: ${JSON.stringify(job)}\n\nProfessionals: ${JSON.stringify(professionals?.slice(0, 10))}\n\nFor each professional, provide a match score (0-1) and reasoning. Return as JSON array: [{"professionalId": "uuid", "score": 0.85, "reasoning": "..."}]`
            }
          ],
        }),
      });

      const aiData = await aiResponse.json();
      const matches = JSON.parse(aiData.choices[0].message.content);

      // Store match scores
      for (const match of matches) {
        await supabase.from('professional_match_scores').insert({
          job_id: jobId,
          professional_id: match.professionalId,
          match_score: match.score,
          reasoning: match.reasoning,
          match_factors: match.factors || {},
        });

        recommendations.push({
          professional_id: match.professionalId,
          score: match.score,
          reasoning: match.reasoning,
        });
      }
    } else if (recommendationType === 'service_suggestions') {
      // Get user history
      const { data: userJobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('client_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: 'You are a service recommendation expert. Analyze user history and suggest relevant services they might need.'
            },
            {
              role: 'user',
              content: `User history: ${JSON.stringify(userJobs)}\n\nSuggest 5 relevant services with reasoning. Return as JSON: [{"service": "...", "reasoning": "...", "priority": "high|medium|low"}]`
            }
          ],
        }),
      });

      const aiData = await aiResponse.json();
      recommendations = JSON.parse(aiData.choices[0].message.content);
    }

    // Store recommendations
    for (const rec of recommendations) {
      await supabase.from('ai_recommendations').insert({
        user_id: userId,
        recommendation_type: recommendationType,
        entity_type: 'service',
        recommendation_score: rec.score || 0.8,
        title: rec.service || 'Professional Match',
        description: rec.reasoning,
        data: rec,
        reasoning: rec.reasoning,
      });
    }

    const executionTime = Date.now() - startTime;

    // Log automation
    await supabase.from('ai_automation_logs').insert({
      automation_type: 'recommendation_engine',
      entity_type: 'user',
      entity_id: userId,
      action_taken: `Generated ${recommendations.length} recommendations`,
      input_data: { recommendationType, jobId },
      output_data: { count: recommendations.length },
      success: true,
      execution_time_ms: executionTime,
    });

    console.log(`Generated ${recommendations.length} recommendations in ${executionTime}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        recommendations,
        count: recommendations.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error generating recommendations:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});