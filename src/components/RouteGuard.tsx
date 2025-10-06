import { useEffect, useState } from 'react';
import { useCurrentSession } from '../../packages/@contracts/clients/auth';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRole?: 'client' | 'professional' | 'admin';
  fallbackPath?: string;
  skipAuthInDev?: boolean;
  requireOnboardingComplete?: boolean;
}

export default function RouteGuard({ 
  children, 
  requiredRole, 
  fallbackPath = '/auth',
  skipAuthInDev = false,
  requireOnboardingComplete = false
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
        
        if (!hasRequiredRole) {
          console.warn(`Access denied: User roles [${session.roles.join(', ')}] do not include required role '${requiredRole}'`);
          setStatus('unauthorized');
          return;
        }

        // Check onboarding completion for professionals if required
        if (requireOnboardingComplete && requiredRole === 'professional') {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('tasker_onboarding_status')
            .eq('id', session.userId)
            .single();

          if (!profileData || profileData.tasker_onboarding_status !== 'complete') {
            console.warn('Professional onboarding not complete, redirecting to onboarding');
            setStatus('unauthorized');
            return;
          }
        }
        
        setStatus('authorized');
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
    // If professional needs onboarding, redirect there directly
    if (requireOnboardingComplete && requiredRole === 'professional') {
      return <Navigate to="/onboarding/professional" replace />;
    }
    
    const redirectUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${fallbackPath}?redirect=${redirectUrl}`} replace />;
  }

  return <>{children}</>;
}