import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface OptimizedQueryOptions<T> {
  table: string;
  selectQuery?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  gcTime?: number;
  staleTime?: number;
}

export function useOptimizedQuery<T = any>(
  queryKey: string,
  options: OptimizedQueryOptions<T>
) {
  const {
    table,
    selectQuery = '*',
    filters = {},
    orderBy,
    limit,
    gcTime = 5 * 60 * 1000, // 5 minutes default
    staleTime = 60 * 1000, // 1 minute default
  } = options;

  return useQuery<T>({
    queryKey: [queryKey, filters, orderBy, limit],
    queryFn: async () => {
      let query = (supabase as any).from(table).select(selectQuery);

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else if (typeof value === 'object' && 'gte' in value) {
            query = query.gte(key, value.gte);
          } else if (typeof value === 'object' && 'lte' in value) {
            query = query.lte(key, value.lte);
          } else {
            query = query.eq(key, value);
          }
        }
      });

      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });
      }

      // Apply limit
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as T;
    },
    gcTime,
    staleTime,
  });
}

export function usePaginatedOptimizedQuery<T = any>(
  queryKey: string,
  options: OptimizedQueryOptions<T> & {
    page: number;
    pageSize: number;
  }
) {
  const { page, pageSize, ...queryOptions } = options;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return useQuery<{ data: T; count: number }>({
    queryKey: [queryKey, page, pageSize, queryOptions.filters, queryOptions.orderBy],
    queryFn: async () => {
      let query = (supabase as any)
        .from(options.table)
        .select(options.selectQuery || '*', { count: 'exact' })
        .range(from, to);

      // Apply filters
      Object.entries(queryOptions.filters || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      // Apply ordering
      if (queryOptions.orderBy) {
        query = query.order(queryOptions.orderBy.column, {
          ascending: queryOptions.orderBy.ascending ?? false,
        });
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { data: data as T, count: count || 0 };
    },
    gcTime: queryOptions.gcTime || 5 * 60 * 1000,
    staleTime: queryOptions.staleTime || 60 * 1000,
    placeholderData: (prev) => prev,
  });
}
