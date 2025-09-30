import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { getActiveRole, getDashboardRoute } from '@/lib/roles';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation('dashboard');
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      // Wait for auth to load
      if (authLoading) return;
      
      try {
        if (!user) {
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
  }, [navigate, searchParams, user, authLoading]);

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