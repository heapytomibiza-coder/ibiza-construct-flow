/**
 * Jobs Data Source Helper
 * 
 * SECURITY: This helper enforces the boundary between public and private job data.
 * - Public visitors and clients MUST use 'public_jobs_preview' (no sensitive fields)
 * - Only authenticated professionals can access the full 'jobs' table
 * 
 * Usage:
 *   const table = getJobsTable(isProfessional);
 *   supabase.from(table).select('*')...
 * 
 * NEVER bypass this helper by hardcoding 'jobs' in public-facing components.
 */

export type JobsTableName = 'jobs' | 'public_jobs_preview';

/**
 * Returns the appropriate jobs table based on user role.
 * 
 * @param canViewPrivateJobs - true if user is an authenticated professional
 * @returns The table name to query
 * 
 * @example
 * const isProfessional = profile?.active_role === 'professional';
 * const table = getJobsTable(isProfessional);
 * const { data } = await supabase.from(table).select('*');
 */
export const getJobsTable = (canViewPrivateJobs: boolean): JobsTableName => {
  return canViewPrivateJobs ? 'jobs' : 'public_jobs_preview';
};

/**
 * Safe columns available in public_jobs_preview.
 * Use this for type safety when building public queries.
 */
export const PUBLIC_PREVIEW_COLUMNS = [
  'id',
  'title',
  'teaser',
  'status',
  'budget_type',
  'budget_value',
  'area',
  'town',
  'has_photos',
  'micro_id',
  'created_at',
  'published_at',
] as const;

/**
 * Columns that are NEVER exposed in public preview.
 * This is a guard list for code reviews.
 */
export const PRIVATE_ONLY_COLUMNS = [
  'client_id',
  'answers',
  'location', // contains exact address
  'attachments',
  'extras', // may contain photos
  'description', // use teaser instead
] as const;
