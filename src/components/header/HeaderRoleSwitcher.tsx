import { useState } from 'react';
import { useRole } from '@/lib/roleHelpers';
import { switchActiveRole, getDashboardRoute } from '@/lib/roles';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Briefcase, Shield } from 'lucide-react';
import { useCurrentSession } from '../../../packages/@contracts/clients/auth';
import { useQueryClient } from '@tanstack/react-query';

export default function HeaderRoleSwitcher() {
  const { active: activeRole, roles } = useRole();
  const { isLoading: loading } = useCurrentSession();
  const [switching, setSwitching] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleRoleSwitch = async (newRole: 'client' | 'professional' | 'admin') => {
    if (activeRole === newRole || switching) return;
    
    setSwitching(true);
    try {
      await switchActiveRole(newRole);

      // 🔥 CRITICAL: clear stale data tied to previous role
      queryClient.invalidateQueries();
      
      toast({
        title: "Role switched",
        description: `You're now in ${newRole === 'client' ? 'client' : newRole === 'professional' ? 'professional' : 'admin'} mode`
      });
      
      // Always force navigation to correct lane
      const dashboardRoute = getDashboardRoute(newRole);
      navigate(dashboardRoute, { replace: true });
    } catch (error: any) {
      toast({
        title: "Error switching role",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSwitching(false);
    }
  };

  if (loading) {
    return <div className="h-8 w-20 bg-muted animate-pulse rounded-full" />;
  }

  if (roles.length < 2) {
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        {activeRole === 'admin' ? (
          <>
            <Shield className="h-3 w-3" />
            Admin
          </>
        ) : activeRole === 'professional' ? (
          <>
            <Briefcase className="h-3 w-3" />
            Professional
          </>
        ) : (
          <>
            <User className="h-3 w-3" />
            Client
          </>
        )}
      </Badge>
    );
  }

  return (
    <div className="inline-flex rounded-full bg-muted p-1">
      {roles.includes('client') && (
        <Button
          variant={activeRole === 'client' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleRoleSwitch('client')}
          disabled={switching}
          className="rounded-full h-8 px-3 text-xs"
        >
          <User className="h-3 w-3 mr-1" />
          Client
        </Button>
      )}
      {roles.includes('professional') && (
        <Button
          variant={activeRole === 'professional' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleRoleSwitch('professional')}
          disabled={switching}
          className="rounded-full h-8 px-3 text-xs"
        >
          <Briefcase className="h-3 w-3 mr-1" />
          Professional
        </Button>
      )}
      {roles.includes('admin') && (
        <Button
          variant={activeRole === 'admin' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleRoleSwitch('admin')}
          disabled={switching}
          className="rounded-full h-8 px-3 text-xs"
        >
          <Shield className="h-3 w-3 mr-1" />
          Admin
        </Button>
      )}
    </div>
  );
}
