import { useState } from 'react';
import { useActiveRole } from '@/hooks/useActiveRole';
import { switchActiveRole, Role } from '@/lib/roles';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Briefcase, Shield } from 'lucide-react';

export default function HeaderRoleSwitcher() {
  const { activeRole, roles, setActiveRole, loading } = useActiveRole();
  const [switching, setSwitching] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleRoleSwitch = async (newRole: Role) => {
    if (activeRole === newRole || switching) return;
    
    setSwitching(true);
    try {
      // Update in database
      await switchActiveRole(newRole);
      
      // Update local state
      setActiveRole(newRole);
      
      // Persist to localStorage for consistency
      localStorage.setItem('active_role', newRole);
      
      toast({
        title: "Role switched",
        description: `You're now in ${newRole} mode`
      });
      
      // Navigate to appropriate dashboard
      if (newRole === 'admin') {
        navigate('/dashboard/admin');
      } else if (newRole === 'professional') {
        navigate('/dashboard/pro');
      } else {
        navigate('/dashboard/client');
      }
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

  // If user only has one role, show a simple badge
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

  // If user has multiple roles, show segmented control
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