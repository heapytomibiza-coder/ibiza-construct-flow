import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Briefcase, Calendar, DollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardKpis {
  total_users: number;
  total_professionals: number;
  total_jobs: number;
  active_jobs: number;
  total_bookings: number;
  total_revenue: number;
}

export function KpiSummary() {
  const { data: kpis, isLoading } = useQuery({
    queryKey: ['admin-dashboard-kpis'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_dashboard_stats');
      if (error) throw error;
      return data as unknown as DashboardKpis;
    },
  });

  const kpiCards = [
    {
      title: 'Total Users',
      value: kpis?.total_users || 0,
      change: '+12% vs last month',
      icon: Users,
    },
    {
      title: 'Active Jobs',
      value: kpis?.active_jobs || 0,
      change: '+8% vs last week',
      icon: Briefcase,
    },
    {
      title: 'Bookings (30d)',
      value: kpis?.total_bookings || 0,
      change: '+15% vs last month',
      icon: Calendar,
    },
    {
      title: 'Revenue (30d)',
      value: `€${((kpis?.total_revenue || 0) / 100).toFixed(2)}`,
      change: '+23% vs last month',
      icon: DollarSign,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiCards.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.title}>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                <h3 className="text-2xl font-semibold mt-1">{kpi.value}</h3>
                <p className="text-xs text-green-600 mt-1">{kpi.change}</p>
              </div>
              <Icon className="h-8 w-8 text-muted-foreground" />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
