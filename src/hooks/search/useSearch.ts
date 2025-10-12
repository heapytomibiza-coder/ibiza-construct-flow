/**
 * Search Hook
 * Phase 17: Advanced Search & Filtering System
 * 
 * React hook for search functionality
 */

import { useState, useMemo, useCallback } from 'react';
import { SearchEngine, SearchOptions, SearchResult, SearchFilter, SortOption } from '@/lib/search';

interface UseSearchOptions<T> {
  items: T[];
  initialQuery?: string;
  initialFilters?: SearchFilter[];
  initialSort?: SortOption;
  limit?: number;
}

export function useSearch<T extends Record<string, any>>(options: UseSearchOptions<T>) {
  const { items, initialQuery = '', initialFilters = [], initialSort, limit = 10 } = options;

  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilter[]>(initialFilters);
  const [sort, setSort] = useState<SortOption | undefined>(initialSort);
  const [page, setPage] = useState(1);

  const searchEngine = useMemo(() => new SearchEngine(items), [items]);

  const results: SearchResult<T> = useMemo(() => {
    const searchOptions: SearchOptions = {
      query,
      filters,
      sort,
      page,
      limit,
    };

    return searchEngine.search(searchOptions);
  }, [searchEngine, query, filters, sort, page, limit]);

  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
    setPage(1); // Reset to first page
  }, []);

  const addFilter = useCallback((filter: SearchFilter) => {
    setFilters(prev => [...prev, filter]);
    setPage(1);
  }, []);

  const removeFilter = useCallback((field: string) => {
    setFilters(prev => prev.filter(f => f.field !== field));
    setPage(1);
  }, []);

  const updateFilter = useCallback((field: string, value: any) => {
    setFilters(prev =>
      prev.map(f => (f.field === field ? { ...f, value } : f))
    );
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters([]);
    setPage(1);
  }, []);

  const updateSort = useCallback((newSort: SortOption | undefined) => {
    setSort(newSort);
    setPage(1);
  }, []);

  const nextPage = useCallback(() => {
    if (results.hasMore) {
      setPage(prev => prev + 1);
    }
  }, [results.hasMore]);

  const previousPage = useCallback(() => {
    setPage(prev => Math.max(1, prev - 1));
  }, []);

  const reset = useCallback(() => {
    setQuery('');
    setFilters([]);
    setSort(undefined);
    setPage(1);
  }, []);

  return {
    query,
    filters,
    sort,
    page,
    results,
    updateQuery,
    addFilter,
    removeFilter,
    updateFilter,
    clearFilters,
    updateSort,
    nextPage,
    previousPage,
    reset,
  };
}
