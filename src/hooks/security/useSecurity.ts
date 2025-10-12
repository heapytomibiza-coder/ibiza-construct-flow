/**
 * Security Hook
 * Phase 24: Advanced Security & Authorization System
 * 
 * React hook for security and permissions
 */

import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Permission, Role, SecurityContext } from '@/lib/security/types';
import { PermissionManager } from '@/lib/security';

export function useSecurity() {
  const { user } = useAuth();

  const context: SecurityContext = useMemo(() => {
    if (!user) {
      return {
        userId: undefined,
        roles: ['guest'],
        permissions: PermissionManager.getPermissionsFromRoles(['guest']),
      };
    }

    const roles: Role[] = user.role ? [user.role as Role] : ['customer'];
    const permissions = PermissionManager.getPermissionsFromRoles(roles);

    return {
      userId: user.id,
      roles,
      permissions,
    };
  }, [user]);

  const hasPermission = (permission: Permission): boolean => {
    return PermissionManager.hasPermission(context, permission);
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return PermissionManager.hasAllPermissions(context, permissions);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return PermissionManager.hasAnyPermission(context, permissions);
  };

  const canAccessResource = (
    resourceType: string,
    action: Permission,
    resourceOwnerId?: string
  ): boolean => {
    return PermissionManager.canAccessResource(
      context,
      resourceType,
      action,
      resourceOwnerId
    );
  };

  const isAdmin = context.roles.includes('admin');
  const isProfessional = context.roles.includes('professional');
  const isCustomer = context.roles.includes('customer');
  const isGuest = context.roles.includes('guest');

  return {
    context,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    canAccessResource,
    isAdmin,
    isProfessional,
    isCustomer,
    isGuest,
  };
}
