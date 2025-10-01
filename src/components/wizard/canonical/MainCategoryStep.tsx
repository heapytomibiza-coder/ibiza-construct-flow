/**
 * Step 1: Main Category Selection (12 main + 6 specialist)
 * Tap-first, tile-based selection
 */
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Home, Hammer, Zap, Droplets, Paintbrush, Wrench,
  Wind, Thermometer, TreePine, Shield, ShoppingBag, Truck,
  Building2, PenTool, Ruler, Users, Briefcase, Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MainCategoryStepProps {
  selectedCategory: string;
  onSelect: (category: string) => void;
  onNext: () => void;
}

const ICON_MAP: Record<string, any> = {
  Home, Hammer, Zap, Droplets, Paintbrush, Wrench, Wind, Thermometer,
  TreePine, Shield, ShoppingBag, Truck, Building2, PenTool, Ruler, Users, Briefcase, Layers
};

const MAIN_CATEGORIES = [
  { id: 'general-construction', label: 'General Construction', icon: 'Hammer', color: 'bg-copper/10 text-copper' },
  { id: 'electrical', label: 'Electrical', icon: 'Zap', color: 'bg-amber-500/10 text-amber-600' },
  { id: 'plumbing', label: 'Plumbing', icon: 'Droplets', color: 'bg-blue-500/10 text-blue-600' },
  { id: 'hvac', label: 'HVAC', icon: 'Wind', color: 'bg-sky-500/10 text-sky-600' },
  { id: 'carpentry', label: 'Carpentry', icon: 'Wrench', color: 'bg-orange-500/10 text-orange-600' },
  { id: 'roofing', label: 'Roofing', icon: 'Home', color: 'bg-slate-500/10 text-slate-600' },
  { id: 'masonry', label: 'Masonry & Concrete', icon: 'Building2', color: 'bg-stone-500/10 text-stone-600' },
  { id: 'painting', label: 'Painting & Decorating', icon: 'Paintbrush', color: 'bg-purple-500/10 text-purple-600' },
  { id: 'flooring', label: 'Flooring', icon: 'Layers', color: 'bg-teal-500/10 text-teal-600' },
  { id: 'landscaping', label: 'Landscaping', icon: 'TreePine', color: 'bg-green-500/10 text-green-600' },
  { id: 'insulation', label: 'Insulation', icon: 'Thermometer', color: 'bg-indigo-500/10 text-indigo-600' },
  { id: 'metalwork', label: 'Metalwork & Welding', icon: 'Shield', color: 'bg-gray-500/10 text-gray-600' }
];

const SPECIALIST_CATEGORIES = [
  { id: 'architects', label: 'Architects & Design', icon: 'PenTool', color: 'bg-violet-500/10 text-violet-600' },
  { id: 'structural', label: 'Structural Engineering', icon: 'Building2', color: 'bg-slate-600/10 text-slate-700' },
  { id: 'interior-design', label: 'Interior Design', icon: 'Paintbrush', color: 'bg-pink-500/10 text-pink-600' },
  { id: 'project-management', label: 'Project Management', icon: 'Briefcase', color: 'bg-emerald-500/10 text-emerald-600' },
  { id: 'surveying', label: 'Surveying & Planning', icon: 'Ruler', color: 'bg-cyan-500/10 text-cyan-600' },
  { id: 'quantity-surveying', label: 'Quantity Surveying', icon: 'Users', color: 'bg-rose-500/10 text-rose-600' }
];

export const MainCategoryStep: React.FC<MainCategoryStepProps> = ({
  selectedCategory,
  onSelect,
  onNext
}) => {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-charcoal">
          What type of work do you need?
        </h1>
        <p className="text-lg text-muted-foreground">
          Choose the main category that best fits your project
        </p>
      </div>

      {/* Main Categories Grid */}
      <div>
        <h2 className="text-xl font-semibold text-charcoal mb-4">Main Services</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {MAIN_CATEGORIES.map((category) => {
            const Icon = ICON_MAP[category.icon];
            const isSelected = selectedCategory === category.id;
            
            return (
              <Card
                key={category.id}
                className={cn(
                  "p-6 cursor-pointer transition-all hover:shadow-lg",
                  isSelected && "ring-2 ring-copper shadow-lg"
                )}
                onClick={() => onSelect(category.id)}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center", category.color)}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <span className="font-medium text-sm text-charcoal">
                    {category.label}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Specialist Categories Grid */}
      <div>
        <h2 className="text-xl font-semibold text-charcoal mb-4">Specialist Services</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {SPECIALIST_CATEGORIES.map((category) => {
            const Icon = ICON_MAP[category.icon];
            const isSelected = selectedCategory === category.id;
            
            return (
              <Card
                key={category.id}
                className={cn(
                  "p-6 cursor-pointer transition-all hover:shadow-lg",
                  isSelected && "ring-2 ring-copper shadow-lg"
                )}
                onClick={() => onSelect(category.id)}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center", category.color)}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <span className="font-medium text-sm text-charcoal">
                    {category.label}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Next Button */}
      {selectedCategory && (
        <div className="flex justify-end pt-6">
          <Button
            size="lg"
            onClick={onNext}
            className="bg-gradient-hero text-white px-8"
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  );
};
