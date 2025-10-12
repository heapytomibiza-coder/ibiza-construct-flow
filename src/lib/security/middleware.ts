/**
 * Security Middleware
 * Phase 24: Advanced Security & Authorization System
 * 
 * Middleware functions for security checks
 */

import { Permission, SecurityContext } from './types';
import { PermissionManager } from './permissions';
import { auditLogger } from './auditLogger';
import { apiRateLimiter } from './rateLimiter';

/**
 * Create middleware to check permissions
 */
export function requirePermission(permission: Permission) {
  return async (context: SecurityContext) => {
    const hasPermission = PermissionManager.hasPermission(context, permission);

    if (!hasPermission) {
      await auditLogger.logDenied(
        context.userId || 'anonymous',
        'access',
        permission,
        'Missing required permission'
      );
      throw new Error(`Permission denied: ${permission}`);
    }

    return true;
  };
}

/**
 * Create middleware to check any of multiple permissions
 */
export function requireAnyPermission(permissions: Permission[]) {
  return async (context: SecurityContext) => {
    const hasAny = PermissionManager.hasAnyPermission(context, permissions);

    if (!hasAny) {
      await auditLogger.logDenied(
        context.userId || 'anonymous',
        'access',
        permissions.join(','),
        'Missing required permissions'
      );
      throw new Error(`Permission denied: requires one of ${permissions.join(', ')}`);
    }

    return true;
  };
}

/**
 * Create middleware to check all permissions
 */
export function requireAllPermissions(permissions: Permission[]) {
  return async (context: SecurityContext) => {
    const hasAll = PermissionManager.hasAllPermissions(context, permissions);

    if (!hasAll) {
      await auditLogger.logDenied(
        context.userId || 'anonymous',
        'access',
        permissions.join(','),
        'Missing required permissions'
      );
      throw new Error(`Permission denied: requires ${permissions.join(', ')}`);
    }

    return true;
  };
}

/**
 * Create middleware to check resource ownership
 */
export function requireOwnership(
  resourceType: string,
  getResourceOwnerId: (resourceId: string) => Promise<string | undefined>
) {
  return async (context: SecurityContext, resourceId: string) => {
    const ownerId = await getResourceOwnerId(resourceId);

    if (!ownerId) {
      throw new Error('Resource not found');
    }

    if (context.userId !== ownerId && !context.roles.includes('admin')) {
      await auditLogger.logDenied(
        context.userId || 'anonymous',
        'access',
        resourceType,
        'Not resource owner',
        { resourceId }
      );
      throw new Error('Access denied: not resource owner');
    }

    return true;
  };
}

/**
 * Create middleware to enforce rate limiting
 */
export function requireRateLimit(key?: string) {
  return async (context: SecurityContext) => {
    const limitKey = key || context.userId || context.ipAddress || 'anonymous';

    if (!apiRateLimiter.isAllowed(limitKey)) {
      await auditLogger.logDenied(
        context.userId || 'anonymous',
        'rate_limit',
        'api',
        'Rate limit exceeded'
      );
      throw new Error('Rate limit exceeded');
    }

    return true;
  };
}

/**
 * Create middleware to require authentication
 */
export function requireAuth() {
  return async (context: SecurityContext) => {
    if (!context.userId) {
      await auditLogger.logDenied(
        'anonymous',
        'access',
        'auth',
        'Authentication required'
      );
      throw new Error('Authentication required');
    }

    return true;
  };
}

/**
 * Compose multiple middleware functions
 */
export function composeMiddleware(
  ...middlewares: Array<(context: SecurityContext, ...args: any[]) => Promise<boolean>>
) {
  return async (context: SecurityContext, ...args: any[]): Promise<boolean> => {
    for (const middleware of middlewares) {
      await middleware(context, ...args);
    }
    return true;
  };
}

/**
 * Create an audit middleware
 */
export function auditAction(action: string, resource: string) {
  return async (context: SecurityContext, resourceId?: string) => {
    await auditLogger.logSuccess(
      context.userId || 'anonymous',
      action,
      resource,
      { resourceId }
    );
    return true;
  };
}
