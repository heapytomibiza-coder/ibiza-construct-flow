import { supabase } from '@/integrations/supabase/client';

export type Role = 'client' | 'professional' | 'admin';

export interface UserProfile {
  id: string;
  roles: Role[];
  active_role: Role;
  tasker_onboarding_status?: string;
}

/**
 * Get active role for current user with clear precedence
 * Priority: Admin > Professional > Client
 */
export async function getActiveRole(): Promise<Role> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('active_role, roles')
      .single();
    
    if (!profile) return 'client';
    
    // Respect explicit active_role if set
    if (profile.active_role) {
      return profile.active_role as Role;
    }
    
    // Otherwise apply precedence
    const roles = Array.isArray(profile.roles) ? (profile.roles as Role[]) : ['client'];
    if (roles.includes('admin')) return 'admin';
    if (roles.includes('professional')) return 'professional';
    return 'client';
  } catch {
    return 'client';
  }
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

export async function switchActiveRole(nextRole: Role) {
  const { data: profile, error: e1 } = await supabase
    .from('profiles')
    .select('id, roles')
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
  
  // Update localStorage cache for immediate UI feedback
  localStorage.setItem('active_role', nextRole);
}

export async function updateOnboardingStatus(status: 'not_started' | 'in_progress' | 'complete') {
  const { error } = await supabase
    .from('profiles')
    .update({ tasker_onboarding_status: status })
    .eq('id', (await supabase.auth.getUser()).data.user?.id);
  if (error) throw error;
}