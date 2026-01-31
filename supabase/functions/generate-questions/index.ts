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
  createServiceClient
} from '../_shared/securityMiddleware.ts';

const generateQuestionsSchema = z.object({
  serviceType: z.string().min(1).max(200),
  category: z.string().max(200).optional(),
  subcategory: z.string().max(200).optional(),
  existingAnswers: z.record(z.any()).optional(),
});

// Helper functions
function createMicroCategoryId(serviceType: string, category: string, subcategory: string): string {
  return `${serviceType}-${category}-${subcategory}`.toLowerCase().replace(/\s+/g, '-');
}

function validateQuestions(questions: any): boolean {
  if (!Array.isArray(questions) || questions.length < 3) return false;
  
  return questions.every(q => 
    q.id && 
    q.label && 
    q.type && 
    typeof q.required === 'boolean' &&
    Array.isArray(q.options) && 
    q.options.length >= 2
  );
}

// Expert building trade prompts by category
const EXPERT_PROMPTS: Record<string, string> = {
  'Electricians': `You are an expert electrical contractor with 20+ years experience in Ibiza and Spain. You understand Spanish electrical codes (REBT), Ibiza's salt air corrosion issues, ICP power capacity problems, solar integration, smart home systems, and boletín eléctrico requirements. Ask technical questions about circuits, voltage, safety compliance, existing conditions, property specifics, and Ibiza challenges.`,

  'Plumbers': `You are a master plumber expert in Mediterranean systems and Ibiza's challenges. You know Spanish codes (CTE DB HS), hard water/calcification issues, water pressure in hill properties, cistern systems, pool plumbing, septic tanks, and solar water heaters. Ask about water source, system age, pressure, hot water needs, outdoor plumbing, and elevation.`,

  'HVAC': `You are an HVAC specialist for Mediterranean climate and Ibiza. You understand Spanish RITE regulations, cooling priorities, salt air impact, energy efficiency (A+++ ratings), VRF systems, humidity control for coastal properties. Ask about property size, existing system, cooling/heating priorities, outdoor unit placement, and energy budget.`,

  'Carpenters': `You are a master carpenter specializing in Mediterranean construction. You know traditional Ibiza sabina wood, moisture/salt resistance, custom work for old fincas, outdoor carpentry, termite prevention. Ask about project scope, wood preferences, indoor/outdoor, structural vs decorative, property style, budget, timeline.`,

  'Painters': `You are a professional painter expert in Mediterranean challenges. You understand Spanish VOC regulations, UV-resistant paints, traditional Ibiza lime wash, exterior preparation, humidity/mold treatments. Ask about interior/exterior, surface condition, property age, sun exposure, previous issues, color preferences, finish type.`,

  'Roofers': `You are a roofing expert specializing in Ibiza's systems. You know traditional flat roofs (azoteas), Spanish waterproofing (CTE DB HS 1), terrace impermeabilization, solar integration, insulation requirements, salt/UV damage. Ask about roof type, drainage, leaks, terrace usage, insulation, solar plans, property age.`,

  'Masons': `You are a master mason understanding traditional Ibiza construction. You know dry stone walls (marès), Spanish structural codes (CTE DB SE), coastal rendering, pool construction, retaining walls for hillsides, crack repair. Ask about project type, structural vs cosmetic, property age, materials, outdoor exposure, load-bearing needs.`,

  'Flooring': `You are a flooring specialist for Ibiza's climate and style. You know traditional mosaic tiles (hidráulico), underfloor heating, moisture barriers, salt resistance, natural stone maintenance, microcement, acoustic insulation. Ask about room type, existing flooring, moisture, heating systems, traffic levels, maintenance preferences.`,

  'Landscaping': `You are a Mediterranean landscaping expert for Ibiza. You know native drought-resistant plants, irrigation/water conservation, salt-tolerant species, rock gardens, terracing, pool area landscaping, maintenance for seasonal residents. Ask about property size, sun exposure, water source, maintenance capability, existing vegetation, soil, aesthetic goals.`,

  'Pool Services': `You are a pool specialist expert in Ibiza. You know Spanish pool safety regulations, salt vs chlorine systems, infinity edge pools, heating solutions, winter maintenance, water chemistry for hard water, equipment rooms. Ask about pool size/type, existing equipment, heating, usage patterns, water source, equipment location, budget.`,

  'Cleaning': `You are a professional cleaning expert for Ibiza properties. You understand rental turnover cleaning, salt/dust in coastal areas, mold prevention, pool/outdoor furniture care, marble/stone cleaning, seasonal deep cleaning, luxury villa standards. Ask about property size, type (rental/private), frequency, special materials, outdoor areas, turnover needs.`,

  'Pest Control': `You are a pest control expert for Mediterranean and Ibiza. You know common pests (processionary caterpillar, termites, mosquitoes), eco-friendly treatments, termite inspection (critical), rodent control, preventive treatments for seasonal properties, Spanish regulations. Ask about pest type, location, severity, previous treatments, pets/children, organic preferences.`,

  'Architects': `You are an architect licensed in Spain, expert in Ibiza planning. You understand Ibiza's strict planning rules (Plan General), protected rural land, heritage property regulations, energy certificates, building permits, tourist rental restrictions, coastal setbacks. Ask about project scope, property classification, permissions, heritage status, intended use, budget, regulatory concerns.`,

  'Interior Designers': `You are an interior designer specializing in Mediterranean and Ibiza style. You know traditional aesthetic (white walls, natural materials), modern luxury villa design, space planning, lighting for Mediterranean sun, indoor-outdoor living, materials for coastal climate, local artisan sourcing. Ask about property style, rooms, budget level, existing furniture, lifestyle, entertaining, aesthetic preferences.`,

  'Engineers': `You are a structural engineer licensed in Spain for Ibiza construction. You understand Spanish structural codes (CTE DB SE), old finca assessment, hillside foundation issues, expansion projects, load calculations, pool engineering, retaining walls, tourist rental requirements. Ask about project type, property age, existing issues, structural changes, soil conditions, permits, timeline.`,

  'Legal': `You are a Spanish property lawyer expert in Ibiza real estate and building law. You know Spanish property law, building permits, tourist rental licenses, escritura issues, boundary disputes, community of owners, inheritance law, construction contracts. Ask about legal issue type, property status, documentation, urgency, complexity, Ibiza jurisdiction concerns.`,

  'Real Estate': `You are a real estate agent specialized in Ibiza market. You understand Ibiza property dynamics, seasonal fluctuations, tourist rental potential/restrictions, location analysis, valuation factors, buyer profiles, foreign buyer documentation, market trends. Ask about transaction type, property type, location preferences, budget, timeline, residency status, investment goals.`,

  'Property Management': `You are a property manager expert in Ibiza's vacation rental and residential market. You know tourist rental regulations, seasonal management, maintenance coordination, rental marketing, guest services, emergency response, financial reporting, security. Ask about property type, rental model, services needed, owner presence, guest capacity, existing systems, budget, management goals.`
};

