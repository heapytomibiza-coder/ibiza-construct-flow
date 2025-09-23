import { supabase } from '@/integrations/supabase/client';

export type Role = 'client' | 'professional' | 'admin';

export async function getProfile() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, roles, active_role, tasker_onboarding_status')
    .single();
  if (error) throw error;
  return data;
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
}

export async function updateOnboardingStatus(status: 'not_started' | 'in_progress' | 'complete') {
  const { error } = await supabase
    .from('profiles')
    .update({ tasker_onboarding_status: status })
    .eq('id', (await supabase.auth.getUser()).data.user?.id);
  if (error) throw error;
}