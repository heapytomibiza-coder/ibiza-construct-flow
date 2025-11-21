import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GlassStatsCard } from './GlassStatsCard';
import { 
  Briefcase, 
  MessageSquare, 
  DollarSign, 
  CheckCircle2 
} from 'lucide-react';

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

      // Fetch unread messages count
      const messagesQuery = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .is('read_at', null);

      // Fetch monthly earnings
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const paymentsQuery = await supabase
        .from('payment_transactions')
        .select('amount, created_at');
      
      const allPayments = paymentsQuery.data || [];
      const thisMonthPayments = allPayments.filter(p => 
        p.amount && p.created_at && new Date(p.created_at) >= new Date(monthStart)
      );
      const earnings = thisMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

      // Fetch profile for completion
      const profileQuery = await supabase
        .from('profiles')
        .select('display_name, bio, avatar_url, phone_number, location')
        .eq('id', user.id)
        .single();

      const profile = profileQuery.data;
      const fields = ['display_name', 'bio', 'avatar_url', 'phone_number', 'location'];
      const completed = fields.filter(f => profile?.[f as keyof typeof profile]).length;
      const completion = Math.round((completed / fields.length) * 100);

      return {
        openJobs: jobsQuery.count || 0,
        unreadMessages: messagesQuery.count || 0,
        monthlyEarnings: earnings,
        profileCompletion: completion
      };
    },
    enabled: !!user
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-7 gap-3 sm:gap-4">
      {/* Primary Featured Stat - Jobs Available (spans more columns) */}
      <div className="lg:col-span-3">
        <GlassStatsCard
          icon={Briefcase}
          label="Available Jobs"
          value={stats?.openJobs || 0}
          variant="primary"
          delay={0}
        />
      </div>

      {/* Secondary Stats - Smaller cards */}
      <div className="lg:col-span-4 grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
        <GlassStatsCard
          icon={MessageSquare}
          label="Messages"
          value={stats?.unreadMessages || 0}
          variant="secondary"
          delay={0.1}
        />
        <GlassStatsCard
          icon={DollarSign}
          label="This Month"
          value={`€${Math.round(stats?.monthlyEarnings || 0)}`}
          variant="secondary"
          delay={0.2}
        />
        <GlassStatsCard
          icon={CheckCircle2}
          label="Profile"
          value={`${stats?.profileCompletion || 0}%`}
          variant="secondary"
          delay={0.3}
        />
      </div>
    </div>
  );
}
