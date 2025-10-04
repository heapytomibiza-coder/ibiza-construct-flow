import React from 'react';
import { X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Checkbox } from '@/components/ui/checkbox';
import { useIsMobile } from '@/hooks/use-mobile';

interface FilterState {
  selectedTaxonomy: {
    category: string;
    subcategory: string;
    micro: string;
  } | null;
  specialists: string[];
  location: string;
  priceRange: [number, number];
  availability: string[];
}

interface MobileFilterDrawerProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  categories: string[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const specialistCategories = [
  'Architects & Design',
  'Builders & Structural Works', 
  'Floors, Doors & Windows',
  'Kitchen & Bathroom Fitter',
  'Design & Planning',
  'Commercial Projects'
];

const availabilityOptions = ['Today', 'This Week', 'Within 2 Weeks', 'Flexible'];

const priceRanges = [
  { label: '€0 - €100', min: 0, max: 100 },
  { label: '€100 - €500', min: 100, max: 500 },
  { label: '€500 - €2K', min: 500, max: 2000 },
  { label: '€2K - €10K', min: 2000, max: 10000 },
  { label: '€10K+', min: 10000, max: 100000 },
];

export const MobileFilterDrawer = ({
  filters,
  onFiltersChange,
  categories,
  isOpen,
  onOpenChange
}: MobileFilterDrawerProps) => {
  const isMobile = useIsMobile();

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newTaxonomy = checked
      ? { category, subcategory: '', micro: '' }
      : null;
    
    onFiltersChange({
      ...filters,
      selectedTaxonomy: newTaxonomy
    });
  };

  const handleSpecialistChange = (specialist: string, checked: boolean) => {
    const newSpecialists = checked
      ? [...filters.specialists, specialist]
      : filters.specialists.filter(s => s !== specialist);
    
    onFiltersChange({
      ...filters,
      specialists: newSpecialists
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
      selectedTaxonomy: null,
      specialists: [],
      location: '',
      priceRange: [0, 100000],
      availability: []
    });
  };

  const hasActiveFilters = filters.selectedTaxonomy !== null || 
                          filters.specialists.length > 0 ||
                          filters.availability.length > 0 || 
                          (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 100000);

  const activeFilterCount = (filters.selectedTaxonomy ? 1 : 0) + filters.specialists.length + filters.availability.length;

  // On desktop, render as regular content
  if (!isMobile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Filters</h3>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
            <FilterContent 
              filters={filters}
              categories={categories}
              onCategoryChange={handleCategoryChange}
              onSpecialistChange={handleSpecialistChange}
              onAvailabilityChange={handleAvailabilityChange}
              hasActiveFilters={hasActiveFilters}
              clearFilters={clearFilters}
              onFiltersChange={onFiltersChange}
            />
      </div>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="relative min-h-[44px]"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </DrawerTrigger>
      
      <DrawerContent className="h-[85vh]">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader className="pb-0">
            <DrawerTitle className="flex items-center justify-between">
              <span>Filters</span>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              )}
            </DrawerTitle>
          </DrawerHeader>
          
          <div className="p-4 overflow-y-auto flex-1">
        <FilterContent 
          filters={filters}
          categories={categories}
          onCategoryChange={handleCategoryChange}
          onSpecialistChange={handleSpecialistChange}
          onAvailabilityChange={handleAvailabilityChange}
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
          onFiltersChange={onFiltersChange}
        />
          </div>
          
          {/* Sticky Apply Button */}
          <div className="border-t bg-background p-4 pb-safe">
            <DrawerClose asChild>
              <Button className="w-full min-h-[44px]" size="lg">
                Apply Filters
                {activeFilterCount > 0 && ` (${activeFilterCount})`}
              </Button>
            </DrawerClose>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

const FilterContent = ({
  filters,
  categories,
  onCategoryChange,
  onSpecialistChange,
  onAvailabilityChange,
  hasActiveFilters,
  clearFilters,
  onFiltersChange
}: {
  filters: FilterState;
  categories: string[];
  onCategoryChange: (category: string, checked: boolean) => void;
  onSpecialistChange: (specialist: string, checked: boolean) => void;
  onAvailabilityChange: (option: string, checked: boolean) => void;
  hasActiveFilters: boolean;
  clearFilters: () => void;
  onFiltersChange: (filters: FilterState) => void;
}) => {
  return (
    <div className="space-y-6">
      {/* Service Categories */}
      <div>
        <h4 className="font-semibold mb-3">Service Type</h4>
        <div className="space-y-3">
          {categories.map(category => {
            const isSelected = filters.selectedTaxonomy?.category === category;
            return (
              <label 
                key={category} 
                className="flex items-center space-x-3 cursor-pointer py-2 min-h-[44px]"
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => 
                    onCategoryChange(category, checked as boolean)
                  }
                />
                <span className="text-sm font-medium">{category}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Specialist Categories Chips */}
      <div>
        <h4 className="font-semibold mb-3">Specialist Categories</h4>
        <div className="flex flex-wrap gap-2">
          {specialistCategories.map(specialist => (
            <button
              key={specialist}
              onClick={() => onSpecialistChange(specialist, !filters.specialists.includes(specialist))}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-colors min-h-[44px] ${
                filters.specialists.includes(specialist)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted-foreground/10'
              }`}
            >
              {specialist}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Chips */}
      <div>
        <h4 className="font-semibold mb-3">Price Range</h4>
        <div className="flex flex-wrap gap-2">
          {priceRanges.map(range => {
            const isActive = filters.priceRange[0] <= range.min && filters.priceRange[1] >= range.max;
            return (
              <button
                key={range.label}
                onClick={() => {
                  // Toggle price range selection
                  if (isActive) {
                    // Reset to full range if deselecting
                    onFiltersChange({
                      ...filters,
                      priceRange: [0, 100000]
                    });
                  } else {
                    onFiltersChange({
                      ...filters,
                      priceRange: [range.min, range.max]
                    });
                  }
                }}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-colors min-h-[44px] ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted-foreground/10'
                }`}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h4 className="font-semibold mb-3">Availability</h4>
        <div className="flex flex-wrap gap-2">
          {availabilityOptions.map(option => (
            <button
              key={option}
              onClick={() => onAvailabilityChange(option, !filters.availability.includes(option))}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-colors min-h-[44px] ${
                filters.availability.includes(option)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted-foreground/10'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div>
          <h4 className="font-semibold mb-3">Active Filters</h4>
          <div className="flex flex-wrap gap-2">
            {filters.selectedTaxonomy && (
              <Badge variant="secondary">
                {filters.selectedTaxonomy.category}
                {filters.selectedTaxonomy.subcategory && ` > ${filters.selectedTaxonomy.subcategory}`}
                {filters.selectedTaxonomy.micro && ` > ${filters.selectedTaxonomy.micro}`}
                <button
                  onClick={() => onCategoryChange('', false)}
                  className="ml-2 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.specialists.map(specialist => (
              <Badge key={specialist} variant="secondary">
                {specialist}
                <button
                  onClick={() => onSpecialistChange(specialist, false)}
                  className="ml-2 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            {filters.availability.map(option => (
              <Badge key={option} variant="secondary">
                {option}
                <button
                  onClick={() => onAvailabilityChange(option, false)}
                  className="ml-2 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};