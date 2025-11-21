/**
 * Fair Stats Component
 * Real-time stats dashboard for fair showcase
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Building, TrendingUp, Star } from 'lucide-react';

export function FairStats() {
  const { data: stats } = useQuery({
    queryKey: ['fair-stats'],
    queryFn: async () => {
      const supabaseClient = supabase as any;
      
      const { count: totalProfiles } = await supabaseClient
        .from('professional_profiles')
        .select('*', { count: 'exact', head: true })
        .contains('featured_at_events', ['ibiza-home-meeting-2025']);

      const { count: verifiedProfiles } = await supabaseClient
        .from('professional_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_verified', true)
        .contains('featured_at_events', ['ibiza-home-meeting-2025']);

      const { data: avgRating } = await supabaseClient
        .from('professional_stats')
        .select('average_rating')
        .gte('average_rating', 0);

      const averageRating = avgRating?.length
        ? avgRating.reduce((sum, s) => sum + (s.average_rating || 0), 0) / avgRating.length
        : 0;

      return {
        totalProfiles: totalProfiles || 0,
        verifiedProfiles: verifiedProfiles || 0,
        averageRating: averageRating.toFixed(1),
        sectorsRepresented: 21,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const statCards = [
    {
      label: 'Empresas Registradas',
      value: stats?.totalProfiles || '0',
      icon: Building,
      color: 'text-blue-600',
    },
    {
      label: 'Profesionales Verificados',
      value: stats?.verifiedProfiles || '0',
      icon: Users,
      color: 'text-green-600',
    },
    {
      label: 'Sectores Representados',
      value: stats?.sectorsRepresented || '0',
      icon: TrendingUp,
      color: 'text-purple-600',
    },
    {
      label: 'Valoración Media',
      value: stats?.averageRating || '0.0',
      icon: Star,
      color: 'text-yellow-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
      {statCards.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <stat.icon className={`h-8 w-8 mx-auto ${stat.color}`} />
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
