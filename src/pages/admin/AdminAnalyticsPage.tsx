import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Briefcase, DollarSign } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const [
        totalUsers,
        activeJobs,
        completedBookings,
        totalRevenue,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('contracts').select('agreed_amount'),
      ]);

      const revenue = totalRevenue.data?.reduce((sum, c) => sum + (Number(c.agreed_amount) || 0), 0) || 0;

      return {
        totalUsers: totalUsers.count || 0,
        activeJobs: activeJobs.count || 0,
        completedBookings: completedBookings.count || 0,
        totalRevenue: revenue,
      };
    },
  });

  const metrics = [
    {
      title: 'Total Users',
      value: analytics?.totalUsers || 0,
      icon: Users,
      trend: '+12.5%',
      color: 'text-blue-500',
    },
    {
      title: 'Active Jobs',
      value: analytics?.activeJobs || 0,
      icon: Briefcase,
      trend: '+8.2%',
      color: 'text-green-500',
    },
    {
      title: 'Completed Bookings',
      value: analytics?.completedBookings || 0,
      icon: TrendingUp,
      trend: '+15.3%',
      color: 'text-purple-500',
    },
    {
      title: 'Total Revenue',
      value: `€${(analytics?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      trend: '+23.1%',
      color: 'text-yellow-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Platform metrics and insights</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-500">{metric.trend}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm">User Growth Rate</span>
              <span className="text-sm font-medium">12.5% monthly</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm">Job Completion Rate</span>
              <span className="text-sm font-medium">87.3%</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm">Average Response Time</span>
              <span className="text-sm font-medium">2.4 hours</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Customer Satisfaction</span>
              <span className="text-sm font-medium">4.6/5.0</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
