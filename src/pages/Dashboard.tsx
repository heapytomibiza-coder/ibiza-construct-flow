import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Dashboard = () => {
  const [redirecting, setRedirecting] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // Wait for auth state to settle before making redirect decisions
    if (authLoading) return;

    const checkUserAndRedirect = async () => {
      try {
        if (!user) {
          navigate('/auth', { replace: true });
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
          setRedirecting(false);
          return;
        }

        // Use centralized routing logic only if on base /dashboard
        const { getInitialDashboardRoute } = await import('@/lib/roles');
        const { path } = await getInitialDashboardRoute(user.id);
        navigate(path);
      } catch (error) {
        console.error('Error checking user role:', error);
        navigate('/auth', { replace: true });
      } finally {
        setRedirecting(false);
      }
    };

    checkUserAndRedirect();
  }, [navigate, searchParams, user, authLoading]);

  if (authLoading || redirecting) {
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