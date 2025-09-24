import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Server, Database, Cloud, Wifi, AlertTriangle, CheckCircle, Clock, RefreshCw, Zap } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  uptime: number;
  response_time: number;
  error_rate: number;
  last_check: string;
  description: string;
  icon: React.ElementType;
}

interface SystemMetric {
  name: string;
  current_value: number;
  target_value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
}

interface PerformanceData {
  timestamp: string;
  api_response: number;
  database_query: number;
  page_load: number;
  error_rate: number;
}

export const SystemHealthMonitor = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [overallStatus, setOverallStatus] = useState<'healthy' | 'degraded' | 'down'>('healthy');
  const { toast } = useToast();

  useEffect(() => {
    loadSystemHealth();
    // Set up real-time monitoring
    const interval = setInterval(loadSystemHealth, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSystemHealth = async () => {
    try {
      setRefreshing(true);

      // Load system health metrics
      const { data: healthData, error: healthError } = await supabase
        .from('system_health_metrics')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(50);

      if (healthError) throw healthError;

      // Mock service health data - in production this would come from monitoring services
      const mockServices: ServiceHealth[] = [
        {
          name: 'API Gateway',
          status: 'healthy',
          uptime: 99.9,
          response_time: 120,
          error_rate: 0.1,
          last_check: new Date().toISOString(),
          description: 'Main API endpoints',
          icon: Server
        },
        {
          name: 'Database',
          status: 'healthy',
          uptime: 99.95,
          response_time: 45,
          error_rate: 0.05,
          last_check: new Date().toISOString(),
          description: 'Primary database cluster',
          icon: Database
        },
        {
          name: 'Authentication',
          status: 'warning',
          uptime: 98.5,
          response_time: 180,
          error_rate: 1.2,
          last_check: new Date().toISOString(),
          description: 'User authentication service',
          icon: Cloud
        },
        {
          name: 'File Storage',
          status: 'healthy',
          uptime: 99.8,
          response_time: 95,
          error_rate: 0.3,
          last_check: new Date().toISOString(),
          description: 'Document and image storage',
          icon: Cloud
        },
        {
          name: 'Real-time Sync',
          status: 'healthy',
          uptime: 99.7,
          response_time: 78,
          error_rate: 0.2,
          last_check: new Date().toISOString(),
          description: 'WebSocket connections',
          icon: Wifi
        }
      ];

      // Mock system metrics
      const mockMetrics: SystemMetric[] = [
        {
          name: 'CPU Usage',
          current_value: 65,
          target_value: 80,
          unit: '%',
          trend: 'stable',
          status: 'good'
        },
        {
          name: 'Memory Usage',
          current_value: 72,
          target_value: 85,
          unit: '%',
          trend: 'up',
          status: 'good'
        },
        {
          name: 'Disk Usage',
          current_value: 45,
          target_value: 90,
          unit: '%',
          trend: 'stable',
          status: 'good'
        },
        {
          name: 'Network Latency',
          current_value: 89,
          target_value: 200,
          unit: 'ms',
          trend: 'down',
          status: 'good'
        },
        {
          name: 'Active Connections',
          current_value: 1247,
          target_value: 2000,
          unit: '',
          trend: 'up',
          status: 'good'
        },
        {
          name: 'Queue Depth',
          current_value: 12,
          target_value: 100,
          unit: '',
          trend: 'stable',
          status: 'good'
        }
      ];

      // Mock performance data over time
      const mockPerformanceData: PerformanceData[] = Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
        api_response: Math.floor(Math.random() * 50) + 100,
        database_query: Math.floor(Math.random() * 30) + 20,
        page_load: Math.floor(Math.random() * 200) + 800,
        error_rate: Math.random() * 2
      }));

      setServices(mockServices);
      setMetrics(mockMetrics);
      setPerformanceData(mockPerformanceData);

      // Calculate overall status
      const hasError = mockServices.some(s => s.status === 'error');
      const hasWarning = mockServices.some(s => s.status === 'warning');
      setOverallStatus(hasError ? 'down' : hasWarning ? 'degraded' : 'healthy');

    } catch (error) {
      console.error('Error loading system health:', error);
      toast({
        title: "Error loading system health",
        description: "Failed to load system monitoring data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': case 'good': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': case 'critical': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': case 'good': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': case 'critical': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with overall status */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6" />
            System Health Monitor
          </h2>
          <div className="flex items-center gap-2 mt-1">
            {getStatusIcon(overallStatus)}
            <span className={`font-medium ${getStatusColor(overallStatus)}`}>
              System {overallStatus === 'healthy' ? 'Healthy' : overallStatus === 'degraded' ? 'Degraded' : 'Down'}
            </span>
          </div>
        </div>
        <Button onClick={loadSystemHealth} disabled={refreshing} size="sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Service Status Cards */}
            {services.slice(0, 3).map((service, index) => (
              <Card key={index} className="hover-scale">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{service.name}</CardTitle>
                  <service.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(service.status)}
                    <Badge variant={
                      service.status === 'healthy' ? 'default' :
                      service.status === 'warning' ? 'secondary' : 'destructive'
                    }>
                      {service.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Uptime: {service.uptime}%</div>
                    <div>Response: {service.response_time}ms</div>
                    <div>Error Rate: {service.error_rate}%</div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Quick Metrics */}
            {metrics.slice(0, 3).map((metric, index) => (
              <Card key={index} className="hover-scale">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metric.current_value}{metric.unit}
                  </div>
                  <Progress 
                    value={(metric.current_value / metric.target_value) * 100} 
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Target: {metric.target_value}{metric.unit}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="services">
          <div className="space-y-4">
            {services.map((service, index) => (
              <Card key={index} className="hover-scale">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <service.icon className="w-8 h-8 text-muted-foreground" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{service.name}</h4>
                          {getStatusIcon(service.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <div className="text-sm text-muted-foreground">Uptime</div>
                        <div className="font-bold">{service.uptime}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Response</div>
                        <div className="font-bold">{service.response_time}ms</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Errors</div>
                        <div className="font-bold">{service.error_rate}%</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="metrics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics.map((metric, index) => (
              <Card key={index} className="hover-scale">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  {getStatusIcon(metric.status)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    {metric.current_value}{metric.unit}
                  </div>
                  <Progress 
                    value={(metric.current_value / metric.target_value) * 100} 
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Target: {metric.target_value}{metric.unit}</span>
                    <Badge variant="outline" className="text-xs">
                      {metric.trend}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Response Time Trends</CardTitle>
                <CardDescription>API and database response times over the last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="api_response" 
                      stroke="hsl(var(--primary))" 
                      name="API Response (ms)"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="database_query" 
                      stroke="#00C49F" 
                      name="DB Query (ms)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Rate</CardTitle>
                <CardDescription>System error rates over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="error_rate" 
                      stroke="#FF8042" 
                      fill="#FF8042"
                      fillOpacity={0.3}
                      name="Error Rate (%)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};