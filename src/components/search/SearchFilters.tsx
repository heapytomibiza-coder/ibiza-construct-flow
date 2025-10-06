import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SearchFilters as SearchFiltersType } from '@/hooks/useSearch';
import { X } from 'lucide-react';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  searchType: 'professional' | 'job' | 'service';
}

export const SearchFilters = ({
  filters,
  onFiltersChange,
  searchType
}: SearchFiltersProps) => {
  const updateFilter = (key: keyof SearchFiltersType, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const activeFiltersCount = Object.keys(filters).filter(
    key => filters[key as keyof SearchFiltersType] !== undefined
  ).length;

  return (
    <div className="space-y-6 p-6 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear all ({activeFiltersCount})
          </Button>
        )}
      </div>

      {searchType === 'professional' && (
        <>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              placeholder="Enter location"
              value={filters.location || ''}
              onChange={(e) => updateFilter('location', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Minimum Rating</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[filters.minRating || 0]}
                onValueChange={([value]) => updateFilter('minRating', value)}
                max={5}
                step={0.5}
                className="flex-1"
              />
              <span className="text-sm font-medium w-12">
                {filters.minRating || 0}★
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Availability</Label>
            <Select
              value={filters.availability || 'all'}
              onValueChange={(value) => updateFilter('availability', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="verified">Verified Only</Label>
            <Switch
              id="verified"
              checked={filters.verified || false}
              onCheckedChange={(checked) => updateFilter('verified', checked)}
            />
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label>Price Range</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) => updateFilter('minPrice', parseFloat(e.target.value) || undefined)}
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) => updateFilter('maxPrice', parseFloat(e.target.value) || undefined)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Sort By</Label>
        <Select
          value={filters.sortBy || 'relevance'}
          onValueChange={(value) => updateFilter('sortBy', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevance</SelectItem>
            <SelectItem value="rating">Highest Rating</SelectItem>
            <SelectItem value="price_low">Price: Low to High</SelectItem>
            <SelectItem value="price_high">Price: High to Low</SelectItem>
            <SelectItem value="recent">Most Recent</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
