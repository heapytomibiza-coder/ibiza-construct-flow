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
      .select('active_role, roles')
      .eq('id', user.id)
      .single();
    
    if (!profile) {
      emit('client', ['client']);
      return 'client';
    }
    
    const dbActiveRole = (profile.active_role as Role) || 'client';
    const rolesData = profile.roles;
    const dbRoles: Role[] = Array.isArray(rolesData) 
      ? rolesData.filter((r): r is Role => ['client', 'professional', 'admin'].includes(r as string))
      : ['client'];
    
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

  const { data: profile, error: e1 } = await supabase
    .from('profiles')
    .select('id, roles')
    .eq('id', user.id)
    .single();
  
  if (e1) throw e1;
  
  const roles = Array.isArray(profile?.roles) ? profile.roles : [];
  if (!roles.includes(nextRole)) {
    throw new Error('Role not enabled for this user');
  }
  
  const { error } = await supabase
    .from('profiles')
    .update({ active_role: nextRole })
    .eq('id', profile.id);
  
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
          const newRoles = payload.new?.roles ?? [];
          emit(newRole, newRoles);
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
    admin: '/dashboard/admin',
    professional: '/dashboard/pro',
    client: '/dashboard/client'
  };
  return routes[role] || routes.client;
}

export async function getProfile(): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, roles, active_role, tasker_onboarding_status')
    .single();
  if (error) throw error;
  return data as UserProfile;
}

export async function enableProfessionalRole() {
  const { data: profile, error: e1 } = await supabase
    .from('profiles')
    .select('id, roles')
    .single();
  if (e1) throw e1;
  
  const roles = Array.isArray(profile?.roles) ? profile.roles : [];
  if (!roles.includes('professional')) {
    roles.push('professional');
    const { error } = await supabase
      .from('profiles')
      .update({ roles })
      .eq('id', profile.id);
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
