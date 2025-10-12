import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Home, Wrench, Paintbrush, Zap, Droplet, Hammer,
  TreePine, Trees, Waves, Wind, Lightbulb, Sun,
  HardHat, Building, Building2, DoorOpen, Bath, FileText,
  Grid3X3, Layers
} from 'lucide-react';

interface CategoryPillNavProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const ICON_MAP: Record<string, any> = {
  Home, Wrench, Paintbrush, Zap, Droplet, Hammer,
  TreePine, Trees, Waves, Wind, Lightbulb, Sun,
  HardHat, Building, Building2, DoorOpen, Bath, FileText,
  Grid3X3, Layers
};

const MAIN_CATEGORIES = [
  'Builder',
  'Plumber',
  'Electrician',
  'Carpenter',
  'Handyman',
  'Painter',
  'Tiler',
  'Plasterer',
  'Roofer',
  'Landscaper',
  'Pool Builder',
  'HVAC',
];

const SPECIALIST_CATEGORIES = [
  'Architects & Design',
  'Structural Works',
  'Floors, Doors & Windows',
  'Kitchen & Bathroom',
  'Commercial Projects',
  'Legal & Regulatory',
];

const CATEGORY_ICONS: Record<string, keyof typeof ICON_MAP> = {
  'Builder': 'HardHat',
  'Plumber': 'Droplet',
  'Electrician': 'Zap',
  'Carpenter': 'Hammer',
  'Handyman': 'Wrench',
  'Painter': 'Paintbrush',
  'Tiler': 'Grid3X3',
  'Plasterer': 'Layers',
  'Roofer': 'Home',
  'Landscaper': 'Trees',
  'Pool Builder': 'Waves',
  'HVAC': 'Wind',
  'Architects & Design': 'Lightbulb',
  'Structural Works': 'Building2',
  'Floors, Doors & Windows': 'DoorOpen',
  'Kitchen & Bathroom': 'Bath',
  'Commercial Projects': 'Building',
  'Legal & Regulatory': 'FileText',
};

export const CategoryPillNav: React.FC<CategoryPillNavProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const renderCategoryPill = (category: string) => {
    const IconComponent = ICON_MAP[CATEGORY_ICONS[category] || 'Wrench'];
    const isSelected = selectedCategory === category;

    return (
      <Badge
        key={category}
        variant={isSelected ? 'default' : 'outline'}
        className={cn(
          'cursor-pointer transition-all px-3 py-2 text-sm font-medium',
          'hover:scale-105 hover:shadow-md',
          isSelected 
            ? 'bg-primary text-primary-foreground border-primary' 
            : 'hover:bg-primary/10 hover:border-primary/50'
        )}
        onClick={() => onSelectCategory(isSelected ? null : category)}
      >
        <IconComponent className="w-4 h-4 mr-1.5" />
        {category}
      </Badge>
    );
  };

  return (
    <div className="space-y-4 py-4">
      {/* All Categories Button */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge
          variant={!selectedCategory ? 'default' : 'outline'}
          className={cn(
            'cursor-pointer transition-all px-3 py-2 text-sm font-medium',
            'hover:scale-105 hover:shadow-md',
            !selectedCategory 
              ? 'bg-primary text-primary-foreground border-primary' 
              : 'hover:bg-primary/10 hover:border-primary/50'
          )}
          onClick={() => onSelectCategory(null)}
        >
          All Categories
        </Badge>
      </div>

      {/* Main Categories */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Main Services
        </h3>
        <div className="flex flex-wrap gap-2">
          {MAIN_CATEGORIES.map(renderCategoryPill)}
        </div>
      </div>

      {/* Specialist Categories */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Specialist Services
        </h3>
        <div className="flex flex-wrap gap-2">
          {SPECIALIST_CATEGORIES.map(renderCategoryPill)}
        </div>
      </div>
    </div>
  );
};
