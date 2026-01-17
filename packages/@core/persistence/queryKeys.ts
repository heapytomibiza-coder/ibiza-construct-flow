/**
 * Query Key Factory
 * @core - Centralized cache key management
 * 
 * Consistent query keys for React Query across all modules
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
    list: (filters?: unknown) => ['jobs', 'list', filters] as const,
    detail: (id: string) => ['jobs', 'detail', id] as const,
    matches: (id: string) => ['jobs', 'matches', id] as const,
  },
  
  // Professionals
  professionals: {
    all: ['professionals'] as const,
    list: (filters?: unknown) => ['professionals', 'list', filters] as const,
    detail: (id: string) => ['professionals', 'detail', id] as const,
    services: (id: string) => ['professionals', 'services', id] as const,
    portfolio: (id: string) => ['professionals', 'portfolio', id] as const,
  },
  
  // Services
  services: {
    all: ['services'] as const,
    list: (filters?: unknown) => ['services', 'list', filters] as const,
    detail: (id: string) => ['services', 'detail', id] as const,
    categories: ['services', 'categories'] as const,
  },
  
  // Bookings
  bookings: {
    all: ['bookings'] as const,
    list: (filters?: unknown) => ['bookings', 'list', filters] as const,
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
    transactions: (filters?: unknown) => ['payments', 'transactions', filters] as const,
    methods: ['payments', 'methods'] as const,
  },
  
  // Admin
  admin: {
    dashboard: ['admin', 'dashboard'] as const,
    users: (filters?: unknown) => ['admin', 'users', filters] as const,
    analytics: (range?: string) => ['admin', 'analytics', range] as const,
  },
} as const;
