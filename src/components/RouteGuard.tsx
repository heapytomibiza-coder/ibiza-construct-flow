import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { requiresTwoFactor } from '@/lib/security/securityMonitor';
import { logAdminAccessAttempt } from '@/lib/security/ipWhitelist';
import { useToast } from '@/hooks/use-toast';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRole?: 'client' | 'professional' | 'admin';
  fallbackPath?: string;
  skipAuthInDev?: boolean;
  requireOnboardingComplete?: boolean;
  enforce2FA?: boolean;
  /**
   * When true, allows users with intent_role='professional' to access this route
   * even if they don't have the professional role yet. ONLY use for onboarding routes.
   * @default false
   */
  allowProfessionalIntent?: boolean;
}

export default function RouteGuard({ 
  children, 
  requiredRole, 
  fallbackPath = '/auth',
  skipAuthInDev = false,
  requireOnboardingComplete = false,
  enforce2FA = true,
  allowProfessionalIntent = false
}: RouteGuardProps) {
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'authorized' | 'unauthorized' | '2fa_required'>('loading');
  const { toast } = useToast();

  useEffect(() => {
    console.log('🔒 [RouteGuard] Starting auth check for role:', requiredRole);
    let isStale = false;
    
    const checkAuth = async () => {
      try {
        // Skip authentication in development if flag is set
        if (skipAuthInDev && process.env.NODE_ENV === 'development') {
          console.log('🔒 [RouteGuard] Dev mode - skipping auth');
          setStatus('authorized');
          return;
        }

        // Get session directly from Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('🔒 [RouteGuard] Session check result:', { hasSession: !!session, error: sessionError });
        
        if (sessionError) {
          console.error('🔒 [RouteGuard] Session error:', sessionError);
          if (!isStale) setStatus('unauthorized');
          return;
        }

        // Add a small delay to let all auth listeners settle
        await new Promise(resolve => setTimeout(resolve, 200));

        if (!session?.user) {
          console.log('🔒 [RouteGuard] No session found after delay, redirecting to auth');
          if (!isStale) setStatus('unauthorized');
          return;
        }

        const userId = session.user.id;

        // No role requirement = just check authentication
        if (!requiredRole) {
          console.log('🔒 [RouteGuard] No role required - authorized');
          if (!isStale) setStatus('authorized');
          return;
        }

        // Fetch user roles from database
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId);

        if (rolesError) {
          console.error('🔒 [RouteGuard] Error fetching roles:', rolesError);
          if (!isStale) setStatus('unauthorized');
          return;
        }

        const userRoles = (rolesData ?? []).map(r => r.role);
        const hasRequiredRole = userRoles.includes(requiredRole);
        
        console.log('🔒 [RouteGuard] Role check:', { userRoles, requiredRole, hasRequiredRole });
        
        // Special case: Allow users with intent_role = 'professional' to access onboarding
        // ONLY when allowProfessionalIntent is explicitly set to true (opt-in, not default)
        // This prevents unapproved users from accessing job board, dashboard, etc.
        if (!hasRequiredRole && requiredRole === 'professional' && allowProfessionalIntent) {
          // Use maybeSingle() to handle missing profile gracefully (prevents crash if profile creation delayed)
          // Also capture errors to deny cleanly rather than risk accidental authorization
          const { data: profileData, error: profileErr } = await supabase
            .from('profiles')
            .select('intent_role')
            .eq('id', userId)
            .maybeSingle();
          
          // Deny on error or missing/wrong intent (no crash, no accidental allow)
          if (profileErr) {
            console.error('🔒 [RouteGuard] Profile query error, denying access:', profileErr);
          } else if (profileData?.intent_role === 'professional') {
            // Additional check: verify they have a pending/rejected verification row
            // (approved users should already have the professional role via user_roles)
            const { data: verificationData, error: verErr } = await supabase
              .from('professional_verifications')
              .select('status')
              .eq('professional_id', userId)
              .maybeSingle();
            
            // Only allow access if no error AND verification exists with pending/rejected status
            // This prevents: legacy users with intent but no verification, RLS misconfig, network issues
            if (!verErr && verificationData && ['pending', 'rejected'].includes(verificationData.status)) {
              console.log('🔒 [RouteGuard] User has pending/rejected verification, allowing onboarding access');
              if (!isStale) setStatus('authorized');
              return;
            } else if (verErr) {
              console.error('🔒 [RouteGuard] Verification query error, denying access:', verErr);
            }
          }
        }
        
        if (!hasRequiredRole) {
          console.warn(`🔒 [RouteGuard] Access denied: User roles [${userRoles.join(', ')}] do not include required role '${requiredRole}'`);
          await logAdminAccessAttempt(false, 'insufficient_permissions');
          if (!isStale) setStatus('unauthorized');
          return;
        }

        // If admin role required, enforce 2FA
        if (requiredRole === 'admin' && enforce2FA) {
          const needs2FA = await requiresTwoFactor(userId);
          if (needs2FA) {
            // Check if 2FA is actually set up
            const { data: twoFactorData } = await supabase
              .from('two_factor_auth')
              .select('*')
              .eq('user_id', userId)
              .maybeSingle();

            if (!twoFactorData) {
              console.log('🔒 [RouteGuard] Admin requires 2FA but it is not set up');
              toast({
                title: 'Two-Factor Authentication Required',
                description: 'As an admin, you must enable 2FA to access this area.',
                variant: 'destructive',
              });
              if (!isStale) setStatus('2fa_required');
              return;
            }
          }
        }

        // Check onboarding completion for professionals if required
        // Uses professional_profiles as the single source of truth (not profiles.tasker_onboarding_status)
        if (requireOnboardingComplete && requiredRole === 'professional') {
          const { data: proProfile } = await supabase
            .from('professional_profiles')
            .select('onboarding_phase, verification_status')
            .eq('user_id', userId)
            .maybeSingle();

          // Professional is complete if: onboarding_phase='complete' OR verification_status='verified'
          const isComplete = 
            proProfile?.onboarding_phase === 'complete' || 
            proProfile?.verification_status === 'verified';

          if (!isComplete) {
            console.warn('🔒 [RouteGuard] Professional onboarding not complete, redirecting to onboarding');
            if (!isStale) setStatus('unauthorized');
            return;
          }
        }

        // Log successful admin access
        if (requiredRole === 'admin') {
          await logAdminAccessAttempt(true);
        }
        
        console.log('🔒 [RouteGuard] ✅ Authorized');
        if (!isStale) setStatus('authorized');
      } catch (error) {
        console.error('🔒 [RouteGuard] Route guard error:', error);
        if (!isStale) setStatus('unauthorized');
      }
    };

    // Set up auth state listener to detect changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔒 [RouteGuard] Auth state change:', event, 'hasSession:', !!session);
      // Re-run auth check when auth state changes
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        checkAuth();
      }
    });

    checkAuth();

    return () => {
      isStale = true;
      subscription.unsubscribe();
    };
  }, [requiredRole, skipAuthInDev, requireOnboardingComplete, enforce2FA, allowProfessionalIntent, toast]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === '2fa_required') {
    return <Navigate to="/admin/security?setup2fa=true" replace />;
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