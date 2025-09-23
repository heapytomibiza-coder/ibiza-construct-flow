import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Role } from '@/lib/roles';

export function useActiveRole() {
  const [activeRole, setActiveRole] = useState<Role>('client');
  const [roles, setRoles] = useState<Role[]>(['client']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const fetchProfile = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('active_role, roles')
          .single();
        
        if (mounted && data) {
          setActiveRole((data.active_role as Role) || 'client');
          setRoles(Array.isArray(data.roles) ? (data.roles as Role[]) : ['client']);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProfile();
    
    return () => { mounted = false; };
  }, []);

  const updateActiveRole = (newRole: Role) => {
    setActiveRole(newRole);
  };

  return { activeRole, roles, setActiveRole: updateActiveRole, loading };
}