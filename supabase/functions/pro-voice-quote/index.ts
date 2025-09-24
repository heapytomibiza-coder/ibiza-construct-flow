import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting voice to quote processing...');
    
    const { audioBlob, serviceCategory, professionalId } = await req.json();
    
    if (!audioBlob || !serviceCategory) {
      throw new Error('Audio data and service category are required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Log the AI run
    const { data: aiRun } = await supabase
      .from('ai_runs')
      .insert({
        operation_type: 'voice_to_quote',
        input_data: { serviceCategory, professionalId },
        status: 'running',
        user_id: professionalId
      })
      .select()
      .single();

    console.log('AI run logged:', aiRun?.id);

    // Get AI API key
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not found');
    }

    // Convert audio to text (simulated - would use actual speech-to-text API)
    // For now, we'll simulate with common voice inputs
    const simulatedTranscription = getSimulatedTranscription(serviceCategory);
    
    console.log('Transcription:', simulatedTranscription);

    // Get service context for better AI understanding
    const { data: serviceData } = await supabase
      .from('services_micro')
      .select('*')
      .eq('category', serviceCategory)
      .limit(5);

    // Prepare AI prompt for quote generation
    const prompt = `You are a professional service estimator. Based on this voice description, extract line items and estimate costs:

VOICE DESCRIPTION: "${simulatedTranscription}"
SERVICE CATEGORY: ${serviceCategory}

CONTEXT: Available services in this category:
${serviceData?.map(s => `- ${s.micro}: ${s.category} > ${s.subcategory}`).join('\n') || 'No specific services found'}

TASK: Generate a detailed quote breakdown in JSON format:
{
  "lineItems": [
    {
      "name": "Item name",
      "description": "Brief description", 
      "quantity": 1,
      "unit": "hour/item/sqm",
      "unitPrice": 50,
      "totalPrice": 50
    }
  ],
  "subtotal": 0,
  "total": 0,
  "notes": "Any additional notes or assumptions",
  "missingInfo": ["What additional info needed?"],
  "timeEstimate": "2-3 hours",
  "confidence": 85
}

Extract realistic pricing based on the description. If information is unclear, note what's missing.`;

    console.log('Sending request to AI gateway...');

    // Call AI gateway
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a professional service estimator. Always respond with valid JSON only.'
          },
          {
            role: 'user', 
            content: prompt
          }
        ],
        max_completion_tokens: 1000
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${aiResponse.status} ${errorText}`);
    }

    const aiResult = await aiResponse.json();
    const aiContent = aiResult.choices[0].message.content;

    console.log('AI response received:', aiContent);

    // Parse the AI response
    let quoteData;
    try {
      quoteData = JSON.parse(aiContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback response
      quoteData = {
        lineItems: [{
          name: "Service Consultation",
          description: "Initial assessment and basic service",
          quantity: 1,
          unit: "hour",
          unitPrice: 75,
          totalPrice: 75
        }],
        subtotal: 75,
        total: 75,
        notes: "Basic quote generated - please clarify requirements",
        missingInfo: ["Specific requirements", "Timeline", "Site conditions"],
        timeEstimate: "1-2 hours",
        confidence: 50
      };
    }

    // Update AI run with results
    await supabase
      .from('ai_runs')
      .update({
        status: 'completed',
        output_data: quoteData,
        completed_at: new Date().toISOString(),
        confidence_score: quoteData.confidence || 50
      })
      .eq('id', aiRun?.id);

    console.log('Quote generated successfully');

    return new Response(JSON.stringify({
      success: true,
      transcription: simulatedTranscription,
      quote: quoteData,
      aiRunId: aiRun?.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in voice-to-quote function:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getSimulatedTranscription(category: string): string {
  const simulations = {
    'Home Improvement': 'I need to install a new kitchen backsplash, about 15 square meters, ceramic tiles with grout. Also need to remove the old tiles first.',
    'Maintenance': 'There is a leak in the bathroom pipe behind the wall. Water is coming through and I think we need to open the wall to fix it properly.',
    'Cleaning': 'Deep clean for a 3 bedroom house, including all bathrooms, kitchen, and living areas. Need it done before weekend guests arrive.',
    'Outdoor': 'Looking to build a small deck in the backyard, maybe 4 by 3 meters, with basic railing and steps.',
    'Technology': 'Need help setting up a home network with WiFi coverage for whole house and connecting smart TV and devices.',
  };
  
  return simulations[category] || 'I need some general service work done, please provide an estimate for typical work in this category.';
}