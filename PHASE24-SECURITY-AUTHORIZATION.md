# Phase 24: Advanced Security & Authorization System

## Overview
Comprehensive security and authorization system with RBAC (Role-Based Access Control), granular permissions, audit logging, rate limiting, and security middleware.

## Features Implemented

### 1. Role-Based Access Control (RBAC)
- **Predefined Roles**: Guest, Customer, Professional, Admin
- **Role Hierarchy**: Inheritance of permissions from lower roles
- **Role Permissions**: Each role has specific set of permissions
- **Dynamic Role Checking**: Runtime role and permission validation

### 2. Permission System
- **Granular Permissions**: Fine-grained access control
- **Resource-Based**: Permissions tied to specific resources
- **Action-Based**: Separate permissions for read, create, update, delete
- **Permission Manager**: Centralized permission checking logic
- **Ownership Checks**: Verify resource ownership

### 3. Audit Logging
- **Comprehensive Logging**: Track all security events
- **User Actions**: Log user activities and access attempts
- **Status Tracking**: Success, failure, and denied events
- **Metadata**: Include context like IP address, user agent
- **Query & Export**: Search and export audit logs
- **Statistics**: Aggregate audit data for analysis

### 4. Rate Limiting
- **Request Throttling**: Prevent abuse and DOS attacks
- **Configurable Limits**: Set max requests and time windows
- **Per-User/IP**: Track limits by identifier
- **Multiple Presets**: Strict, moderate, lenient configurations
- **Status Tracking**: Monitor current usage and reset times
- **Auto-Cleanup**: Periodically clean expired records

### 5. Security Middleware
- **Permission Checks**: Require specific permissions
- **Authentication**: Enforce authentication requirements
- **Ownership Validation**: Verify resource ownership
- **Rate Limiting**: Apply rate limits to operations
- **Composable**: Chain multiple security checks
- **Audit Integration**: Automatic audit logging

### 6. React Integration
- **Hooks**:
  - `useSecurity`: Main security context hook
  - `usePermission`: Check specific permissions
  - `useAnyPermission`: Check any of multiple permissions
  - `useAllPermissions`: Check all permissions
  - `useRequirePermission`: Throw if permission denied
- **Components**:
  - `ProtectedRoute`: Guard routes with permissions
  - `PermissionGate`: Conditionally render based on permissions
  - `RoleGate`: Conditionally render based on roles
  - `AdminOnly`, `ProfessionalOnly`, `CustomerOnly`: Role-specific gates

## Architecture

### Role Hierarchy
```
Guest → Customer → Professional → Admin
```

Each higher role inherits all permissions from lower roles.

### Permission Categories
- **User**: user:read, user:write, user:delete, user:manage
- **Job**: job:read, job:create, job:update, job:delete, job:manage
- **Quote**: quote:read, quote:create, quote:update, quote:delete, quote:approve
- **Service**: service:read, service:create, service:update, service:delete
- **Admin**: admin:access, admin:users, admin:content, admin:settings
- **Payment**: payment:read, payment:process, payment:refund

### Security Flow
```
Request → Auth Check → Permission Check → Rate Limit → Audit Log → Response
```

## Usage Examples

### Check Permissions in Components

```tsx
import { useSecurity } from '@/hooks/security';

function MyComponent() {
  const { hasPermission, isAdmin, canAccessResource } = useSecurity();

  const canEdit = hasPermission('job:update');
  const canDelete = hasPermission('job:delete');

  return (
    <div>
      {canEdit && <button>Edit</button>}
      {canDelete && <button>Delete</button>}
      {isAdmin && <button>Admin Panel</button>}
    </div>
  );
}
```

### Protected Routes

```tsx
import { ProtectedRoute } from '@/components/security';

function App() {
  return (
    <Routes>
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredPermission="admin:access">
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/jobs/create" 
        element={
          <ProtectedRoute requiredPermission="job:create">
            <CreateJob />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}
```

