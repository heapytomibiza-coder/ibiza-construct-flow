/**
 * Step 1: Visual Category Selection
 * Beautiful, engaging visual selection with minimal typing
 */

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Package, Home, ShoppingCart, Wrench, Sparkles, 
  Truck, Dog, Heart, Briefcase, Search, ArrowRight 
} from 'lucide-react';
import { useServicesRegistry } from '@/contexts/ServicesRegistry';
import { cn } from '@/lib/utils';

interface VisualCategoryStepProps {
  selectedCategory: string;
  selectedSubcategory: string;
  selectedMicro: string;
  onSelect: (category: string, subcategory: string, micro: string, microId: string) => void;
  onNext: () => void;
}

const categoryIcons: Record<string, any> = {
  'Moving & Delivery': Truck,
  'Home Services': Home,
  'Shopping & Errands': ShoppingCart,
  'Handyman': Wrench,
  'Cleaning': Sparkles,
  'Pet Care': Dog,
  'Personal Services': Heart,
  'default': Briefcase
};

const VisualCategoryStep: React.FC<VisualCategoryStepProps> = ({
  selectedCategory,
  selectedSubcategory,
  selectedMicro,
  onSelect,
  onNext
}) => {
  const { t } = useTranslation();
  const { services, getCategories, getSubcategories, getMicroServices } = useServicesRegistry();
  const [searchTerm, setSearchTerm] = useState('');

  const categories = useMemo(() => getCategories(), [getCategories]);
  const subcategories = useMemo(
    () => selectedCategory ? getSubcategories(selectedCategory) : [],
    [selectedCategory, getSubcategories]
  );
  const microServices = useMemo(
    () => selectedCategory && selectedSubcategory 
      ? getMicroServices(selectedCategory, selectedSubcategory)
      : [],
    [selectedCategory, selectedSubcategory, getMicroServices]
  );

  const filteredServices = useMemo(() => {
    if (!searchTerm) return services;
    const term = searchTerm.toLowerCase();
    return services.filter(s => 
      s.category.toLowerCase().includes(term) ||
      s.subcategory.toLowerCase().includes(term) ||
      s.micro.toLowerCase().includes(term)
    );
  }, [services, searchTerm]);

  const handleCategorySelect = (category: string) => {
    onSelect(category, '', '', '');
  };

  const handleSubcategorySelect = (subcategory: string) => {
    onSelect(selectedCategory, subcategory, '', '');
  };

  const handleMicroSelect = (micro: string, microId: string) => {
    onSelect(selectedCategory, selectedSubcategory, micro, microId);
    // Auto-advance after selection
    setTimeout(() => onNext(), 300);
  };

  const handleBack = () => {
    if (selectedSubcategory) {
      onSelect(selectedCategory, '', '', '');
    } else if (selectedCategory) {
      onSelect('', '', '', '');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          {!selectedCategory && t('wizard.steps.category.title')}
          {selectedCategory && !selectedSubcategory && t('wizard.steps.subcategory.title')}
          {selectedCategory && selectedSubcategory && t('wizard.steps.microservice.title')}
        </h1>
        <p className="text-muted-foreground text-lg">
          {t('wizard.steps.category.subtitle')}
        </p>

        {/* Breadcrumb */}
        {selectedCategory && (
          <div className="flex items-center justify-center gap-2 text-sm">
            <Button variant="link" onClick={() => onSelect('', '', '', '')} className="h-auto p-0">
              {t('wizard.steps.category.title')}
            </Button>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium">{selectedCategory}</span>
            {selectedSubcategory && (
              <>
                <span className="text-muted-foreground">/</span>
                <span className="font-medium">{selectedSubcategory}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder={t('wizard.steps.category.search')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 h-14 text-lg rounded-xl"
        />
      </div>

      {/* Category Selection */}
      {!selectedCategory && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(searchTerm ? [...new Set(filteredServices.map(s => s.category))] : categories).map((category) => {
            const Icon = categoryIcons[category] || categoryIcons.default;
            return (
              <Card
                key={category}
                className={cn(
                  "group relative overflow-hidden cursor-pointer transition-all duration-300",
                  "hover:shadow-xl hover:scale-105 hover:border-primary",
                  "p-8 bg-gradient-to-br from-card to-card/50"
                )}
                onClick={() => handleCategorySelect(category)}
              >
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                    {category}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {getSubcategories(category).length} services available
                  </p>
                </div>
                <ArrowRight className="absolute bottom-4 right-4 w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Card>
            );
          })}
        </div>
      )}

      {/* Subcategory Selection */}
      {selectedCategory && !selectedSubcategory && (
        <div className="space-y-6">
          <Button variant="outline" onClick={handleBack} className="mb-4">
            ← Back to Categories
          </Button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subcategories.map((subcategory) => (
              <Card
                key={subcategory}
                className={cn(
                  "group cursor-pointer transition-all duration-200",
                  "hover:shadow-lg hover:border-primary",
                  "p-6"
                )}
                onClick={() => handleSubcategorySelect(subcategory)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {subcategory}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {getMicroServices(selectedCategory, subcategory).length} options
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Micro Service Selection */}
      {selectedCategory && selectedSubcategory && (
        <div className="space-y-6">
          <Button variant="outline" onClick={handleBack} className="mb-4">
            ← Back to {selectedCategory}
          </Button>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {microServices.map((service) => (
              <Card
                key={service.id}
                className={cn(
                  "group cursor-pointer transition-all duration-200",
                  "hover:shadow-xl hover:scale-105 hover:border-primary",
                  "p-6 bg-gradient-to-br from-card to-card/50",
                  selectedMicro === service.micro && "border-primary shadow-lg scale-105"
                )}
                onClick={() => handleMicroSelect(service.micro, service.id)}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {service.micro}
                    </h4>
                    {selectedMicro === service.micro && (
                      <Badge variant="default" className="animate-pulse">Selected</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    Professional {service.micro.toLowerCase()} service
                  </p>
                </div>
                <ArrowRight className="mt-4 w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualCategoryStep;
