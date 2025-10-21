import { supabase } from '@/integrations/supabase/client'
import { AnalyticsAdapter, type AnalyticsEventRow } from './analyticsAdapter'

type AnalyticsMetadata = Record<string, any>

export interface AnalyticsEventPayload {
  category: string
  action: string
  label?: string
  value?: number
  metadata?: AnalyticsMetadata
  timestamp?: number
}

type Listener = (event: AnalyticsEventPayload) => void

class AnalyticsService {
  private enabled = true
  private queue: AnalyticsEventPayload[] = []
  private listeners: Set<Listener> = new Set()
  private flushing = false
  private flushIntervalId: NodeJS.Timeout | null = null
  private flushTimeoutId: NodeJS.Timeout | null = null
  private sampleRate = 1
  private readonly batchSize = 20
  private readonly flushInterval = 10000

  constructor() {
    if (typeof window !== 'undefined') {
      this.flushIntervalId = setInterval(() => {
        void this.flush()
      }, this.flushInterval)
    }
  }

  configure({ enabled, sampleRate }: { enabled?: boolean; sampleRate?: number } = {}) {
    if (typeof enabled === 'boolean') {
      this.enabled = enabled
    }
    if (typeof sampleRate === 'number' && sampleRate > 0 && sampleRate <= 1) {
      this.sampleRate = sampleRate
    }
  }

  on(listener: Listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  track(event: AnalyticsEventPayload): void {
    if (!this.enabled) return
    if (this.sampleRate < 1 && Math.random() > this.sampleRate) return

    const payload: AnalyticsEventPayload = {
      ...event,
      timestamp: event.timestamp ?? Date.now()
    }

    this.queue.push(payload)
    this.listeners.forEach((listener) => listener(payload))

    if (import.meta.env.DEV) {
      console.debug('[analytics]', payload)
    }

    if (this.queue.length >= this.batchSize) {
      void this.flush()
      return
    }

    this.scheduleFlush()
  }

  private scheduleFlush() {
    if (this.flushTimeoutId || this.flushing) return
    if (typeof window === 'undefined') {
      void this.flush()
      return
    }
    this.flushTimeoutId = setTimeout(() => {
      void this.flush()
      this.flushTimeoutId = null
    }, this.flushInterval)
  }

  async flush(): Promise<void> {
    if (this.flushing || this.queue.length === 0) return

    this.flushing = true
    if (this.flushTimeoutId) {
      clearTimeout(this.flushTimeoutId)
      this.flushTimeoutId = null
    }
    const batch = this.queue.splice(0, this.batchSize)
    try {
      const rows: AnalyticsEventRow[] = batch.map((item) => AnalyticsAdapter.toRow(item))
      const { error } = await supabase.from('analytics_events').insert(rows)
      if (error) {
        throw error
      }
    } catch (error) {
      console.error('[analytics] Failed to persist events', error)
      this.queue.unshift(...batch)
    } finally {
      this.flushing = false
      if (this.queue.length > 0) {
        this.scheduleFlush()
      }
    }
  }
}

export const analytics = new AnalyticsService()

export const trackPageView = (pageName: string, metadata?: AnalyticsMetadata) => {
  analytics.track({
    category: 'navigation',
    action: 'page_view',
    label: pageName,
    metadata
  })
}

export const trackUserAction = (action: string, label?: string, value?: number) => {
  analytics.track({
    category: 'user_action',
    action,
    label,
    value
  })
}

export const trackConversion = (type: string, value: number, metadata?: AnalyticsMetadata) => {
  analytics.track({
    category: 'conversion',
    action: type,
    value,
    metadata
  })
}

export const trackError = (error: Error, context?: string) => {
  analytics.track({
    category: 'error',
    action: error.name,
    label: context,
    metadata: {
      message: error.message,
      stack: error.stack
    }
  })
}

export const trackSearch = (query: string, resultsCount: number) => {
  analytics.track({
    category: 'search',
    action: 'query',
    label: query,
    value: resultsCount
  })
}

export const trackFormSubmit = (formName: string, success: boolean) => {
  analytics.track({
    category: 'form',
    action: success ? 'submit_success' : 'submit_failed',
    label: formName
  })
}
