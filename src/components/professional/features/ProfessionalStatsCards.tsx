import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Briefcase, Eye, TrendingUp, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function ProfessionalStatsCards() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    availableJobs: 0,
    interested: 0,
    thisMonth: 0,
    profileCompletion: 0
  });

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      // Fetch available jobs count
      const { count: jobsCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .in('status', ['posted', 'matched']);

      // Fetch profile completion from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Calculate profile completion percentage
      let completion = 0;
      if (profile) {
        const fields = ['full_name', 'bio', 'phone', 'address'];
        const completedFields = fields.filter(field => profile[field]);
        completion = Math.round((completedFields.length / fields.length) * 100);
      }

      setStats({
        availableJobs: jobsCount || 0,
        interested: 0, // Will be populated with actual interested jobs data
        thisMonth: 0, // Will be populated with actual earnings data
        profileCompletion: completion
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card 
        className="cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => navigate('/job-board')}
      >
        <CardContent className="p-4 text-center">
          <Briefcase className="w-8 h-8 text-copper mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{stats.availableJobs}</div>
          <p className="text-xs text-muted-foreground">Available Jobs</p>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => navigate('/job-board')}
      >
        <CardContent className="p-4 text-center">
          <Eye className="w-8 h-8 text-copper mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{stats.interested}</div>
          <p className="text-xs text-muted-foreground">Interested</p>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => navigate('/earnings')}
      >
        <CardContent className="p-4 text-center">
          <TrendingUp className="w-8 h-8 text-copper mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">€{stats.thisMonth}</div>
          <p className="text-xs text-muted-foreground">This Month</p>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => navigate('/settings/profile')}
      >
        <CardContent className="p-4 text-center">
          <User className="w-8 h-8 text-copper mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{stats.profileCompletion}%</div>
          <p className="text-xs text-muted-foreground">Profile</p>
        </CardContent>
      </Card>
    </div>
  );
}
