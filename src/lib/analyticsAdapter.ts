import type { AnalyticsEventPayload } from './analytics'

const parseSizeLimited = (value: any) => {
  try {
    if (value === undefined) return null
    return JSON.parse(JSON.stringify(value))
  } catch (error) {
    console.warn('[analytics] Failed to serialize metadata', error)
    return null
  }
}

const parseUserAgent = (ua: string | undefined) => {
  if (!ua) {
    return { deviceType: 'unknown', browser: 'unknown', os: 'unknown' }
  }

  const isMobile = /Mobi|Android/i.test(ua)
  const deviceType = isMobile ? 'mobile' : 'desktop'

  let browser = 'unknown'
  if (/Chrome\//i.test(ua)) browser = 'chrome'
  else if (/Safari\//i.test(ua)) browser = 'safari'
  else if (/Firefox\//i.test(ua)) browser = 'firefox'
  else if (/Edg\//i.test(ua)) browser = 'edge'

  let os = 'unknown'
  if (/Windows/i.test(ua)) os = 'windows'
  else if (/Mac OS X/i.test(ua)) os = 'macos'
  else if (/Android/i.test(ua)) os = 'android'
  else if (/iPhone|iPad/i.test(ua)) os = 'ios'

  return { deviceType, browser, os }
}

export interface AnalyticsEventRow {
  event_name: string
  event_category?: string | null
  event_properties?: Record<string, any> | null
  page_url?: string | null
  referrer?: string | null
  session_id: string
  device_type?: string | null
  browser?: string | null
  os?: string | null
  user_id?: string | null
}

export class AnalyticsAdapter {
  static toRow(event: AnalyticsEventPayload): AnalyticsEventRow {
    const properties = parseSizeLimited(event.metadata) || {}
    if (event.label) properties.label = event.label
    if (typeof event.value === 'number') properties.value = event.value

    let path: string | null = null
    let referrer: string | null = null
    let sessionId = `session_${Date.now()}`
    let deviceInfo = { deviceType: 'unknown', browser: 'unknown', os: 'unknown' }

    if (typeof window !== 'undefined') {
      path = window.location?.pathname ?? null
      referrer = document?.referrer || null
      
      const stored = window.sessionStorage?.getItem('analytics_session_id')
      if (stored) {
        sessionId = stored
      } else {
        window.sessionStorage?.setItem('analytics_session_id', sessionId)
      }
      
      deviceInfo = parseUserAgent(navigator?.userAgent)
    }

    return {
      event_name: `${event.category}:${event.action}`,
      event_category: event.category,
      event_properties: properties,
      page_url: path,
      referrer,
      session_id: sessionId,
      device_type: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      os: deviceInfo.os
    }
  }
}
