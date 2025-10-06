import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAnalytics, usePlatformAnalytics } from '@/hooks/useAnalytics';
import { useAuth } from '@/hooks/useAuth';
import { KPICard } from './KPICard';
import { Calendar, TrendingUp, Users, Briefcase, DollarSign, Star, AlertCircle } from 'lucide-react';

export const AnalyticsDashboard = () => {
  const { user, isAdmin } = useAuth();
  const [dateRange, setDateRange] = useState('30');
  const { kpis, isLoading, error } = useAnalytics();
  const { metrics, isLoading: platformLoading } = usePlatformAnalytics();

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
  };

  if (isLoading || platformLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-destructive">
        <p>Error loading analytics: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Track your performance and activity metrics
          </p>
        </div>
        <Select value={dateRange} onValueChange={handleDateRangeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {isAdmin?.() && <TabsTrigger value="platform">Platform</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Total Users"
              value={kpis?.total_users || 0}
              icon={<Users className="h-4 w-4" />}
            />
            <KPICard
              title="Active Users"
              value={kpis?.active_users || 0}
              icon={<TrendingUp className="h-4 w-4" />}
            />
            <KPICard
              title="Total Bookings"
              value={kpis?.total_bookings || 0}
              icon={<Briefcase className="h-4 w-4" />}
            />
            <KPICard
              title="Active Disputes"
              value={kpis?.active_disputes || 0}
              icon={<AlertCircle className="h-4 w-4" />}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue</CardTitle>
                <CardDescription>Total platform revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(kpis?.total_revenue || 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Rating</CardTitle>
                <CardDescription>Platform-wide rating</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">
                    {(kpis?.average_rating || 0).toFixed(1)}
                  </div>
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {isAdmin?.() && (
          <TabsContent value="platform" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <KPICard
                title="Total Users"
                value={metrics?.total_users || kpis?.total_users || 0}
                icon={<Users className="h-4 w-4" />}
              />
              <KPICard
                title="Active Users"
                value={metrics?.active_users || kpis?.active_users || 0}
                icon={<TrendingUp className="h-4 w-4" />}
              />
              <KPICard
                title="Total Bookings"
                value={metrics?.total_bookings || kpis?.total_bookings || 0}
                icon={<Briefcase className="h-4 w-4" />}
              />
              <KPICard
                title="Revenue"
                value={`$${(metrics?.total_revenue || kpis?.total_revenue || 0).toLocaleString()}`}
                icon={<DollarSign className="h-4 w-4" />}
              />
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
