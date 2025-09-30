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
        // Check localStorage first for immediate feedback
        const cachedRole = localStorage.getItem('active_role') as Role;
        if (cachedRole && mounted) {
          setActiveRole(cachedRole);
        }

        const { data } = await supabase
          .from('profiles')
          .select('active_role, roles')
          .single();
        
        if (mounted && data) {
          const dbActiveRole = (data.active_role as Role) || 'client';
          const rolesData = data.roles;
          const dbRoles: Role[] = Array.isArray(rolesData) 
            ? rolesData.filter((r): r is Role => ['client', 'professional', 'admin'].includes(r as string))
            : ['client'];
          
          setActiveRole(dbActiveRole);
          setRoles(dbRoles);
          
          // Sync localStorage with database
          localStorage.setItem('active_role', dbActiveRole);
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
    localStorage.setItem('active_role', newRole);
  };

  return { activeRole, roles, setActiveRole: updateActiveRole, loading };
}