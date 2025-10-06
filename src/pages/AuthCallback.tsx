import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getAuthRoute } from '@/lib/navigation';

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
          navigate(getAuthRoute('signin'));
          return;
        }

        if (data.session) {
          // Determine redirect destination
          const redirectTo = searchParams.get('redirect');
          if (redirectTo) {
            navigate(decodeURIComponent(redirectTo));
            return;
          }

          // Wait for profile to be created by trigger
          let retries = 0;
          let profile = null;
          
          while (retries < 5 && !profile) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('active_role, full_name')
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
            navigate(getAuthRoute('signin'));
            return;
          }

          // Handle redirect or navigate based on centralized routing
          if (redirectTo) {
            navigate(decodeURIComponent(redirectTo));
          } else {
            // Use centralized routing logic
            const { getInitialDashboardRoute } = await import('@/lib/roles');
            const { path } = await getInitialDashboardRoute(data.session.user.id);
            navigate(path);
          }
        } else {
          navigate(getAuthRoute('signin'));
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        navigate(getAuthRoute('signin'));
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