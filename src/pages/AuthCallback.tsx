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
          const redirectTo = searchParams.get('redirect');
          
          // Wait for profile to be created by trigger
          let retries = 0;
          let profile = null;
          
          while (retries < 5 && !profile) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('roles, active_role, full_name')
              .eq('id', data.session.user.id)
              .maybeSingle();
            
            if (profileData) {
              profile = profileData;
              break;
            }
            
            retries++;
            if (retries < 5) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }

          if (!profile) {
            toast({
              variant: 'destructive',
              title: 'Profile Creation Error',
              description: 'Failed to create your profile. Please try signing in again.',
            });
            navigate('/auth/sign-in');
            return;
          }

          // Handle redirect or role-based navigation
          if (redirectTo) {
            navigate(redirectTo);
          } else {
            const roles = Array.isArray(profile.roles) ? profile.roles : JSON.parse(profile.roles || '[]');
            
            if (roles.includes('admin')) {
              navigate('/dashboard/admin');
            } else if (roles.includes('client') && roles.includes('professional')) {
              navigate('/role-switcher');
            } else if (roles.includes('professional')) {
              navigate('/dashboard/pro');
            } else {
              navigate('/dashboard/client');
            }
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