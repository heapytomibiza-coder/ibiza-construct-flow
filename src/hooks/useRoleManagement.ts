import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Role, switchActiveRole, enableProfessionalRole } from '@/lib/roles';
import { useToast } from '@/hooks/use-toast';

export function useRoleManagement() {
  const [activeRole, setActiveRole] = useState<Role>('client');
  const [availableRoles, setAvailableRoles] = useState<Role[]>(['client']);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('roles, active_role')
          .eq('id', user.id)
          .single();

        if (profile) {
          const roles = Array.isArray(profile.roles) 
            ? profile.roles as Role[]
            : JSON.parse(String(profile.roles || '["client"]')) as Role[];
          
          setAvailableRoles(roles);
          setActiveRole((profile.active_role as Role) || 'client');
        }
      } catch (error) {
        console.error('Error fetching user roles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoles();
  }, []);

  const switchRole = async (newRole: Role) => {
    try {
      setLoading(true);
      await switchActiveRole(newRole);
      setActiveRole(newRole);
      
      toast({
        title: 'Role switched',
        description: `You are now operating as a ${newRole}.`,
      });
      
      return true;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error switching role',
        description: error.message,
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const becomeProfessional = async () => {
    try {
      setLoading(true);
      await enableProfessionalRole();
      
      // Refresh roles
      const { data: profile } = await supabase
        .from('profiles')
        .select('roles')
        .single();
      
      if (profile) {
        const roles = Array.isArray(profile.roles) 
          ? profile.roles as Role[]
          : JSON.parse(String(profile.roles || '["client"]')) as Role[];
        setAvailableRoles(roles);
      }
      
      toast({
        title: 'Professional role enabled',
        description: 'You can now offer services as a professional.',
      });
      
      return true;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error enabling professional role',
        description: error.message,
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: Role) => availableRoles.includes(role);
  const canSwitchRoles = availableRoles.length > 1;

  return {
    activeRole,
    availableRoles,
    loading,
    switchRole,
    becomeProfessional,
    hasRole,
    canSwitchRoles
  };
}