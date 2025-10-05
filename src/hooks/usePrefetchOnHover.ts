import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

/**
 * Hook for prefetching data on hover interactions
 * Improves perceived performance by loading data before user clicks
 */
export const usePrefetchOnHover = () => {
  const queryClient = useQueryClient();

  const prefetchOnHover = useCallback((
    prefetchFn: (queryClient: any, ...args: any[]) => void,
    ...args: any[]
  ) => {
    return {
      onMouseEnter: () => {
        prefetchFn(queryClient, ...args);
      },
      onFocus: () => {
        // Also prefetch on keyboard focus
        prefetchFn(queryClient, ...args);
      },
    };
  }, [queryClient]);

  return { prefetchOnHover };
};

// Example usage:
// const { prefetchOnHover } = usePrefetchOnHover();
// 
// <Link 
//   to="/job/123" 
//   {...prefetchOnHover(prefetchJobDetails, '123')}
// >
//   View Job
// </Link>