### Permission Gates

```tsx
import { PermissionGate } from '@/components/security';

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      <PermissionGate permission="job:create">
        <button>Create New Job</button>
      </PermissionGate>
      
      <PermissionGate 
        permissions={['quote:create', 'quote:update']} 
        requireAll={false}
      >
        <QuoteSection />
      </PermissionGate>
    </div>
  );
}
```

### Role Gates

```tsx
import { RoleGate, AdminOnly, ProfessionalOnly } from '@/components/security';

function UserProfile() {
  return (
    <div>
      <h1>Profile</h1>
      
      <AdminOnly>
        <button>Delete User</button>
      </AdminOnly>
      
      <ProfessionalOnly>
        <button>View Services</button>
      </ProfessionalOnly>
      
      <RoleGate roles={['admin', 'professional']}>
        <button>Advanced Settings</button>
      </RoleGate>
    </div>
  );
}
```

### Audit Logging

```tsx
import { auditLogger } from '@/lib/security';

async function deleteJob(jobId: string, userId: string) {
  try {
    await api.delete(`/jobs/${jobId}`);
    
    // Log successful action
    await auditLogger.logSuccess(
      userId,
      'delete',
      'job',
      { resourceId: jobId }
    );
  } catch (error) {
    // Log failed action
    await auditLogger.logFailure(
      userId,
      'delete',
      'job',
      'Failed to delete job',
      { resourceId: jobId, error: error.message }
    );
  }
}
```

### Rate Limiting

```tsx
import { apiRateLimiter, authRateLimiter } from '@/lib/security';

async function handleApiRequest(userId: string) {
  // Check rate limit
  if (!apiRateLimiter.isAllowed(userId)) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  // Get current status
  const status = apiRateLimiter.getStatus(userId);
  console.log(`Remaining requests: ${status.remaining}/${status.limit}`);
  
  // Make API request
  await api.get('/data');
}

async function handleLogin(userId: string) {
  // Stricter rate limit for auth
  if (!authRateLimiter.isAllowed(userId)) {
    throw new Error('Too many login attempts. Please try again later.');
  }
  
  // Perform login
  await auth.login(userId);
}
```

### Security Middleware

```tsx
import { 
  requirePermission, 
  requireAuth, 
  requireOwnership,
  composeMiddleware 
} from '@/lib/security/middleware';

// Single middleware
const checkEditPermission = requirePermission('job:update');

// Composed middleware
const secureJobUpdate = composeMiddleware(
  requireAuth(),
  requirePermission('job:update'),
  requireOwnership('job', async (jobId) => {
    const job = await getJob(jobId);
    return job.userId;
  })
);

// Use in your code
async function updateJob(jobId: string, data: any, context: SecurityContext) {
  await secureJobUpdate(context, jobId);
  
  // Proceed with update
  return await api.update(`/jobs/${jobId}`, data);
}
```

### Custom Permissions Check

```tsx
import { PermissionManager } from '@/lib/security';

function checkComplexPermission(userId: string, resourceId: string) {
  // Create security context
  const context = PermissionManager.createContext(
    userId,
    ['professional'],
    {
      ipAddress: '192.168.1.1',
      userAgent: navigator.userAgent,
    }
  );

  // Check resource access
  const canAccess = PermissionManager.canAccessResource(
    context,
    'job',
    'job:update',
    resourceOwnerId
  );

  if (!canAccess) {
    throw new Error('Access denied');
  }
}
```

### View Audit Logs

```tsx
import { auditLogger } from '@/lib/security';

function AuditLogViewer({ userId }: { userId: string }) {
  // Get user's logs
  const userLogs = auditLogger.getLogsByUser(userId, 50);
  
  // Get recent denied attempts
  const deniedLogs = auditLogger.getLogsByStatus('denied', 20);
  
  // Get statistics
  const stats = auditLogger.getStatistics();
  
  return (
    <div>
      <h2>Audit Logs</h2>
      <p>Total: {stats.total}</p>
      <p>Success: {stats.success}</p>
      <p>Denied: {stats.denied}</p>
      
      {userLogs.map(log => (
        <div key={log.id}>
          {log.action} on {log.resource} - {log.status}
        </div>
      ))}
    </div>
  );
}
```

