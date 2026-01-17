/**
 * Common DTOs
 * @core - NON-LOB shared types
 * 
 * Standard API response types used across all modules
 */

/**
 * Standard API error structure
 */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * API response wrapper
 */
export interface APIResponse<T> {
  data: T | null;
  error: APIError | null;
}

/**
 * Lightweight API response (for edge functions)
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Standard result type for operations
 */
export type Result<T, E = APIError> = 
  | { success: true; data: T }
  | { success: false; error: E };
