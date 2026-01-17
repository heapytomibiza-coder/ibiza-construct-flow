/**
 * @ibiza/ref-impl
 * Reference Implementation - LOB Modules
 * 
 * Contains role-based modules:
 * - user: Auth/profile (role-agnostic)
 * - admin: Admin module
 * - client: Job posters
 * - workers: Professionals (Person | Business)
 * - shared: LOB-shared components/hooks/layouts
 * 
 * @module @ibiza/ref-impl
 */

export * from './user';
export * from './admin';
export * from './client';
export * from './workers';
export * from './shared';
