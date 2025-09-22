import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRole?: 'asker' | 'tasker' | 'admin';
  fallbackPath?: string;
}

export default function RouteGuard({ 
  children, 
  requiredRole,
  fallbackPath = '/auth/sign-in' 
}: RouteGuardProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading');

  useEffect(() => {
    if (loading) return;

    if (!user || !profile) {
      setStatus('unauthorized');
      return;
    }

    if (!requiredRole) {
      setStatus('authorized');
      return;
    }

    // Check if user has required role
    const userRoles = profile.roles as string[];
    const hasRequiredRole = userRoles.includes(requiredRole);
    
    setStatus(hasRequiredRole ? 'authorized' : 'unauthorized');
  }, [user, profile, loading, requiredRole]);

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