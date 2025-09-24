import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRole?: 'asker' | 'tasker' | 'admin' | 'client' | 'professional';
  fallbackPath?: string;
  skipAuthInDev?: boolean;
}

export default function RouteGuard({ 
  children, 
  requiredRole,
  fallbackPath = '/auth/sign-in',
  skipAuthInDev = false
}: RouteGuardProps) {
  const { user, profile, loading } = useAuth();
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

        if (loading) return;

        if (!user) {
          // Double check with Supabase
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          if (!currentUser) {
            setStatus('unauthorized');
            return;
          }
        }

        if (!requiredRole) {
          setStatus('authorized');
          return;
        }

        // Get user profile with roles
        const currentUser = user || (await supabase.auth.getUser()).data.user;
        if (!currentUser) {
          setStatus('unauthorized');
          return;
        }

        const { data: userProfile, error } = await supabase
          .from('profiles')
          .select('roles')
          .eq('id', currentUser.id)
          .single();

        if (error || !userProfile) {
          setStatus('unauthorized');
          return;
        }

        // Check if user has required role
        const userRoles = userProfile.roles as string[];
        const hasRequiredRole = userRoles.includes(requiredRole);
        
        setStatus(hasRequiredRole ? 'authorized' : 'unauthorized');
      } catch (error) {
        console.error('Route guard error:', error);
        setStatus('unauthorized');
      }
    };

    checkAuth();
  }, [user, profile, loading, requiredRole, skipAuthInDev]);

  if (loading || status === 'loading') {
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