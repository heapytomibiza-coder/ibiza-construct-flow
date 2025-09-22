import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import ClientDashboard from '@/components/dashboards/ClientDashboard';
import ProfessionalDashboard from '@/components/dashboards/ProfessionalDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import { Skeleton } from '@/components/ui/skeleton';

type UserRole = 'client' | 'professional' | 'admin';

interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
      fetchProfile(session.user.id);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/auth');
        return;
      }
      if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // If no profile exists, redirect to auth to complete profile setup
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const renderDashboard = () => {
    switch (profile.role) {
      case 'client':
        return <ClientDashboard user={user} profile={profile} />;
      case 'professional':
        return <ProfessionalDashboard user={user} profile={profile} />;
      case 'admin':
        return <AdminDashboard user={user} profile={profile} />;
      default:
        return <ClientDashboard user={user} profile={profile} />;
    }
  };

  return renderDashboard();
};

export default Dashboard;