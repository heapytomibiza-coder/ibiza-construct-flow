import { useEffect, useState } from 'react';
import { onActiveRoleChange, getActiveRole, initRoleRealtime, Role } from '@/lib/roles';

export function useActiveRole() {
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize realtime listener for multi-tab sync
    initRoleRealtime();
    
    // Fetch initial role
    getActiveRole()
      .then(() => setLoading(false))
      .catch(() => {
        setLoading(false);
      });
    
    // Subscribe to role changes
    const unsubscribe = onActiveRoleChange((role, availableRoles) => {
      setActiveRole(role);
      setRoles(availableRoles);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  return { 
    activeRole, 
    roles, 
    loading,
    // Expose setActiveRole for local state updates (after DB update)
    setActiveRole 
  };
}
