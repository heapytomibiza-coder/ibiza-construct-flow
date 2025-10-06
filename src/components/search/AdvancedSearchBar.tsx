import { useState, useRef, useEffect } from 'react';
import { Search, X, Filter, Bookmark, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSearchSuggestions } from '@/hooks/useSearchSuggestions';
import { cn } from '@/lib/utils';

interface AdvancedSearchBarProps {
  searchType: 'professional' | 'job' | 'service';
  onSearch: (term: string) => void;
  onFilterClick?: () => void;
  onSaveSearch?: () => void;
  placeholder?: string;
  showFilters?: boolean;
}

export const AdvancedSearchBar = ({
  searchType,
  onSearch,
  onFilterClick,
  onSaveSearch,
  placeholder = 'Search...',
  showFilters = true
}: AdvancedSearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { getFilteredSuggestions, popularSearches } = useSearchSuggestions(searchType);

  const suggestions = getFilteredSuggestions(searchTerm);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-10 h-12"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSearchTerm('');
                inputRef.current?.focus();
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Button onClick={handleSearch} size="lg" className="px-6">
          Search
        </Button>

        {showFilters && (
          <Button
            variant="outline"
            size="lg"
            onClick={onFilterClick}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        )}

        {onSaveSearch && (
          <Button
            variant="outline"
            size="lg"
            onClick={onSaveSearch}
            className="gap-2"
          >
            <Bookmark className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (suggestions.length > 0 || popularSearches.length > 0) && (
        <Card className="absolute top-full mt-2 w-full z-50 shadow-lg">
          <ScrollArea className="max-h-96">
            {suggestions.length > 0 && (
              <div className="p-3">
                <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                  Suggestions
                </div>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion.suggestion_text)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg hover:bg-accent transition-colors",
                      "flex items-center gap-2"
                    )}
                  >
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <span>{suggestion.suggestion_text}</span>
                    {suggestion.category && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {suggestion.category}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            )}

            {popularSearches.length > 0 && (
              <div className="p-3 border-t">
                <div className="text-xs font-medium text-muted-foreground mb-2 px-2 flex items-center gap-2">
                  <TrendingUp className="h-3 w-3" />
                  Trending Searches
                </div>
                {popularSearches.slice(0, 5).map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search.search_term)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg hover:bg-accent transition-colors",
                      "flex items-center gap-2"
                    )}
                  >
                    <span className="text-xs font-medium text-muted-foreground w-6">
                      #{index + 1}
                    </span>
                    <span>{search.search_term}</span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {search.popularity_score}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>
      )}
    </div>
  );
};
