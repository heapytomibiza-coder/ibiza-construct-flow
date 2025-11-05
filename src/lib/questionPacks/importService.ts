/**
 * Import construction service to question pack
 */

import type { ConstructionService } from '@/types/construction-services';
import type { Pack, PackStatus, PackSource, MicroserviceDef } from '@/types/packs';
import { supabase } from '@/integrations/supabase/client';
import { transformServiceToContent } from './transformJsonToContent';
import { validateQuestionPack } from './validateQuestionPack';
import { v4 as uuidv4 } from 'uuid';

export async function importServiceToQuestionPack(
  service: ConstructionService,
  microSlug: string,
  status: PackStatus = 'draft',
  source: PackSource = 'manual'
): Promise<Pack> {
  // Transform to content format
  const content = transformServiceToContent(service, microSlug);
  
  // Validate
  const validation = validateQuestionPack(content);
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }
  
  // Get next version for this slug
  const { data: existing } = await supabase
    .from('question_packs')
    .select('version')
    .eq('micro_slug', microSlug)
    .order('version', { ascending: false })
    .limit(1)
    .single();
  
  const version = existing ? existing.version + 1 : 1;
  
  // Create pack
  const packInsert = {
    pack_id: uuidv4(),
    micro_slug: microSlug,
    version,
    status,
    source,
    content: content as any,
    is_active: status === 'approved',
  };
  
  const { data, error } = await supabase
    .from('question_packs')
    .insert(packInsert)
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    ...data,
    content: data.content as any as MicroserviceDef,
  } as Pack;
}
