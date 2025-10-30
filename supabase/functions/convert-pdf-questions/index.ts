/**
 * AI-Powered PDF Question Converter
 * Uses Lovable AI to convert PDF text to structured JSON question packs
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { serverClient } from '../_shared/client.ts';
import { json } from '../_shared/json.ts';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const SYSTEM_PROMPT = `You are an expert at parsing construction service questions from PDF text into structured JSON.

Your task is to extract question packs for construction microservices from raw PDF text and convert them into valid JSON following this EXACT schema:

{
  "category": "MAIN CATEGORY NAME",
  "subcategory": "SUBCATEGORY NAME",
  "microservice": "MICROSERVICE NAME",
  "slug": "auto-generated-slug",
  "version": "1.0.0",
  "locale": "en-GB",
  "metadata": {
    "id": "generate-uuid",
    "created_at": "ISO date",
    "source": "AI-converted from PDF"
  },
  "questions": [
    {
      "id": "q1",
      "order": 1,
      "label": "Question text",
      "type": "short_text" | "long_text" | "single_select" | "multi_select" | "file_upload",
      "placeholder": "Example text",
      "required": true | false,
      "help": "Helper text",
      "output_key": "unique_output_key",
      "options": [{"value": "value", "label": "Label"}],  // only for select types
      "visible_if": {"question_id": "q1", "equals": "value"},  // optional
      "min_selections": 1,  // only for multi_select
      "max_selections": 3,  // only for multi_select
      "accept": ["image/*", ".pdf"],  // only for file_upload
      "max_files": 5,  // only for file_upload
      "max_total_mb": 25  // only for file_upload
    }
  ]
}

CRITICAL RULES:
1. Extract each microservice as a separate JSON object
2. Generate meaningful slugs from category/subcategory/microservice names
3. Map question types correctly:
   - "Short text", "text input", "location" → "short_text"
   - "Long text", "description", "notes" → "long_text"
   - "Single choice", "select one", checkboxes with ☐ → "single_select"
   - "Multiple choice", "select multiple" → "multi_select"
   - "Upload", "photos", "documents" → "file_upload"
4. For select types, extract all options from checkboxes or lists
5. Generate unique output_keys based on the question purpose
6. Detect required questions (location, size, access, timeline are usually required)
7. Add helpful placeholders and help text where obvious
8. Return ONLY valid JSON array of pack objects, no markdown or explanation`;

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateUUID(): string {
  return crypto.randomUUID();
}

async function convertWithAI(pdfText: string): Promise<any[]> {
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Convert this PDF text to structured question packs:\n\n${pdfText}` }
      ],
      temperature: 0.3,
      max_tokens: 8000
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    }
    if (response.status === 402) {
      throw new Error('AI credits exhausted. Please add credits to your workspace.');
    }
    const errorText = await response.text();
    console.error('AI gateway error:', response.status, errorText);
    throw new Error(`AI conversion failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('No content returned from AI');
  }

  // Extract JSON from response (handle markdown code blocks)
  let jsonText = content;
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    jsonText = jsonMatch[1];
  }

  try {
    const parsed = JSON.parse(jsonText);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (error) {
    console.error('Failed to parse AI response as JSON:', jsonText);
    throw new Error('AI returned invalid JSON format');
  }
}

function validateAndEnhancePack(pack: any): any {
  // Ensure required fields exist
  if (!pack.category || !pack.microservice) {
    throw new Error('Pack missing required category or microservice name');
  }

  // Generate slug if missing
  if (!pack.slug) {
    pack.slug = generateSlug(`${pack.category}-${pack.subcategory || ''}-${pack.microservice}`);
  }

  // Ensure metadata
  if (!pack.metadata) {
    pack.metadata = {
      id: generateUUID(),
      created_at: new Date().toISOString(),
      source: 'AI-converted from PDF'
    };
  }

  // Ensure version and locale
  pack.version = pack.version || '1.0.0';
  pack.locale = pack.locale || 'en-GB';

  // Validate questions
  if (!Array.isArray(pack.questions) || pack.questions.length === 0) {
    throw new Error(`Pack ${pack.slug} has no valid questions`);
  }

  // Enhance questions
  pack.questions = pack.questions.map((q: any, index: number) => {
    const enhanced: any = {
      id: q.id || `q${index + 1}`,
      order: q.order ?? (index + 1),
      label: q.label || q.text || 'Question',
      type: q.type || 'short_text',
      required: q.required ?? false,
      output_key: q.output_key || generateSlug(q.label || `question_${index + 1}`)
    };

    // Copy optional fields
    if (q.placeholder) enhanced.placeholder = q.placeholder;
    if (q.help) enhanced.help = q.help;
    if (q.options) enhanced.options = q.options;
    if (q.visible_if) enhanced.visible_if = q.visible_if;
    if (q.min_selections) enhanced.min_selections = q.min_selections;
    if (q.max_selections) enhanced.max_selections = q.max_selections;
    if (q.accept) enhanced.accept = q.accept;
    if (q.max_files) enhanced.max_files = q.max_files;
    if (q.max_total_mb) enhanced.max_total_mb = q.max_total_mb;

    return enhanced;
  });

  return pack;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!LOVABLE_API_KEY) {
      return json({ error: 'LOVABLE_API_KEY not configured' }, 500);
    }

    const supabase = serverClient(req);
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const { pdfText } = await req.json();
    
    if (!pdfText || typeof pdfText !== 'string') {
      return json({ error: 'No PDF text provided' }, 400);
    }

    console.log(`Converting PDF text (${pdfText.length} chars) with AI...`);

    // Convert with AI
    const rawPacks = await convertWithAI(pdfText);
    console.log(`AI returned ${rawPacks.length} packs`);

    // Validate and enhance each pack
    const packs = rawPacks.map(pack => validateAndEnhancePack(pack));

    const totalQuestions = packs.reduce((sum, p) => sum + p.questions.length, 0);

    console.log(`Successfully converted ${packs.length} packs with ${totalQuestions} questions`);

    return json({
      success: true,
      packs,
      stats: {
        totalPacks: packs.length,
        totalQuestions,
        avgQuestionsPerPack: Math.round(totalQuestions / packs.length * 10) / 10
      }
    });
    
  } catch (error) {
    console.error('Conversion error:', error);
    return json({ 
      error: error.message || 'Failed to convert PDF',
      details: error.stack
    }, 500);
  }
});
