/**
 * Permission Manager
 * Phase 24: Advanced Security & Authorization System
 * 
 * Centralized permission checking and management
 */

import { Permission, Role, SecurityContext } from './types';
import { getRolePermissions } from './roles';

export class PermissionManager {
  /**
   * Check if user has a specific permission
   */
  static hasPermission(context: SecurityContext, permission: Permission): boolean {
    return context.permissions.includes(permission);
  }

  /**
   * Check if user has all specified permissions
   */
  static hasAllPermissions(context: SecurityContext, permissions: Permission[]): boolean {
    return permissions.every(p => this.hasPermission(context, p));
  }

  /**
   * Check if user has any of the specified permissions
   */
  static hasAnyPermission(context: SecurityContext, permissions: Permission[]): boolean {
    return permissions.some(p => this.hasPermission(context, p));
  }

  /**
   * Get all permissions for a user based on their roles
   */
  static getPermissionsFromRoles(roles: Role[]): Permission[] {
    const allPermissions = new Set<Permission>();
    
    for (const role of roles) {
      const rolePermissions = getRolePermissions(role);
      rolePermissions.forEach(p => allPermissions.add(p));
    }
    
    return Array.from(allPermissions);
  }

  /**
   * Create a security context from user data
   */
  static createContext(
    userId: string | undefined,
    roles: Role[],
    additionalData?: Partial<SecurityContext>
  ): SecurityContext {
    const permissions = this.getPermissionsFromRoles(roles);
    
    return {
      userId,
      roles,
      permissions,
      ...additionalData,
    };
  }

  /**
   * Check if user can access a resource
   */
  static canAccessResource(
    context: SecurityContext,
    resourceType: string,
    action: Permission,
    resourceOwnerId?: string
  ): boolean {
    // Check if user has the required permission
    if (!this.hasPermission(context, action)) {
      return false;
    }
    
    // If resource has an owner, check ownership
    if (resourceOwnerId && context.userId !== resourceOwnerId) {
      // Admins can access any resource
      if (context.roles.includes('admin')) {
        return true;
      }
      
      // Check if user has manage permission
      const managePermission = `${resourceType}:manage` as Permission;
      return this.hasPermission(context, managePermission);
    }
    
    return true;
  }

  /**
   * Filter resources by access
   */
  static filterByAccess<T extends { id: string; userId?: string }>(
    context: SecurityContext,
    resources: T[],
    action: Permission
  ): T[] {
    return resources.filter(resource => 
      this.canAccessResource(context, 'resource', action, resource.userId)
    );
  }

  /**
   * Require specific permission or throw error
   */
  static requirePermission(
    context: SecurityContext,
    permission: Permission,
    message?: string
  ): void {
    if (!this.hasPermission(context, permission)) {
      throw new Error(message || `Permission denied: ${permission}`);
    }
  }

  /**
   * Require any of the specified permissions or throw error
   */
  static requireAnyPermission(
    context: SecurityContext,
    permissions: Permission[],
    message?: string
  ): void {
    if (!this.hasAnyPermission(context, permissions)) {
      throw new Error(
        message || `Permission denied: requires one of ${permissions.join(', ')}`
      );
    }
  }

  /**
   * Require all specified permissions or throw error
   */
  static requireAllPermissions(
    context: SecurityContext,
    permissions: Permission[],
    message?: string
  ): void {
    if (!this.hasAllPermissions(context, permissions)) {
      throw new Error(
        message || `Permission denied: requires ${permissions.join(', ')}`
      );
    }
  }
}
