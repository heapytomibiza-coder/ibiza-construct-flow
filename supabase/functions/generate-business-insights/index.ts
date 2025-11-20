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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { userId, userType } = await req.json();

    // Fetch user's data for insights
    const [jobsResult, profileResult, metricsResult] = await Promise.all([
      supabaseClient
        .from('jobs')
        .select('*')
        .or(`client_id.eq.${userId},professional_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(50),
      supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single(),
      supabaseClient
        .from('business_metrics')
        .select('*')
        .order('period_start', { ascending: false })
        .limit(10)
    ]);

    const jobs = jobsResult.data || [];
    const profile = profileResult.data;
    const recentMetrics = metricsResult.data || [];

    // Generate insights using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const systemPrompt = `You are a business intelligence analyst. Analyze the user's data and provide 3-5 actionable business insights.
    
For each insight, provide:
- insight_title: Clear, specific title
- insight_description: Detailed explanation (2-3 sentences)
- insight_type: One of: revenue_opportunity, efficiency, risk_alert, growth, retention
- priority: high, medium, or low
- impact_score: 0-100 (how impactful this insight is)
- action_items: Array of 1-3 specific actionable steps

Focus on insights that are:
1. Actionable and specific
2. Based on actual data patterns
3. Relevant to the user's role (${userType})
4. Time-sensitive when applicable

Return ONLY a JSON object with this structure:
{
  "insights": [
    {
      "insight_title": "string",
      "insight_description": "string",
      "insight_type": "revenue_opportunity|efficiency|risk_alert|growth|retention",
      "priority": "high|medium|low",
      "impact_score": number,
      "action_items": ["action1", "action2"]
    }
  ]
}`;

    const userContext = `
User Type: ${userType}
Profile: ${JSON.stringify(profile, null, 2)}
Recent Jobs (${jobs.length}): ${JSON.stringify(jobs.slice(0, 10), null, 2)}
Recent Metrics: ${JSON.stringify(recentMetrics, null, 2)}

Key Stats:
- Total jobs: ${jobs.length}
- Completed jobs: ${jobs.filter(j => j.status === 'completed').length}
- In-progress jobs: ${jobs.filter(j => j.status === 'in_progress').length}
- Average job value: ${jobs.length > 0 ? (jobs.reduce((sum, j) => sum + (j.final_price || 0), 0) / jobs.length).toFixed(2) : 0}
`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContext }
        ],
      }),
    });

    if (!aiResponse.ok) {
      console.error('AI API error:', await aiResponse.text());
      throw new Error('Failed to generate insights');
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    const insights = JSON.parse(content).insights;

    // Store insights in database
    const insightsToInsert = insights.map((insight: any) => ({
      user_id: userId,
      insight_title: insight.insight_title,
      insight_description: insight.insight_description,
      insight_type: insight.insight_type,
      priority: insight.priority,
      impact_score: insight.impact_score,
      action_items: insight.action_items,
      is_read: false
    }));

    const { error: insertError } = await supabaseClient
      .from('business_insights')
      .insert(insightsToInsert);

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ success: true, insights: insightsToInsert }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
