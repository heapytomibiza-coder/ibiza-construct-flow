import { useAnalytics } from '@/hooks/useAnalytics';
import { useRevenueAnalytics } from '@/hooks/useRevenueAnalytics';
import { useDataExport } from '@/hooks/useDataExport';
import { KPICard } from './KPICard';
import { LineChart } from './charts/LineChart';
import { BarChart } from './charts/BarChart';
import { AreaChart } from './charts/AreaChart';
import { PieChart } from './charts/PieChart';
import { FunnelChart } from './FunnelChart';
import { CohortTable } from './CohortTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Download } from 'lucide-react';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { useState } from 'react';
import { addDays } from 'date-fns';

export function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const { kpis, isLoading, error } = useAnalytics(dateRange.from, dateRange.to);
  const { data: revenueData, isLoading: revenueLoading } = useRevenueAnalytics(dateRange.from, dateRange.to);
  const { exportData, exporting } = useDataExport();

  const handleExport = async (format: 'csv' | 'excel' | 'json' | 'pdf') => {
    await exportData('revenue', format, dateRange);
  };

  // Mock funnel data
  const funnelData = [
    { name: 'Visits', value: 10000, percentage: 100 },
    { name: 'Searched', value: 7500, percentage: 75 },
    { name: 'Viewed Profile', value: 5000, percentage: 50 },
    { name: 'Contacted', value: 2500, percentage: 25 },
    { name: 'Booked', value: 1000, percentage: 10 },
  ];

  // Mock cohort data
  const cohortData = [
    { cohort: 'Jan 2024', size: 150, retention: [100, 85, 72, 65, 58, 52] },
    { cohort: 'Feb 2024', size: 180, retention: [100, 88, 75, 68, 61] },
    { cohort: 'Mar 2024', size: 200, retention: [100, 90, 78, 70] },
    { cohort: 'Apr 2024', size: 220, retention: [100, 92, 80] },
  ];

  if (isLoading || revenueLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-destructive">Error loading analytics: {error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
        <div className="flex items-center gap-4">
          <DatePickerWithRange
            date={dateRange}
            onDateChange={(range) => range && setDateRange(range)}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
            disabled={exporting}
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="funnel">Conversion</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Total Users"
              value={kpis?.total_users || 0}
            />
            <KPICard
              title="Active Users"
              value={kpis?.active_users || 0}
            />
            <KPICard
              title="Total Bookings"
              value={kpis?.total_bookings || 0}
            />
            <KPICard
              title="Active Disputes"
              value={kpis?.active_disputes || 0}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  ${(kpis?.total_revenue || 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Average Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {(kpis?.average_rating || 0).toFixed(1)} / 5.0
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="p-6">
            <AreaChart
              data={revenueData}
              xKey="date"
              areas={[
                { key: 'revenue', name: 'Revenue', color: 'hsl(var(--primary))' },
                { key: 'transactions', name: 'Transactions', color: 'hsl(var(--secondary))' },
              ]}
              title="Revenue Trends"
              height={400}
            />
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <KPICard
              title="Total Revenue"
              value={`$${(kpis?.total_revenue || 0).toLocaleString()}`}
            />
            <KPICard
              title="Completed Bookings"
              value={kpis?.completed_bookings || 0}
            />
            <KPICard
              title="Avg. Booking Value"
              value={`$${kpis?.completed_bookings ? ((kpis.total_revenue / kpis.completed_bookings) || 0).toFixed(2) : '0.00'}`}
            />
          </div>

          <Card className="p-6">
            <LineChart
              data={revenueData}
              xKey="date"
              lines={[
                { key: 'revenue', name: 'Revenue ($)', color: 'hsl(var(--primary))' },
              ]}
              title="Daily Revenue"
              height={400}
            />
          </Card>

          <Card className="p-6">
            <BarChart
              data={revenueData.slice(-7)}
              xKey="date"
              bars={[
                { key: 'transactions', name: 'Transactions', color: 'hsl(var(--primary))' },
              ]}
              title="Daily Transactions (Last 7 Days)"
              height={300}
            />
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <KPICard
              title="Total Users"
              value={kpis?.total_users || 0}
            />
            <KPICard
              title="Active Users"
              value={kpis?.active_users || 0}
            />
            <KPICard
              title="New Users"
              value={kpis?.new_users || 0}
            />
          </div>

          <CohortTable data={cohortData} title="User Retention Cohorts" />

          <Card className="p-6">
            <PieChart
              data={[
                { name: 'Active', value: kpis?.active_users || 0 },
                { name: 'Inactive', value: (kpis?.total_users || 0) - (kpis?.active_users || 0) },
              ]}
              colors={['hsl(var(--primary))', 'hsl(var(--muted))']}
              title="User Activity Distribution"
              height={300}
            />
          </Card>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-4">
          <FunnelChart data={funnelData} title="Conversion Funnel" />
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Overall Conversion</span>
                  <span className="font-semibold">10%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Search to Contact</span>
                  <span className="font-semibold">33.3%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contact to Book</span>
                  <span className="font-semibold">40%</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Improvement Areas</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Biggest Drop-off</p>
                  <p className="text-sm text-muted-foreground">Search to Profile (25% drop)</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Recommendation</p>
                  <p className="text-sm text-muted-foreground">
                    Improve search results relevance and professional profiles
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
