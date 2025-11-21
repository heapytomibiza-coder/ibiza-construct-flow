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
      gradient: 'from-blue-500/10 to-cyan-400/5',
      icon: Briefcase,
      iconColor: 'text-blue-500'
    },
    {
      label: 'Unread Messages',
      value: stats?.unreadMessages || 0,
      gradient: 'from-purple-500/10 to-pink-400/5',
      icon: MessageSquare,
      iconColor: 'text-purple-500'
    },
    {
      label: 'This Month',
      value: `€${Math.round(stats?.monthlyEarnings || 0)}`,
      gradient: 'from-green-500/10 to-emerald-400/5',
      icon: TrendingUp,
      iconColor: 'text-green-500'
    },
    {
      label: 'Profile',
      value: `${stats?.profileCompletion || 0}%`,
      gradient: 'from-orange-500/10 to-amber-400/5',
      icon: User,
      iconColor: 'text-orange-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card 
          key={index}
          className={`p-4 bg-gradient-to-br ${stat.gradient} border-border/50 hover:shadow-lg transition-all duration-300 hover:scale-105`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
            <stat.icon className={`h-8 w-8 ${stat.iconColor}`} />
          </div>
        </Card>
      ))}
    </div>
  );
}
