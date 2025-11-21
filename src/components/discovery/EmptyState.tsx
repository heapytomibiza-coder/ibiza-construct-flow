import React from 'react';
import { Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  type: 'no-search' | 'no-results';
  searchTerm?: string;
  onClearSearch?: () => void;
  viewMode?: 'services' | 'professionals';
}

export const EmptyState = ({ type, searchTerm, onClearSearch, viewMode = 'services' }: EmptyStateProps) => {
  if (type === 'no-search') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-card rounded-lg border">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-pulse">
          <Search className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">
          {viewMode === 'services' ? 'Browse Services' : 'Browse Professionals'}
        </h3>
        <p className="text-muted-foreground max-w-sm">
          {viewMode === 'services' 
            ? 'Use the search bar above or select a category to discover services, or scroll to see all available options'
            : 'Use the search bar above to find professionals by trade, name, or specialty'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-card rounded-lg border">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
        <Sparkles className="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-foreground">No Results Found</h3>
      <p className="text-muted-foreground max-w-sm mb-4">
        We couldn't find any {viewMode === 'services' ? 'services' : 'professionals'} matching "{searchTerm}"
      </p>
      <Button variant="outline" onClick={onClearSearch}>
        Clear Filters & Search
      </Button>
    </div>
  );
};
