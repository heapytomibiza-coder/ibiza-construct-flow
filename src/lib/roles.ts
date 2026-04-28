import { supabase } from '@/integrations/supabase/client';
import { canAccessProDashboard } from '@/lib/onboarding/markProfessionalOnboardingComplete';

export type Role = 'client' | 'professional' | 'admin';

/**
 * Canonical onboarding phase values (from professional_profiles table)
 * These are the single source of truth for professional onboarding progress
 */
export const ONBOARDING_PHASES = {
  NOT_STARTED: 'not_started',
  INTRO_SUBMITTED: 'intro_submitted',
  VERIFICATION_PENDING: 'verification_pending',
  SERVICE_CONFIGURED: 'service_configured',
  COMPLETE: 'complete',
} as const;

export type OnboardingPhase = typeof ONBOARDING_PHASES[keyof typeof ONBOARDING_PHASES];

/**
 * Canonical verification status values (from professional_profiles table)
 */
export const VERIFICATION_STATUSES = {
  UNVERIFIED: 'unverified',
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
} as const;

export type VerificationStatus = typeof VERIFICATION_STATUSES[keyof typeof VERIFICATION_STATUSES];

/**
 * @deprecated Use professional_profiles.onboarding_phase instead
 */
export interface UserProfile {
  id: string;
  roles: Role[];
  active_role: Role;
  /** @deprecated Use professional_profiles.onboarding_phase instead */
  tasker_onboarding_status?: string;
}

// In-memory cache and listeners for reactive updates
let cachedRole: Role | null = null;
let cachedRoles: Role[] = [];
let listeners = new Set<(role: Role | null, roles: Role[]) => void>();

function emit(role: Role | null, roles: Role[] = []) {
  cachedRole = role;
  cachedRoles = roles;
  listeners.forEach(l => l(role, roles));
}

/**
 * Subscribe to active role changes
 * Returns unsubscribe function
 */
export function onActiveRoleChange(cb: (role: Role | null, roles: Role[]) => void) {
  listeners.add(cb);
  // Immediately call with cached value
  cb(cachedRole, cachedRoles);
  return () => listeners.delete(cb);
}

/**
 * Get active role for current user with caching
 */
export async function getActiveRole(): Promise<Role> {
  try {
    // Return cached value if available
    if (cachedRole) return cachedRole;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      emit(null, []);
      return 'client';
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('active_role')
      .eq('id', user.id)
      .single();
    
    if (!profile) {
      emit('client', ['client']);
      return 'client';
    }
    
    // Get roles from user_roles table
    const { data: rolesData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);
    
    const dbActiveRole = (profile.active_role as Role) || 'client';
    const dbRoles: Role[] = rolesData?.map(r => r.role as Role) || ['client'];
    
    emit(dbActiveRole, dbRoles);
    return dbActiveRole;
  } catch {
    emit('client', ['client']);
    return 'client';
  }
}

/**
 * Switch active role (updates database and notifies all listeners)
 */
export async function switchActiveRole(nextRole: Role) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get roles from user_roles table
  const { data: rolesData, error: e1 } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);
  
  if (e1) throw e1;
  
  const roles = rolesData?.map(r => r.role) || [];
  if (!roles.includes(nextRole)) {
    throw new Error('Role not enabled for this user');
  }
  
  const { error } = await supabase
    .from('profiles')
    .update({ active_role: nextRole })
    .eq('id', user.id);
  
  if (error) throw error;
  
  // Emit to all listeners immediately (optimistic update)
  emit(nextRole, roles as Role[]);
}

/**
 * Initialize realtime listener for role changes (multi-tab sync)
 */
let channelInitialized = false;
export function initRoleRealtime() {
  if (channelInitialized) return;
  
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (!user) return;
    
    channelInitialized = true;
    supabase
      .channel('profiles-active-role')
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'profiles', 
          filter: `id=eq.${user.id}` 
        },
        (payload: any) => {
          const newRole = payload.new?.active_role ?? null;
          // Roles come from user_roles table, not profiles - preserve cached value
          emit(newRole, cachedRoles);
        }
      )
      .subscribe();
  });
}

/**
 * Get dashboard route for a given role
 */
export function getDashboardRoute(role: Role): string {
  const routes: Record<Role, string> = {
    admin: '/admin',
    professional: '/dashboard/pro',
    client: '/dashboard/client'
  };
  return routes[role] || routes.client;
}

