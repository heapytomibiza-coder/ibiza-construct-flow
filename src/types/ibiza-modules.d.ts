/**
 * Module declarations for @ibiza/* packages
 * 
 * These declarations allow TypeScript to recognize @ibiza/* imports
 * in the Lovable environment where node_modules linking isn't available.
 * 
 * When running locally with `npm install`, the actual package types
 * from node_modules/@ibiza/* will take precedence.
 */

// Core package - persistence subpath
declare module '@ibiza/core/persistence' {
  export { 
    registerSupabase, 
    getSupabase, 
    isSupabaseRegistered 
  } from '../../packages/@core/persistence/clientRegistry';
  export * from '../../packages/@core/persistence/queryKeys';
  export * from '../../packages/@core/persistence/mutationKeys';
  export * from '../../packages/@core/persistence/cacheTypes';
  export { StorageManager, storageManager } from '../../packages/@core/persistence/storageManager';
}

// Core package - services/api subpath
declare module '@ibiza/core/services/api' {
  export { httpClient, type HttpClientOptions } from '../../packages/@core/services/api/httpClient';
  export {
    getErrorMessage,
    normalizeError,
    handleApiError,
    isAuthError,
    isPermissionError,
    isNotFoundError,
    isValidationError,
    isNetworkError,
    type ErrorHandlerOptions,
  } from '../../packages/@core/services/api/errorHandler';
}

// Core package root
declare module '@ibiza/core' {
  export * from '../../packages/@core/index';
}

// Contracts package
declare module '@ibiza/contracts' {
  export * from '../../packages/@contracts/clients/index';
}

// Ref-impl packages
declare module '@ibiza/ref-impl-shared' {
  export * from '../../packages/@ref-impl/shared/index';
}

declare module '@ibiza/ref-impl-user' {
  export * from '../../packages/@ref-impl/user/index';
}

declare module '@ibiza/ref-impl-admin' {
  export * from '../../packages/@ref-impl/admin/index';
}

declare module '@ibiza/ref-impl-client' {
  export * from '../../packages/@ref-impl/client/index';
}

declare module '@ibiza/ref-impl-workers' {
  export * from '../../packages/@ref-impl/workers/index';
}
