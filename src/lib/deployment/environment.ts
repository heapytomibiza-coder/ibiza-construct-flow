/**
 * Environment Configuration
 * Centralized environment variable management
 */

export const env = {
  // App
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
  
  // Supabase
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabasePublishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  supabaseProjectId: import.meta.env.VITE_SUPABASE_PROJECT_ID,
  
  // App URLs
  appUrl: import.meta.env.VITE_APP_URL || window.location.origin,
  apiUrl: import.meta.env.VITE_API_URL,
  
  // Features
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableErrorTracking: import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true',
} as const;

/**
 * Validate required environment variables
 */
export function validateEnvironment(): void {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_PUBLISHABLE_KEY',
  ];

  const missing = required.filter(key => !import.meta.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

/**
 * Get environment-specific configuration
 */
export function getConfig() {
  return {
    // API Rate limits
    rateLimit: env.isProduction ? {
      maxRequests: 100,
      windowMs: 60000,
    } : {
      maxRequests: 1000,
      windowMs: 60000,
    },
    
    // Cache durations
    cache: {
      staleTime: env.isProduction ? 5 * 60 * 1000 : 1000,
      gcTime: env.isProduction ? 10 * 60 * 1000 : 5000,
    },
    
    // Debug settings
    debug: {
      logErrors: !env.isProduction,
      logAnalytics: !env.isProduction,
      logPerformance: !env.isProduction,
    },
  };
}
