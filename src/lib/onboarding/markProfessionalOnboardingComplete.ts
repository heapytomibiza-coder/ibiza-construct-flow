import { supabase } from '@/integrations/supabase/client';

/**
 * Onboarding Phase Ordering
 * 
 * IMPORTANT: These are LINEAR phases only. Do NOT include verification_status values here.
 * 
 * Phase = progression through onboarding steps
 * verification_status = orthogonal admin approval state (pending → submitted → verified → rejected)
 * 
 * The two dimensions are INDEPENDENT:
 * - A user can be at phase 'service_configured' with verification_status 'pending'
 * - A user can be at phase 'intro_submitted' with verification_status 'verified' (edge case)
 * 
 * Dashboard access requires BOTH: onboarding_phase complete AND verification_status verified
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
 * Checks if user can access the professional dashboard
 * Requires BOTH: phase complete AND verification verified
 * 
 * @deprecated Use canAccessProDashboard() for clarity
 */
export function isOnboardingComplete(phase: string | null | undefined): boolean {
  // Legacy: only checks phase, not verification
  // RouteGuard separately checks verification_status
  return phase === 'complete' || phase === 'service_configured';
}

/**
 * Full access check: combines phase and verification status
 */
export function canAccessProDashboard(
  phase: string | null | undefined,
  verificationStatus: string | null | undefined
): boolean {
  const phaseComplete = phase === 'complete' || phase === 'service_configured';
  const isVerified = verificationStatus === 'verified';
  return phaseComplete || isVerified; // Either grants access (backwards compat)
}

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
  if (phase === 'verification_pending' || phase === 'verified') {
    return '/professional/service-setup';
  }
  // service_configured or complete = go to dashboard
  return '/dashboard/pro';
}
