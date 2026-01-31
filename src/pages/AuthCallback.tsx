import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getAuthRoute, normalizeRedirectPath, sanitizeRedirectForCompletedPro } from '@/lib/navigation';
import { canAccessProDashboard } from '@/lib/onboarding/markProfessionalOnboardingComplete';

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
          // Clear any common redirect storage keys (defensive, prevents sticky loops)
          try {
            localStorage.removeItem('redirect');
            localStorage.removeItem('redirectTo');
            localStorage.removeItem('postLoginRedirect');
            localStorage.removeItem('returnTo');
            sessionStorage.removeItem('redirect');
            sessionStorage.removeItem('redirectTo');
            sessionStorage.removeItem('postLoginRedirect');
            sessionStorage.removeItem('returnTo');
          } catch {
            // ignore
          }

          // Normalize and validate redirect parameter
          const rawRedirect = searchParams.get('redirect');
          const redirectPath = normalizeRedirectPath(rawRedirect);

          // Hard-block onboarding redirects from being used as a landing target.
          // If onboarding is truly required, the route resolver / guards will send them there.
          const isOnboardingRedirect =
            !!redirectPath && (
              redirectPath.startsWith('/onboarding/professional') ||
              redirectPath.startsWith('/professional/verification') ||
              redirectPath.startsWith('/professional/service-setup') ||
              redirectPath.startsWith('/professional/services/wizard')
            );
          const safeRedirectCandidate = isOnboardingRedirect ? null : redirectPath;

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

          // Check if professional is complete (to sanitize stale redirect params)
          let proComplete = false;
          if (profile.active_role === 'professional') {
            // Fetch profile AND active services count (canonical pro dashboard access check)
            const [{ data: proProfile, error: proErr }, { data: services, error: svcErr }] = await Promise.all([
              supabase
                .from('professional_profiles')
                .select('onboarding_phase, verification_status')
                .eq('user_id', data.session.user.id)
                .maybeSingle(),
              supabase
                .from('professional_services')
                .select('id')
                .eq('professional_id', data.session.user.id)
                .eq('is_active', true)
                .limit(1),
            ]);

            // Fail-safe: if we can't evaluate pro dashboard access, do NOT treat as complete.
            // This avoids reintroducing accidental access while also not breaking sign-in.
            if (proErr || svcErr) {
              console.warn('[AuthCallback] Unable to evaluate pro dashboard access, treating as incomplete', {
                proErr,
                svcErr,
              });
              proComplete = false;
            } else {
              const phase = (proProfile as any)?.onboarding_phase ?? null;
              const verStatus = (proProfile as any)?.verification_status ?? 'pending';
              const activeServicesCount = services?.length ?? 0;

              proComplete = canAccessProDashboard(phase, verStatus, activeServicesCount);
            }
          }

          // Handle redirect with sanitization for completed professionals
          if (safeRedirectCandidate) {
            const safeRedirect = sanitizeRedirectForCompletedPro(
              safeRedirectCandidate,
              proComplete,
              '/dashboard/pro'
            );
            navigate(safeRedirect, { replace: true });
          } else if (proComplete) {
            // Absolute override: completed professionals should never land back in onboarding.
            navigate('/dashboard/pro', { replace: true });
          } else {
            // Use centralized routing logic
            const { getInitialDashboardRoute } = await import('@/lib/roles');
            const { path } = await getInitialDashboardRoute(data.session.user.id);
            navigate(path, { replace: true });
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