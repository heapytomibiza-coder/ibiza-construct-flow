/**
 * Search Results Component
 * Phase 17: Advanced Search & Filtering System
 * 
 * Display search results with pagination
 */

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SearchResultsProps<T> {
  results: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyMessage?: string;
}

export function SearchResults<T>({
  results,
  total,
  page,
  limit,
  hasMore,
  onNextPage,
  onPreviousPage,
  renderItem,
  emptyMessage = 'No results found',
}: SearchResultsProps<T>) {
  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {startIndex}-{endIndex} of {total} results
        </span>
      </div>

      <div className="space-y-2">
        {results.map((item, index) => renderItem(item, index))}
      </div>

      {total > limit && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onPreviousPage}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {Math.ceil(total / limit)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onNextPage}
            disabled={!hasMore}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