async function getMinimalFallback(serviceType: string): Promise<any[]> {
  return [
    {
      id: 'scope',
      type: 'textarea',
      label: 'Please describe what you need in detail',
      required: true,
      options: [],
      placeholder: `Describe your ${serviceType} needs...`
    },
    {
      id: 'timeline',
      type: 'select',
      label: 'When do you need this completed?',
      required: true,
      options: ['As soon as possible', 'Within 1 week', 'Within 1 month', 'Flexible timing']
    },
    {
      id: 'budget',
      type: 'select',
      label: 'What is your budget range?',
      required: false,
      options: ['Under €500', '€500-€1,500', '€1,500-€5,000', '€5,000-€15,000', 'Over €15,000']
    }
  ];
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const supabase = createServiceClient();

  try {
    // Rate limiting by IP (no auth required for question generation)
    const clientId = getClientIdentifier(req);
    const rateLimitResult = await checkRateLimitDb(supabase, clientId, 'generate-questions', 'AI_STANDARD');
    
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult);
    }

    const { serviceType, category, subcategory, existingAnswers } = await validateRequestBody(req, generateQuestionsSchema);

    const microCategoryId = createMicroCategoryId(serviceType, category || '', subcategory || '');
    console.log("Processing questions for micro category:", microCategoryId);

    // 1. Try to load from snapshot first (instant response)
    const { data: snapshot } = await supabase
      .from('micro_questions_snapshot')
      .select('questions_json')
      .eq('micro_category_id', microCategoryId)
      .single();

    if (snapshot) {
      console.log("Returning questions from snapshot");
      return new Response(JSON.stringify({ 
        questions: snapshot.questions_json,
        source: 'snapshot'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. No snapshot exists - try AI generation with timeout
    console.log("No snapshot found, attempting AI generation");

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      console.log("LOVABLE_API_KEY not configured, returning minimal fallback");
      const fallbackQuestions = await getMinimalFallback(serviceType);
      return new Response(JSON.stringify({ 
        questions: fallbackQuestions,
        source: 'minimal_fallback'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get expert prompt for this category
    const expertContext = EXPERT_PROMPTS[category] || EXPERT_PROMPTS['Electricians'];
    
    // Create expert-level prompt for question generation
    const prompt = `${expertContext}

Based on your deep professional expertise, generate 6-10 highly specific, technical questions for this exact service:

Service Type: ${serviceType}
Category: ${category}
Subcategory: ${subcategory}
${existingAnswers ? `\nContext: User has already answered: ${JSON.stringify(existingAnswers)}` : ''}

Your questions must demonstrate expert-level knowledge and should:
1. Show deep technical understanding of this specific trade
2. Include Ibiza/Spain-specific considerations (regulations, climate, local challenges)
3. Uncover critical details professionals need for accurate quotes
4. Follow a logical flow from general scope to technical specifics
5. Ask about materials, existing conditions, and potential complications
6. Consider safety, compliance, and quality standards
7. Include access, timing, and logistical constraints specific to Ibiza properties
8. Use terminology professionals would use (be technical but clear)

Question types to use strategically:
- "radio": For exclusive choices (yes/no, property type, single option)
- "select": For single selection from many options (timeline, budget ranges)
- "checkbox": For multiple selections with limited options (up to 5-6 options)
- "multiple-choice": For selecting multiple from many options (specify maxSelections: 3-5)

Return a JSON array with this exact structure:
[
  {
    "id": "descriptive_technical_id",
    "type": "radio|select|checkbox|multiple-choice",
    "label": "Professional, specific question demonstrating expertise",
    "required": true|false,
    "options": ["detailed_technical_option1", "detailed_option2", ...],
    "maxSelections": number (ONLY for multiple-choice, typically 3-5)
  }
]

CRITICAL: Ask questions that a seasoned professional with 20+ years experience would ask. Show mastery of the trade, local regulations, and Ibiza-specific challenges.`;

    console.log("Attempting AI generation for:", { serviceType, category, subcategory });

    // 3. Try AI generation with 8-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    let aiQuestions;
    try {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
        signal: controller.signal,
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: "You are an expert building trade professional with 20+ years experience in Ibiza and Spain. Generate highly specific, technical questions that demonstrate deep domain knowledge. Include local regulations, climate considerations, and professional best practices. Use appropriate technical terminology while keeping questions clear. Always return valid JSON arrays with the exact structure requested.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI Gateway error:", response.status, errorText);
        throw new Error(`AI Gateway error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content;

      if (!aiResponse) {
        console.error("No response from AI", data);
        throw new Error("No response from AI");
      }

      // Parse the JSON response from AI
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
      aiQuestions = JSON.parse(jsonString);

      // Validate questions
      if (!validateQuestions(aiQuestions)) {
        throw new Error("Invalid AI questions format");
      }

      console.log("AI generated valid questions:", aiQuestions.length);

      // 4. Save successful AI response to snapshot
      await supabase
        .from('micro_questions_snapshot')
        .upsert({
          micro_category_id: microCategoryId,
          questions_json: aiQuestions,
          version: 1,
          schema_rev: 1
        });

      // Log successful AI run
      await supabase
        .from('micro_questions_ai_runs')
        .insert({
          micro_category_id: microCategoryId,
          prompt_hash: `${serviceType}-${category}-${subcategory}`,
          model: "google/gemini-2.5-flash",
          raw_response: aiQuestions,
          status: 'success'
        });

      console.log("AI questions saved to snapshot");
      
      return new Response(JSON.stringify({ 
        questions: aiQuestions,
        source: 'ai_generated'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } catch (aiError) {
      clearTimeout(timeoutId);
      console.error("AI generation failed:", aiError);
      
      // Log failed AI run
      await supabase
        .from('micro_questions_ai_runs')
        .insert({
          micro_category_id: microCategoryId,
          prompt_hash: `${serviceType}-${category}-${subcategory}`,
          model: "google/gemini-2.5-flash",
          raw_response: null,
          status: 'failed',
          error: String(aiError)
        });

      // 5. Return minimal fallback questions
      console.log("Returning minimal fallback questions");
      const fallbackQuestions = await getMinimalFallback(serviceType);
      
      return new Response(JSON.stringify({ 
        questions: fallbackQuestions,
        source: 'minimal_fallback'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    logError('generate-questions', error);
    
    // Return minimal fallback on error
    try {
      const body = await req.clone().json().catch(() => ({}));
      const fallbackQuestions = await getMinimalFallback(body.serviceType || 'service');
      
      return new Response(JSON.stringify({ 
        questions: fallbackQuestions,
        source: 'error_fallback'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch {
      return createErrorResponse(error);
    }
  }
});