/**
 * Competitor Benchmark Panel Component
 * Phase 11: Professional Tools & Insights
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, Clock, DollarSign, CheckCircle } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type CompetitorBenchmark = Database['public']['Tables']['competitor_benchmarks']['Row'];

interface CompetitorBenchmarkPanelProps {
  benchmarks: CompetitorBenchmark[];
}

export function CompetitorBenchmarkPanel({ benchmarks }: CompetitorBenchmarkPanelProps) {
  if (benchmarks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Competitive Analysis
          </CardTitle>
          <CardDescription>
            See how you compare to other professionals in your category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Complete more jobs to see competitive benchmarks
          </p>
        </CardContent>
      </Card>
    );
  }

  const latest = benchmarks[0];
  const percentile = Number(latest.percentile);

  const getRankColor = (rank: number, total: number) => {
    const topPercent = (rank / total) * 100;
    if (topPercent <= 10) return 'text-yellow-500';
    if (topPercent <= 25) return 'text-green-500';
    if (topPercent <= 50) return 'text-blue-500';
    return 'text-muted-foreground';
  };

  const getPerformanceBadge = (percentile: number) => {
    if (percentile >= 90) return { variant: 'default' as const, label: 'Top 10%', icon: Trophy };
    if (percentile >= 75) return { variant: 'secondary' as const, label: 'Top 25%', icon: TrendingUp };
    if (percentile >= 50) return { variant: 'outline' as const, label: 'Above Average', icon: CheckCircle };
    return { variant: 'outline' as const, label: 'Below Average', icon: Clock };
  };

  const badge = getPerformanceBadge(percentile);
  const BadgeIcon = badge.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Competitive Analysis
        </CardTitle>
        <CardDescription>
          How you compare to other professionals in your category
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 border rounded-lg bg-accent/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Your Ranking</p>
              <p className={`text-3xl font-bold ${getRankColor(latest.professional_rank, latest.total_professionals)}`}>
                #{latest.professional_rank}
              </p>
              <p className="text-sm text-muted-foreground">
                out of {latest.total_professionals} professionals
              </p>
            </div>
            <Badge variant={badge.variant} className="h-fit">
              <BadgeIcon className="w-4 h-4 mr-1" />
              {badge.label}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Performance Percentile</span>
              <span className="font-medium">{percentile.toFixed(1)}%</span>
            </div>
            <Progress value={percentile} className="h-2" />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold">Performance Comparison</h4>
          
          <div className="grid gap-4">
            {latest.peer_avg_rating && (
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Average Rating</span>
                </div>
                <span className="font-medium">{Number(latest.peer_avg_rating).toFixed(1)} ⭐</span>
              </div>
            )}

            {latest.peer_avg_response_time && (
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Avg Response Time</span>
                </div>
                <span className="font-medium">{Number(latest.peer_avg_response_time).toFixed(1)}h</span>
              </div>
            )}

            {latest.peer_avg_job_value && (
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Avg Job Value</span>
                </div>
                <span className="font-medium">${Number(latest.peer_avg_job_value).toLocaleString()}</span>
              </div>
            )}

            {latest.peer_completion_rate && (
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Completion Rate</span>
                </div>
                <span className="font-medium">{(Number(latest.peer_completion_rate) * 100).toFixed(1)}%</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
