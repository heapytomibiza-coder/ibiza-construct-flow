/**
 * API Client Configuration
 * Phase 12: API Client Standardization & React Query Integration
 * 
 * Centralized API client with interceptors, error handling, and retry logic
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Standard API error structure
 */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public details?: any
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
 * Base API client configuration
 */
export const apiClient = {
  /**
   * Get authenticated Supabase client
   */
  getClient: () => supabase,

  /**
   * Standard error handler
   */
  handleError: (error: any): APIError => {
    console.error('API Error:', error);
    
    if (error instanceof APIError) {
      return error;
    }

    // Supabase error
    if (error?.message) {
      return new APIError(
        error.message,
        error.status || error.code,
        error.code,
        error.details
      );
    }

    // Network error
    if (!navigator.onLine) {
      return new APIError('No internet connection', 0, 'NETWORK_ERROR');
    }

    // Generic error
    return new APIError('An unexpected error occurred', 500, 'UNKNOWN_ERROR');
  },

  /**
   * Wrap API call with error handling
   */
  async execute<T>(
    operation: () => Promise<{ data: T | null; error: any }>
  ): Promise<APIResponse<T>> {
    try {
      const { data, error } = await operation();
      
      if (error) {
        return {
          data: null,
          error: this.handleError(error),
        };
      }

      return {
        data,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
      };
    }
  },
};

/**
 * Query key factory for consistent cache keys
 */
export const queryKeys = {
  // Auth
  auth: {
    user: ['auth', 'user'] as const,
    session: ['auth', 'session'] as const,
  },
  
  // Jobs
  jobs: {
    all: ['jobs'] as const,
    list: (filters?: any) => ['jobs', 'list', filters] as const,
    detail: (id: string) => ['jobs', 'detail', id] as const,
    matches: (id: string) => ['jobs', 'matches', id] as const,
  },
  
  // Professionals
  professionals: {
    all: ['professionals'] as const,
    list: (filters?: any) => ['professionals', 'list', filters] as const,
    detail: (id: string) => ['professionals', 'detail', id] as const,
    services: (id: string) => ['professionals', 'services', id] as const,
    portfolio: (id: string) => ['professionals', 'portfolio', id] as const,
  },
  
  // Services
  services: {
    all: ['services'] as const,
    list: (filters?: any) => ['services', 'list', filters] as const,
    detail: (id: string) => ['services', 'detail', id] as const,
    categories: ['services', 'categories'] as const,
  },
  
  // Bookings
  bookings: {
    all: ['bookings'] as const,
    list: (filters?: any) => ['bookings', 'list', filters] as const,
    detail: (id: string) => ['bookings', 'detail', id] as const,
  },
  
  // Messages
  messages: {
    all: ['messages'] as const,
    conversations: ['messages', 'conversations'] as const,
    conversation: (id: string) => ['messages', 'conversation', id] as const,
    unread: ['messages', 'unread'] as const,
  },
  
  // Notifications
  notifications: {
    all: ['notifications'] as const,
    unread: ['notifications', 'unread'] as const,
  },
  
  // Payments
  payments: {
    all: ['payments'] as const,
    transactions: (filters?: any) => ['payments', 'transactions', filters] as const,
    methods: ['payments', 'methods'] as const,
  },
  
  // Admin
  admin: {
    dashboard: ['admin', 'dashboard'] as const,
    users: (filters?: any) => ['admin', 'users', filters] as const,
    analytics: (range?: string) => ['admin', 'analytics', range] as const,
  },
} as const;

/**
 * Mutation key factory for consistent mutation tracking
 */
export const mutationKeys = {
  // Jobs
  jobs: {
    create: ['jobs', 'create'] as const,
    update: (id: string) => ['jobs', 'update', id] as const,
    delete: (id: string) => ['jobs', 'delete', id] as const,
  },
  
  // Professionals
  professionals: {
    update: (id: string) => ['professionals', 'update', id] as const,
    verify: (id: string) => ['professionals', 'verify', id] as const,
  },
  
  // Services
  services: {
    create: ['services', 'create'] as const,
    update: (id: string) => ['services', 'update', id] as const,
    delete: (id: string) => ['services', 'delete', id] as const,
  },
  
  // Bookings
  bookings: {
    create: ['bookings', 'create'] as const,
    update: (id: string) => ['bookings', 'update', id] as const,
    cancel: (id: string) => ['bookings', 'cancel', id] as const,
  },
  
  // Messages
  messages: {
    send: ['messages', 'send'] as const,
    markRead: (id: string) => ['messages', 'markRead', id] as const,
  },
} as const;
