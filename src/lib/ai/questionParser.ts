import { supabase } from "@/integrations/supabase/client";

export interface ParsedQuestion {
  text: string;
  type: 'text' | 'number' | 'single' | 'multi';
  required: boolean;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  unit?: string;
}

/**
 * Parse questions using AI
 */
export async function parseQuestionsWithAI(text: string): Promise<ParsedQuestion[]> {
  const { data, error } = await supabase.functions.invoke('parse-questions', {
    body: { text }
  });

  if (error) {
    throw new Error(`Failed to parse questions: ${error.message}`);
  }

  if (!data || !data.questions) {
    throw new Error('Invalid response from parser');
  }

  return data.questions;
}

/**
 * Fallback simple parser (splits by lines)
 */
export function parseQuestionsSimple(text: string): ParsedQuestion[] {
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.match(/^[-*•]\s*$/));

  return lines.map(line => {
    // Remove numbering (1. 2. etc.)
    const cleaned = line.replace(/^\d+\.\s*/, '').replace(/^[-*•]\s*/, '');
    
    return {
      text: cleaned,
      type: 'text' as const,
      required: false,
    };
  });
}
