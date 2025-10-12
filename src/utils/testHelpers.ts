import { QueryClient } from '@tanstack/react-query';

/**
 * Creates a fresh QueryClient for testing
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * Waits for a condition to be true
 */
export async function waitFor(
  callback: () => boolean | Promise<boolean>,
  options: { timeout?: number; interval?: number } = {}
): Promise<void> {
  const { timeout = 5000, interval = 50 } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const result = await callback();
    if (result) return;
    await sleep(interval);
  }

  throw new Error(`Timeout waiting for condition after ${timeout}ms`);
}

/**
 * Sleep utility for tests
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Mock Supabase client for testing
 */
export function createMockSupabaseClient() {
  const mockData: Record<string, any[]> = {};

  return {
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          single: async () => ({
            data: mockData[table]?.find(item => item[column] === value),
            error: null
          }),
          then: async () => ({
            data: mockData[table]?.filter(item => item[column] === value) || [],
            error: null
          })
        }),
        then: async () => ({
          data: mockData[table] || [],
          error: null
        })
      }),
      insert: (data: any) => ({
        select: () => ({
          single: async () => {
            const id = Math.random().toString();
            const newItem = { id, ...data };
            if (!mockData[table]) mockData[table] = [];
            mockData[table].push(newItem);
            return { data: newItem, error: null };
          }
        })
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          select: () => ({
            single: async () => {
              const item = mockData[table]?.find(item => item[column] === value);
              if (item) {
                Object.assign(item, data);
                return { data: item, error: null };
              }
              return { data: null, error: { message: 'Not found' } };
            }
          })
        })
      }),
      delete: () => ({
        eq: (column: string, value: any) => ({
          then: async () => {
            if (mockData[table]) {
              mockData[table] = mockData[table].filter(item => item[column] !== value);
            }
            return { error: null };
          }
        })
      })
    }),
    auth: {
      getUser: async () => ({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null
      }),
      signIn: async () => ({
        data: { user: { id: 'test-user-id' }, session: {} },
        error: null
      }),
      signOut: async () => ({ error: null })
    },
    // Helper to set mock data
    __setMockData: (table: string, data: any[]) => {
      mockData[table] = data;
    }
  };
}

/**
 * Mock localStorage for testing
 */
export function setupLocalStorageMock() {
  const store: Record<string, string> = {};

  const mockLocalStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach(key => delete store[key]);
    },
    key: (index: number) => Object.keys(store)[index] || null,
    get length() {
      return Object.keys(store).length;
    }
  };

  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true
  });

  return mockLocalStorage;
}

/**
 * Create mock intersection observer
 */
export function setupIntersectionObserverMock() {
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
    takeRecords() {
      return [];
    }
  } as any;
}
