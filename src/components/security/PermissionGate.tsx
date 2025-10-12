/**
 * Permission Gate Component
 * Phase 24: Advanced Security & Authorization System
 * 
 * Conditionally render content based on permissions
 */

import { ReactNode } from 'react';
import { Permission } from '@/lib/security/types';
import { useSecurity } from '@/hooks/security';

interface PermissionGateProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
  showFallback?: boolean;
}

/**
 * Show/hide content based on user permissions
 */
export function PermissionGate({
  children,
  permission,
  permissions,
  requireAll = true,
  fallback = null,
  showFallback = true,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useSecurity();

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions) {
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  } else {
    // No permissions specified, show content
    hasAccess = true;
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  return showFallback ? <>{fallback}</> : null;
}
