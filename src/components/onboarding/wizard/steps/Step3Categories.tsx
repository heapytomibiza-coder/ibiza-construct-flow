import { AlertCircle, Briefcase, Search } from 'lucide-react';
import { ModernCategoryCard } from '../shared/ModernCategoryCard';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { getMainCategories, getSpecialistCategories, getServiceIconName } from '@/utils/serviceHelpers';
import { 
  Hammer, Wrench, Paintbrush, Zap, Droplet, Grid3x3, Layers, 
  Home, Trees, Waves, Wind, Ruler, HardHat, DoorOpen, Bath, Building2, FileText 
} from 'lucide-react';

const getIconComponent = (iconName: string, size: string = "w-10 h-10") => {
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

interface Step3CategoriesProps {
  data: {
    categories: string[];
  };
  onChange: (field: string, value: string[]) => void;
  errors: Record<string, string>;
}

export function Step3Categories({ data, onChange, errors }: Step3CategoriesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const mainCategories = getMainCategories();
  const specialistCategories = getSpecialistCategories();
  const popularCategories = ['Builder', 'Plumber', 'Electrician'];

  const allCategories = [...mainCategories, ...specialistCategories];
  const filteredMain = mainCategories.filter(cat => 
    cat.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredSpecialist = specialistCategories.filter(cat => 
    cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleCategory = (category: string) => {
    if (data.categories.includes(category)) {
      onChange('categories', data.categories.filter(c => c !== category));
    } else {
      onChange('categories', [...data.categories, category]);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
          <Briefcase className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold">What Services Do You Offer?</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Select all that apply. You'll configure specific services and pricing after verification.
        </p>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search services..."
            className="pl-10 h-12"
          />
        </div>

        {/* Selected Categories */}
        {data.categories.length > 0 && (
          <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
            <p className="text-sm font-medium mb-3">Selected ({data.categories.length}):</p>
            <div className="flex flex-wrap gap-2">
              {data.categories.map((cat) => (
                <Badge
                  key={cat}
                  variant="default"
                  className="cursor-pointer hover:bg-primary/80 pr-1"
                  onClick={() => toggleCategory(cat)}
                >
                  {cat}
                  <span className="ml-2 hover:bg-primary-foreground/20 rounded-full p-0.5">×</span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Main Services */}
        {filteredMain.length > 0 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Hammer className="w-5 h-5" />
                Main Services
              </h3>
              <p className="text-sm text-muted-foreground mt-1">Core trades and services</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMain.map(cat => (
                <ModernCategoryCard
                  key={cat}
                  name={cat}
                  icon={getIconComponent(getServiceIconName(cat))}
                  isSelected={data.categories.includes(cat)}
                  onClick={() => toggleCategory(cat)}
                  isPopular={popularCategories.includes(cat)}
                  gradient="from-blue-500/20 to-primary/10"
                />
              ))}
            </div>
          </div>
        )}

        {/* Specialist Services */}
        {filteredSpecialist.length > 0 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Specialist Services
              </h3>
              <p className="text-sm text-muted-foreground mt-1">Specialized professional services</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredSpecialist.map(cat => (
                <ModernCategoryCard
                  key={cat}
                  name={cat}
                  icon={getIconComponent(getServiceIconName(cat))}
                  isSelected={data.categories.includes(cat)}
                  onClick={() => toggleCategory(cat)}
                  gradient="from-purple-500/20 to-primary/10"
                />
              ))}
            </div>
          </div>
        )}

        {errors.categories && (
          <p className="text-sm text-destructive flex items-center gap-1 justify-center">
            <AlertCircle className="w-4 h-4" />
            {errors.categories}
          </p>
        )}
      </div>
    </div>
  );
}
