import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Database, Users, Briefcase, CreditCard, Flag } from 'lucide-react';

interface TableStat {
  table: string;
  count: number;
  icon: React.ReactNode;
  label: string;
}

const DatabaseStats = () => {
  const [stats, setStats] = useState<TableStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getTableCount = async (tableName: 'profiles' | 'bookings' | 'services' | 'escrow_payments' | 'feature_flags') => {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (error) throw error;
        return count || 0;
      } catch (error) {
        console.error(`Error counting ${tableName}:`, error);
        return 0;
      }
    };

    const loadStats = async () => {
      try {
        const results = await Promise.all([
          {
            table: 'profiles',
            label: 'Users',
            icon: <Users className="w-4 h-4" />,
            count: await getTableCount('profiles'),
          },
          {
            table: 'bookings',
            label: 'Bookings',
            icon: <Briefcase className="w-4 h-4" />,
            count: await getTableCount('bookings'),
          },
          {
            table: 'services',
            label: 'Services',
            icon: <Database className="w-4 h-4" />,
            count: await getTableCount('services'),
          },
          {
            table: 'escrow_payments',
            label: 'Payments',
            icon: <CreditCard className="w-4 h-4" />,
            count: await getTableCount('escrow_payments'),
          },
          {
            table: 'feature_flags',
            label: 'Feature Flags',
            icon: <Flag className="w-4 h-4" />,
            count: await getTableCount('feature_flags'),
          },
        ]);

        setStats(results);
      } catch (error) {
        console.error('Error loading database stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();

    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-16 mb-2"></div>
                <div className="h-8 bg-muted rounded w-8 mb-1"></div>
                <div className="h-3 bg-muted rounded w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <Card key={stat.table}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.count}</div>
            <p className="text-xs text-muted-foreground">
              Total records
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DatabaseStats;