### Rate Limit Status

```tsx
import { apiRateLimiter } from '@/lib/security';

function RateLimitStatus({ userId }: { userId: string }) {
  const status = apiRateLimiter.getStatus(userId);
  const resetDate = new Date(status.reset);
  
  return (
    <div>
      <p>Remaining: {status.remaining}/{status.limit}</p>
      <p>Resets at: {resetDate.toLocaleTimeString()}</p>
    </div>
  );
}
```

## Role Definitions

### Guest
- **Permissions**: service:read
- **Description**: Unauthenticated users, can browse services

### Customer
- **Permissions**: All Guest permissions plus:
  - job:read, job:create, job:update, job:delete
  - quote:read
  - user:read, user:write
  - payment:read
- **Description**: Authenticated users who can create jobs and request quotes

### Professional
- **Permissions**: All Customer permissions plus:
  - service:create, service:update
  - quote:create, quote:update
- **Description**: Service providers who can manage services and create quotes

### Admin
- **Permissions**: All Professional permissions plus:
  - admin:access, admin:users, admin:content, admin:settings
  - user:delete, user:manage
  - job:manage
  - quote:delete, quote:approve
  - service:delete
  - payment:process, payment:refund
- **Description**: Full system access for administration

## Best Practices

1. **Always Check Permissions**: Never assume a user has access
2. **Use Least Privilege**: Grant minimum permissions necessary
3. **Audit Everything**: Log all security-sensitive actions
4. **Rate Limit**: Protect against abuse
5. **Validate Ownership**: Check resource ownership for user data
6. **Fail Securely**: Default to deny access
7. **Use Middleware**: Compose security checks for reusability
8. **Test Security**: Write tests for permission checks

## Security Checklist

- [ ] All routes protected with authentication
- [ ] Permissions checked for sensitive operations
- [ ] Resource ownership validated
- [ ] Rate limiting applied to APIs
- [ ] Audit logging enabled
- [ ] Admin routes restricted
- [ ] User input sanitized
- [ ] Error messages don't leak information

## Testing Security

```tsx
import { describe, it, expect } from 'vitest';
import { PermissionManager } from '@/lib/security';
import { createTestUser } from '@/lib/testing';

describe('Security', () => {
  it('customer cannot delete users', () => {
    const customer = createTestUser({ role: 'customer' });
    const context = PermissionManager.createContext(
      customer.id,
      [customer.role]
    );
    
    expect(
      PermissionManager.hasPermission(context, 'user:delete')
    ).toBe(false);
  });
  
  it('admin can delete users', () => {
    const admin = createTestUser({ role: 'admin' });
    const context = PermissionManager.createContext(
      admin.id,
      [admin.role]
    );
    
    expect(
      PermissionManager.hasPermission(context, 'user:delete')
    ).toBe(true);
  });
});
```

## Future Enhancements

- [ ] Dynamic role creation
- [ ] Permission groups
- [ ] Time-based permissions
- [ ] Geo-based restrictions
- [ ] Multi-factor authentication
- [ ] OAuth integration
- [ ] IP whitelisting/blacklisting
- [ ] Security dashboard

## Dependencies

- uuid: Audit log ID generation
- React Router: Protected routes
- Existing auth system: User context

## Configuration

Rate limiter presets can be adjusted in `rateLimiter.ts`:

```typescript
const presets = {
  strict: { maxRequests: 10, windowMs: 60000 },
  moderate: { maxRequests: 30, windowMs: 60000 },
  lenient: { maxRequests: 100, windowMs: 60000 },
};
```

Roles and permissions are defined in `roles.ts` and can be customized per application needs.
