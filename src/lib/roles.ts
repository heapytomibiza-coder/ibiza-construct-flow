import { supabase } from '@/integrations/supabase/client';

export type Role = 'client' | 'professional' | 'admin';

export interface UserProfile {
  id: string;
  roles: Role[];
  active_role: Role;
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
  | 'admin_dashboard'
  | 'pro_needs_onboarding'
  | 'pro_dashboard'
  | 'client_dashboard';

/**
 * Single source of truth for initial dashboard routing
 * Checks profile completeness, role, and onboarding status
 */
export async function getInitialDashboardRoute(
  userId: string
): Promise<{ path: string; reason: InitialRouteReason }> {
  // 1) Check profile has display_name
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, active_role')
    .eq('id', userId)
    .single();

  if (!profile?.display_name) {
    return { path: '/auth/quick-start', reason: 'no_display_name' };
  }

  // 2) Get user roles
  const { data: rolesData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);

  const roles = rolesData?.map(r => r.role as Role) || [];
  const hasRole = (r: Role) => roles.includes(r);

  // 3) Admin takes precedence if active
  if (hasRole('admin') && profile.active_role === 'admin') {
    return { path: '/admin', reason: 'admin_dashboard' };
  }

  // 4) Professional with onboarding check
  if (profile.active_role === 'professional' || hasRole('professional')) {
    // Check onboarding status from profiles table
    const { data: profileData } = await supabase
      .from('profiles')
      .select('tasker_onboarding_status')
      .eq('id', userId)
      .single();

    // Check if onboarding is complete
    const onboardingComplete = profileData?.tasker_onboarding_status === 'complete';
    
    if (!onboardingComplete) {
      return { path: '/onboarding/professional', reason: 'pro_needs_onboarding' };
    }
    
    return { path: '/dashboard/pro', reason: 'pro_dashboard' };
  }

  // 5) Default to client
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
