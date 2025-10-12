/**
 * Role Definitions
 * Phase 24: Advanced Security & Authorization System
 * 
 * Define roles and their permissions
 */

import { RoleDefinition, Role, Permission } from './types';

export const ROLE_DEFINITIONS: Record<Role, RoleDefinition> = {
  guest: {
    name: 'guest',
    description: 'Unauthenticated user with limited access',
    permissions: [
      'service:read',
    ],
  },
  
  customer: {
    name: 'customer',
    description: 'Customer who can create jobs and request quotes',
    permissions: [
      'service:read',
      'job:read',
      'job:create',
      'job:update',
      'job:delete',
      'quote:read',
      'user:read',
      'user:write',
      'payment:read',
    ],
    inherits: ['guest'],
  },
  
  professional: {
    name: 'professional',
    description: 'Professional who can manage services and quotes',
    permissions: [
      'service:read',
      'service:create',
      'service:update',
      'job:read',
      'quote:read',
      'quote:create',
      'quote:update',
      'user:read',
      'user:write',
      'payment:read',
    ],
    inherits: ['customer'],
  },
  
  admin: {
    name: 'admin',
    description: 'Administrator with full access',
    permissions: [
      'admin:access',
      'admin:users',
      'admin:content',
      'admin:settings',
      'user:read',
      'user:write',
      'user:delete',
      'user:manage',
      'job:read',
      'job:create',
      'job:update',
      'job:delete',
      'job:manage',
      'quote:read',
      'quote:create',
      'quote:update',
      'quote:delete',
      'quote:approve',
      'service:read',
      'service:create',
      'service:update',
      'service:delete',
      'payment:read',
      'payment:process',
      'payment:refund',
    ],
    inherits: ['professional'],
  },
};

/**
 * Get all permissions for a role (including inherited)
 */
export function getRolePermissions(role: Role): Permission[] {
  const definition = ROLE_DEFINITIONS[role];
  const permissions = new Set<Permission>(definition.permissions);
  
  // Add inherited permissions
  if (definition.inherits) {
    for (const inheritedRole of definition.inherits) {
      const inheritedPermissions = getRolePermissions(inheritedRole);
      inheritedPermissions.forEach(p => permissions.add(p));
    }
  }
  
  return Array.from(permissions);
}

/**
 * Check if a role has a specific permission
 */
export function roleHasPermission(role: Role, permission: Permission): boolean {
  const permissions = getRolePermissions(role);
  return permissions.includes(permission);
}

/**
 * Get the highest role from a list of roles
 */
export function getHighestRole(roles: Role[]): Role {
  const roleHierarchy: Role[] = ['guest', 'customer', 'professional', 'admin'];
  
  for (let i = roleHierarchy.length - 1; i >= 0; i--) {
    if (roles.includes(roleHierarchy[i])) {
      return roleHierarchy[i];
    }
  }
  
  return 'guest';
}

/**
 * Check if one role is higher than another
 */
export function isRoleHigher(role1: Role, role2: Role): boolean {
  const hierarchy = ['guest', 'customer', 'professional', 'admin'];
  return hierarchy.indexOf(role1) > hierarchy.indexOf(role2);
}
