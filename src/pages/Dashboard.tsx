import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useActiveRole } from '@/hooks/useActiveRole';
import { getDashboardRoute } from '@/lib/roles';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation('dashboard');
  const { user } = useAuth();
  const { activeRole, loading: roleLoading } = useActiveRole();

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      // Wait for auth and role to load
      if (roleLoading) return;
      
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

        // Redirect to appropriate dashboard based on active role
        if (activeRole) {
          const dashboardRoute = getDashboardRoute(activeRole);
          navigate(dashboardRoute);
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        navigate('/auth/sign-in');
      } finally {
        setLoading(false);
      }
    };

    checkUserAndRedirect();
  }, [navigate, searchParams, user, activeRole, roleLoading]);

  if (loading || roleLoading) {
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