import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, HardHat, Droplet, Zap, Hammer, Wrench, Paintbrush, Square, Layers, Home, Leaf, Waves, Wind, Ruler, Building2, DoorOpen, Bath, Building, FileText, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Icon mapping for dynamic icon rendering
const ICON_MAP: Record<string, LucideIcon> = {
  HardHat, Droplet, Zap, Hammer, Wrench, Paintbrush, Square, Layers, Home, Leaf, 
  Waves, Wind, Ruler, Building2, DoorOpen, Bath, Building, FileText
};

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
        <p className="text-destructive">Failed to load categories</p>
        <p className="text-sm text-muted-foreground mt-2">
          Please try again or contact support
        </p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No categories available</p>
      </div>
    );
  }

  return (
    <div className={cn("max-w-6xl mx-auto", className)}>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5">
        {categories.map((category) => {
          const isSelected = selectedCategory === category.slug;
          const IconComponent = category.icon_name ? ICON_MAP[category.icon_name] : null;
          
          return (
            <Card
              key={category.id}
              className={cn(
                "cursor-pointer transition-all hover:scale-[1.01] hover:shadow-lg",
                "border-2 p-5",
                isSelected
                  ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => {
                onSelect(category.slug, category.id);
                if (onNext) {
                  setTimeout(() => onNext(), 400);
                }
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(category.slug, category.id);
                  if (onNext) {
                    setTimeout(() => onNext(), 400);
                  }
                }
              }}
              aria-pressed={isSelected}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                {IconComponent && (
                  <div className={cn(
                    "flex-shrink-0 p-3.5 rounded-xl",
                    isSelected 
                      ? "bg-primary/10 text-primary" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    <IconComponent className="h-9 w-9" />
                  </div>
                )}
                
                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  {/* Category Name */}
                  <h3 className={cn(
                    "font-semibold text-lg leading-tight",
                    isSelected ? "text-primary" : "text-foreground"
                  )}>
                    {category.name}
                  </h3>
                  
                  {/* Examples */}
                  {category.examples && category.examples.length > 0 && (
                    <div className="space-y-0.5">
                      {category.examples.slice(0, 3).map((example, idx) => (
                        <p key={idx} className="text-xs text-muted-foreground/80 leading-relaxed">
                          {example}
                        </p>
                      ))}
                    </div>
                  )}
                  
                  {/* Featured Badge */}
                  {category.is_featured && (
                    <Badge 
                      variant="secondary" 
                      className="text-[10px] px-2 py-0.5 mt-2"
                    >
                      Popular
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
