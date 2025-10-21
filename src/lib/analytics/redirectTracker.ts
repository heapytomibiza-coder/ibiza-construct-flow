import { supabase } from '@/integrations/supabase/client'
import { analytics } from '../analytics'

export interface RedirectOptions {
  from: string
  to: string
  reason: 'consolidation' | 'deprecation' | 'migration' | 'service_auto_switch'
  metadata?: Record<string, any>
}

export async function trackRedirect({ from, to, reason, metadata }: RedirectOptions) {
  analytics.track({
    category: 'redirect',
    action: 'hit',
    label: from,
    metadata: {
      from_path: from,
      to_path: to,
      redirect_reason: reason,
      ...metadata
    }
  })

  try {
    const { data: existing } = await supabase
      .from('redirect_analytics')
      .select('id, hit_count')
      .eq('from_path', from)
      .eq('to_path', to)
      .maybeSingle()

    if (existing) {
      await supabase
        .from('redirect_analytics')
        .update({
          hit_count: existing.hit_count + 1,
          last_hit_at: new Date().toISOString()
        })
        .eq('id', existing.id)
    } else {
      await supabase.from('redirect_analytics').insert({
        from_path: from,
        to_path: to,
        redirect_reason: reason,
        hit_count: 1,
        last_hit_at: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error('[redirectTracker] Error tracking redirect:', error)
  }
}

export function trackLegacyEditorRoute(path: string) {
  analytics.track({
    category: 'legacy',
    action: 'editor_route',
    label: path,
    metadata: { path, auto_switch_disabled: true }
  })
}
