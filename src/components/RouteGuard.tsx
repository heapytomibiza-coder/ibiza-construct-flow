import { useEffect, useState } from 'react';
import { useCurrentSession } from '../../packages/@contracts/clients/auth';
import { Navigate, useLocation } from 'react-router-dom';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRole?: 'asker' | 'tasker' | 'admin';
  fallbackPath?: string;
  skipAuthInDev?: boolean;
}

export default function RouteGuard({ 
  children, 
  requiredRole,
  fallbackPath = '/auth/sign-in',
  skipAuthInDev = false
}: RouteGuardProps) {
  const { data: sessionData, isLoading: authLoading } = useCurrentSession();
  const session = sessionData?.data;
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Skip authentication in development if flag is set
        if (skipAuthInDev && process.env.NODE_ENV === 'development') {
          setStatus('authorized');
          return;
        }

        if (authLoading) return;

        if (!session?.userId) {
          setStatus('unauthorized');
          return;
        }

        // No role requirement = just check authentication
        if (!requiredRole) {
          setStatus('authorized');
          return;
        }

        // Check if user has required role
        const hasRequiredRole = session.roles.includes(requiredRole);
        
        setStatus(hasRequiredRole ? 'authorized' : 'unauthorized');
      } catch (error) {
        console.error('Route guard error:', error);
        setStatus('unauthorized');
      }
    };

    checkAuth();
  }, [session, authLoading, requiredRole, skipAuthInDev]);

  if (authLoading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === 'unauthorized') {
    const redirectUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${fallbackPath}?redirect=${redirectUrl}`} replace />;
  }

  return <>{children}</>;
}