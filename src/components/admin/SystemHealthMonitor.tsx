import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export function SystemHealthMonitor() {
  const { data: errorStats } = useQuery({
    queryKey: ['system-error-stats'],
    queryFn: async () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const { count: errorCount } = await (supabase as any)
        .from('client_logs')
        .select('*', { count: 'exact', head: true })
        .eq('level', 'error')
        .gte('created_at', oneHourAgo);

      const { count: warnCount } = await (supabase as any)
        .from('client_logs')
        .select('*', { count: 'exact', head: true })
        .eq('level', 'warn')
        .gte('created_at', oneHourAgo);

      return { errorCount: errorCount || 0, warnCount: warnCount || 0 };
    },
    refetchInterval: 30000
  });

  const { data: recentErrors } = useQuery({
    queryKey: ['recent-errors'],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('client_logs')
        .select('*')
        .eq('level', 'error')
        .order('created_at', { ascending: false })
        .limit(10);

      return data || [];
    },
    refetchInterval: 30000
  });

  const { data: alerts } = useQuery({
    queryKey: ['admin-alerts'],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('admin_alerts')
        .select('*')
        .eq('is_resolved', false)
        .order('created_at', { ascending: false })
        .limit(5);

      return data || [];
    },
    refetchInterval: 30000
  });

  const getHealthStatus = () => {
    if (!errorStats) return 'unknown';
    if (errorStats.errorCount > 10) return 'critical';
    if (errorStats.errorCount > 5 || errorStats.warnCount > 20) return 'warning';
    return 'healthy';
  };

  const healthStatus = getHealthStatus();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {healthStatus === 'healthy' && (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <Badge variant="outline" className="bg-green-50">Healthy</Badge>
                </>
              )}
              {healthStatus === 'warning' && (
                <>
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <Badge variant="outline" className="bg-yellow-50">Warning</Badge>
                </>
              )}
              {healthStatus === 'critical' && (
                <>
                  <XCircle className="w-5 h-5 text-red-500" />
                  <Badge variant="destructive">Critical</Badge>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Errors (1h)</CardTitle>
            <XCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorStats?.errorCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Warnings (1h)</CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorStats?.warnCount || 0}</div>
          </CardContent>
        </Card>
      </div>

      {alerts && alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map((alert: any) => (
              <Alert key={alert.id} variant={alert.severity === 'high' ? 'destructive' : 'default'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{alert.alert_type}</p>
                      <p className="text-sm">{alert.message}</p>
                    </div>
                    <Badge variant="outline">
                      {new Date(alert.created_at).toLocaleTimeString()}
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Errors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentErrors && recentErrors.length > 0 ? (
              recentErrors.map((error: any) => (
                <div 
                  key={error.id} 
                  className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-medium text-sm">{error.message}</p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(error.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{error.url}</p>
                  {error.stack && (
                    <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                      {error.stack}
                    </pre>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No recent errors</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
