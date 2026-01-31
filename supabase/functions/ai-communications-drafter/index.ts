import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { validateRequestBody } from '../_shared/inputValidation.ts';
import { createErrorResponse, logError } from '../_shared/errorMapping.ts';
import { 
  checkRateLimitDb, 
  createRateLimitResponse, 
  getClientIdentifier,
  corsHeaders,
  handleCors,
  createServiceClient
} from '../_shared/securityMiddleware.ts';

// Strict schema with payload caps to prevent cost bombs
const communicationsSchema = z.object({
  communicationType: z.string().trim().min(1).max(100),
  // Limit context fields instead of allowing arbitrary data
  context: z.object({
    jobId: z.string().uuid().optional(),
    clientName: z.string().max(200).optional(),
    professionalName: z.string().max(200).optional(),
    serviceName: z.string().max(200).optional(),
    amount: z.number().min(0).max(1000000).optional(),
    date: z.string().max(50).optional(),
    notes: z.string().max(2000).optional(),
  }).passthrough(), // Allow additional fields but validate core ones
  recipientType: z.string().max(100).optional(),
  tone: z.string().max(50).optional(),
  keyPoints: z.array(z.string().max(500)).max(10).optional(),
});

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createServiceClient();
    
    // Rate limiting
    const clientId = getClientIdentifier(req);
    const rateLimitResult = await checkRateLimitDb(supabase, clientId, 'ai-communications-drafter', 'AI_STANDARD');
    
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult.retryAfter);
    }

    const { communicationType, context, recipientType, tone, keyPoints } = await validateRequestBody(req, communicationsSchema);

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
    const lines = draftContent.split('\n').filter((line: string) => line.trim());
    let subject = '';
    let body = '';
    
    // Look for subject line patterns
    const subjectLine = lines.find((line: string) => 
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
    logError('ai-communications-drafter', error);
    return createErrorResponse(error);
  }
});