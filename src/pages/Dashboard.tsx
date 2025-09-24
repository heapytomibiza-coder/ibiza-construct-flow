import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      try {
        // Enable auth for production
        const DISABLE_AUTH_FOR_WIREFRAME = false;
        
        // Skip authentication in wireframe mode
        if (DISABLE_AUTH_FOR_WIREFRAME) {
          setLoading(false);
          // Default to client dashboard for wireframe mode
          navigate('/dashboard/client');
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth/sign-in');
          return;
        }

        setUser(session.user);

        // Check if there's a redirect parameter
        const redirectTo = searchParams.get('redirect');
        if (redirectTo) {
          navigate(redirectTo);
          return;
        }

        // Get user profile to determine role-based redirect
        const { data: profile } = await supabase
          .from('profiles')
          .select('roles')
          .eq('id', session.user.id)
          .single();

        if (profile?.roles) {
          const roles = profile.roles as string[];
          if (roles.includes('admin')) {
            navigate('/dashboard/admin');
          } else if (roles.includes('professional')) {
            navigate('/dashboard/pro');
          } else {
            navigate('/dashboard/client');
          }
        } else {
          // Default to client if no role found
          navigate('/dashboard/client');
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        navigate('/auth/sign-in');
      }
    };

    checkUserAndRedirect();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/auth/sign-in');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default Dashboard;