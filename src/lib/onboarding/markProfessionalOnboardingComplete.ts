import { supabase } from '@/integrations/supabase/client';

/**
 * Onboarding Phase Ordering
 * 
 * IMPORTANT: These are LINEAR phases only. Do NOT include verification_status values here.
 * 
 * Two Orthogonal Dimensions:
 * 1. onboarding_phase = progression through onboarding steps (linear, forward-only)
 * 2. verification_status = admin approval state (pending → submitted → verified → rejected)
 * 
 * Access Rules:
 * - canEnterProArea: verification_status === 'verified'
 * - onboardingComplete: onboarding_phase in ['service_configured', 'complete'] AND active_services >= 1
 * - fullDashboardAccess: canEnterProArea AND onboardingComplete
 * 
 * The old rule "(phase === 'complete') || (status === 'verified')" was WRONG because it
 * allowed verified users with zero services to be treated as "complete".
 */
export const ONBOARDING_PHASE_ORDER = [
  'not_started',
  'intro_submitted',
  'verification_pending',
  'service_configured',
  'complete',
] as const;

export type OnboardingPhase = typeof ONBOARDING_PHASE_ORDER[number];

/**
 * Returns the "higher" phase (further along in onboarding).
 * Used to prevent phase downgrades.
 */
export function maxPhase(current: string | null | undefined, proposed: string): string {
  if (!current) return proposed;
  const currentIdx = ONBOARDING_PHASE_ORDER.indexOf(current as OnboardingPhase);
  const proposedIdx = ONBOARDING_PHASE_ORDER.indexOf(proposed as OnboardingPhase);
  
  // If current phase is unknown, allow the proposed phase
  if (currentIdx === -1) return proposed;
  // If proposed phase is unknown, keep current
  if (proposedIdx === -1) return current;
  
  return currentIdx >= proposedIdx ? current : proposed;
}

/**
 * Checks if onboarding phase is complete (independent of verification status)
 */
export function isOnboardingPhaseComplete(phase: string | null | undefined): boolean {
  return phase === 'complete' || phase === 'service_configured';
}

/**
 * Can user ENTER the professional area? (basic gate)
 * Requires: verification_status === 'verified'
 */
export function canEnterProArea(verificationStatus: string | null | undefined): boolean {
  return verificationStatus === 'verified';
}

/**
 * Full professional dashboard access check.
 * Requires ALL THREE conditions:
 * 1. verification_status === 'verified'
 * 2. onboarding_phase in ['service_configured', 'complete']
 * 3. active_services >= 1
 * 
 * @param activeServicesCount - MUST be passed by caller. Defaults to 0 (fail-safe).
 */
export function canAccessProDashboard(
  phase: string | null | undefined,
  verificationStatus: string | null | undefined,
  activeServicesCount: number | null | undefined = 0 // Default to 0 = fail-safe (deny access if caller forgets)
): boolean {
  const phaseComplete = isOnboardingPhaseComplete(phase);
  const isVerified = verificationStatus === 'verified';
  const hasService = (activeServicesCount ?? 0) >= 1;
  
  return isVerified && phaseComplete && hasService;
}

/**
 * @deprecated Legacy function for backwards compatibility during migration.
 * Use canEnterProArea() + canAccessProDashboard() instead.
 */
export function canAccessProDashboardLegacy(
  phase: string | null | undefined,
  verificationStatus: string | null | undefined
): boolean {
  return (phase === 'complete' || phase === 'service_configured') || verificationStatus === 'verified';
}

/**
 * @deprecated Alias for isOnboardingPhaseComplete. Use isOnboardingPhaseComplete() instead.
 * Kept for backwards compatibility with existing imports.
 */
export const isOnboardingComplete = isOnboardingPhaseComplete;

/**
 * Marks professional onboarding as complete.
 * Only sets phase to 'complete' if at least 1 active service exists in DB.
 * This is the single source of truth for onboarding completion.
 */
export async function markProfessionalOnboardingComplete(userId: string): Promise<boolean> {
  try {
    // Verify at least 1 active service exists in DB (not just local state)
    const { data: activeServices, error: activeErr } = await supabase
      .from('professional_services')
      .select('id')
      .eq('professional_id', userId)
      .eq('is_active', true)
      .limit(1);

    if (activeErr) {
      console.error('[onboarding] active services check failed:', activeErr);
      return false;
    }

    if (!activeServices || activeServices.length === 0) {
      console.warn('[onboarding] no active services found, skipping completion');
      return false;
    }

    // Use upsert to guarantee the row exists
    const { error: phaseErr } = await supabase
      .from('professional_profiles')
      .upsert(
        { user_id: userId, onboarding_phase: 'complete' } as any,
        { onConflict: 'user_id' }
      );

    if (phaseErr) {
      console.error('[onboarding] mark complete failed:', phaseErr);
      return false;
    }

    console.log('[onboarding] ✅ marked as complete for user:', userId);
    return true;
  } catch (error) {
    console.error('[onboarding] unexpected error:', error);
    return false;
  }
}

/**
 * Updates onboarding phase without allowing downgrades.
 * Always moves forward, never backward.
 */
export async function updateOnboardingPhase(
  userId: string, 
  proposedPhase: OnboardingPhase
): Promise<boolean> {
  try {
    // Fetch current phase
    const { data: existing, error: fetchErr } = await supabase
      .from('professional_profiles')
      .select('onboarding_phase')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchErr) {
      console.error('[onboarding] fetch phase failed:', fetchErr);
      return false;
    }

    // Calculate the phase that should be set (forward-only)
    const currentPhase = existing?.onboarding_phase ?? null;
    const nextPhase = maxPhase(currentPhase, proposedPhase);

    // Only update if we're actually moving forward
    if (currentPhase === nextPhase) {
      console.log('[onboarding] phase unchanged:', currentPhase);
      return true;
    }

    const { error: updateErr } = await supabase
      .from('professional_profiles')
      .upsert(
        { user_id: userId, onboarding_phase: nextPhase } as any,
        { onConflict: 'user_id' }
      );

    if (updateErr) {
      console.error('[onboarding] update phase failed:', updateErr);
      return false;
    }

    console.log('[onboarding] phase updated:', currentPhase, '->', nextPhase);
    return true;
  } catch (error) {
    console.error('[onboarding] unexpected error:', error);
    return false;
  }
}

/**
 * Determines the next onboarding step based on current phase
 */
export function getNextOnboardingStep(phase: string | null | undefined): string {
  if (!phase || phase === 'not_started') {
    return '/onboarding/professional';
  }
  if (phase === 'intro_submitted') {
    return '/professional/verification';
  }
  if (phase === 'verification_pending') {
    return '/professional/service-setup';
  }
  // service_configured or complete = go to dashboard
  return '/dashboard/pro';
}
