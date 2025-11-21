import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { TrendingUp, Briefcase, MessageSquare, User } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function HeroStatsBar() {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['professional-hero-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Fetch jobs count
      const jobsQuery = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      // Fetch unread messages count - using read_at null check
      const messagesQuery = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .is('read_at', null);

      // Fetch monthly earnings - simplified approach
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const paymentsQuery = await supabase
        .from('payment_transactions')
        .select('amount, created_at');
      
      // Filter by date in memory to avoid TypeScript issues
      const allPayments = paymentsQuery.data || [];
      const thisMonthPayments = allPayments.filter(p => 
        p.amount && p.created_at && new Date(p.created_at) >= new Date(monthStart)
      );
      const earnings = thisMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

      // Fetch profile for completion calculation
      const profileQuery = await supabase
        .from('profiles')
        .select('display_name, bio, avatar_url, phone_number, location')
        .eq('id', user.id)
        .single();

      const profile = profileQuery.data;

      // Calculate profile completion
      const fields = ['display_name', 'bio', 'avatar_url', 'phone_number', 'location'];
      const completed = fields.filter(f => profile?.[f as keyof typeof profile]).length;
      const completion = Math.round((completed / fields.length) * 100);

      return {
        jobsAvailable: jobsQuery.count || 0,
        unreadMessages: messagesQuery.count || 0,
        monthlyEarnings: earnings,
        profileCompletion: completion
      };
    },
    enabled: !!user
  });

  const statCards = [
    {
      label: 'Jobs Available',
      value: stats?.jobsAvailable || 0,
      gradient: 'from-sage/15 to-sage-dark/8',
      icon: Briefcase,
      iconColor: 'text-sage'
    },
    {
      label: 'Unread Messages',
      value: stats?.unreadMessages || 0,
      gradient: 'from-sage-light/12 to-sage/6',
      icon: MessageSquare,
      iconColor: 'text-sage-dark'
    },
    {
      label: 'This Month',
      value: `€${Math.round(stats?.monthlyEarnings || 0)}`,
      gradient: 'from-sage/15 to-sage-dark/8',
      icon: TrendingUp,
      iconColor: 'text-sage'
    },
    {
      label: 'Profile',
      value: `${stats?.profileCompletion || 0}%`,
      gradient: 'from-sage-light/12 to-sage/6',
      icon: User,
      iconColor: 'text-sage-dark'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {statCards.map((stat, index) => (
        <Card 
          key={index}
          className={`p-3 bg-gradient-to-br ${stat.gradient} border-border/50 hover:shadow-md transition-all duration-300`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-xl font-bold">{stat.value}</p>
            </div>
            <stat.icon className={`h-6 w-6 ${stat.iconColor} opacity-70`} />
          </div>
        </Card>
      ))}
    </div>
  );
}
