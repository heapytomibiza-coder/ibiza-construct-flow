import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CalculatorInput {
  projectType: string;
  sizePreset: {
    size_min_sqm: number;
    size_max_sqm: number;
    typical_duration_days: number;
  };
  qualityTier: {
    tier_key: string;
    multiplier: number;
  };
  scopeBundles: Array<{
    base_uplift_percentage: number;
  }>;
  locationFactor?: {
    uplift_percentage: number;
  };
  adders: Array<{
    price_type: 'fixed' | 'percentage' | 'per_sqm';
    price_value: number;
  }>;
}

interface PricingBreakdown {
  labour: number;
  materials: number;
  permits: number;
  contingency: number;
  disposal: number;
}

interface PricingResult {
  subtotal: number;
  min: number;
  max: number;
  breakdown: PricingBreakdown;
  timeline: number;
  recommendations: string[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const input: CalculatorInput = await req.json();

    // Validate required inputs
    if (!input.projectType || !input.sizePreset || !input.qualityTier) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Fetch cost template
    const { data: template, error: templateError } = await supabase
      .from('calculator_cost_templates')
      .select('*')
      .eq('project_type', input.projectType)
      .eq('quality_tier', input.qualityTier.tier_key)
      .maybeSingle();

    if (templateError || !template) {
      console.error('Template fetch error:', templateError);
      return new Response(
        JSON.stringify({ error: 'Cost template not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Calculate base price
    const sizeAvg = (input.sizePreset.size_min_sqm + input.sizePreset.size_max_sqm) / 2;
    let subtotal = template.base_rate_per_sqm * sizeAvg;

    // 3. Apply tier multiplier
    subtotal *= input.qualityTier.multiplier;

    // 4. Apply bundle uplifts
    input.scopeBundles.forEach(bundle => {
      subtotal *= (1 + bundle.base_uplift_percentage / 100);
    });

    // 5. Apply adders
    input.adders.forEach(adder => {
      if (adder.price_type === 'fixed') {
        subtotal += adder.price_value;
      } else if (adder.price_type === 'percentage') {
        subtotal *= (1 + adder.price_value / 100);
      } else if (adder.price_type === 'per_sqm') {
        subtotal += adder.price_value * sizeAvg;
      }
    });

    // 6. Apply location factor
    if (input.locationFactor) {
      subtotal *= (1 + input.locationFactor.uplift_percentage / 100);
    }

    // 7. Calculate breakdown
    const breakdown: PricingBreakdown = {
      labour: subtotal * (template.labour_percentage / 100),
      materials: subtotal * (template.materials_percentage / 100),
      permits: subtotal * (template.permits_percentage / 100),
      contingency: subtotal * (template.contingency_percentage / 100),
      disposal: subtotal * (template.disposal_percentage / 100)
    };

    const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

    // 8. Generate recommendations
    const recommendations: string[] = [];
    
    // Recommend structural assessment for extensions
    if (input.projectType === 'extension' && !input.adders.some(a => a.price_type === 'fixed')) {
      recommendations.push('structural_assessment');
    }

    // Recommend underfloor heating for premium tier
    if (input.qualityTier.tier_key === 'premium' && input.adders.length === 0) {
      recommendations.push('premium_upgrades');
    }

    // Recommend extended scope if only basic selected
    if (input.scopeBundles.length === 1 && input.scopeBundles[0].base_uplift_percentage === 0) {
      recommendations.push('extended_scope_benefits');
    }

    const result: PricingResult = {
      subtotal: total,
      min: total * 0.9,
      max: total * 1.1,
      breakdown,
      timeline: input.sizePreset.typical_duration_days,
      recommendations
    };

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Calculation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
