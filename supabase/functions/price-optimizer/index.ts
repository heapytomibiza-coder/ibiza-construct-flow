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

    const { serviceType, professionalId, jobDetails } = await req.json();

    console.log(`Optimizing price for ${serviceType}`);

    const startTime = Date.now();

    // Get market data
    const { data: similarJobs } = await supabase
      .from('jobs')
      .select('budget_value, status, created_at')
      .eq('micro_id', serviceType)
      .eq('status', 'complete')
      .order('created_at', { ascending: false })
      .limit(50);

    // Get professional's stats
    const { data: professionalStats } = await supabase
      .from('professional_stats')
      .select('*')
      .eq('professional_id', professionalId)
      .single();

    // Use Lovable AI for price optimization
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: 'You are a pricing optimization expert. Analyze market data, professional stats, and job details to suggest optimal pricing.'
          },
          {
            role: 'user',
            content: `Market data: ${JSON.stringify(similarJobs?.slice(0, 10))}\n\nProfessional stats: ${JSON.stringify(professionalStats)}\n\nJob details: ${JSON.stringify(jobDetails)}\n\nReturn as JSON: {"suggestedPrice": 150, "priceRange": {"min": 120, "max": 180}, "confidence": 0.85, "reasoning": "...", "factors": ["factor1", "factor2"]}`
          }
        ],
      }),
    });

    const data = await response.json();
    const optimization = JSON.parse(data.choices[0].message.content);

    // Store predictive insight
    await supabase.from('predictive_insights').insert({
      insight_type: 'price_optimization',
      entity_type: 'professional',
      entity_id: professionalId,
      prediction_value: optimization.suggestedPrice,
      prediction_data: optimization,
      confidence_score: optimization.confidence,
      factors: optimization.factors,
      valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    });

    const executionTime = Date.now() - startTime;

    // Log automation
    await supabase.from('ai_automation_logs').insert({
      automation_type: 'price_optimization',
      entity_type: 'professional',
      entity_id: professionalId,
      action_taken: `Suggested price: ${optimization.suggestedPrice}`,
      input_data: { serviceType, jobDetails },
      output_data: optimization,
      success: true,
      execution_time_ms: executionTime,
    });

    console.log(`Price optimization completed in ${executionTime}ms: $${optimization.suggestedPrice}`);

    return new Response(
      JSON.stringify({
        success: true,
        suggestedPrice: optimization.suggestedPrice,
        priceRange: optimization.priceRange,
        confidence: optimization.confidence,
        reasoning: optimization.reasoning,
        factors: optimization.factors,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error optimizing price:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});