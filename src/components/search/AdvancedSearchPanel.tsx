/**
 * Advanced Search Panel Component
 * Phase 13: Enhanced Search & Filtering System
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp, Clock } from 'lucide-react';
import { useAdvancedSearch } from '@/hooks/search';
import { useState } from 'react';

export function AdvancedSearchPanel() {
  const [query, setQuery] = useState('');
  const { trendingSearches, suggestions, incrementSuggestion, recordSearch } = useAdvancedSearch();

  const handleSearch = () => {
    if (!query.trim()) return;
    
    recordSearch.mutate({
      searchType: 'all',
      query: query.trim(),
      filters: {},
      resultsCount: 0,
    });

    incrementSuggestion.mutate(query.trim());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Advanced Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Input
            placeholder="Search professionals, services, jobs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch}>
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {trendingSearches && trendingSearches.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span>Trending Searches</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingSearches.slice(0, 8).map((search: any) => (
                <Badge
                  key={search.search_query}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary/20"
                  onClick={() => {
                    setQuery(search.search_query);
                    handleSearch();
                  }}
                >
                  {search.search_query}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {suggestions && suggestions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Popular Searches</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.slice(0, 10).map((suggestion) => (
                <Badge
                  key={suggestion.id}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => {
                    setQuery(suggestion.suggestion_text);
                  }}
                >
                  {suggestion.suggestion_text}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
