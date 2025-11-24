import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      try {
        if (!user) {
          navigate('/auth');
          return;
        }

        // Check for explicit redirect parameter
        const redirectTo = searchParams.get('redirect');
        if (redirectTo) {
          navigate(redirectTo);
          return;
        }

        // Failsafe: if already on a valid dashboard route, don't re-route
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/dashboard/client') || 
            currentPath.startsWith('/dashboard/pro') || 
            currentPath.startsWith('/dashboard/admin')) {
          console.log('Already on valid dashboard route:', currentPath);
          setLoading(false);
          return;
        }

        // Use centralized routing logic only if on base /dashboard
        const { getInitialDashboardRoute } = await import('@/lib/roles');
        const { path } = await getInitialDashboardRoute(user.id);
        navigate(path);
      } catch (error) {
        console.error('Error checking user role:', error);
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };

    checkUserAndRedirect();
  }, [navigate, searchParams, user]);

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