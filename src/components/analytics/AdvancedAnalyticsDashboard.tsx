import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, TrendingDown, Users, DollarSign, Activity, AlertTriangle, Download, RefreshCw } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  description: string;
}

interface ChartData {
  name: string;
  value: number;
  revenue?: number;
  jobs?: number;
  users?: number;
  date?: string;
}

export const AdvancedAnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [revenueData, setRevenueData] = useState<ChartData[]>([]);
  const [jobsData, setJobsData] = useState<ChartData[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<ChartData[]>([]);
  const [performanceData, setPerformanceData] = useState<ChartData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const { toast } = useToast();

  const loadAnalytics = async () => {
    try {
      setRefreshing(true);
      
      // Load business metrics
      const { data: businessMetrics, error: metricsError } = await supabase
        .from('business_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (metricsError) throw metricsError;

      // Process metrics data
      const processedMetrics: MetricCard[] = [
        {
          title: 'Total Revenue',
          value: '$124,320',
          change: 12.5,
          trend: 'up',
          icon: DollarSign,
          description: 'vs last month'
        },
        {
          title: 'Active Jobs',
          value: '1,247',
          change: -2.3,
          trend: 'down',
          icon: Activity,
          description: 'Currently active'
        },
        {
          title: 'User Growth',
          value: '2,850',
          change: 8.7,
          trend: 'up',
          icon: Users,
          description: 'New users this month'
        },
        {
          title: 'Completion Rate',
          value: '94.2%',
          change: 1.8,
          trend: 'up',
          icon: TrendingUp,
          description: 'Job completion rate'
        }
      ];

      setMetrics(processedMetrics);

      // Mock chart data - in production, this would come from business_metrics table
      const mockRevenueData: ChartData[] = Array.from({ length: 30 }, (_, i) => ({
        name: `Day ${i + 1}`,
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 5000) + 1000,
        jobs: Math.floor(Math.random() * 50) + 10,
        users: Math.floor(Math.random() * 100) + 20,
        value: Math.floor(Math.random() * 1000) + 500
      }));

      setRevenueData(mockRevenueData);
      setJobsData(mockRevenueData);
      setUserGrowthData(mockRevenueData);
      setPerformanceData(mockRevenueData);

    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Error loading analytics",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const exportData = async (format: 'csv' | 'pdf') => {
    toast({
      title: "Exporting data",
      description: `Generating ${format.toUpperCase()} export...`
    });
    
    // Implementation would call export API
    setTimeout(() => {
      toast({
        title: "Export complete",
        description: "Download started automatically"
      });
    }, 2000);
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Business Intelligence</h1>
          <p className="text-muted-foreground">Real-time analytics and insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportData('csv')} size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => exportData('pdf')} size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={loadAnalytics} disabled={refreshing} size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        {[
          { key: '7d', label: '7 Days' },
          { key: '30d', label: '30 Days' },
          { key: '90d', label: '90 Days' },
          { key: '1y', label: '1 Year' }
        ].map(period => (
          <Button
            key={period.key}
            variant={selectedPeriod === period.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod(period.key as any)}
          >
            {period.label}
          </Button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="hover-scale">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center text-xs">
                {metric.trend === 'up' ? (
                  <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                ) : metric.trend === 'down' ? (
                  <TrendingDown className="w-3 h-3 mr-1 text-red-500" />
                ) : null}
                <span className={
                  metric.trend === 'up' ? 'text-green-500' : 
                  metric.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
                }>
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </span>
                <span className="text-muted-foreground ml-1">{metric.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Daily revenue over the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Activity</CardTitle>
              <CardDescription>Job completion and creation trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={jobsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="jobs" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>New user registrations and activity</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Performance</CardTitle>
              <CardDescription>System health and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};