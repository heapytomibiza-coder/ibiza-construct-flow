import { corsHeaders } from '../_shared/cors.ts';
import { serverClient } from '../_shared/client.ts';
import { json } from '../_shared/json.ts';

const EMOJI_MAP: Record<string, string> = {
  'excavation': '⚙️',
  'groundworks': '🏗️',
  'concrete': '🧱',
  'brickwork': '🧱',
  'roofing': '🏠',
  'plumbing': '💧',
  'electrical': '⚡',
  'carpentry': '🪚',
  'plastering': '🎨',
  'tiling': '◻️',
  'flooring': '📐',
  'painting': '🎨',
  'glazing': '🪟',
  'landscaping': '🌳',
  'demolition': '🔨',
  'insulation': '🧊',
  'drainage': '💧',
  'heating': '🔥',
  'ventilation': '💨',
  'security': '🔒',
};

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toKey(text: string, index: number): string {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 30);
  return `q${index + 1}_${slug}`;
}

function detectEmoji(text: string): string {
  const lower = text.toLowerCase();
  for (const [keyword, emoji] of Object.entries(EMOJI_MAP)) {
    if (lower.includes(keyword)) return emoji;
  }
  return '🏗️'; // default
}

function detectQuestionType(options: any[]): 'single' | 'multi' | 'text' {
  if (!options || options.length === 0) return 'text';
  return 'single'; // default to single select for options
}

function isRequiredQuestion(label: string): boolean {
  const lower = label.toLowerCase();
  return /location|where|address|size|area|dimensions|access|timeline|when|deadline|budget/.test(lower);
}

function generateAiHint(label: string): string {
  const lower = label.toLowerCase();
  if (/location|where|address/.test(lower)) return 'location';
  if (/size|area|dimensions/.test(lower)) return 'area_size';
  if (/access|machinery/.test(lower)) return 'site_access';
  if (/timeline|when|deadline/.test(lower)) return 'timeline';
  if (/budget|cost/.test(lower)) return 'budget';
  if (/material/.test(lower)) return 'materials';
  if (/finish|quality/.test(lower)) return 'finish_quality';
  return '';
}

function transformJSON(data: any) {
  const microservices = data.microservices || [];
  const packs: any[] = [];
  
  for (const micro of microservices) {
    const microSlug = toSlug(micro.service);
    const emoji = detectEmoji(micro.category || micro.service);
    
    const questions = (micro.questions || []).map((q: any, index: number) => {
      // Map question types
      let type = 'text';
      switch (q.type) {
        case 'multi_choice': type = 'multi'; break;
        case 'single_choice': type = 'single'; break;
        case 'number': type = 'number'; break;
        case 'short_text': type = 'text'; break;
        case 'file_upload': type = 'text'; break; // Handle as text with note
        default: type = 'text';
      }
      
      // Extract options
      const options = (q.options || []).map((opt: any, optIndex: number) => ({
        value: toSlug(opt).replace(/-+/g, '_'),
        i18nKey: opt,
        order: optIndex
      }));
      
      return {
        key: q.id || toKey(q.text, index),
        type,
        i18nKey: q.text,
        required: q.required || false,
        ...(options.length > 0 && { options }),
        ...(q.min !== undefined && { min: q.min }),
        ...(q.max !== undefined && { max: q.max }),
        ...(q.unit && { unit: q.unit }),
        aiHint: q.ai_prompt_template || generateAiHint(q.text)
      };
    });
    
    packs.push({
      micro_slug: microSlug,
      version: 1,
      status: 'draft',
      source: 'manual',
      is_active: false,
      content: {
        id: crypto.randomUUID(),
        category: micro.category || 'General',
        name: micro.service,
        slug: microSlug,
        i18nPrefix: microSlug.replace(/-/g, '.'),
        questions
      }
    });
  }
  
  return packs;
}

function extractOptions(lines: string[], startIndex: number): { options: any[], nextIndex: number } {
  const options: any[] = [];
  let i = startIndex;
  
  while (i < lines.length) {
    const line = lines[i].trim();
    
    // Stop at next question or micro header
    if (/^\d+\.?\s+/.test(line) || /–|—/.test(line)) break;
    
    // Detect option markers
    if (/^[☐○●•\-]\s*/.test(line) || /^[A-Z][a-z]+:/.test(line)) {
      const cleaned = line.replace(/^[☐○●•\-]\s*/, '').trim();
      if (cleaned) {
        const value = toSlug(cleaned).replace(/-+/g, '_');
        options.push({
          value,
          i18nKey: cleaned,
          order: options.length
        });
      }
    }
    
    i++;
  }
  
  return { options, nextIndex: i };
}

async function parsePDF(text: string) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  
  const packs: any[] = [];
  let currentPack: any = null;
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    
    // Detect micro-service header (contains en dash)
    if (/–|—/.test(line) && !/^\d+\./.test(line)) {
      // Save previous pack
      if (currentPack && currentPack.content.questions.length > 0) {
        packs.push(currentPack);
      }
      
      // Parse new micro header
      const parts = line.split(/–|—/).map(s => s.trim());
      const microName = parts[parts.length - 1] || line;
      const category = parts[0] || 'General';
      const microSlug = toSlug(microName);
      const emoji = detectEmoji(line);
      
      currentPack = {
        micro_slug: microSlug,
        version: 1,
        status: 'draft',
        source: 'manual',
        is_active: false,
        content: {
          id: crypto.randomUUID(),
          category,
          name: microName,
          slug: microSlug,
          i18nPrefix: microSlug.replace(/-/g, '.'),
          questions: []
        }
      };
      
      i++;
      continue;
    }
    
    // Detect question (numbered line)
    if (/^\d+\.?\s+/.test(line) && currentPack) {
      const label = line.replace(/^\d+\.?\s*/, '').trim();
      const questionKey = toKey(label, currentPack.content.questions.length);
      
      // Look ahead for options
      const { options, nextIndex } = extractOptions(lines, i + 1);
      const type = detectQuestionType(options);
      
      currentPack.content.questions.push({
        key: questionKey,
        type,
        i18nKey: label,
        required: isRequiredQuestion(label),
        ...(options.length > 0 && { options }),
        aiHint: generateAiHint(label)
      });
      
      i = nextIndex;
      continue;
    }
    
    i++;
  }
  
  // Save last pack
  if (currentPack && currentPack.content.questions.length > 0) {
    packs.push(currentPack);
  }
  
  return packs;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = serverClient(req);
    
    // Get user and check admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const formData = await req.formData();
    const jsonText = formData.get('jsonText') as string;
    const pdfText = formData.get('pdfText') as string;
    
    let packs: any[] = [];
    
    if (jsonText) {
      console.log('Parsing JSON...');
      const jsonData = JSON.parse(jsonText);
      packs = transformJSON(jsonData);
    } else if (pdfText) {
      console.log('Parsing PDF text...');
      packs = await parsePDF(pdfText);
    } else {
      return json({ error: 'No JSON or PDF data provided' }, 400);
    }
    
    console.log(`Parsed ${packs.length} packs with ${packs.reduce((sum, p) => sum + p.content.questions.length, 0)} total questions`);
    
    return json({
      success: true,
      packs,
      stats: {
        totalPacks: packs.length,
        totalQuestions: packs.reduce((sum, p) => sum + p.content.questions.length, 0),
        avgQuestionsPerPack: Math.round(packs.reduce((sum, p) => sum + p.content.questions.length, 0) / packs.length * 10) / 10
      }
    });
    
  } catch (error) {
    console.error('Error parsing:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return json({ error: errorMessage }, 500);
  }
});
