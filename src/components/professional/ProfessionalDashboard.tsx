/**
 * Professional Dashboard Component
 * Phase 11: Professional Tools & Insights
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useProfessionalMetrics } from '@/hooks/professional';
import { InsightsPanel } from './insights/InsightsPanel';
import { PerformanceMetrics } from './insights/PerformanceMetrics';
import { RevenueForecastPanel } from './insights/RevenueForecastPanel';
import { CompetitorBenchmarkPanel } from './insights/CompetitorBenchmarkPanel';
import { Loader2 } from 'lucide-react';

export function ProfessionalDashboard() {
  const { user } = useAuth();
  const { metrics, insights, forecasts, benchmarks, isLoading } = useProfessionalMetrics(user?.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Professional Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Track your performance and get personalized insights
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <PerformanceMetrics metrics={metrics || []} />
          <InsightsPanel insights={insights || []} />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <InsightsPanel insights={insights || []} />
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-6">
          <RevenueForecastPanel forecasts={forecasts || []} />
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-6">
          <CompetitorBenchmarkPanel benchmarks={benchmarks || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
