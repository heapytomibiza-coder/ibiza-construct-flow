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

    const { content, contentType, contentId } = await req.json();

    if (!content || !contentType || !contentId) {
      throw new Error('Missing required fields');
    }

    console.log(`Categorizing ${contentType}: ${contentId}`);

    const startTime = Date.now();

    // Get available categories (mock for now)
    const availableCategories = [
      'plumbing', 'electrical', 'carpentry', 'painting', 'cleaning',
      'landscaping', 'roofing', 'hvac', 'general_maintenance', 'renovation'
    ];

    // Use Lovable AI for categorization
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
            content: 'You are a categorization expert. Analyze content and assign the most relevant category with confidence score and reasoning.'
          },
          {
            role: 'user',
            content: `Content: "${content}"\n\nAvailable categories: ${availableCategories.join(', ')}\n\nReturn as JSON: {"category": "...", "confidence": 0.95, "reasoning": "...", "secondaryCategories": ["...", "..."]}`
          }
        ],
      }),
    });

    const data = await response.json();
    const categorization = JSON.parse(data.choices[0].message.content);

    // Update content with category (example for jobs)
    if (contentType === 'job') {
      await supabase
        .from('jobs')
        .update({
          // Store in metadata or custom field
          metadata: {
            ai_category: categorization.category,
            ai_confidence: categorization.confidence,
          }
        })
        .eq('id', contentId);
    }

    const executionTime = Date.now() - startTime;

    // Log automation
    await supabase.from('ai_automation_logs').insert({
      automation_type: 'smart_categorization',
      entity_type: contentType,
      entity_id: contentId,
      action_taken: `Categorized as: ${categorization.category}`,
      input_data: { contentLength: content.length },
      output_data: categorization,
      success: true,
      execution_time_ms: executionTime,
    });

    console.log(`Categorization completed in ${executionTime}ms: ${categorization.category}`);

    return new Response(
      JSON.stringify({
        success: true,
        category: categorization.category,
        confidence: categorization.confidence,
        reasoning: categorization.reasoning,
        secondaryCategories: categorization.secondaryCategories,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error categorizing content:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});