// API layer foundation - Phase 1 complete, waiting for migration confirmation
export * from './types';

// Re-export existing hooks for backward compatibility
export { useAuth } from '@/hooks/useAuth';
export { useServices } from '@/hooks/useServices';
export { useServiceOptions } from '@/hooks/useServiceOptions';

// Integration playbook implementation status:
// ✅ Phase 1: Database schema migration created (awaiting confirmation)
// ⏳ Phase 2: API adapter layer (will be implemented after migration)
// ⏳ Phase 3: Route guards (RouteGuard component ready)
// ⏳ Phase 4: Full job lifecycle
// ⏳ Phase 5: Testing & polish

export const integrationStatus = {
  databaseSchema: 'migration-pending',
  apiLayer: 'ready-to-implement',
  routeGuards: 'implemented',
  jobLifecycle: 'pending-schema',
  testing: 'pending'
};