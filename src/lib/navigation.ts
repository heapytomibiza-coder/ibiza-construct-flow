import { Role } from './roles';

/**
 * Navigation helper utilities for consistent route generation
 */

/**
 * Get auth route with optional mode and role parameters
 */
export const getAuthRoute = (
  mode?: 'signin' | 'signup',
  role?: 'client' | 'professional'
): string => {
  const params = new URLSearchParams();
  if (mode) params.append('mode', mode);
  if (role) params.append('role', role);
  const query = params.toString();
  return query ? `/auth?${query}` : '/auth';
};

/**
 * Get settings route for a specific section
 */
export const getSettingsRoute = (
  section: 'profile' | 'account' | 'notifications' | 'client' | 'professional'
): string => {
  return `/settings/${section}`;
};

/**
 * Get dashboard route for a specific role
 */
export const getDashboardForRole = (role: Role): string => {
  const routes: Record<Role, string> = {
    admin: '/admin',
    professional: '/dashboard/pro',
    client: '/dashboard/client',
  };
  return routes[role] || routes.client;
};

/**
 * Get professional management routes
 */
export const getProfessionalRoute = (
  page: 'verification' | 'services' | 'portfolio' | 'onboarding'
): string => {
  if (page === 'onboarding') return '/onboarding/professional';
  return `/professional/${page}`;
};

/**
 * Get admin route for specific section
 * @param section - The admin section to navigate to
 * @returns The admin route path
 * @example
 * getAdminRoute('users') // '/admin/users'
 * getAdminRoute('disputes') // '/admin/disputes'
 */
export const getAdminRoute = (
  section: 'questions' | 'website-settings' | 'verifications' | 'users' | 'jobs' | 'profiles' | 'disputes' | 'analytics' | 'settings' | 'contracts'
): string => {
  return `/admin/${section}`;
};

/**
 * Get contract route
 * @param contractId - The UUID of the contract
 * @param action - Optional action to perform on the contract (e.g., 'fund')
 * @returns The contract route path
 * @example
 * getContractRoute('123e4567-e89b-12d3-a456-426614174000') // '/contracts/123e4567-e89b-12d3-a456-426614174000'
 * getContractRoute('123e4567-e89b-12d3-a456-426614174000', 'fund') // '/contracts/123e4567-e89b-12d3-a456-426614174000/fund'
 */
export const getContractRoute = (contractId: string, action?: 'fund'): string => {
  if (action === 'fund') return `/contracts/${contractId}/fund`;
  return `/contracts/${contractId}`;
};

/**
 * Get job route
 * @param jobId - The UUID of the job
 * @param page - Optional page within the job (e.g., 'matches')
 * @returns The job route path
 * @example
 * getJobRoute('123e4567-e89b-12d3-a456-426614174000') // '/jobs/123e4567-e89b-12d3-a456-426614174000'
 * getJobRoute('123e4567-e89b-12d3-a456-426614174000', 'matches') // '/jobs/123e4567-e89b-12d3-a456-426614174000/matches'
 */
export const getJobRoute = (jobId: string, page?: 'matches'): string => {
  if (page === 'matches') return `/jobs/${jobId}/matches`;
  return `/jobs/${jobId}`;
};

/**
 * Normalize and validate an internal redirect path.
 * - Must start with '/'
 * - Rejects protocol-based URLs and protocol-relative URLs
 */
export function normalizeRedirectPath(input: string | null | undefined): string | null {
  if (!input) return null;
  let decoded = input;
  try {
    decoded = decodeURIComponent(input);
  } catch {
    // ignore decode errors; fall back to raw
  }

  if (!decoded.startsWith('/')) return null;
  if (decoded.startsWith('//')) return null;
  if (decoded.includes('://')) return null;

  return decoded;
}
