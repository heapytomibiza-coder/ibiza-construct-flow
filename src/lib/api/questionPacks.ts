/**
 * Admin API for question pack management
 */

import { supabase } from '@/integrations/supabase/client';
import { Pack, MicroserviceDef } from '@/types/packs';
import { PackSchema, MicroserviceDefSchema } from '@/schemas/packs';

export interface PackFilters {
  status?: string;
  source?: string;
  slug?: string;
  ibizaSpecific?: boolean;
}

/**
 * List question packs with filters (admin only)
 */
export async function listPacks(filters: PackFilters = {}): Promise<Pack[]> {
  let query = supabase
    .from('question_packs')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.status) query = query.eq('status', filters.status as any);
  if (filters.source) query = query.eq('source', filters.source as any);
  if (filters.slug) query = query.eq('micro_slug', filters.slug);

  const { data, error } = await query;

  if (error) throw new Error(`Failed to list packs: ${error.message}`);
  
  return data?.map(d => PackSchema.parse(d)) || [];
}

/**
 * Import a new question pack (creates as draft or approved)
 */
export async function importPack(payload: {
  slug: string;
  content: MicroserviceDef;
  source: 'manual' | 'ai' | 'hybrid';
  status?: 'draft' | 'approved';
}): Promise<Pack> {
  // Validate content
  MicroserviceDefSchema.parse(payload.content);

  // Get next version number
  const { data: existing } = await supabase
    .from('question_packs')
    .select('version')
    .eq('micro_slug', payload.slug)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  const version = (existing?.version || 0) + 1;

  const { data, error } = await supabase
    .from('question_packs')
    .insert({
      micro_slug: payload.slug,
      version,
      status: payload.status || 'draft',
      source: payload.source,
      content: payload.content as any,
      is_active: payload.status === 'approved' ? true : false,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to import pack: ${error.message}`);

  return PackSchema.parse(data);
}

/**
 * Approve a draft pack (immutable after this)
 */
export async function approvePack(packId: string): Promise<Pack> {
  const { data, error } = await supabase
    .from('question_packs')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
    })
    .eq('pack_id', packId)
    .eq('status', 'draft') // Only draft packs can be approved
    .select()
    .single();

  if (error) throw new Error(`Failed to approve pack: ${error.message}`);

  return PackSchema.parse(data);
}

/**
 * Activate an approved pack (deactivates others for same slug)
 */
export async function activatePack(packId: string): Promise<Pack> {
  const { data: pack } = await supabase
    .from('question_packs')
    .select('micro_slug, status')
    .eq('pack_id', packId)
    .single();

  if (!pack) throw new Error('Pack not found');
  if (pack.status !== 'approved') throw new Error('Only approved packs can be activated');

  // Deactivate others
  await supabase
    .from('question_packs')
    .update({ is_active: false })
    .eq('micro_slug', pack.micro_slug)
    .eq('is_active', true);

  // Activate this one
  const { data, error } = await supabase
    .from('question_packs')
    .update({ is_active: true })
    .eq('pack_id', packId)
    .select()
    .single();

  if (error) throw new Error(`Failed to activate pack: ${error.message}`);

  return PackSchema.parse(data);
}

/**
 * Retire a pack (soft delete)
 */
export async function retirePack(packId: string): Promise<Pack> {
  const { data, error } = await supabase
    .from('question_packs')
    .update({
      status: 'retired',
      is_active: false,
    })
    .eq('pack_id', packId)
    .select()
    .single();

  if (error) throw new Error(`Failed to retire pack: ${error.message}`);

  return PackSchema.parse(data);
}

/**
 * Get comparison data for admin review
 */
export async function getComparison(slug: string): Promise<{
  active: Pack | null;
  draft: Pack | null;
}> {
  const [activeResult, draftResult] = await Promise.all([
    supabase
      .from('question_packs')
      .select('*')
      .eq('micro_slug', slug)
      .eq('status', 'approved')
      .eq('is_active', true)
      .maybeSingle(),
    supabase
      .from('question_packs')
      .select('*')
      .eq('micro_slug', slug)
      .eq('status', 'draft')
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    active: activeResult.data ? PackSchema.parse(activeResult.data) : null,
    draft: draftResult.data ? PackSchema.parse(draftResult.data) : null,
  };
}

/**
 * Get pack performance metrics
 */
export async function getPackMetrics(packId: string) {
  const { data, error } = await supabase
    .from('question_metrics')
    .select('*')
    .eq('pack_id', packId);

  if (error) throw new Error(`Failed to get metrics: ${error.message}`);

  return data || [];
}
