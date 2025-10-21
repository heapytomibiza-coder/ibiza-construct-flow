import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

export interface AnalyticsEventRecord {
  id: string
  event_name: string
  event_category: string | null
  event_properties: Record<string, any> | null
  page_url: string | null
  referrer: string | null
  created_at: string
}

export interface RedirectAnalyticsRecord {
  id: string
  from_path: string
  to_path: string
  redirect_reason: string | null
  hit_count: number
  last_hit_at: string | null
  created_at: string
}

export interface PerformanceMetricRecord {
  id: string
  metric_name: string
  metric_value: number
  route?: string | null
  created_at: string
}

export const useAnalyticsEvents = () =>
  useQuery({
    queryKey: ['analytics-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('id,event_name,event_category,event_properties,page_url,referrer,created_at')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      return (data as AnalyticsEventRecord[]) ?? []
    },
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30
  })

export const useRedirectAnalytics = () =>
  useQuery({
    queryKey: ['redirect-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('redirect_analytics')
        .select('*')
        .order('hit_count', { ascending: false })

      if (error) throw error
      return (data as RedirectAnalyticsRecord[]) ?? []
    },
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60
  })

export const usePerformanceMetrics = () =>
  useQuery({
    queryKey: ['performance-metrics-recent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('performance_metrics')
        .select('id,metric_name,metric_value,created_at')
        .order('created_at', { ascending: false })
        .limit(500)

      if (error) throw error
      return (data as PerformanceMetricRecord[]) ?? []
    },
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60
  })
