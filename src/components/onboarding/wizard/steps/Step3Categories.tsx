import { AlertCircle, Briefcase, Search, Hammer } from 'lucide-react';
import { ModernCategoryCard } from '../shared/ModernCategoryCard';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { getCategoryConfig } from '@/lib/categoryConfig';

// Category data with slugs
const MAIN_CATEGORIES = [
  { name: 'Builder', slug: 'building' },
  { name: 'Carpenter', slug: 'carpentry' },
  { name: 'Electrician', slug: 'electrical' },
  { name: 'Plumber', slug: 'plumbing' },
  { name: 'Air Conditioning', slug: 'air-conditioning' },
  { name: 'Landscaping', slug: 'landscaping' },
  { name: 'Painter', slug: 'painting' },
  { name: 'Flooring', slug: 'flooring' },
  { name: 'Windows & Doors', slug: 'windows-doors' },
  { name: 'Metalwork', slug: 'metalwork' },
  { name: 'Handyman', slug: 'handyman' },
  { name: 'Cleaning', slug: 'cleaning' },
];

const SPECIALIST_CATEGORIES = [
  { name: 'Architect', slug: 'architecture' },
  { name: 'Project Manager', slug: 'project-management' },
  { name: 'Interior Designer', slug: 'interior-design' },
  { name: 'Property Manager', slug: 'property-management' },
  { name: 'Legal Consultant', slug: 'legal-consulting' },
  { name: 'Pool Maintenance', slug: 'pool-maintenance' },
  { name: 'Bathroom Renovation', slug: 'bathroom-renovation' },
  { name: 'Home Renovation', slug: 'home-renovation' },
];

interface Step3CategoriesProps {
  data: {
    categories: string[];
  };
  onChange: (field: string, value: string[]) => void;
  errors: Record<string, string>;
}

export function Step3Categories({ data, onChange, errors }: Step3CategoriesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const popularCategories = ['Builder', 'Plumber', 'Electrician'];

  const filteredMain = MAIN_CATEGORIES.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredSpecialist = SPECIALIST_CATEGORIES.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
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
              {filteredMain.map(cat => {
                const config = getCategoryConfig(cat.slug);
                const Icon = config.icon;
                return (
                  <ModernCategoryCard
                    key={cat.slug}
                    name={cat.name}
                    icon={<Icon className="w-8 h-8" />}
                    isSelected={data.categories.includes(cat.name)}
                    onClick={() => toggleCategory(cat.name)}
                    isPopular={popularCategories.includes(cat.name)}
                    gradient={config.gradient}
                    serviceCount={config.serviceCount}
                  />
                );
              })}
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
              {filteredSpecialist.map(cat => {
                const config = getCategoryConfig(cat.slug);
                const Icon = config.icon;
                return (
                  <ModernCategoryCard
                    key={cat.slug}
                    name={cat.name}
                    icon={<Icon className="w-8 h-8" />}
                    isSelected={data.categories.includes(cat.name)}
                    onClick={() => toggleCategory(cat.name)}
                    gradient={config.gradient}
                    serviceCount={config.serviceCount}
                  />
                );
              })}
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
