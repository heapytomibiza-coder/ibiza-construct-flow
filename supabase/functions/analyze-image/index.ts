import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { validateRequestBody } from '../_shared/inputValidation.ts';
import { createErrorResponse, logError } from '../_shared/errorMapping.ts';
import { 
  checkRateLimitDb, 
  createRateLimitResponse, 
  getClientIdentifier,
  corsHeaders,
  handleCors,
  createAuthenticatedClient,
  createServiceClient
} from '../_shared/securityMiddleware.ts';

const analyzeImageSchema = z.object({
  imageUrl: z.string().url().max(2000),
  analysisType: z.enum(['quality_check', 'object_detection', 'text_extraction', 'safety_check', 'general']),
  entityType: z.string().min(1).max(100),
  entityId: z.string().uuid(),
});

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Authentication required for image analysis
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Unauthorized');
    }

    const supabaseClient = createAuthenticatedClient(authHeader);
    const serviceClient = createServiceClient();

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Rate limiting - 10 requests/hour for image analysis (expensive)
    const clientId = getClientIdentifier(req, user.id);
    const rateLimitResult = await checkRateLimitDb(serviceClient, clientId, 'analyze-image', 'AI_STRICT');
    
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult);
    }

    const { imageUrl, analysisType, entityType, entityId } = await validateRequestBody(req, analyzeImageSchema);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    let analysisPrompt = "";
    switch (analysisType) {
      case "quality_check":
        analysisPrompt = `Analyze this image for quality. Check for:
- Image clarity and resolution
- Proper lighting
- Professional composition
- Any visible defects or issues
Provide a quality score (0-100) and specific recommendations.`;
        break;

      case "object_detection":
        analysisPrompt = `Identify and list all objects visible in this image. Provide:
- Object names
- Confidence scores
- Location descriptions
- Relevance to the context`;
        break;

      case "text_extraction":
        analysisPrompt = `Extract all text visible in this image. Provide:
- Extracted text content
- Text locations
- Confidence in accuracy
- Language detected`;
        break;

      case "safety_check":
        analysisPrompt = `Analyze this image for safety concerns. Check for:
- Inappropriate content
- Safety hazards
- Quality issues
- Professional standards
Provide a safety score and list any concerns.`;
        break;

      default:
        analysisPrompt = "Provide a general analysis of this image.";
    }

    const prompt = `${analysisPrompt}

Provide a JSON response with this structure:
{
  "analysis_result": {
    "score": 85,
    "summary": "Brief analysis summary",
    "details": "Detailed findings"
  },
  "tags": ["tag1", "tag2", "tag3"],
  "confidence_score": 0.92,
  "issues_found": [
    {"severity": "low|medium|high", "description": "Issue description"}
  ],
  "recommendations": ["recommendation1", "recommendation2"]
}`;

    // Use Gemini 2.5 Flash with vision capabilities
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an AI image analysis system. Always respond with valid JSON only.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      throw new Error("AI image analysis failed");
    }

    const aiData = await aiResponse.json();
    const analysis = JSON.parse(aiData.choices[0].message.content);

    // Store analysis results
    const { error: insertError } = await serviceClient
      .from("ai_image_analysis")
      .insert({
        image_url: imageUrl,
        entity_type: entityType,
        entity_id: entityId,
        analysis_type: analysisType,
        analysis_result: analysis.analysis_result,
        tags: analysis.tags || [],
        confidence_score: analysis.confidence_score,
        issues_found: analysis.issues_found || [],
        recommendations: analysis.recommendations || [],
        user_id: user.id,
      });

    if (insertError) {
      console.error("Error storing analysis:", insertError);
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    logError('analyze-image', error);
    return createErrorResponse(error);
  }
});