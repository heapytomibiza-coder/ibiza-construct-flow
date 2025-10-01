/**
 * Metrics Panel - Usage analytics and performance data
 */

import { TrendingUp, Clock, Users, Smartphone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { UsageMetrics } from '@/types/compare';

interface MetricsPanelProps {
  metrics: UsageMetrics | null;
}

export function MetricsPanel({ metrics }: MetricsPanelProps) {
  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage Metrics</CardTitle>
          <CardDescription>No active pack metrics available yet</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Metrics will appear once this pack has been activated and used by clients.
        </CardContent>
      </Card>
    );
  }

  const completionPercent = Math.round(metrics.completionRate * 100);

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionPercent}%</div>
            <Progress value={completionPercent} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              Median Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(metrics.medianDurationS)}s</div>
            <p className="text-xs text-muted-foreground mt-1">Time to complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              Render Latency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.renderLatency?.p50 ? `${metrics.renderLatency.p50}ms` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              p50 / p95: {metrics.renderLatency?.p95 || 'N/A'}ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-orange-600" />
              Device Split
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.mobileVsDesktop ? (
              <>
                <div className="text-2xl font-bold">
                  {Math.round(metrics.mobileVsDesktop.mobile * 100)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">Mobile users</p>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Drop-off Analysis */}
      {Object.keys(metrics.dropoffsByStep).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Drop-off Heatmap</CardTitle>
            <CardDescription>Percentage of users who abandoned at each question</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(metrics.dropoffsByStep).map(([step, rate]) => {
                const dropoffPercent = Math.round(rate * 100);
                const severity = dropoffPercent > 15 ? 'destructive' : dropoffPercent > 8 ? 'warning' : 'success';
                
                return (
                  <div key={step} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-mono">{step}</span>
                      <span className={`font-medium ${
                        severity === 'destructive' ? 'text-red-600' :
                        severity === 'warning' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {dropoffPercent}% drop-off
                      </span>
                    </div>
                    <Progress 
                      value={dropoffPercent} 
                      className={`h-2 ${
                        severity === 'destructive' ? 'bg-red-100' :
                        severity === 'warning' ? 'bg-yellow-100' :
                        'bg-green-100'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Answer Distribution */}
      {Object.keys(metrics.answerDistribution).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Answer Distribution</CardTitle>
            <CardDescription>Top answer choices by question</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(metrics.answerDistribution).map(([questionKey, answers]) => (
                <div key={questionKey} className="space-y-2">
                  <div className="font-medium text-sm font-mono">{questionKey}</div>
                  <div className="space-y-1">
                    {answers.slice(0, 3).map((answer, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground truncate">{answer.value}</span>
                        <span className="font-medium">{Math.round(answer.share * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
