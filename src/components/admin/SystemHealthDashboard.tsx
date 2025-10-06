import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Database,
  Zap,
  Shield,
  TrendingUp
} from 'lucide-react';
import { HealthChecker, HealthCheckResult } from '@/lib/monitoring/healthCheck';
import { ErrorTracker } from '@/lib/monitoring/errorTracking';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function SystemHealthDashboard() {
  const [healthSummary, setHealthSummary] = useState<any>(null);
  const [errorSummary, setErrorSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const { toast } = useToast();

  const fetchHealthData = async () => {
    setLoading(true);
    try {
      const [health, errors] = await Promise.all([
        HealthChecker.getHealthSummary(),
        ErrorTracker.getUnresolvedErrorsSummary(),
      ]);

      setHealthSummary(health);
      setErrorSummary(errors);
      setLastChecked(new Date());
    } catch (error: any) {
      console.error('Error fetching health data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch system health data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const runHealthChecks = async () => {
    setLoading(true);
    try {
      await HealthChecker.runAllChecks();
      await fetchHealthData();
      
      toast({
        title: 'Health checks complete',
        description: 'System health has been updated',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to run health checks',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resolveError = async (errorId: string) => {
    const success = await ErrorTracker.resolveError(errorId);
    
    if (success) {
      toast({
        title: 'Error resolved',
        description: 'Error has been marked as resolved',
      });
      await fetchHealthData();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to resolve error',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchHealthData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealthData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      healthy: 'default',
      degraded: 'secondary',
      unhealthy: 'destructive',
    };
    
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  if (loading && !healthSummary) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-32 bg-muted rounded-lg mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-64 bg-muted rounded-lg"></div>
            <div className="h-64 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Health Monitor</h2>
          <p className="text-sm text-muted-foreground">
            Last checked: {lastChecked.toLocaleTimeString()}
          </p>
        </div>
        <Button onClick={runHealthChecks} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Run Health Checks
        </Button>
      </div>

      {/* Overall Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(healthSummary?.overallStatus)}
              Overall System Status
            </CardTitle>
            {getStatusBadge(healthSummary?.overallStatus)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Database</p>
                <p className="text-lg font-semibold">
                  {healthSummary?.checks?.find((c: any) => c.name === 'database_connection')?.status || 'Unknown'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Auth Service</p>
                <p className="text-lg font-semibold">
                  {healthSummary?.checks?.find((c: any) => c.name === 'auth_service')?.status || 'Unknown'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Edge Functions</p>
                <p className="text-lg font-semibold">Operational</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Performance</p>
                <p className="text-lg font-semibold">Good</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed View */}
      <Tabs defaultValue="checks">
        <TabsList>
          <TabsTrigger value="checks">Health Checks</TabsTrigger>
          <TabsTrigger value="errors">
            Errors
            {errorSummary?.totalUnresolved > 0 && (
              <Badge variant="destructive" className="ml-2">
                {errorSummary.totalUnresolved}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="checks" className="space-y-4">
          {healthSummary?.checks?.map((check: any, index: number) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(check.status)}
                    <div>
                      <CardTitle className="text-base">{check.name}</CardTitle>
                      <p className="text-sm text-muted-foreground capitalize">{check.type}</p>
                    </div>
                  </div>
                  {getStatusBadge(check.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Response Time:</span>
                    <span className="ml-2 font-medium">{check.response_time_ms}ms</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Checked:</span>
                    <span className="ml-2 font-medium">
                      {new Date(check.checked_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          {/* Error Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Error Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Unresolved</p>
                  <p className="text-2xl font-bold">{errorSummary?.totalUnresolved || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Critical</p>
                  <p className="text-2xl font-bold text-red-500">{errorSummary?.criticalCount || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Errors</p>
                  <p className="text-2xl font-bold text-orange-500">{errorSummary?.errorCount || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Warnings</p>
                  <p className="text-2xl font-bold text-yellow-500">{errorSummary?.warningCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Errors */}
          {errorSummary?.recentErrors?.length > 0 ? (
            errorSummary.recentErrors.map((error: any) => (
              <Card key={error.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{error.function_name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(error.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge
                      variant={
                        error.severity === 'critical'
                          ? 'destructive'
                          : error.severity === 'error'
                          ? 'secondary'
                          : 'default'
                      }
                    >
                      {error.severity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">{error.error_message}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => resolveError(error.id)}
                  >
                    Mark as Resolved
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <p>No recent errors found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
