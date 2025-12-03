import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCategoryIcon } from '@/lib/categoryIcons';
import { useTranslation } from 'react-i18next';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_emoji: string | null;
  icon_name: string | null;
  examples: string[] | null;
  category_group: string | null;
  is_featured: boolean;
  is_active: boolean;
}

interface CategorySelectorProps {
  selectedCategory?: string;
  onSelect: (categorySlug: string, categoryId: string) => void;
  filterGroups?: string[]; // Optional: filter by category_group
  className?: string;
  onNext?: () => void; // Optional: auto-advance after selection
}


export const CategorySelector = ({ 
  selectedCategory, 
  onSelect,
  filterGroups,
  className,
  onNext
}: CategorySelectorProps) => {
  const { t } = useTranslation('wizard');
  const { data: categories = [], isLoading, error } = useQuery<Category[]>({
    queryKey: ['service-categories', filterGroups],
    queryFn: async () => {
      // Build query with proper filtering
      const baseQuery: any = supabase
        .from('service_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      // Execute query with or without filter
      const result = filterGroups && filterGroups.length > 0
        ? await baseQuery.in('category_group', filterGroups)
        : await baseQuery;
      
      const { data, error } = result;
      
      if (error) throw error;
      
      // Map to typed interface
      return ((data || []) as any[]).map(row => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        icon_emoji: row.icon_emoji,
        icon_name: row.icon_name,
        examples: row.examples,
        category_group: row.category_group,
        is_featured: row.is_featured,
        is_active: row.is_active
      }));
    },
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{t('category.failedLoad')}</p>
        <p className="text-sm text-muted-foreground mt-2">
          {t('category.tryAgain')}
        </p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t('category.noCategories')}</p>
      </div>
    );
  }

  return (
    <div className={cn("max-w-5xl mx-auto", className)}>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {categories.map((category) => {
          const isSelected = selectedCategory === category.slug;
          const IconComponent = category.icon_name ? getCategoryIcon(category.icon_name) : null;
          const examples = category.examples?.slice(0, 3) || [];
          
          return (
            <button
              key={category.id}
              className={cn(
                "flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border-2 transition-all",
                "hover:shadow-md active:scale-[0.98] bg-card min-h-[120px]",
                isSelected
                  ? "border-primary shadow-sm"
                  : "border-border hover:border-primary/30"
              )}
              onClick={() => {
                onSelect(category.slug, category.id);
                if (onNext) {
                  setTimeout(() => onNext(), 200);
                }
              }}
              aria-pressed={isSelected}
            >
              {/* Icon */}
              {IconComponent && (
                <div className="w-10 h-10 flex items-center justify-center">
                  <IconComponent className={cn(
                    "w-7 h-7",
                    isSelected ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
              )}
              
              {/* Category Name */}
              <span className={cn(
                "text-sm font-medium text-center leading-tight",
                isSelected ? "text-primary" : "text-foreground"
              )}>
                {category.name}
              </span>
              
              {/* Examples */}
              {examples.length > 0 && (
                <span className="text-xs text-muted-foreground text-center leading-tight px-2">
                  {examples.join(' • ')}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
