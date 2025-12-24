import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { validateRequestBody } from '../_shared/inputValidation.ts';
import { createErrorResponse, logError } from '../_shared/errorMapping.ts';
import { checkRateLimitDb, createRateLimitResponse, getClientIdentifier, createServiceClient, corsHeaders, handleCors } from '../_shared/securityMiddleware.ts';

const requestSchema = z.object({
  serviceType: z.string().trim().min(1).max(200),
  category: z.string().trim().max(200).optional(),
  subcategory: z.string().trim().max(200).optional(),
  questions: z.array(z.any()).min(1).max(50),
});

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createServiceClient();

    // Rate limiting - AI_STANDARD (20/hr)
    const clientId = getClientIdentifier(req);
    const rateLimit = await checkRateLimitDb(supabase, clientId, 'ai-question-tester', 'AI_STANDARD');
    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit.retryAfter);
    }

    const { serviceType, category, subcategory, questions } = await validateRequestBody(req, requestSchema);

    // Get AI prompt template
    const { data: promptData } = await supabase
      .from('ai_prompts')
      .select('*')
      .eq('name', 'question_logic_tester')
      .eq('is_active', true)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (!promptData) {
      throw new Error('Question tester prompt template not found');
    }

    // Log AI run start
    const { data: aiRun } = await supabase
      .from('ai_runs')
      .insert([{
        operation_type: 'question_logic_test',
        prompt_template_id: promptData.id,
        input_data: { serviceType, category, subcategory, questions },
        status: 'running'
      }])
      .select()
      .single();

    const startTime = Date.now();

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      throw new Error("AI service unavailable");
    }

    // Prepare prompt with data
    let prompt = promptData.template;
    prompt = prompt.replace('{{service_type}}', serviceType);
    prompt = prompt.replace('{{category}}', category || 'N/A');
    prompt = prompt.replace('{{subcategory}}', subcategory || 'N/A');
    prompt = prompt.replace('{{questions}}', JSON.stringify(questions, null, 2));

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
            content: "You are an expert UX researcher and service configuration specialist. Analyze question flows for logical consistency, user experience, and completeness. Provide specific, actionable recommendations."
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
      
      if (aiRun?.id) {
        await supabase
          .from('ai_runs')
          .update({
            status: 'failed',
            error_message: 'AI service error',
            execution_time_ms: executionTime
          })
          .eq('id', aiRun.id);
      }

      throw new Error("Failed to analyze questions");
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content;

    if (!analysis) {
      throw new Error("No analysis generated");
    }

    const result = {
      analysis,
      recommendations: [],
      score: 0.8,
      issues: [],
      timestamp: new Date().toISOString()
    };

    // Log successful run
    if (aiRun?.id) {
      await supabase
        .from('ai_runs')
        .update({
          status: 'completed',
          output_data: result,
          execution_time_ms: executionTime,
          confidence_score: result.score
        })
        .eq('id', aiRun.id);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    logError('ai-question-tester', error as Error);
    return createErrorResponse(error as Error);
  }
});
