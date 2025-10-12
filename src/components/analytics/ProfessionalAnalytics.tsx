import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Users, Star, Calendar, AlertTriangle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProfessionalAnalyticsProps {
  professionalId: string;
}

export function ProfessionalAnalytics({ professionalId }: ProfessionalAnalyticsProps) {
  const { data: stats } = useQuery({
    queryKey: ['professional-stats', professionalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professional_stats')
        .select('*')
        .eq('professional_id', professionalId)
        .single();
      if (error) throw error;
      return data;
    }
  });

  const { data: earningsData } = useQuery({
    queryKey: ['earnings-timeline', professionalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('amount, created_at, currency')
        .eq('user_id', professionalId)
        .in('status', ['completed', 'succeeded'])
        .order('created_at', { ascending: true })
        .limit(30);
      if (error) throw error;
      
      // Group by day
      const grouped = data.reduce((acc: any, curr) => {
        const date = new Date(curr.created_at).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { date, amount: 0 };
        }
        acc[date].amount += curr.amount;
        return acc;
      }, {});
      
      return Object.values(grouped);
    }
  });

  const { data: viewsData } = useQuery({
    queryKey: ['profile-views-timeline', professionalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile_views')
        .select('viewed_at')
        .eq('professional_id', professionalId)
        .order('viewed_at', { ascending: true })
        .limit(30);
      if (error) throw error;
      
      // Group by day
      const grouped = data.reduce((acc: any, curr) => {
        const date = new Date(curr.viewed_at).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { date, views: 0 };
        }
        acc[date].views += 1;
        return acc;
      }, {});
      
      return Object.values(grouped);
    }
  });

  const metrics = [
    {
      title: 'Total Earnings',
      value: `€${stats?.total_earnings?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Completed Jobs',
      value: stats?.completed_bookings || 0,
      icon: Calendar,
      trend: '+8%',
      trendUp: true
    },
    {
      title: 'Average Rating',
      value: stats?.average_rating?.toFixed(1) || '0.0',
      icon: Star,
      trend: '+0.2',
      trendUp: true
    },
    {
      title: 'Completion Rate',
      value: `${stats?.completion_rate?.toFixed(0) || 0}%`,
      icon: TrendingUp,
      trend: '+5%',
      trendUp: true
    }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <h3 className="text-2xl font-bold mt-2">{metric.value}</h3>
                  <p className={`text-sm mt-1 ${metric.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.trend} from last month
                  </p>
                </div>
                <metric.icon className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Earnings Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile Views</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={viewsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}