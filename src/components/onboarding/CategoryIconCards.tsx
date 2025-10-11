import { getMainCategories, getSpecialistCategories, getServiceIconName } from '@/utils/serviceHelpers';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Hammer, Wrench, Paintbrush, Zap, Droplet, Grid3x3, Layers, 
  Home, Trees, Waves, Wind, Ruler, HardHat, DoorOpen, Bath, Building2, FileText 
} from 'lucide-react';

interface CategoryIconCardsProps {
  selectedCategories: string[];
  onSelectionChange: (categories: string[]) => void;
}

const getIconComponent = (iconName: string, size: string = "w-8 h-8") => {
  const icons: Record<string, any> = {
    'Hammer': Hammer,
    'Droplets': Droplet,
    'Zap': Zap,
    'Wrench': Wrench,
    'Paintbrush': Paintbrush,
    'Grid3x3': Grid3x3,
    'Layers': Layers,
    'Home': Home,
    'Trees': Trees,
    'Waves': Waves,
    'Wind': Wind,
    'Ruler': Ruler,
    'HardHat': HardHat,
    'DoorOpen': DoorOpen,
    'Bath': Bath,
    'Building2': Building2,
    'FileText': FileText,
  };
  const Icon = icons[iconName] || Wrench;
  return <Icon className={size} />;
};

export const CategoryIconCards = ({ selectedCategories, onSelectionChange }: CategoryIconCardsProps) => {
  const mainCategories = getMainCategories();
  const specialistCategories = getSpecialistCategories();

  const popularCategories = ['Builder', 'Plumber', 'Electrician'];

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onSelectionChange(selectedCategories.filter(c => c !== category));
    } else {
      onSelectionChange([...selectedCategories, category]);
    }
  };

  const renderCategoryCard = (category: string, isPopular: boolean) => {
    const isSelected = selectedCategories.includes(category);
    const iconName = getServiceIconName(category);

    return (
      <Card
        key={category}
        onClick={() => toggleCategory(category)}
        className={cn(
          "relative p-6 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg",
          "flex flex-col items-center justify-center gap-3 min-h-[140px]",
          isSelected 
            ? "border-primary bg-primary/10 shadow-md" 
            : "border-border hover:border-primary/50"
        )}
      >
        {isPopular && (
          <Badge 
            variant="secondary" 
            className="absolute top-2 right-2 text-xs bg-primary/20 text-primary border-primary/30"
          >
            Popular
          </Badge>
        )}
        
        <div className={cn(
          "transition-colors",
          isSelected ? "text-primary" : "text-muted-foreground"
        )}>
          {getIconComponent(iconName, "w-10 h-10")}
        </div>
        
        <div className="text-center">
          <div className={cn(
            "font-semibold text-sm",
            isSelected && "text-primary"
          )}>
            {category}
          </div>
        </div>

        {isSelected && (
          <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none" />
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">🎯 What Type of Work Do You Do?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Select your main service categories. This helps us match you with relevant jobs quickly.
        </p>
      </div>

      <div className="space-y-6">
        {/* Main Services */}
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold mb-1">Main Services</h3>
            <p className="text-sm text-muted-foreground">Core trades and services</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mainCategories.map(cat => renderCategoryCard(cat, popularCategories.includes(cat)))}
          </div>
        </div>

        {/* Specialist Services */}
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold mb-1">Specialist Services</h3>
            <p className="text-sm text-muted-foreground">Specialized and professional services</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {specialistCategories.map(cat => renderCategoryCard(cat, false))}
          </div>
        </div>
      </div>

      {/* Selection Summary */}
      <div className="flex items-center justify-center gap-2 text-sm">
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg border border-primary/20">
          <span className="font-semibold text-primary">
            ✅ Selected: {selectedCategories.length} {selectedCategories.length === 1 ? 'category' : 'categories'}
          </span>
        </div>
      </div>

      {selectedCategories.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          💡 Next, you'll build your detailed service menu based on these selections
        </div>
      )}
    </div>
  );
};