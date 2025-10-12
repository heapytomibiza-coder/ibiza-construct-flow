import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

export function usePaginatedData<T>(
  queryKey: string[],
  fetchFn: (page: number, pageSize: number) => Promise<{ data: T[]; total: number }>,
  pageSize: number = 20
) {
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: [...queryKey, page, pageSize],
    queryFn: () => fetchFn(page, pageSize),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    data: data?.data || [],
    total: data?.total || 0,
    page,
    pageSize,
    setPage,
    isLoading,
    error,
    totalPages: Math.ceil((data?.total || 0) / pageSize),
  };
}

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useInfiniteScroll(
  callback: () => void,
  hasMore: boolean,
  threshold: number = 100
) {
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      if (scrollHeight - scrollTop - clientHeight < threshold && hasMore) {
        callback();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [callback, hasMore, threshold]);
}