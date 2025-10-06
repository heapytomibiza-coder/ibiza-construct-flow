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
    admin: '/dashboard/admin',
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
 */
export const getAdminRoute = (
  section: 'questions' | 'website-settings' | 'verifications'
): string => {
  return `/admin/${section}`;
};
