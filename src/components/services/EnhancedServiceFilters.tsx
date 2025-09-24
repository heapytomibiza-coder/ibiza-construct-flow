import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, X, MapPin } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

interface FilterProps {
  filters: {
    categories: string[];
    subcategories: string[];
    specialists: string[];
    priceRange: [number, number];
    availability: string[];
    location: string;
  };
  onFiltersChange: (filters: any) => void;
  categories: string[];
  visible: boolean;
}

const specialistCategories = [
  {
    category: 'Architecture & Design',
    specialists: [
      'Architect (Home Design)',
      'Technical Architect',
      'Structural Engineer',
      'Civil Engineer',
      'MEP Engineer',
      'Interior Designer',
      'Land Surveyor',
      'Geotechnical Specialist'
    ]
  },
  {
    category: 'Construction & Building',
    specialists: [
      'Groundworks & Excavation',
      'Foundations & Concrete',
      'Bricklaying & Masonry',
      'Stonework & Restoration',
      'Timber Framing',
      'Structural Steel & Welding',
      'Formwork Carpentry'
    ]
  },
  {
    category: 'Flooring & Finishes',
    specialists: [
      'Tiling (Floors & Walls)',
      'Wood Flooring',
      'Carpet & Vinyl Flooring',
      'Door Fitting',
      'Window Fitting & Glazing',
      'Skylights & Roof Windows'
    ]
  },
  {
    category: 'Kitchen & Bathroom',
    specialists: [
      'Kitchen Installation',
      'Kitchen Renovation',
      'Bathroom Installation',
      'Wetrooms & Waterproofing',
      'Joinery & Cabinetry'
    ]
  },
  {
    category: 'Commercial Projects',
    specialists: [
      'Project Management',
      'Structural & Heavy Works',
      'MEP Systems',
      'Interior Fit-Out',
      'Exterior & Infrastructure',
      'Commissioning'
    ]
  }
];

const EnhancedServiceFilters: React.FC<FilterProps> = ({
  filters,
  onFiltersChange,
  categories,
  visible
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [localFilters, setLocalFilters] = useState(filters);

  // Load filters from URL on mount
  useEffect(() => {
    const urlFilters = {
      categories: searchParams.get('cat')?.split(',').filter(Boolean) || [],
      subcategories: searchParams.get('sub')?.split(',').filter(Boolean) || [],
      specialists: searchParams.get('spec')?.split(',').filter(Boolean) || [],
      priceRange: [
        parseInt(searchParams.get('minPrice') || '0'),
        parseInt(searchParams.get('maxPrice') || '100000')
      ] as [number, number],
      availability: searchParams.get('avail')?.split(',').filter(Boolean) || [],
      location: searchParams.get('loc') || ''
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
    if (newFilters.categories.length > 0) params.set('cat', newFilters.categories.join(','));
    if (newFilters.subcategories.length > 0) params.set('sub', newFilters.subcategories.join(','));
    if (newFilters.specialists.length > 0) params.set('spec', newFilters.specialists.join(','));
    if (newFilters.priceRange[0] > 0) params.set('minPrice', newFilters.priceRange[0].toString());
    if (newFilters.priceRange[1] < 100000) params.set('maxPrice', newFilters.priceRange[1].toString());
    if (newFilters.availability.length > 0) params.set('avail', newFilters.availability.join(','));
    if (newFilters.location) params.set('loc', newFilters.location);
    
    setSearchParams(params);
  };

  const toggleCategory = (category: string) => {
    const newCategories = localFilters.categories.includes(category)
      ? localFilters.categories.filter(c => c !== category)
      : [...localFilters.categories, category];
    
    updateFilters({ ...localFilters, categories: newCategories });
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
      categories: [],
      subcategories: [],
      specialists: [],
      priceRange: [0, 100000] as [number, number],
      availability: [],
      location: ''
    };
    updateFilters(emptyFilters);
    setSearchParams(new URLSearchParams());
  };

  const getActiveFilterCount = () => {
    return localFilters.categories.length + 
           localFilters.specialists.length + 
           localFilters.availability.length +
           (localFilters.location ? 1 : 0) +
           (localFilters.priceRange[0] > 0 || localFilters.priceRange[1] < 100000 ? 1 : 0);
  };

  if (!visible) return null;

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

      {/* Service Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Service Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category}`}
                checked={localFilters.categories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
              />
              <label
                htmlFor={`category-${category}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {category}
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Specialist Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Specialist Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {specialistCategories.map((group) => (
            <div key={group.category} className="space-y-2">
              <h4 className="font-medium text-sm text-primary">{group.category}</h4>
              <div className="space-y-2 pl-4">
                {group.specialists.map((specialist) => (
                  <div key={specialist} className="flex items-center space-x-2">
                    <Checkbox
                      id={`specialist-${specialist}`}
                      checked={localFilters.specialists.includes(specialist)}
                      onCheckedChange={() => toggleSpecialist(specialist)}
                    />
                    <label
                      htmlFor={`specialist-${specialist}`}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {specialist}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
    </div>
  );
};

export default EnhancedServiceFilters;