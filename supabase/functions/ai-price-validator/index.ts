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
    const { serviceType, location, pricingData, category, subcategory } = await req.json();

    if (!serviceType || !pricingData) {
      return new Response(JSON.stringify({ error: "Service type and pricing data are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get historical pricing data for context
    const { data: historicalData } = await supabase
      .from('pricing_hints')
      .select('*')
      .eq('service_category', category)
      .eq('service_subcategory', subcategory)
      .limit(10);

    // Get AI prompt template
    const { data: promptData } = await supabase
      .from('ai_prompts')
      .select('*')
      .eq('name', 'price_band_validator')
      .eq('is_active', true)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (!promptData) {
      throw new Error('Price validator prompt template not found');
    }

    // Log AI run start
    const { data: aiRun } = await supabase
      .from('ai_runs')
      .insert([{
        operation_type: 'price_validation',
        prompt_template_id: promptData.id,
        input_data: { serviceType, location, pricingData, historicalData },
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
    prompt = prompt.replace('{{location}}', location || 'General');
    prompt = prompt.replace('{{pricing_data}}', JSON.stringify(pricingData, null, 2));
    prompt = prompt.replace('{{historical_data}}', JSON.stringify(historicalData || [], null, 2));

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
            content: "You are an expert pricing analyst specializing in service marketplaces. Analyze pricing configurations for market alignment, competitive positioning, and profitability. Provide data-driven recommendations with confidence scores."
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

      return new Response(JSON.stringify({ error: "Failed to validate pricing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content;

    if (!analysis) {
      throw new Error("No pricing analysis generated");
    }

    // Calculate market position based on historical data
    let marketPosition = 'unknown';
    let confidenceScore = 0.5;
    
    if (historicalData && historicalData.length > 0) {
      const avgMarketPrice = historicalData.reduce((sum, item) => sum + parseFloat(item.avg_price || 0), 0) / historicalData.length;
      const proposedPrice = parseFloat(pricingData.basePrice || pricingData.price || 0);
      
      if (proposedPrice < avgMarketPrice * 0.8) {
        marketPosition = 'below_market';
      } else if (proposedPrice > avgMarketPrice * 1.2) {
        marketPosition = 'above_market';
      } else {
        marketPosition = 'market_aligned';
      }
      
      confidenceScore = Math.min(0.95, 0.6 + (historicalData.length * 0.05));
    }

    const result = {
      analysis,
      marketPosition,
      confidenceScore,
      recommendations: [], // Could be enhanced to extract specific recommendations
      priceRange: {
        min: historicalData?.[0]?.min_price || null,
        max: historicalData?.[0]?.max_price || null,
        avg: historicalData?.[0]?.avg_price || null
      },
      riskFactors: [],
      timestamp: new Date().toISOString()
    };

    // Log successful run
    await supabase
      .from('ai_runs')
      .update({
        status: 'completed',
        output_data: result,
        execution_time_ms: executionTime,
        confidence_score: confidenceScore
      })
      .eq('id', aiRun.id);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in AI price validator:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});