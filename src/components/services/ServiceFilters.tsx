import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface FilterState {
  categories: string[];
  priceRange: [number, number];
  availability: string[];
}

interface ServiceFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  categories: string[];
  visible: boolean;
}

export const ServiceFilters = ({ filters, onFiltersChange, categories, visible }: ServiceFiltersProps) => {
  const availabilityOptions = ['Today', 'This Week', 'Within 2 Weeks', 'Flexible'];
  const priceRanges = [
    { label: '€0 - €100', min: 0, max: 100 },
    { label: '€100 - €500', min: 100, max: 500 },
    { label: '€500 - €2K', min: 500, max: 2000 },
    { label: '€2K - €10K', min: 2000, max: 10000 },
    { label: '€10K+', min: 10000, max: 100000 },
  ];

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, category]
      : filters.categories.filter(c => c !== category);
    
    onFiltersChange({
      ...filters,
      categories: newCategories
    });
  };

  const handleAvailabilityChange = (option: string, checked: boolean) => {
    const newAvailability = checked
      ? [...filters.availability, option]
      : filters.availability.filter(a => a !== option);
    
    onFiltersChange({
      ...filters,
      availability: newAvailability
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      categories: [],
      priceRange: [0, 100000],
      availability: []
    });
  };

  const hasActiveFilters = filters.categories.length > 0 || 
                          filters.availability.length > 0 || 
                          (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 100000);

  if (!visible) return null;

  return (
    <Card className="card-luxury">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-display text-lg">Filters</CardTitle>
        {hasActiveFilters && (
          <button 
            onClick={clearFilters}
            className="text-copper hover:text-copper-dark transition-colors flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Categories */}
        <div>
          <h4 className="font-semibold text-charcoal mb-3">Service Type</h4>
          <div className="space-y-2">
            {categories.map(category => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={filters.categories.includes(category)}
                  onCheckedChange={(checked) => 
                    handleCategoryChange(category, checked as boolean)
                  }
                />
                <label 
                  htmlFor={`category-${category}`}
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h4 className="font-semibold text-charcoal mb-3">Price Range</h4>
          <div className="space-y-2">
            {priceRanges.map(range => (
              <div key={range.label} className="flex items-center space-x-2">
                <Checkbox
                  id={`price-${range.label}`}
                  checked={filters.priceRange[0] <= range.min && filters.priceRange[1] >= range.max}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onFiltersChange({
                        ...filters,
                        priceRange: [range.min, range.max]
                      });
                    }
                  }}
                />
                <label 
                  htmlFor={`price-${range.label}`}
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  {range.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div>
          <h4 className="font-semibold text-charcoal mb-3">Availability</h4>
          <div className="space-y-2">
            {availabilityOptions.map(option => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`availability-${option}`}
                  checked={filters.availability.includes(option)}
                  onCheckedChange={(checked) => 
                    handleAvailabilityChange(option, checked as boolean)
                  }
                />
                <label 
                  htmlFor={`availability-${option}`}
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div>
            <h4 className="font-semibold text-charcoal mb-3">Active Filters</h4>
            <div className="flex flex-wrap gap-2">
              {filters.categories.map(category => (
                <Badge key={category} variant="secondary" className="bg-copper/10 text-copper">
                  {category}
                  <button
                    onClick={() => handleCategoryChange(category, false)}
                    className="ml-1 hover:text-copper-dark"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {filters.availability.map(option => (
                <Badge key={option} variant="secondary" className="bg-copper/10 text-copper">
                  {option}
                  <button
                    onClick={() => handleAvailabilityChange(option, false)}
                    className="ml-1 hover:text-copper-dark"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};