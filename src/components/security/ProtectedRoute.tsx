/**
 * Protected Route Component
 * Phase 24: Advanced Security & Authorization System
 * 
 * Route wrapper that requires authentication and permissions
 */

import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Permission } from '@/lib/security/types';
import { useSecurity } from '@/hooks/security';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: Permission;
  requiredPermissions?: Permission[];
  requireAny?: boolean;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredPermission,
  requiredPermissions,
  requireAny = false,
  fallback,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { context, hasPermission, hasAnyPermission, hasAllPermissions } = useSecurity();

  // Check if user is authenticated
  if (!context.userId && context.roles.includes('guest')) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check single permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return fallback || <AccessDenied permission={requiredPermission} />;
  }

  // Check multiple permissions
  if (requiredPermissions) {
    const hasAccess = requireAny
      ? hasAnyPermission(requiredPermissions)
      : hasAllPermissions(requiredPermissions);

    if (!hasAccess) {
      return fallback || <AccessDenied permissions={requiredPermissions} />;
    }
  }

  return <>{children}</>;
}

function AccessDenied({ 
  permission, 
  permissions 
}: { 
  permission?: Permission; 
  permissions?: Permission[] 
}) {
  const permissionText = permission || permissions?.join(', ') || 'required permission';

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You don't have permission to access this resource.
          <br />
          Required: {permissionText}
        </AlertDescription>
      </Alert>
    </div>
  );
}
