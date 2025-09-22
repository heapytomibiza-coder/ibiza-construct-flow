import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: JSX.Element;
  role?: 'client' | 'professional' | 'admin';
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const [status, setStatus] = useState<'loading' | 'ok' | 'redirect'>('loading');

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return setStatus('redirect');

        if (!role) return setStatus('ok');

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('roles')
          .eq('id', user.id)
          .single();

        if (error || !profile) return setStatus('redirect');

        const userRoles = profile.roles as string[];
        const hasRole = userRoles.includes(role);
        
        setStatus(hasRole ? 'ok' : 'redirect');
      } catch (error) {
        setStatus('redirect');
      }
    })();
  }, [role]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (status === 'redirect') {
    const currentPath = window.location.pathname + window.location.search;
    return <Navigate to={`/auth/sign-in?redirect=${encodeURIComponent(currentPath)}`} replace />;
  }
  
  return children;
}