/**
 * Step 1: Main Category Selection
 * Categories hardcoded for immediate functionality
 */
import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Home, Wrench, Paintbrush, Zap, Droplet, Hammer,
  TreePine, Trees, Waves, Wind, Lightbulb, Sun,
  HardHat, Building, Building2, DoorOpen, Bath, FileText,
  Grid3X3, Layers
} from 'lucide-react';

interface MainCategoryStepProps {
  selectedCategory: string;
  onSelect: (category: string) => void;
  onNext: () => void;
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

export const MainCategoryStep: React.FC<MainCategoryStepProps> = ({
  selectedCategory,
  onSelect,
  onNext
}) => {
  // Auto-advance after selection
  useEffect(() => {
    if (selectedCategory) {
      const timer = setTimeout(() => {
        onNext();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [selectedCategory, onNext]);

  // Map category names to icons (12 Main + 6 Specialist)
  const getCategoryIcon = (category: string): keyof typeof ICON_MAP => {
    const iconMap: Record<string, keyof typeof ICON_MAP> = {
      // 12 Main Construction Categories
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
      // 6 Specialist Categories
      'Architects & Design': 'Lightbulb',
      'Structural Works': 'Building2',
      'Floors, Doors & Windows': 'DoorOpen',
      'Kitchen & Bathroom': 'Bath',
      'Commercial Projects': 'Building',
      'Legal & Regulatory': 'FileText',
    };
    return iconMap[category] || 'Wrench';
  };

  const renderCategoryGrid = (categories: string[], title: string) => (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground/80">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {categories.map((category) => {
          const iconName = getCategoryIcon(category);
          const IconComponent = ICON_MAP[iconName];
          const isSelected = selectedCategory === category;

          return (
            <Card
              key={category}
              className={cn(
                "cursor-pointer transition-all hover:scale-105 hover:shadow-lg",
                "border-2 p-4",
                isSelected
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => onSelect(category)}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <div className={cn(
                  "p-2.5 rounded-full",
                  isSelected ? "bg-primary/20" : "bg-muted"
                )}>
                  <IconComponent className={cn(
                    "h-6 w-6",
                    isSelected ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
                <span className="font-medium text-xs leading-tight">
                  {category}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          What type of work do you need?
        </h1>
        <p className="text-lg text-muted-foreground">
          Choose the category that best fits your project
        </p>
      </div>

      <div className="space-y-6">
        {renderCategoryGrid(MAIN_CATEGORIES, "Main Services")}
        {renderCategoryGrid(SPECIALIST_CATEGORIES, "Specialist Services")}
      </div>

      {/* Next Button */}
      {selectedCategory && (
        <div className="flex justify-end pt-4">
          <Button
            size="lg"
            onClick={onNext}
            className="min-w-32"
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  );
};
