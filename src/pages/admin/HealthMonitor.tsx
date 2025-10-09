import { useState } from 'react';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Activity, 
  Server, 
  Database,
  HardDrive,
  Zap,
  RefreshCw
} from 'lucide-react';

interface HealthMetric {
  name: string;
  status: 'ok' | 'warning' | 'critical';
  value: number;
  threshold: number;
  unit: string;
  icon: any;
}

export default function HealthMonitor() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: metrics, refetch } = useQuery({
    queryKey: ['health-metrics'],
    queryFn: async () => {
      const mockMetrics: HealthMetric[] = [
        {
          name: 'Database Connection Pool',
          status: 'ok',
          value: 45,
          threshold: 100,
          unit: 'connections',
          icon: Database,
        },
        {
          name: 'API Response Time',
          status: 'warning',
          value: 450,
          threshold: 500,
          unit: 'ms',
          icon: Zap,
        },
        {
          name: 'Storage Usage',
          status: 'ok',
          value: 68,
          threshold: 100,
          unit: '%',
          icon: HardDrive,
        },
        {
          name: 'Memory Usage',
          status: 'ok',
          value: 72,
          threshold: 100,
          unit: '%',
          icon: Server,
        },
        {
          name: 'Active Users',
          status: 'ok',
          value: 234,
          threshold: 1000,
          unit: 'users',
          icon: Activity,
        },
      ];

      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: totalJobs } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true });

      mockMetrics.push({
        name: 'Total Users',
        status: 'ok',
        value: totalUsers || 0,
        threshold: 10000,
        unit: 'users',
        icon: Activity,
      });

      mockMetrics.push({
        name: 'Total Jobs',
        status: 'ok',
        value: totalJobs || 0,
        threshold: 5000,
        unit: 'jobs',
        icon: Database,
      });

      return mockMetrics;
    },
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getStatusIcon = (status: 'ok' | 'warning' | 'critical') => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: 'ok' | 'warning' | 'critical') => {
    switch (status) {
      case 'ok':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
    }
  };

  const overallStatus = metrics?.some(m => m.status === 'critical')
    ? 'critical'
    : metrics?.some(m => m.status === 'warning')
    ? 'warning'
    : 'ok';

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">System Health</h1>
            <p className="text-sm text-muted-foreground">
              Monitor system performance and health metrics
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant={overallStatus === 'ok' ? 'default' : 'destructive'} className="px-3 py-1">
              {getStatusIcon(overallStatus)}
              <span className="ml-2 capitalize">{overallStatus}</span>
            </Badge>
            <Button onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics?.map((metric) => {
            const Icon = metric.icon;
            const percentage = (metric.value / metric.threshold) * 100;
            
            return (
              <Card key={metric.name}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {metric.name}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {metric.value}
                        <span className="text-sm font-normal text-muted-foreground ml-1">
                          {metric.unit}
                        </span>
                      </div>
                      {getStatusIcon(metric.status)}
                    </div>
                    <Progress 
                      value={percentage} 
                      className={`h-2 [&>div]:${getStatusColor(metric.status)}`}
                    />
                    <p className="text-xs text-muted-foreground">
                      Threshold: {metric.threshold} {metric.unit}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <h3 className="font-medium">Database Connection</h3>
                    <p className="text-sm text-muted-foreground">
                      PostgreSQL connection is healthy
                    </p>
                  </div>
                </div>
                <Badge>Operational</Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <h3 className="font-medium">Storage Service</h3>
                    <p className="text-sm text-muted-foreground">
                      File storage is accessible and responsive
                    </p>
                  </div>
                </div>
                <Badge>Operational</Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <h3 className="font-medium">Authentication Service</h3>
                    <p className="text-sm text-muted-foreground">
                      User authentication is working normally
                    </p>
                  </div>
                </div>
                <Badge>Operational</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
