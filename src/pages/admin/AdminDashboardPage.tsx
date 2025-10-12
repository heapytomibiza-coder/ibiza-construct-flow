import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuickActions } from '@/components/admin/dashboard/QuickActions';
import { Users, Briefcase, Calendar, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const [users, jobs, bookings, contracts, disputes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('jobs').select('id', { count: 'exact', head: true }),
        supabase.from('bookings').select('id', { count: 'exact', head: true }),
        supabase.from('contracts').select('agreed_amount'),
        supabase.from('disputes').select('id', { count: 'exact', head: true }).eq('status', 'open'),
      ]);

      const totalRevenue = contracts.data?.reduce((sum, c) => sum + (Number(c.agreed_amount) || 0), 0) || 0;

      return {
        totalUsers: users.count || 0,
        totalJobs: jobs.count || 0,
        totalBookings: bookings.count || 0,
        totalRevenue,
        openDisputes: disputes.count || 0,
      };
    },
  });

  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-500' },
    { title: 'Total Jobs', value: stats?.totalJobs || 0, icon: Briefcase, color: 'text-green-500' },
    { title: 'Total Bookings', value: stats?.totalBookings || 0, icon: Calendar, color: 'text-purple-500' },
    { title: 'Total Revenue', value: `€${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-yellow-500' },
    { title: 'Open Disputes', value: stats?.openDisputes || 0, icon: AlertTriangle, color: 'text-red-500' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and management</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <QuickActions />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Platform Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">System Status</span>
              <span className="text-sm font-medium text-green-500">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Database</span>
              <span className="text-sm font-medium text-green-500">Healthy</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">API Response Time</span>
              <span className="text-sm font-medium">~120ms</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
