import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { requiresTwoFactor } from '@/lib/security/securityMonitor';
import { logAdminAccessAttempt } from '@/lib/security/ipWhitelist';
import { useToast } from '@/hooks/use-toast';
import { getNextOnboardingStep, isOnboardingComplete } from '@/lib/onboarding/markProfessionalOnboardingComplete';
import { normalizeRedirectPath } from '@/lib/navigation';

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
  const [status, setStatus] = useState<'loading' | 'authorized' | 'unauthorized' | '2fa_required' | 'onboarding_required'>('loading');
  const [onboardingRedirectPath, setOnboardingRedirectPath] = useState<string>('/onboarding/professional');
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
            // Check verification status - but DON'T require a row to exist
            // New users starting onboarding won't have a verification row yet
            const { data: verificationData, error: verErr } = await supabase
              .from('professional_verifications')
              .select('status')
              .eq('professional_id', userId)
              .maybeSingle();
            
            if (verErr) {
              console.error('🔒 [RouteGuard] Verification query error, denying access:', verErr);
            } else {
              // Allow onboarding access if:
              // 1. No verification row yet (user is starting onboarding)
              // 2. OR verification exists with non-approved status
              const status = verificationData?.status;
              const blockedStatuses = ['verified', 'approved']; // These users should have professional role already
              const isBlocked = status && blockedStatuses.includes(status);
              
              if (!isBlocked) {
                console.log('🔒 [RouteGuard] Allowing onboarding via professional intent', { 
                  hasVerificationRow: !!verificationData, 
                  status 
                });
                if (!isStale) setStatus('authorized');
                return;
              }
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

          const phase = proProfile?.onboarding_phase ?? null;
          const verStatus = proProfile?.verification_status ?? 'pending';

          // Professional is complete if: onboarding_phase='complete' OR verification_status='verified'
          const isComplete = isOnboardingComplete(phase) || verStatus === 'verified';

          if (!isComplete) {
            // Determine the next step in onboarding flow (linear progression)
            const nextStep = getNextOnboardingStep(phase);
            setOnboardingRedirectPath(nextStep);
            console.warn('🔒 [RouteGuard] Professional onboarding not complete, redirecting to:', nextStep);
            if (!isStale) setStatus('onboarding_required');
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
      
      // Handle sign out explicitly - immediately set unauthorized
      if (event === 'SIGNED_OUT') {
        console.log('🔒 [RouteGuard] User signed out, setting unauthorized');
        if (!isStale) setStatus('unauthorized');
        return;
      }
      
      // Re-run auth check on any other auth state change
      // This covers SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED, PASSWORD_RECOVERY, and future events
      checkAuth();
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

  if (status === 'onboarding_required') {
    // Redirect to the next required onboarding step (linear progression)
    return <Navigate to={onboardingRedirectPath} replace />;
  }

  if (status === 'unauthorized') {
    // Build redirect URL but NEVER store onboarding paths as redirect targets.
    // If onboarding is needed, RouteGuard will route there directly post-login.
    const attemptedPath = location.pathname + location.search;
    const normalized = normalizeRedirectPath(attemptedPath);
    
    const isOnboardingTrap =
      !!normalized &&
      (
        normalized.startsWith('/onboarding/professional') ||
        normalized.startsWith('/professional/verification') ||
        normalized.startsWith('/professional/service-setup') ||
        normalized.startsWith('/professional/services/wizard')
      );
    
    // If the attempted path is an onboarding route, redirect to /dashboard instead
    // This prevents users getting trapped in "/auth?redirect=/onboarding/..." loops
    const safeRedirectTarget = isOnboardingTrap ? '/dashboard' : attemptedPath;
    const redirectUrl = encodeURIComponent(safeRedirectTarget);
    
    return <Navigate to={`${fallbackPath}?redirect=${redirectUrl}`} replace />;
  }

  return <>{children}</>;
}