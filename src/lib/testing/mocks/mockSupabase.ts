/**
 * Mock Supabase Client
 * Phase 23: Testing & Quality Assurance System
 * 
 * Mock implementation of Supabase client for testing
 */

import { MockAPIResponse } from '../types';

export function createMockSupabaseClient() {
  const mockData: Record<string, any[]> = {};
  
  const from = (table: string) => {
    if (!mockData[table]) {
      mockData[table] = [];
    }

    return {
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          single: async () => ({
            data: mockData[table].find((row) => row[column] === value) || null,
            error: null,
          }),
          then: async (resolve: any) => {
            const filtered = mockData[table].filter((row) => row[column] === value);
            return resolve({ data: filtered, error: null });
          },
        }),
        in: (column: string, values: any[]) => ({
          then: async (resolve: any) => {
            const filtered = mockData[table].filter((row) => 
              values.includes(row[column])
            );
            return resolve({ data: filtered, error: null });
          },
        }),
        order: (column: string, options?: any) => ({
          then: async (resolve: any) => {
            const sorted = [...mockData[table]].sort((a, b) => {
              if (options?.ascending === false) {
                return b[column] - a[column];
              }
              return a[column] - b[column];
            });
            return resolve({ data: sorted, error: null });
          },
        }),
        limit: (count: number) => ({
          then: async (resolve: any) => {
            return resolve({ 
              data: mockData[table].slice(0, count), 
              error: null 
            });
          },
        }),
        then: async (resolve: any) => {
          return resolve({ data: mockData[table], error: null });
        },
      }),
      insert: (data: any) => ({
        select: () => ({
          single: async () => {
            const newRow = Array.isArray(data) ? data[0] : data;
            mockData[table].push(newRow);
            return { data: newRow, error: null };
          },
          then: async (resolve: any) => {
            const newRows = Array.isArray(data) ? data : [data];
            mockData[table].push(...newRows);
            return resolve({ data: newRows, error: null });
          },
        }),
        then: async (resolve: any) => {
          const newRows = Array.isArray(data) ? data : [data];
          mockData[table].push(...newRows);
          return resolve({ data: newRows, error: null });
        },
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          then: async (resolve: any) => {
            const index = mockData[table].findIndex((row) => row[column] === value);
            if (index !== -1) {
              mockData[table][index] = { ...mockData[table][index], ...data };
              return resolve({ data: mockData[table][index], error: null });
            }
            return resolve({ data: null, error: { message: 'Not found' } });
          },
        }),
      }),
      delete: () => ({
        eq: (column: string, value: any) => ({
          then: async (resolve: any) => {
            const index = mockData[table].findIndex((row) => row[column] === value);
            if (index !== -1) {
              const deleted = mockData[table].splice(index, 1);
              return resolve({ data: deleted[0], error: null });
            }
            return resolve({ data: null, error: { message: 'Not found' } });
          },
        }),
      }),
    };
  };

  const auth = {
    getSession: async () => ({
      data: { session: null },
      error: null,
    }),
    getUser: async () => ({
      data: { user: null },
      error: null,
    }),
    signInWithPassword: async (credentials: any) => ({
      data: { user: { id: '1', email: credentials.email }, session: {} },
      error: null,
    }),
    signUp: async (credentials: any) => ({
      data: { user: { id: '1', email: credentials.email }, session: {} },
      error: null,
    }),
    signOut: async () => ({
      error: null,
    }),
    onAuthStateChange: (callback: any) => {
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
  };

  const storage = {
    from: (bucket: string) => ({
      upload: async (path: string, file: File) => ({
        data: { path },
        error: null,
      }),
      download: async (path: string) => ({
        data: new Blob(),
        error: null,
      }),
      remove: async (paths: string[]) => ({
        data: paths,
        error: null,
      }),
      getPublicUrl: (path: string) => ({
        data: { publicUrl: `https://example.com/${bucket}/${path}` },
      }),
    }),
  };

  return {
    from,
    auth,
    storage,
    mockData,
    _reset: () => {
      Object.keys(mockData).forEach(key => {
        mockData[key] = [];
      });
    },
    _seed: (table: string, data: any[]) => {
      mockData[table] = data;
    },
  };
}

export type MockSupabaseClient = ReturnType<typeof createMockSupabaseClient>;
