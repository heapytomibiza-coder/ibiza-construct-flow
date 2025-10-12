/**
 * Security Types
 * Phase 24: Advanced Security & Authorization System
 */

export type Role = 'admin' | 'professional' | 'customer' | 'guest';

export type Permission = 
  // User permissions
  | 'user:read'
  | 'user:write'
  | 'user:delete'
  | 'user:manage'
  
  // Job permissions
  | 'job:read'
  | 'job:create'
  | 'job:update'
  | 'job:delete'
  | 'job:manage'
  
  // Quote permissions
  | 'quote:read'
  | 'quote:create'
  | 'quote:update'
  | 'quote:delete'
  | 'quote:approve'
  
  // Admin permissions
  | 'admin:access'
  | 'admin:users'
  | 'admin:content'
  | 'admin:settings'
  
  // Service permissions
  | 'service:read'
  | 'service:create'
  | 'service:update'
  | 'service:delete'
  
  // Financial permissions
  | 'payment:read'
  | 'payment:process'
  | 'payment:refund';

export interface RoleDefinition {
  name: Role;
  description: string;
  permissions: Permission[];
  inherits?: Role[];
}

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  rules: SecurityRule[];
  enabled: boolean;
}

export interface SecurityRule {
  id: string;
  type: 'allow' | 'deny';
  resource: string;
  action: Permission;
  condition?: SecurityCondition;
}

export interface SecurityCondition {
  type: 'owner' | 'role' | 'permission' | 'custom';
  value: any;
  operator?: 'eq' | 'ne' | 'in' | 'nin' | 'gt' | 'lt';
}

export interface AuditLog {
  id: string;
  timestamp: number;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure' | 'denied';
  reason?: string;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitStatus {
  limit: number;
  remaining: number;
  reset: number;
}

export interface SecurityContext {
  userId?: string;
  roles: Role[];
  permissions: Permission[];
  session?: any;
  ipAddress?: string;
  userAgent?: string;
}

export interface AccessControlEntry {
  userId: string;
  resourceType: string;
  resourceId: string;
  permissions: Permission[];
  granted: Date;
  expiresAt?: Date;
}
