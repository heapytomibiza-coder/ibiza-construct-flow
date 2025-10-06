import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface PaymentTrendsChartProps {
  userId?: string;
  days?: number;
}

export const PaymentTrendsChart = ({ userId, days = 30 }: PaymentTrendsChartProps) => {
  const { data: trendsData, isLoading } = useQuery({
    queryKey: ['payment-trends', userId, days],
    queryFn: async () => {
      const startDate = subDays(new Date(), days);
      
      let query = supabase
        .from('payment_transactions')
        .select('created_at, amount, status')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Group by date
      const groupedData = data?.reduce((acc: any, transaction: any) => {
        const date = format(new Date(transaction.created_at), 'MMM dd');
        
        if (!acc[date]) {
          acc[date] = {
            date,
            total: 0,
            completed: 0,
            pending: 0,
            failed: 0,
          };
        }

        acc[date].total += transaction.amount;
        if (transaction.status === 'completed' || transaction.status === 'succeeded') {
          acc[date].completed += transaction.amount;
        } else if (transaction.status === 'pending') {
          acc[date].pending += transaction.amount;
        } else if (transaction.status === 'failed') {
          acc[date].failed += transaction.amount;
        }

        return acc;
      }, {});

      return Object.values(groupedData || {});
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Trends</CardTitle>
        <CardDescription>Last {days} days</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendsData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="completed" 
              stroke="hsl(var(--chart-1))" 
              strokeWidth={2}
              name="Completed"
            />
            <Line 
              type="monotone" 
              dataKey="pending" 
              stroke="hsl(var(--chart-2))" 
              strokeWidth={2}
              name="Pending"
            />
            <Line 
              type="monotone" 
              dataKey="failed" 
              stroke="hsl(var(--chart-3))" 
              strokeWidth={2}
              name="Failed"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
