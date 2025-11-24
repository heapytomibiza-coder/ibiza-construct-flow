import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Filter, X, ChevronRight, Star, ShieldCheck, ChevronDown } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useCategories, useSubcategories } from '@/hooks/useCategories';
import { getCategoryIcon } from '@/lib/categoryIcons';

interface FilterProps {
  filters: {
    selectedTaxonomy: {
      category: string;
      subcategory: string;
      micro: string;
    } | null;
    specialists: string[];
    priceRange: [number, number];
    availability: string[];
    location: string;
    verified?: boolean;
    minRating?: number;
  };
  onFiltersChange: (filters: any) => void;
  categories: string[];
  visible: boolean;
}

// Component to fetch and display subcategories for a specific category
const CategoryWithSubcategories: React.FC<{
  categoryId: string;
  categoryName: string;
  categoryIcon: string | null;
  isExpanded: boolean;
  onToggle: () => void;
  selectedSubcategory: string | null;
  onSubcategoryChange: (subcategorySlug: string) => void;
}> = ({ categoryId, categoryName, categoryIcon, isExpanded, onToggle, selectedSubcategory, onSubcategoryChange }) => {
  const { data: subcategories = [], isLoading } = useSubcategories(categoryId);
  const Icon = categoryIcon ? getCategoryIcon(categoryIcon) : null;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left group">
        <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
        <span className="text-sm font-medium text-foreground">{categoryName}</span>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="ml-8 space-y-2 py-2 border-l-2 border-border pl-4">
        {isLoading ? (
          <div className="text-xs text-muted-foreground py-2">Loading...</div>
        ) : subcategories.length > 0 ? (
          subcategories.map((subcategory) => (
            <div key={subcategory.id} className="flex items-center gap-2">
              <Checkbox
                id={`sub-${subcategory.id}`}
                checked={selectedSubcategory === subcategory.slug}
                onCheckedChange={() => onSubcategoryChange(subcategory.slug)}
              />
              <label
                htmlFor={`sub-${subcategory.id}`}
                className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors leading-none"
              >
                {subcategory.name}
              </label>
            </div>
          ))
        ) : (
          <div className="text-xs text-muted-foreground py-2">No subcategories available</div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

const EnhancedServiceFilters: React.FC<FilterProps> = ({
  filters,
  onFiltersChange,
  categories,
  visible
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [localFilters, setLocalFilters] = useState(filters);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const { data: allCategories = [], isLoading: categoriesLoading } = useCategories();

  // Load filters from URL on mount
  useEffect(() => {
    const urlFilters = {
      selectedTaxonomy: searchParams.get('cat') || searchParams.get('sub') || searchParams.get('micro') 
        ? {
            category: searchParams.get('cat') || '',
            subcategory: searchParams.get('sub') || '',
            micro: searchParams.get('micro') || ''
          }
        : null,
      specialists: searchParams.get('spec')?.split(',').filter(Boolean) || [],
      priceRange: [
        parseInt(searchParams.get('minPrice') || '0'),
        parseInt(searchParams.get('maxPrice') || '100000')
      ] as [number, number],
      availability: searchParams.get('avail')?.split(',').filter(Boolean) || [],
      location: searchParams.get('loc') || '',
      verified: searchParams.get('verified') === 'true',
      minRating: searchParams.get('minRating') ? parseInt(searchParams.get('minRating')!) : undefined
    };
    
    setLocalFilters(urlFilters);
    onFiltersChange(urlFilters);
  }, []);

  // Update URL when filters change
  const updateFilters = (newFilters: any) => {
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);

    // Update URL parameters
    const params = new URLSearchParams();
    if (newFilters.selectedTaxonomy) {
      if (newFilters.selectedTaxonomy.category) params.set('cat', newFilters.selectedTaxonomy.category);
      if (newFilters.selectedTaxonomy.subcategory) params.set('sub', newFilters.selectedTaxonomy.subcategory);
      if (newFilters.selectedTaxonomy.micro) params.set('micro', newFilters.selectedTaxonomy.micro);
    }
    if (newFilters.specialists.length > 0) params.set('spec', newFilters.specialists.join(','));
    if (newFilters.priceRange[0] > 0) params.set('minPrice', newFilters.priceRange[0].toString());
    if (newFilters.priceRange[1] < 100000) params.set('maxPrice', newFilters.priceRange[1].toString());
    if (newFilters.availability.length > 0) params.set('avail', newFilters.availability.join(','));
    if (newFilters.location) params.set('loc', newFilters.location);
    if (newFilters.verified) params.set('verified', 'true');
    if (newFilters.minRating) params.set('minRating', newFilters.minRating.toString());
    
    setSearchParams(params);
  };

  const handleTaxonomySelect = (selection: any) => {
    updateFilters({ 
      ...localFilters, 
      selectedTaxonomy: {
        category: selection.category,
        subcategory: selection.subcategory,
        micro: selection.micro
      }
    });
  };

  const clearTaxonomy = () => {
    updateFilters({ ...localFilters, selectedTaxonomy: null });
  };

  const toggleSpecialist = (specialist: string) => {
    const newSpecialists = localFilters.specialists.includes(specialist)
      ? localFilters.specialists.filter(s => s !== specialist)
      : [...localFilters.specialists, specialist];
    
    updateFilters({ ...localFilters, specialists: newSpecialists });
  };

  const toggleAvailability = (availability: string) => {
    const newAvailability = localFilters.availability.includes(availability)
      ? localFilters.availability.filter(a => a !== availability)
      : [...localFilters.availability, availability];
    
    updateFilters({ ...localFilters, availability: newAvailability });
  };

  const clearAllFilters = () => {
    const emptyFilters = {
      selectedTaxonomy: null,
      specialists: [],
      priceRange: [0, 100000] as [number, number],
      availability: [],
      location: '',
      verified: false,
      minRating: undefined
    };
    updateFilters(emptyFilters);
    setSearchParams(new URLSearchParams());
  };

  const getActiveFilterCount = () => {
    return (localFilters.selectedTaxonomy ? 1 : 0) +
           localFilters.specialists.length + 
           localFilters.availability.length +
           (localFilters.location ? 1 : 0) +
           (localFilters.priceRange[0] > 0 || localFilters.priceRange[1] < 100000 ? 1 : 0) +
           (localFilters.verified ? 1 : 0) +
           (localFilters.minRating ? 1 : 0);
  };

  return (
    <div className="space-y-6">
      {/* Filter Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
              {getActiveFilterCount() > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {getActiveFilterCount()}
                </Badge>
              )}
            </CardTitle>
            {getActiveFilterCount() > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                <X className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Browse by Category */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Browse by Category</CardTitle>
            {localFilters.selectedTaxonomy && (
              <Button variant="ghost" size="sm" onClick={clearTaxonomy}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          {categoriesLoading ? (
            <div className="text-sm text-muted-foreground py-4 text-center">Loading categories...</div>
          ) : allCategories.length > 0 ? (
            <div className="space-y-1">
              {allCategories.map((category) => (
                <CategoryWithSubcategories
                  key={category.id}
                  categoryId={category.id}
                  categoryName={category.name}
                  categoryIcon={category.icon_name}
                  isExpanded={expandedCategory === category.id}
                  onToggle={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                  selectedSubcategory={localFilters.selectedTaxonomy?.subcategory || null}
                  onSubcategoryChange={(subcategorySlug) => {
                    updateFilters({
                      ...localFilters,
                      selectedTaxonomy: {
                        category: category.slug,
                        subcategory: subcategorySlug,
                        micro: ''
                      }
                    });
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground py-4 text-center">No categories available</div>
          )}
        </CardContent>
      </Card>

      {/* Price Range */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Price Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="px-2">
            <Slider
              defaultValue={localFilters.priceRange}
              value={localFilters.priceRange}
              onValueChange={(value) => 
                updateFilters({ ...localFilters, priceRange: value as [number, number] })
              }
              max={100000}
              min={0}
              step={50}
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>€{localFilters.priceRange[0]}</span>
            <span>€{localFilters.priceRange[1] === 100000 ? '100k+' : localFilters.priceRange[1]}</span>
          </div>
        </CardContent>
      </Card>

      {/* Availability */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Availability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {['Available now', 'This week', 'This month', 'Emergency'].map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={`availability-${option}`}
                checked={localFilters.availability.includes(option)}
                onCheckedChange={() => toggleAvailability(option)}
              />
              <label
                htmlFor={`availability-${option}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {option}
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Professional Quality */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Professional Quality
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="verified-only"
              checked={localFilters.verified || false}
              onCheckedChange={(checked) => 
                updateFilters({ ...localFilters, verified: checked as boolean })
              }
            />
            <label
              htmlFor="verified-only"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Verified Professionals Only
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Star className="w-4 h-4" />
              Minimum Rating
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  variant={localFilters.minRating === rating ? "default" : "outline"}
                  size="sm"
                  onClick={() => 
                    updateFilters({ 
                      ...localFilters, 
                      minRating: localFilters.minRating === rating ? undefined : rating 
                    })
                  }
                  className="flex items-center justify-center gap-1"
                >
                  {rating}
                  <Star className="w-3 h-3" />
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedServiceFilters;