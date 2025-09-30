import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { getActiveRole, getDashboardRoute } from '@/lib/roles';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation('dashboard');

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth/sign-in');
          return;
        }

        // Check for explicit redirect parameter
        const redirectTo = searchParams.get('redirect');
        if (redirectTo) {
          navigate(redirectTo);
          return;
        }

        // Get active role and redirect to appropriate dashboard
        const activeRole = await getActiveRole();
        const dashboardRoute = getDashboardRoute(activeRole);
        navigate(dashboardRoute);
      } catch (error) {
        console.error('Error checking user role:', error);
        navigate('/auth/sign-in');
      } finally {
        setLoading(false);
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
  }, [navigate, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return null;
};

export default Dashboard;