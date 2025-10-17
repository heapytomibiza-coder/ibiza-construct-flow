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
  Waves, Wind, Ruler, Square, Leaf,
  HardHat, Building, Building2, DoorOpen, Bath, FileText,
  Layers
} from 'lucide-react';

interface MainCategoryStepProps {
  selectedCategory: string;
  onSelect: (category: string) => void;
  onNext: () => void;
}

const ICON_MAP: Record<string, any> = {
  Home, Wrench, Paintbrush, Zap, Droplet, Hammer,
  Waves, Wind, Ruler, Square, Leaf,
  HardHat, Building, Building2, DoorOpen, Bath, FileText,
  Layers
};

interface CategoryInfo {
  name: string;
  icon: keyof typeof ICON_MAP;
  examples: string[];
}

const ALL_CATEGORIES: CategoryInfo[] = [
  { name: 'Builder', icon: 'HardHat', examples: ['New construction', 'Extensions', 'Renovations'] },
  { name: 'Plumber', icon: 'Droplet', examples: ['Leak repairs', 'Pipe installation', 'Bathroom fitting'] },
  { name: 'Electrician', icon: 'Zap', examples: ['Rewiring', 'Socket installation', 'Lighting'] },
  { name: 'Carpenter', icon: 'Hammer', examples: ['Custom furniture', 'Door fitting', 'Decking'] },
  { name: 'Handyman', icon: 'Wrench', examples: ['General repairs', 'Assembly', 'Odd jobs'] },
  { name: 'Painter', icon: 'Paintbrush', examples: ['Interior painting', 'Exterior painting', 'Decorating'] },
  { name: 'Tiler', icon: 'Square', examples: ['Floor tiling', 'Wall tiling', 'Bathroom tiles'] },
  { name: 'Plasterer', icon: 'Layers', examples: ['Wall plastering', 'Ceiling repair', 'Rendering'] },
  { name: 'Roofer', icon: 'Home', examples: ['Roof repairs', 'New roofing', 'Guttering'] },
  { name: 'Landscaper', icon: 'Leaf', examples: ['Garden design', 'Paving', 'Planting'] },
  { name: 'Pool Builder', icon: 'Waves', examples: ['Pool installation', 'Pool maintenance', 'Repairs'] },
  { name: 'HVAC', icon: 'Wind', examples: ['Air conditioning', 'Heating', 'Ventilation'] },
  { name: 'Architects & Design', icon: 'Ruler', examples: ['Building plans', 'Interior design', '3D renders'] },
  { name: 'Structural Works', icon: 'Building2', examples: ['Foundations', 'Steel work', 'Concrete'] },
  { name: 'Floors, Doors & Windows', icon: 'DoorOpen', examples: ['Flooring', 'Window installation', 'Door fitting'] },
  { name: 'Kitchen & Bathroom', icon: 'Bath', examples: ['Kitchen fitting', 'Bathroom design', 'Plumbing'] },
  { name: 'Commercial Projects', icon: 'Building', examples: ['Office fit-outs', 'Retail spaces', 'Warehouses'] },
  { name: 'Legal & Regulatory', icon: 'FileText', examples: ['Building permits', 'Planning', 'Compliance'] },
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

  const renderCategoryCard = (category: CategoryInfo) => {
    const IconComponent = ICON_MAP[category.icon];
    const isSelected = selectedCategory === category.name;

    return (
      <Card
        key={category.name}
        className={cn(
          "cursor-pointer transition-all hover:scale-[1.01] hover:shadow-lg",
          "border-2 p-5",
          isSelected
            ? "border-primary bg-primary/5 shadow-md"
            : "border-border hover:border-primary/50"
        )}
        onClick={() => onSelect(category.name)}
      >
        <div className="flex items-start gap-4">
          <div className={cn(
            "p-3.5 rounded-xl shrink-0",
            isSelected ? "bg-primary/20" : "bg-muted"
          )}>
            <IconComponent className={cn(
              "h-9 w-9",
              isSelected ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-2 text-foreground">
              {category.name}
            </h3>
            <ul className="space-y-0.5">
              {category.examples.map((example, idx) => (
                <li key={idx} className="text-xs text-muted-foreground/80 flex items-start">
                  <span className="mr-1.5 mt-0.5">•</span>
                  <span>{example}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    );
  };

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {ALL_CATEGORIES.map(renderCategoryCard)}
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
