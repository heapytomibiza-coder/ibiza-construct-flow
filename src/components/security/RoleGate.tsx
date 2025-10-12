/**
 * Role Gate Component
 * Phase 24: Advanced Security & Authorization System
 * 
 * Conditionally render content based on user roles
 */

import { ReactNode } from 'react';
import { Role } from '@/lib/security/types';
import { useSecurity } from '@/hooks/security';

interface RoleGateProps {
  children: ReactNode;
  roles: Role | Role[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

/**
 * Show/hide content based on user roles
 */
export function RoleGate({
  children,
  roles,
  requireAll = false,
  fallback = null,
}: RoleGateProps) {
  const { context } = useSecurity();
  const requiredRoles = Array.isArray(roles) ? roles : [roles];

  const hasAccess = requireAll
    ? requiredRoles.every(role => context.roles.includes(role))
    : requiredRoles.some(role => context.roles.includes(role));

  if (hasAccess) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

/**
 * Convenience components for specific roles
 */
export const AdminOnly = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <RoleGate roles="admin" fallback={fallback}>
    {children}
  </RoleGate>
);

export const ProfessionalOnly = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <RoleGate roles="professional" fallback={fallback}>
    {children}
  </RoleGate>
);

export const CustomerOnly = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <RoleGate roles="customer" fallback={fallback}>
    {children}
  </RoleGate>
);
