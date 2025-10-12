import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_emoji: string | null;
  category_group: string | null;
  is_featured: boolean;
  is_active: boolean;
}

interface CategorySelectorProps {
  selectedCategory?: string;
  onSelect: (categorySlug: string) => void;
  filterGroups?: string[]; // Optional: filter by category_group
  className?: string;
}

const GROUP_LABELS: Record<string, string> = {
  'PROFESSIONAL_SERVICES': 'Professional Services',
  'STRUCTURAL': 'Core Construction',
  'MEP': 'Mechanical & Electrical',
  'FINISHES': 'Interior Finishes',
  'EXTERIOR': 'Exterior & Landscaping',
  'SERVICES': 'Maintenance & Services'
};

const GROUP_ORDER = [
  'PROFESSIONAL_SERVICES',
  'STRUCTURAL',
  'MEP',
  'FINISHES',
  'EXTERIOR',
  'SERVICES'
];

export const CategorySelector = ({ 
  selectedCategory, 
  onSelect,
  filterGroups,
  className 
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

  // Group categories by category_group
  const grouped = categories.reduce((acc, cat) => {
    const group = cat.category_group || 'OTHER';
    if (!acc[group]) acc[group] = [];
    acc[group].push(cat);
    return acc;
  }, {} as Record<string, Category[]>);

  // Sort groups by predefined order
  const sortedGroups = GROUP_ORDER.filter(group => grouped[group]);
  const otherGroups = Object.keys(grouped).filter(g => !GROUP_ORDER.includes(g));
  const allGroups = [...sortedGroups, ...otherGroups];

  return (
    <div className={cn("space-y-8", className)}>
      {allGroups.map((group) => (
        <div key={group} className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              {GROUP_LABELS[group] || group}
            </h2>
            <Badge variant="outline" className="text-xs">
              {grouped[group].length}
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {grouped[group].map((category) => {
              const isSelected = selectedCategory === category.slug;
              
              return (
                <Card
                  key={category.id}
                  className={cn(
                    "cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg",
                    "border-2 p-4",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => onSelect(category.slug)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelect(category.slug);
                    }
                  }}
                  aria-pressed={isSelected}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    {/* Emoji Icon */}
                    {category.icon_emoji && (
                      <div className="text-4xl" role="img" aria-label={category.name}>
                        {category.icon_emoji}
                      </div>
                    )}
                    
                    {/* Category Name */}
                    <span className={cn(
                      "font-medium text-xs leading-tight line-clamp-2",
                      isSelected ? "text-primary" : "text-foreground"
                    )}>
                      {category.name}
                    </span>
                    
                    {/* Featured Badge */}
                    {category.is_featured && (
                      <Badge 
                        variant="secondary" 
                        className="text-[10px] px-1.5 py-0.5"
                      >
                        Popular
                      </Badge>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
