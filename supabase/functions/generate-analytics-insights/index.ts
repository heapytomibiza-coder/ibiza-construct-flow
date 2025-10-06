import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('[Insights] Fetching analytics data...');

    // Fetch recent metrics for analysis
    const { data: profMetrics } = await supabase
      .from('professional_performance_metrics')
      .select('*')
      .order('calculated_at', { ascending: false })
      .limit(100);

    const { data: clientAnalytics } = await supabase
      .from('client_analytics')
      .select('*')
      .order('calculated_at', { ascending: false })
      .limit(100);

    const { data: payments } = await supabase
      .from('payment_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    const { data: jobs } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    console.log('[Insights] Analyzing data with AI...');

    // Call Lovable AI for insight generation
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert business analyst. Analyze the provided data and generate 3-5 actionable insights.
            Focus on: trends, anomalies, predictions, and recommendations.
            Return insights as JSON array with: insight_type, title, description, severity, data.`
          },
          {
            role: 'user',
            content: `Analyze this platform data:
            
Professional Metrics: ${JSON.stringify(profMetrics?.slice(0, 20))}
Client Analytics: ${JSON.stringify(clientAnalytics?.slice(0, 20))}
Recent Payments: ${JSON.stringify(payments?.slice(0, 50))}
Recent Jobs: ${JSON.stringify(jobs?.slice(0, 50))}

Generate insights about:
1. Revenue trends and predictions
2. Professional performance patterns
3. Client behavior anomalies
4. Platform health recommendations`
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_insights',
              description: 'Generate business insights from analytics data',
              parameters: {
                type: 'object',
                properties: {
                  insights: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        insight_type: {
                          type: 'string',
                          enum: ['trend', 'anomaly', 'prediction', 'recommendation']
                        },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        severity: {
                          type: 'string',
                          enum: ['info', 'warning', 'critical']
                        },
                        data: { type: 'object' }
                      },
                      required: ['insight_type', 'title', 'description', 'severity']
                    }
                  }
                },
                required: ['insights']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'generate_insights' } }
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('[Insights] AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('[Insights] AI response received');

    // Extract insights from tool call
    const toolCall = aiData.choices[0]?.message?.tool_calls?.[0];
    const insights = toolCall ? JSON.parse(toolCall.function.arguments).insights : [];

    console.log(`[Insights] Generated ${insights.length} insights`);

    // Insert insights into database
    const insightRecords = insights.map((insight: any) => ({
      insight_type: insight.insight_type,
      title: insight.title,
      description: insight.description,
      severity: insight.severity,
      data: insight.data || {},
      is_acknowledged: false
    }));

    const { data: inserted, error: insertError } = await supabase
      .from('analytics_insights')
      .insert(insightRecords)
      .select();

    if (insertError) {
      console.error('[Insights] Insert error:', insertError);
      throw insertError;
    }

    console.log('[Insights] Successfully inserted insights');

    return new Response(
      JSON.stringify({ 
        success: true, 
        insights: inserted,
        count: inserted?.length || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[Insights] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});