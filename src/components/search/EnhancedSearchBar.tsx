import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface SearchFilters {
  category?: string;
  location?: string;
  minBudget?: number;
  maxBudget?: number;
  minRating?: number;
  verifiedOnly?: boolean;
}

interface EnhancedSearchBarProps {
  searchType: 'jobs' | 'professionals';
  onSearch: (query: string, filters: SearchFilters) => void;
  loading?: boolean;
}

export function EnhancedSearchBar({ searchType, onSearch, loading }: EnhancedSearchBarProps) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    onSearch(query, filters);
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== undefined && v !== null && v !== false).length;

  const clearFilters = () => {
    setFilters({});
    onSearch(query, {});
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${searchType}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Filters</h4>
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear all
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    placeholder="City or region"
                    value={filters.location || ''}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  />
                </div>

                {searchType === 'jobs' && (
                  <>
                    <div className="space-y-2">
                      <Label>Budget Range</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={filters.minBudget || ''}
                          onChange={(e) => setFilters({ ...filters, minBudget: Number(e.target.value) })}
                        />
                        <Input
                          type="number"
                          placeholder="Max"
                          value={filters.maxBudget || ''}
                          onChange={(e) => setFilters({ ...filters, maxBudget: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label>Minimum Rating</Label>
                  <Select
                    value={filters.minRating?.toString()}
                    onValueChange={(v) => setFilters({ ...filters, minRating: Number(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any rating</SelectItem>
                      <SelectItem value="3">3+ stars</SelectItem>
                      <SelectItem value="4">4+ stars</SelectItem>
                      <SelectItem value="4.5">4.5+ stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {searchType === 'professionals' && (
                  <div className="flex items-center justify-between">
                    <Label>Verified only</Label>
                    <Switch
                      checked={filters.verifiedOnly || false}
                      onCheckedChange={(checked) => setFilters({ ...filters, verifiedOnly: checked })}
                    />
                  </div>
                )}
              </div>

              <Button onClick={() => { handleSearch(); setShowFilters(false); }} className="w-full">
                Apply Filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Button onClick={handleSearch} disabled={loading}>
          Search
        </Button>
      </div>

      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.location && (
            <Badge variant="secondary" className="gap-1">
              Location: {filters.location}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setFilters({ ...filters, location: undefined })}
              />
            </Badge>
          )}
          {filters.minRating && (
            <Badge variant="secondary" className="gap-1">
              Rating: {filters.minRating}+
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setFilters({ ...filters, minRating: undefined })}
              />
            </Badge>
          )}
          {filters.verifiedOnly && (
            <Badge variant="secondary" className="gap-1">
              Verified only
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setFilters({ ...filters, verifiedOnly: false })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
