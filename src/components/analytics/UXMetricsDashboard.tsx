import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingDown, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Smartphone,
  Monitor
} from 'lucide-react';

interface FunnelStep {
  step: number;
  stepName: string;
  views: number;
  completions: number;
  dropoffRate: number;
  avgDuration: number;
}

export const UXMetricsDashboard = () => {
  // Fetch wizard funnel data
  const { data: funnelData, isLoading } = useQuery<FunnelStep[]>({
    queryKey: ['ux-funnel-metrics'],
    queryFn: async (): Promise<FunnelStep[]> => {
      const supabaseClient: any = supabase;
      const response = await supabaseClient
        .from('analytics_events')
        .select('event_type, event_data, created_at')
        .in('event_type', ['wizard_step_viewed', 'wizard_step_completed', 'wizard_abandoned'])
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });
      
      const data: any[] = response.data || [];
      const error = response.error;

      if (error) throw error;

      // Process funnel data
      const stepViews: Record<number, number> = {};
      const stepCompletions: Record<number, number> = {};
      const stepDurations: Record<number, number[]> = {};
      const stepAbandoned: Record<number, number> = {};

      data?.forEach((event: any) => {
        const step = event.event_data?.step;
        if (!step) return;

        if (event.event_type === 'wizard_step_viewed') {
          stepViews[step] = (stepViews[step] || 0) + 1;
        } else if (event.event_type === 'wizard_step_completed') {
          stepCompletions[step] = (stepCompletions[step] || 0) + 1;
          if (event.event_data?.duration) {
            if (!stepDurations[step]) stepDurations[step] = [];
            stepDurations[step].push(event.event_data.duration);
          }
        } else if (event.event_type === 'wizard_abandoned') {
          stepAbandoned[step] = (stepAbandoned[step] || 0) + 1;
        }
      });

      // Calculate funnel steps
      const funnel: FunnelStep[] = [];
      const maxStep = Math.max(...Object.keys(stepViews).map(Number), 8);
      
      for (let i = 1; i <= maxStep; i++) {
        const views = stepViews[i] || 0;
        const completions = stepCompletions[i] || 0;
        const abandoned = stepAbandoned[i] || 0;
        const durations = stepDurations[i] || [];
        const avgDuration = durations.length > 0 
          ? durations.reduce((a, b) => a + b, 0) / durations.length 
          : 0;

        funnel.push({
          step: i,
          stepName: `Step ${i}`,
          views,
          completions,
          dropoffRate: views > 0 ? ((abandoned / views) * 100) : 0,
          avgDuration: Math.round(avgDuration / 1000) // Convert to seconds
        });
      }

      return funnel;
    },
    refetchInterval: 60000 // Refresh every minute
  });

  // Fetch form validation errors
  const { data: validationErrors } = useQuery<Array<{ field: string; count: number }>>({
    queryKey: ['ux-validation-errors'],
    queryFn: async (): Promise<Array<{ field: string; count: number }>> => {
      const supabaseClient: any = supabase;
      const response = await supabaseClient
        .from('analytics_events')
        .select('event_data')
        .eq('event_type', 'form_validation_error')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      
      const data: any[] = response.data || [];
      const error = response.error;

      if (error) throw error;

      const errorCounts: Record<string, number> = {};
      data?.forEach((event: any) => {
        const fieldName = event.event_data?.fieldName;
        if (fieldName) {
          errorCounts[fieldName] = (errorCounts[fieldName] || 0) + 1;
        }
      });

      return Object.entries(errorCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([field, count]) => ({ field, count }));
    }
  });

  // Fetch device breakdown
  const { data: deviceData } = useQuery<{ mobile: number; desktop: number; total: number }>({
    queryKey: ['ux-device-metrics'],
    queryFn: async (): Promise<{ mobile: number; desktop: number; total: number }> => {
      const supabaseClient: any = supabase;
      const response = await supabaseClient
        .from('analytics_events')
        .select('event_data, device_type')
        .eq('event_type', 'wizard_step_viewed')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      
      const data: any[] = response.data || [];
      const error = response.error;

      if (error) throw error;

      let mobile = 0;
      let desktop = 0;
      
      data?.forEach((event: any) => {
        if (event.device_type === 'mobile' || event.event_data?.deviceType === 'mobile') {
          mobile++;
        } else {
          desktop++;
        }
      });

      return { mobile, desktop, total: mobile + desktop };
    }
  });

  if (isLoading) {
    return <div className="animate-pulse">Loading UX metrics...</div>;
  }

  const totalViews = funnelData?.reduce((sum, step) => sum + step.views, 0) || 0;
  const totalCompletions = funnelData?.[funnelData.length - 1]?.completions || 0;
  const overallConversionRate = totalViews > 0 ? (totalCompletions / totalViews) * 100 : 0;
  const avgTimePerStep = funnelData?.reduce((sum, step) => sum + step.avgDuration, 0) / (funnelData?.length || 1);

  return (
    <div className="space-y-6">
      {/* KPI Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallConversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {totalCompletions} of {totalViews} started
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Time/Step</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgTimePerStep.toFixed(0)}s</div>
            <p className="text-xs text-muted-foreground">
              Per wizard step
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mobile Traffic</CardTitle>
            <Smartphone className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deviceData ? ((deviceData.mobile / deviceData.total) * 100).toFixed(0) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {deviceData?.mobile || 0} mobile users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {validationErrors?.reduce((sum, e) => sum + e.count, 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total validation errors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Wizard Conversion Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {funnelData?.map((step, index) => {
              const conversionFromPrevious = index > 0 
                ? ((step.views / funnelData[index - 1].views) * 100)
                : 100;
              
              return (
                <div key={step.step} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{step.stepName}</span>
                    <div className="flex gap-4 text-muted-foreground">
                      <span>{step.views} views</span>
                      <span>{step.avgDuration}s avg</span>
                      <span className={step.dropoffRate > 30 ? 'text-destructive font-semibold' : ''}>
                        {step.dropoffRate.toFixed(1)}% drop
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all" 
                      style={{ width: `${conversionFromPrevious}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Validation Errors */}
      {validationErrors && validationErrors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Top Validation Errors (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {validationErrors.map(({ field, count }) => (
                <div key={field} className="flex items-center justify-between">
                  <span className="font-medium">{field}</span>
                  <span className="text-destructive">{count} errors</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Device Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Device Type Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-4">
              <Smartphone className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">
                  {deviceData ? ((deviceData.mobile / deviceData.total) * 100).toFixed(0) : 0}%
                </p>
                <p className="text-sm text-muted-foreground">Mobile</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Monitor className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">
                  {deviceData ? ((deviceData.desktop / deviceData.total) * 100).toFixed(0) : 0}%
                </p>
                <p className="text-sm text-muted-foreground">Desktop</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