export type InitialRouteReason =
  | 'no_display_name'
  | 'onboarding_incomplete'
  | 'admin_dashboard'
  | 'choose_role'
  | 'pro_needs_onboarding'
  | 'pro_dashboard'
  | 'client_dashboard';

async function getProfessionalDashboardOrOnboardingRoute(userId: string) {
  const [{ data: proProfile, error: proErr }, { data: services, error: svcErr }] = await Promise.all([
    supabase
      .from('professional_profiles')
      .select('onboarding_phase, verification_status')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('professional_services')
      .select('id')
      .eq('professional_id', userId)
      .eq('is_active', true)
      .limit(1),
  ]);

  // Fail-safe: treat errors as incomplete (deny pro dashboard access)
  if (proErr || svcErr || !proProfile) {
    return { path: '/onboarding/professional', reason: 'pro_needs_onboarding' as const };
  }

  const phase = (proProfile as any)?.onboarding_phase ?? null;
  const verStatus = (proProfile as any)?.verification_status ?? 'pending';
  const activeServicesCount = services?.length ?? 0;

  const hasProDashboardAccess = canAccessProDashboard(phase, verStatus, activeServicesCount);

  if (!hasProDashboardAccess) {
    return { path: '/onboarding/professional', reason: 'pro_needs_onboarding' as const };
  }

  return { path: '/dashboard/pro', reason: 'pro_dashboard' as const };
}

/**
 * Single source of truth for initial dashboard routing.
 *
 * Important: this resolver must respect profiles.active_role for dual-role users.
 * A user who has both client and professional roles should not be pushed into the
 * professional lane just because the professional role exists.
 */
export async function getInitialDashboardRoute(
  userId: string
): Promise<{ path: string; reason: InitialRouteReason }> {
  // 1) Check profile has display_name and onboarding status
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, active_role, onboarding_completed')
    .eq('id', userId)
    .maybeSingle();

  // 2) Get user roles before deciding a fallback lane
  const { data: rolesData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);

  const roles = rolesData?.map(r => r.role as Role) || [];
  const hasRole = (r: Role) => roles.includes(r);
  const profileActiveRole = profile?.active_role as Role | null | undefined;
  const activeRole: Role | null = profileActiveRole && hasRole(profileActiveRole)
    ? profileActiveRole
    : null;

  if (!profile?.display_name) {
    return { path: '/auth/quick-start', reason: 'no_display_name' };
  }

  // 3) Admin only takes precedence when admin is the active lane.
  if (activeRole === 'admin') {
    return { path: '/admin', reason: 'admin_dashboard' };
  }

  // 4) Check if first-time user needs onboarding welcome
  if (profile.onboarding_completed === false) {
    return { path: '/auth/quick-start', reason: 'onboarding_incomplete' };
  }

  // 5) Respect the explicitly active lane for dual-role users.
  if (activeRole === 'client') {
    return { path: '/dashboard/client', reason: 'client_dashboard' };
  }

  if (activeRole === 'professional') {
    return getProfessionalDashboardOrOnboardingRoute(userId);
  }

  // 6) If active_role is missing/stale, choose the safest clear route.
  if (roles.length > 1) {
    return { path: '/role-switcher', reason: 'choose_role' };
  }

  if (hasRole('professional')) {
    return getProfessionalDashboardOrOnboardingRoute(userId);
  }

  if (hasRole('admin')) {
    return { path: '/admin', reason: 'admin_dashboard' };
  }

  // 7) Default to client only when there is no better role context.
  return { path: '/dashboard/client', reason: 'client_dashboard' };
}

export async function getProfile(): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, active_role, tasker_onboarding_status')
    .eq('id', user.id)
    .single();
  
  if (error) throw error;
  
  // Get roles from user_roles table
  const { data: rolesData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);
  
  return {
    id: data.id,
    roles: (rolesData?.map(r => r.role) || ['client']) as Role[],
    active_role: (data.active_role || 'client') as Role,
    tasker_onboarding_status: data.tasker_onboarding_status,
  };
}

export async function enableProfessionalRole() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  // Check if user already has professional role
  const { data: existingRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'professional')
    .maybeSingle();
  
  if (!existingRole) {
    // Add professional role
    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: user.id, role: 'professional' });
    
    if (error) throw error;
  }
}

export async function updateOnboardingStatus(status: 'not_started' | 'in_progress' | 'complete') {
  const { error } = await supabase
    .from('profiles')
    .update({ tasker_onboarding_status: status })
    .eq('id', (await supabase.auth.getUser()).data.user?.id);
  if (error) throw error;
}
