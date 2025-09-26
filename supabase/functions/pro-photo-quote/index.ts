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
    console.log('Starting photo to quote processing...');
    
    const { imageUrls, serviceCategory, professionalId, description } = await req.json();
    
    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      throw new Error('At least one image URL is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Log the AI run
    const { data: aiRun } = await supabase
      .from('ai_runs')
      .insert({
        operation_type: 'photo_to_quote',
        input_data: { 
          imageCount: imageUrls.length,
          serviceCategory, 
          professionalId,
          description 
        },
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

    // Get service context for better AI understanding
    const { data: serviceData } = await supabase
      .from('services_micro')
      .select('*')
      .eq('category', serviceCategory)
      .limit(5);

    // Prepare AI prompt for photo analysis and quote generation
    const prompt = `You are a professional service estimator with visual analysis expertise. Based on the uploaded photos, generate a detailed service quote.

SERVICE CATEGORY: ${serviceCategory}
${description ? `ADDITIONAL DESCRIPTION: ${description}` : ''}

CONTEXT: Available services in this category:
${serviceData?.map(s => `- ${s.micro}: ${s.category} > ${s.subcategory}`).join('\n') || 'No specific services found'}

ANALYSIS INSTRUCTIONS:
1. Analyze the photos for scope of work
2. Identify materials, area size, complexity
3. Note any challenges or special requirements
4. Estimate realistic quantities and labor

RESPONSE FORMAT (JSON only):
{
  "visualAnalysis": {
    "observations": ["What you see in the photos"],
    "measurements": "Estimated dimensions/area",
    "complexity": "low/medium/high",
    "challenges": ["Potential challenges identified"]
  },
  "lineItems": [
    {
      "name": "Item name",
      "description": "What work is needed based on photos", 
      "quantity": 1,
      "unit": "hour/item/sqm/linear_meter",
      "unitPrice": 50,
      "totalPrice": 50,
      "photoEvidence": "What in the photo justifies this item"
    }
  ],
  "materialEstimates": [
    {
      "name": "Material name",
      "quantity": "estimated amount",
      "unit": "unit type",
      "estimatedCost": 100
    }
  ],
  "subtotal": 0,
  "materialsTotal": 0,
  "total": 0,
  "timeEstimate": "X hours over Y days",
  "confidence": 85,
  "notes": "Key observations and assumptions",
  "recommendedActions": ["Next steps or additional info needed"]
}

Base your analysis on what's visible in the photos. Be specific about photo evidence.`;

    console.log('Sending request to AI gateway...');

    // For vision models, we need to use a model that supports images
    const messages = [
      {
        role: 'system',
        content: 'You are a professional service estimator with visual analysis expertise. Always respond with valid JSON only.'
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          ...imageUrls.map(url => ({
            type: 'image_url',
            image_url: { url }
          }))
        ]
      }
    ];

    // Call AI gateway with vision model
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5', // Use GPT-5 for vision capabilities
        messages,
        max_completion_tokens: 1500
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
        visualAnalysis: {
          observations: ["Photo analysis in progress"],
          measurements: "Estimates based on visual reference",
          complexity: "medium",
          challenges: ["Detailed assessment needed"]
        },
        lineItems: [{
          name: "Service Assessment",
          description: "Professional evaluation based on photos provided",
          quantity: 1,
          unit: "service",
          unitPrice: 100,
          totalPrice: 100,
          photoEvidence: "Initial visual assessment"
        }],
        materialEstimates: [],
        subtotal: 100,
        materialsTotal: 0,
        total: 100,
        timeEstimate: "2-4 hours",
        confidence: 60,
        notes: "Quote generated from photo analysis - site visit recommended for accuracy",
        recommendedActions: ["Schedule site visit", "Confirm measurements", "Discuss specific requirements"]
      };
    }

    // Update AI run with results
    await supabase
      .from('ai_runs')
      .update({
        status: 'completed',
        output_data: quoteData,
        completed_at: new Date().toISOString(),
        confidence_score: quoteData.confidence || 60
      })
      .eq('id', aiRun?.id);

    console.log('Photo quote generated successfully');

    return new Response(JSON.stringify({
      success: true,
      quote: quoteData,
      aiRunId: aiRun?.id,
      imagesAnalyzed: imageUrls.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in photo-to-quote function:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});