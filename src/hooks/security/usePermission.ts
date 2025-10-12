/**
 * Permission Hook
 * Phase 24: Advanced Security & Authorization System
 * 
 * React hook for checking specific permissions
 */

import { Permission } from '@/lib/security/types';
import { useSecurity } from './useSecurity';

/**
 * Hook to check if user has a specific permission
 */
export function usePermission(permission: Permission): boolean {
  const { hasPermission } = useSecurity();
  return hasPermission(permission);
}

/**
 * Hook to check if user has any of the specified permissions
 */
export function useAnyPermission(permissions: Permission[]): boolean {
  const { hasAnyPermission } = useSecurity();
  return hasAnyPermission(permissions);
}

/**
 * Hook to check if user has all specified permissions
 */
export function useAllPermissions(permissions: Permission[]): boolean {
  const { hasAllPermissions } = useSecurity();
  return hasAllPermissions(permissions);
}

/**
 * Hook to require a permission (throws if not allowed)
 */
export function useRequirePermission(permission: Permission): void {
  const hasPermission = usePermission(permission);
  
  if (!hasPermission) {
    throw new Error(`Permission denied: ${permission}`);
  }
}
