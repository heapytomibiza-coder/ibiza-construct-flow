import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: error.message,
          });
          navigate('/auth/sign-in');
          return;
        }

        if (data.session) {
          const user = data.session.user;
          const role = searchParams.get('role') || user.user_metadata?.intent_role || 'client';
          
          // Check if user needs quick start
          const { data: profile } = await supabase
            .from('profiles')
            .select('roles, display_name')
            .eq('id', user.id)
            .single();

          // If profile exists and is complete, redirect to dashboard
          if (profile && profile.display_name) {
            const roles = profile.roles as string[];
            if (roles.includes('client') && roles.includes('professional')) {
              navigate('/role-switcher');
            } else if (roles.includes('professional')) {
              navigate('/dashboard/pro');
            } else {
              navigate('/dashboard/client');
            }
          } else {
            // Redirect to quick start
            navigate(`/auth/quick-start?role=${role}`);
          }
        } else {
          navigate('/auth/sign-in');
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        navigate('/auth/sign-in');
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}