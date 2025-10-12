import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SearchFilter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'contains';
  value: any;
}

export interface SearchOptions {
  table: string;
  select?: string;
  filters?: SearchFilter[];
  searchTerm?: string;
  searchFields?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export function useAdvancedSearch<T = any>() {
  const [results, setResults] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const search = useCallback(async (options: SearchOptions) => {
    setIsLoading(true);
    setError(null);

    try {
      let query = (supabase as any)
        .from(options.table)
        .select(options.select || '*', { count: 'exact' });

      // Apply filters
      if (options.filters && options.filters.length > 0) {
        options.filters.forEach(filter => {
          switch (filter.operator) {
            case 'eq':
              query = query.eq(filter.field, filter.value);
              break;
            case 'neq':
              query = query.neq(filter.field, filter.value);
              break;
            case 'gt':
              query = query.gt(filter.field, filter.value);
              break;
            case 'gte':
              query = query.gte(filter.field, filter.value);
              break;
            case 'lt':
              query = query.lt(filter.field, filter.value);
              break;
            case 'lte':
              query = query.lte(filter.field, filter.value);
              break;
            case 'like':
              query = query.like(filter.field, filter.value);
              break;
            case 'ilike':
              query = query.ilike(filter.field, filter.value);
              break;
            case 'in':
              query = query.in(filter.field, filter.value);
              break;
            case 'contains':
              query = query.contains(filter.field, filter.value);
              break;
          }
        });
      }

      // Apply search term across multiple fields
      if (options.searchTerm && options.searchFields && options.searchFields.length > 0) {
        const searchConditions = options.searchFields
          .map(field => `${field}.ilike.%${options.searchTerm}%`)
          .join(',');
        query = query.or(searchConditions);
      }

      // Apply sorting
      if (options.sortBy) {
        query = query.order(options.sortBy, { 
          ascending: options.sortOrder === 'asc' 
        });
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(
          options.offset, 
          options.offset + (options.limit || 10) - 1
        );
      }

      const { data, error: queryError, count } = await query;

      if (queryError) throw queryError;

      setResults(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      setError(err as Error);
      console.error('Advanced search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResults([]);
    setError(null);
    setTotalCount(0);
  }, []);

  return {
    results,
    isLoading,
    error,
    totalCount,
    search,
    reset
  };
}
