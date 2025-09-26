import React, { memo, useMemo, useState, useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

interface VirtualizedGridProps {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  itemHeight?: number;
  className?: string;
}

// Optimized grid with pagination for large result sets
export const VirtualizedGrid = memo(({ 
  items, 
  renderItem, 
  itemHeight = 300,
  className = ""
}: VirtualizedGridProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 12;
  
  const paginatedItems = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  if (items.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No results found</div>;
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {paginatedItems.map((item, index) => (
          <div key={item.id || index}>
            {renderItem(item, currentPage * itemsPerPage + index)}
          </div>
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="px-4 py-2 rounded-md bg-muted disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
            className="px-4 py-2 rounded-md bg-muted disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
});

VirtualizedGrid.displayName = 'VirtualizedGrid';

// Optimized search with debouncing and memoization
interface OptimizedSearchProps {
  items: any[];
  searchFields: string[];
  children: (filteredItems: any[], searchTerm: string) => React.ReactNode;
  debounceMs?: number;
}

export const OptimizedSearch = memo(({ 
  items, 
  searchFields, 
  children, 
  debounceMs = 300 
}: OptimizedSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);

  const filteredItems = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return items;
    
    const lowerSearchTerm = debouncedSearchTerm.toLowerCase();
    
    return items.filter(item => 
      searchFields.some(field => {
        const value = field.split('.').reduce((obj, key) => obj?.[key], item);
        if (Array.isArray(value)) {
          return value.some(v => String(v).toLowerCase().includes(lowerSearchTerm));
        }
        return String(value || '').toLowerCase().includes(lowerSearchTerm);
      })
    );
  }, [items, debouncedSearchTerm, searchFields]);

  return (
    <>
      {children(filteredItems, searchTerm)}
    </>
  );
});

OptimizedSearch.displayName = 'OptimizedSearch';

// Lazy loading image component
interface LazyImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
}

export const LazyImage = memo(({ src, alt, className, fallback }: LazyImageProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  if (imageError || !src) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        {fallback || <span className="text-muted-foreground text-sm">No Image</span>}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {!imageLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded" />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

// Intersection observer hook for infinite scroll
export const useIntersectionObserver = (
  callback: () => void,
  options: IntersectionObserverInit = {}
) => {
  const [elementRef, setElementRef] = useState<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!elementRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          callback();
        }
      },
      {
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(elementRef);

    return () => observer.disconnect();
  }, [elementRef, callback, options]);

  return setElementRef;
};

// Infinite scroll component
interface InfiniteScrollProps {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  loadMore: () => void;
  hasMore: boolean;
  loading?: boolean;
  className?: string;
}

export const InfiniteScroll = memo(({ 
  items, 
  renderItem, 
  loadMore, 
  hasMore, 
  loading,
  className = "" 
}: InfiniteScrollProps) => {
  const loadMoreRef = useIntersectionObserver(
    useCallback(() => {
      if (hasMore && !loading) {
        loadMore();
      }
    }, [hasMore, loading, loadMore])
  );

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <div key={item.id || index}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
      
      {hasMore && (
        <div 
          ref={loadMoreRef}
          className="flex justify-center py-8"
        >
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Loading more...
            </div>
          )}
        </div>
      )}
    </div>
  );
});

InfiniteScroll.displayName = 'InfiniteScroll';