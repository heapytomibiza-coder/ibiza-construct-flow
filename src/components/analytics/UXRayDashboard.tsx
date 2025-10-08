import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { 
  AlertTriangle, 
  XCircle, 
  CheckCircle2,
  TrendingDown,
  FileWarning 
} from 'lucide-react';
import { z } from 'zod';

const UXHealthCheckSchema = z.object({
  id: z.string().uuid(),
  check_type: z.string(),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  entity_type: z.string().nullable(),
  entity_id: z.string().nullable(),
  message: z.string(),
  metadata: z.any(),
  detected_at: z.string(),
  resolved_at: z.string().nullable(),
  status: z.enum(['active', 'resolved', 'ignored']),
});

type UXHealthCheck = z.infer<typeof UXHealthCheckSchema>;

export const UXRayDashboard = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch active health warnings
  const { data: healthChecks, isLoading } = useQuery<UXHealthCheck[]>({
    queryKey: ['ux-health-checks', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ux_health_checks')
        .select('*')
        .eq('status', 'active')
        .order('priority_weight', { ascending: false })
        .order('detected_at', { ascending: false });
      
      if (error) throw error;
      return z.array(UXHealthCheckSchema).parse(data ?? []);
    },
    staleTime: 30_000, // 30 seconds
  });
  
  // Real-time subscription for new UX health warnings
  useEffect(() => {
    const channel = supabase
      .channel('ux-health-checks-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ux_health_checks',
          filter: 'status=eq.active'
        },
        (payload: any) => {
          console.log('New UX health warning detected:', payload);
          
          // Show toast notification for critical/high severity warnings
          if (payload.new?.severity === 'critical' || payload.new?.severity === 'high') {
            toast({
              title: `${payload.new.severity.toUpperCase()} UX Issue Detected`,
              description: payload.new.message,
              variant: payload.new.severity === 'critical' ? 'destructive' : 'default',
            });
          }
          
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['ux-health-checks'] });
        }
      )
      .subscribe();
    
    return () => { 
      supabase.removeChannel(channel); 
    };
  }, [queryClient, toast]);
  
  // Mark check as resolved
  const resolveCheck = useMutation({
    mutationFn: async (checkId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('ux_health_checks')
        .update({ 
          status: 'resolved', 
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id 
        })
        .eq('id', checkId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ux-health-checks'] });
    }
  });
  
  const getSeverityVariant = (severity: string): 'destructive' | 'default' | 'secondary' | 'outline' => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };
  
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return XCircle;
      case 'high': return AlertTriangle;
      default: return FileWarning;
    }
  };
  
  if (isLoading) {
    return <div className="animate-pulse">Loading UX-Ray analysis...</div>;
  }
  
  const criticalCount = healthChecks?.filter(c => c.severity === 'critical').length || 0;
  const highCount = healthChecks?.filter(c => c.severity === 'high').length || 0;
  
  return (
    <div className="space-y-6">
      {/* KPI Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{criticalCount}</div>
            <p className="text-xs text-muted-foreground">Requires immediate action</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{highCount}</div>
            <p className="text-xs text-muted-foreground">Review within 24 hours</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Active</CardTitle>
            <TrendingDown className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthChecks?.length || 0}</div>
            <p className="text-xs text-muted-foreground">UX friction points detected</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Active Health Warnings */}
      <Card>
        <CardHeader>
          <CardTitle>Active UX Health Warnings</CardTitle>
        </CardHeader>
        <CardContent>
          {healthChecks && healthChecks.length > 0 ? (
            <div className="space-y-4">
              {healthChecks.map((check) => {
                const SeverityIcon = getSeverityIcon(check.severity);
                return (
                  <div 
                    key={check.id} 
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/5 transition-colors"
                  >
                    <SeverityIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityVariant(check.severity)}>
                            {check.severity.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {check.check_type.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => resolveCheck.mutate(check.id)}
                          disabled={resolveCheck.isPending}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Mark Resolved
                        </Button>
                      </div>
                      
                      <p className="font-medium">{check.message}</p>
                      
                      {check.metadata && (
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="font-medium">Context:</div>
                          <div className="bg-muted/50 p-2 rounded text-xs font-mono">
                            {Object.entries(check.metadata).map(([key, value]) => (
                              <div key={key}>
                                <span className="font-semibold">{key}:</span> {JSON.stringify(value)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        Detected {new Date(check.detected_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-medium">All Clear!</p>
              <p className="text-sm">No active UX health warnings detected.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};