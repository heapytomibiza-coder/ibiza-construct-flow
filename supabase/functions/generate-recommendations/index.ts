import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { serverClient } from "../_shared/client.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = serverClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { userId, userType } = await req.json();

    // Fetch user context based on type
    let context: any = {};
    
    if (userType === 'professional') {
      const { data: profile } = await supabase
        .from('professional_profiles')
        .select('*, professional_services(micro_service_id)')
        .eq('user_id', userId)
        .single();
      
      const { data: stats } = await supabase
        .from('professional_stats')
        .select('*')
        .eq('professional_id', userId)
        .single();
      
      context = { profile, stats };
    } else {
      const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('client_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);
      
      context = { jobs };
    }

    // Generate recommendations using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const prompt = userType === 'professional' 
      ? `Based on this professional's profile and stats: ${JSON.stringify(context)}, generate 3-5 actionable recommendations to improve their business. Focus on service optimization, pricing strategy, and client acquisition. Return as JSON array with: {title, description, priority, actionUrl}`
      : `Based on this client's job history: ${JSON.stringify(context)}, generate 3-5 helpful recommendations for their next projects. Focus on service selection, budget optimization, and timing. Return as JSON array with: {title, description, priority, actionUrl}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a business advisor. Return recommendations as valid JSON array only.' },
          { role: 'user', content: prompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "create_recommendations",
            description: "Create recommendations for the user",
            parameters: {
              type: "object",
              properties: {
                recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      priority: { type: "string", enum: ["low", "medium", "high"] },
                      actionUrl: { type: "string" }
                    },
                    required: ["title", "description", "priority"],
                    additionalProperties: false
                  }
                }
              },
              required: ["recommendations"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "create_recommendations" } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      throw new Error('Failed to generate recommendations');
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    const recommendations = JSON.parse(toolCall?.function?.arguments || '{"recommendations":[]}').recommendations;

    // Store recommendations in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    for (const rec of recommendations) {
      await supabase.from('ai_recommendations').insert({
        user_id: userId,
        recommendation_type: userType === 'professional' ? 'business_growth' : 'project_planning',
        title: rec.title,
        description: rec.description,
        priority: rec.priority,
        data: { actionUrl: rec.actionUrl },
        confidence_score: 0.85,
        expires_at: expiresAt.toISOString()
      });
    }

    return new Response(
      JSON.stringify({ success: true, recommendations }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});