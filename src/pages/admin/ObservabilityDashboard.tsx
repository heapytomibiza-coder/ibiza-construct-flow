import { useMemo } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Activity, AlertTriangle, BarChart3, Compass, History, RefreshCcw } from 'lucide-react'
import Header from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  useAnalyticsEvents,
  usePerformanceMetrics,
  useRedirectAnalytics,
  type AnalyticsEventRecord,
  type RedirectAnalyticsRecord
} from '@/hooks/useObservability'
import { Skeleton } from '@/components/ui/skeleton'

const groupByEvent = (events: AnalyticsEventRecord[]) => {
  const counts = new Map<string, { count: number; lastSeen: string }>()
  events.forEach((event) => {
    const current = counts.get(event.event_name)
    counts.set(event.event_name, {
      count: (current?.count ?? 0) + 1,
      lastSeen: current?.lastSeen ?? event.created_at
    })
  })
  return Array.from(counts.entries())
    .map(([name, info]) => ({ name, ...info }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
}

const getRedirectsToReview = (records: RedirectAnalyticsRecord[]) => {
  const now = Date.now()
  const sevenDays = 1000 * 60 * 60 * 24 * 7
  return records.filter((record) => {
    if (!record.last_hit_at) return true
    return now - new Date(record.last_hit_at).getTime() > sevenDays
  })
}

export default function ObservabilityDashboard() {
  const { data: analyticsEvents = [], isLoading: loadingEvents, refetch: refetchEvents } = useAnalyticsEvents()
  const { data: redirects = [], isLoading: loadingRedirects, refetch: refetchRedirects } = useRedirectAnalytics()
  const { data: performance = [], isLoading: loadingPerformance, refetch: refetchPerformance } = usePerformanceMetrics()

  const topEvents = useMemo(() => groupByEvent(analyticsEvents), [analyticsEvents])
  const redirectsToReview = useMemo(() => getRedirectsToReview(redirects), [redirects])
  const slowRoutes = useMemo(
    () =>
      performance
        .filter((metric) => metric.metric_name === 'web_vital_lcp' && metric.metric_value > 2500)
        .slice(0, 10),
    [performance]
  )

  const isLoading = loadingEvents || loadingRedirects || loadingPerformance

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Observability Hub</h2>
            <p className="text-muted-foreground">
              Real-time visibility into analytics events, performance vitals, and legacy route clean-up.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void Promise.all([refetchEvents(), refetchRedirects(), refetchPerformance()])
              }}
            >
              <RefreshCcw className="mr-2 h-4 w-4" /> Refresh data
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" /> Events (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingEvents ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{analyticsEvents.length}</div>}
              <p className="text-xs text-muted-foreground">Latest tracked analytics events</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <History className="h-4 w-4 text-primary" /> Redirects
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingRedirects ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{redirects.length}</div>
              )}
              <p className="text-xs text-muted-foreground">Tracked legacy redirects with hit counters</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" /> Slow routes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingPerformance ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{slowRoutes.length}</div>}
              <p className="text-xs text-muted-foreground">Routes with LCP above 2.5s</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-primary" /> Deletion candidates
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingRedirects ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{redirectsToReview.length}</div>}
              <p className="text-xs text-muted-foreground">Legacy routes with no hits in 7 days</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" /> Live analytics stream
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  {topEvents.map((event) => (
                    <Badge key={event.name} variant="secondary" className="text-xs">
                      {event.name} · {event.count} hits
                    </Badge>
                  ))}
                  {topEvents.length === 0 && <span className="text-sm text-muted-foreground">No events recorded yet.</span>}
                </div>
                <Separator />
                <div className="max-h-80 overflow-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Event</TableHead>
                        <TableHead>Path</TableHead>
                        <TableHead>Properties</TableHead>
                        <TableHead className="w-[160px]">When</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analyticsEvents.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell>
                            <div className="font-medium">{event.event_name}</div>
                            {event.event_category && <div className="text-xs text-muted-foreground">{event.event_category}</div>}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{event.page_url || '—'}</TableCell>
                          <TableCell>
                            <pre className="max-w-[280px] overflow-x-auto rounded bg-muted/40 p-2 text-xs">
                              {event.event_properties ? JSON.stringify(event.event_properties, null, 2) : '—'}
                            </pre>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                          </TableCell>
                        </TableRow>
                      ))}
                      {analyticsEvents.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                            No analytics events tracked yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary" /> Redirect cleanup status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-72 overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Hits</TableHead>
                    <TableHead>Last seen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {redirects.map((redirect) => (
                    <TableRow key={redirect.id}>
                      <TableCell className="font-medium">{redirect.from_path}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{redirect.to_path}</TableCell>
                      <TableCell>{redirect.hit_count}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {redirect.last_hit_at ? formatDistanceToNow(new Date(redirect.last_hit_at), { addSuffix: true }) : 'No hits'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {redirects.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                        No redirect traffic recorded.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {redirectsToReview.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                <div className="font-semibold mb-1 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Cleanup recommended
                </div>
                <p>These routes have not been hit in the last 7 days. Safe to remove after verification:</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {redirectsToReview.map((redirect) => (
                    <li key={redirect.id}>
                      {redirect.from_path} → {redirect.to_path}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </main>
    </div>
  )
}
