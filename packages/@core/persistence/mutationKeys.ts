/**
 * Mutation Key Factory
 * @core - Centralized mutation key management
 * 
 * Consistent mutation keys for React Query across all modules
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
