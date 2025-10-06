import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Database, Zap, Clock, TrendingUp, Server } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function PerformanceMonitor() {
  // Background Jobs Status
  const { data: jobsStats } = useQuery({
    queryKey: ['background-jobs-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('background_jobs')
        .select('status, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      
      if (error) throw error;
      
      const stats = {
        pending: data?.filter(j => j.status === 'pending').length || 0,
        processing: data?.filter(j => j.status === 'processing').length || 0,
        completed: data?.filter(j => j.status === 'completed').length || 0,
        failed: data?.filter(j => j.status === 'failed').length || 0,
        total: data?.length || 0
      };
      
      return stats;
    },
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  // Cache Performance
  const { data: cacheStats } = useQuery({
    queryKey: ['cache-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kpi_cache')
        .select('cache_key, expires_at, created_at');
      
      if (error) throw error;
      
      const now = new Date();
      const active = data?.filter(c => new Date(c.expires_at) > now).length || 0;
      const expired = data?.filter(c => new Date(c.expires_at) <= now).length || 0;
      
      return { active, expired, total: data?.length || 0 };
    }
  });

  // Recent Job Performance
  const { data: recentJobs } = useQuery({
    queryKey: ['recent-background-jobs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('background_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      return data || [];
    }
  });

  // Aggregate job performance over time
  const jobPerformanceData = recentJobs?.reduce((acc: any[], job: any) => {
    const hour = new Date(job.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const existing = acc.find(item => item.time === hour);
    
    if (existing) {
      existing[job.status] = (existing[job.status] || 0) + 1;
    } else {
      acc.push({ time: hour, [job.status]: 1 });
    }
    
    return acc;
  }, []) || [];

  const successRate = jobsStats ? 
    ((jobsStats.completed / (jobsStats.total || 1)) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Performance Monitor</h2>
        <p className="text-muted-foreground">System performance and background job status</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobsStats?.processing || 0}</div>
            <p className="text-xs text-muted-foreground">
              {jobsStats?.pending || 0} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cache Hits</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cacheStats?.active || 0}</div>
            <p className="text-xs text-muted-foreground">
              {cacheStats?.expired || 0} expired
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Failed Jobs</CardTitle>
            <Server className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobsStats?.failed || 0}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="jobs">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="jobs">Background Jobs</TabsTrigger>
          <TabsTrigger value="cache">Cache Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Background Jobs</CardTitle>
              <CardDescription>Last 50 jobs execution status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentJobs?.slice(0, 10).map((job: any) => (
                  <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Activity className="h-4 w-4" />
                      <div>
                        <p className="font-medium capitalize">{job.job_type.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(job.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {job.retry_count > 0 && (
                        <Badge variant="outline" className="text-xs">
                          Retry {job.retry_count}
                        </Badge>
                      )}
                      <Badge variant={
                        job.status === 'completed' ? 'secondary' :
                        job.status === 'failed' ? 'destructive' :
                        job.status === 'processing' ? 'default' : 'outline'
                      }>
                        {job.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cache Statistics</CardTitle>
              <CardDescription>Cache hit rates and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Database className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <p className="text-2xl font-bold">{cacheStats?.total || 0}</p>
                    <p className="text-xs text-muted-foreground">Total Entries</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Zap className="h-6 w-6 mx-auto mb-2 text-green-500" />
                    <p className="text-2xl font-bold">{cacheStats?.active || 0}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Clock className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                    <p className="text-2xl font-bold">{cacheStats?.expired || 0}</p>
                    <p className="text-xs text-muted-foreground">Expired</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Cache helps reduce database load and improve response times
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Execution Trends</CardTitle>
              <CardDescription>Background job status over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={jobPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="completed" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Completed" />
                  <Area type="monotone" dataKey="failed" stackId="1" stroke="#ff6b6b" fill="#ff6b6b" name="Failed" />
                  <Area type="monotone" dataKey="processing" stackId="1" stroke="#ffc658" fill="#ffc658" name="Processing" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
