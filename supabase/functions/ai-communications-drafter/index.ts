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
    const { communicationType, context, recipientType, tone, keyPoints } = await req.json();

    if (!communicationType || !context) {
      return new Response(JSON.stringify({ error: "Communication type and context are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get AI prompt template
    const { data: promptData } = await supabase
      .from('ai_prompts')
      .select('*')
      .eq('name', 'communications_drafter')
      .eq('is_active', true)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (!promptData) {
      throw new Error('Communications drafter prompt template not found');
    }

    // Log AI run start
    const { data: aiRun } = await supabase
      .from('ai_runs')
      .insert([{
        operation_type: 'communications_drafting',
        prompt_template_id: promptData.id,
        input_data: { communicationType, context, recipientType, tone, keyPoints },
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
    prompt = prompt.replace('{{communication_type}}', communicationType);
    prompt = prompt.replace('{{context}}', JSON.stringify(context, null, 2));
    prompt = prompt.replace('{{recipient_type}}', recipientType || 'general');
    prompt = prompt.replace('{{tone}}', tone || 'professional');
    prompt = prompt.replace('{{key_points}}', JSON.stringify(keyPoints || [], null, 2));

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
            content: "You are an expert communications specialist for service marketplaces. Draft professional, clear, and effective communications that maintain brand voice while achieving specific objectives. Always include both subject line and body content."
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

      return new Response(JSON.stringify({ error: "Failed to draft communication" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const draftContent = data.choices?.[0]?.message?.content;

    if (!draftContent) {
      throw new Error("No communication draft generated");
    }

    // Parse the draft to extract subject and body (basic parsing)
    const lines = draftContent.split('\n').filter(line => line.trim());
    let subject = '';
    let body = '';
    
    // Look for subject line patterns
    const subjectLine = lines.find(line => 
      line.toLowerCase().includes('subject:') || 
      line.toLowerCase().includes('subject line:')
    );
    
    if (subjectLine) {
      subject = subjectLine.replace(/subject:?\s*/i, '').trim();
      const subjectIndex = lines.indexOf(subjectLine);
      body = lines.slice(subjectIndex + 1).join('\n').trim();
    } else {
      // If no clear subject found, use first line as subject
      subject = lines[0] || 'Professional Communication';
      body = lines.slice(1).join('\n').trim() || draftContent;
    }

    const result = {
      subject: subject.replace(/^["']|["']$/g, ''), // Remove quotes if present
      body: body,
      fullDraft: draftContent,
      communicationType,
      tone: tone || 'professional',
      wordCount: body.split(' ').length,
      timestamp: new Date().toISOString()
    };

    // Log successful run
    await supabase
      .from('ai_runs')
      .update({
        status: 'completed',
        output_data: result,
        execution_time_ms: executionTime,
        confidence_score: 0.85 // High confidence for text generation
      })
      .eq('id', aiRun.id);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in AI communications drafter:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});