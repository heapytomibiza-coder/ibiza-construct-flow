/**
 * Hybrid module shims for @ibiza/* packages
 * 
 * Preserves typings for actively used imports while keeping the rest minimal.
 * Avoids re-exporting from ../../packages/* (which can pull source into the 
 * TS program and cause unexpected CI failures).
 * 
 * When running locally with `npm install`, real packages in node_modules 
 * will provide proper typings and take precedence.
 */

/** -------------------------
 * @ibiza/core/services/api
 * Matches: packages/@core/services/api/httpClient.ts
 * -------------------------- */

declare module "@ibiza/core/services/api" {
  export interface HttpClientOptions {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    params?: Record<string, unknown>;
    data?: unknown;
    headers?: Record<string, string>;
    signal?: AbortSignal;
    /** Skip auth header injection (for public endpoints) */
    skipAuth?: boolean;
  }

  /**
   * HTTP client compatible with React Query and contract-generated hooks
   * Handles auth token injection via registered Supabase client
   */
  export function httpClient<T>(config: HttpClientOptions): Promise<T>;

  /** -------------------------
   * Error Handling
   * Matches: packages/@core/services/api/errorHandler.ts
   * -------------------------- */

  /** Standard API error structure */
  export class APIError extends Error {
    constructor(
      message: string,
      statusCode?: number,
      code?: string,
      details?: unknown
    );
    statusCode?: number;
    code?: string;
    details?: unknown;
  }

  /** Error handler options */
  export interface ErrorHandlerOptions {
    showToast?: boolean;
    logError?: boolean;
    rethrow?: boolean;
  }

  /** Get user-friendly error message from APIError */
  export function getErrorMessage(error: APIError): string;

  /** Normalize any error to APIError */
  export function normalizeError(error: unknown): APIError;

  /** Handle API error with logging */
  export function handleApiError(error: APIError, options?: ErrorHandlerOptions): string;

  /** Error type classification utilities */
  export function isAuthError(error: APIError): boolean;
  export function isPermissionError(error: APIError): boolean;
  export function isNotFoundError(error: APIError): boolean;
  export function isValidationError(error: APIError): boolean;
  export function isNetworkError(error: APIError): boolean;
}

/** -------------------------
 * @ibiza/core/persistence
 * Matches: packages/@core/persistence/clientRegistry.ts
 * -------------------------- */

declare module "@ibiza/core/persistence" {
  /**
   * Register the Supabase client instance
   * Call this in app bootstrap before using any services
   */
  export function registerSupabase(client: unknown): void;

  /**
   * Get the registered Supabase client
   * Throws if not registered
   */
  export function getSupabase<T = unknown>(): T;

  /**
   * Check if Supabase client is registered
   */
  export function isSupabaseRegistered(): boolean;
}

/** -------------------------
 * Minimal existence shims for packages not directly used in src/
 * When properly installed, real types from node_modules take over
 * -------------------------- */

declare module "@ibiza/core";
declare module "@ibiza/core/*";

declare module "@ibiza/contracts";
declare module "@ibiza/contracts/*";

declare module "@ibiza/ref-impl-shared";
declare module "@ibiza/ref-impl-user";
declare module "@ibiza/ref-impl-admin";
declare module "@ibiza/ref-impl-client";
declare module "@ibiza/ref-impl-workers";
