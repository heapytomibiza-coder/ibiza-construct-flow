import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

interface CategoryPillNavProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

interface ServiceCategory {
  id: string;
  name: string;
  name_es: string | null;
  slug: string;
  icon_emoji: string;
  category_group: string;
  is_featured: boolean;
}

export const CategoryPillNav: React.FC<CategoryPillNavProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const { t, i18n } = useTranslation('common');
  const isSpanish = i18n.language?.startsWith('es');

  // Fetch categories from database
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['service-categories-nav'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_categories')
        .select('id, name, name_es, slug, icon_emoji, category_group, is_featured')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return (data || []) as ServiceCategory[];
    }
  });

  // Get localized category name
  const getLocalizedName = (category: ServiceCategory) => {
    return isSpanish && category.name_es ? category.name_es : category.name;
  };

  // Group categories
  const mainServices = categories.filter(c => 
    ['STRUCTURAL', 'MEP', 'FINISHES', 'EXTERIOR'].includes(c.category_group)
  );
  
  const specialistServices = categories.filter(c => 
    ['PROFESSIONAL', 'SERVICES'].includes(c.category_group)
  );

  const renderCategoryPill = (category: ServiceCategory) => {
    const isSelected = selectedCategory === category.name;

    return (
      <Badge
        key={category.id}
        variant={isSelected ? 'default' : 'outline'}
        className={cn(
          'cursor-pointer transition-all px-3 py-2 text-sm font-medium',
          'hover:scale-105 hover:shadow-md',
          isSelected 
            ? 'bg-primary text-primary-foreground border-primary' 
            : 'hover:bg-primary/10 hover:border-primary/50'
        )}
        onClick={() => onSelectCategory(isSelected ? null : category.name)}
      >
        <span className="text-base mr-1.5">{category.icon_emoji}</span>
        {getLocalizedName(category)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        <div className="flex flex-wrap gap-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-9 w-32 bg-muted animate-pulse rounded-full" />
          ))}
        </div>
      </div>
    );
  }

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
          {t('allCategories', 'All Categories')}
        </Badge>
      </div>

      {/* Main Services */}
      {mainServices.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {t('mainServices', 'Main Services')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {mainServices.map(renderCategoryPill)}
          </div>
        </div>
      )}

      {/* Specialist Services */}
      {specialistServices.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {t('specialistServices', 'Specialist Services')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {specialistServices.map(renderCategoryPill)}
          </div>
        </div>
      )}
    </div>
  );
};
