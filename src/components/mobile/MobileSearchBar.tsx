import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TouchFriendlySheet } from './TouchFriendlySheet';

interface MobileSearchBarProps {
  onSearch: (query: string) => void;
  onFilterChange?: (filters: Record<string, any>) => void;
  placeholder?: string;
}

export const MobileSearchBar = ({
  onSearch,
  onFilterChange,
  placeholder = 'Search...'
}: MobileSearchBarProps) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  const removeFilter = (filter: string) => {
    setActiveFilters(prev => prev.filter(f => f !== filter));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={placeholder}
            className="pl-10 pr-10 h-12 text-base"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 shrink-0"
          onClick={() => setShowFilters(true)}
        >
          <Filter className="h-5 w-5" />
        </Button>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <Badge
              key={filter}
              variant="secondary"
              className="gap-1"
              onClick={() => removeFilter(filter)}
            >
              {filter}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}

      <TouchFriendlySheet
        open={showFilters}
        onOpenChange={setShowFilters}
        title="Filters"
        description="Refine your search results"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Filter options will be implemented based on your specific needs
          </p>
        </div>
      </TouchFriendlySheet>
    </div>
  );
};
