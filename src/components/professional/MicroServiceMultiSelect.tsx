/**
 * Micro-Service Multi-Select Component
 * Checkbox grid for selecting multiple micro-services within subcategories
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ChevronDown, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { ServiceSelection } from '@/hooks/useProfessionalServicePreferences';

interface MicroService {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

interface SubcategoryWithMicros {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  microServices: MicroService[];
}

interface MicroServiceMultiSelectProps {
  selectedCategoryIds: string[];
  selectedSubcategoryIds: string[];
  categoryMap: Record<string, { id: string; name: string }>;
  subcategoryMap: Record<string, { id: string; name: string; categoryId: string }>;
  selectedMicroServiceIds: Set<string>;
  onToggleMicroService: (selection: ServiceSelection) => void;
  onToggleAllInSubcategory: (
    subcategoryId: string,
    subcategoryName: string,
    categoryId: string,
    categoryName: string,
    microServices: Array<{ id: string; name: string }>
  ) => void;
}

export const MicroServiceMultiSelect = ({
  selectedCategoryIds,
  selectedSubcategoryIds,
  categoryMap,
  subcategoryMap,
  selectedMicroServiceIds,
  onToggleMicroService,
  onToggleAllInSubcategory
}: MicroServiceMultiSelectProps) => {
  const [subcategoriesWithMicros, setSubcategoriesWithMicros] = useState<SubcategoryWithMicros[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());

  // Fetch micro-services for selected subcategories
  useEffect(() => {
    const fetchMicroServices = async () => {
      if (selectedSubcategoryIds.length === 0) {
        setSubcategoriesWithMicros([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // First get subcategory details
        const { data: subcatData, error: subcatError } = await supabase
          .from('service_subcategories')
          .select('id, name, category_id')
          .in('id', selectedSubcategoryIds);

        if (subcatError) throw subcatError;

        // Then get micro-services for each subcategory
        const { data: microData, error: microError } = await supabase
          .from('service_micro_categories')
          .select('id, name, slug, subcategory_id, description')
          .in('subcategory_id', selectedSubcategoryIds)
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (microError) throw microError;

        // Group micro-services by subcategory
        const grouped: SubcategoryWithMicros[] = (subcatData || []).map(subcat => {
          const category = categoryMap[subcat.category_id] || { id: subcat.category_id, name: 'Unknown' };
          return {
            id: subcat.id,
            name: subcat.name,
            categoryId: category.id,
            categoryName: category.name,
            microServices: (microData || [])
              .filter(m => m.subcategory_id === subcat.id)
              .map(m => ({
                id: m.id,
                name: m.name,
                slug: m.slug,
                description: m.description
              }))
          };
        }).filter(g => g.microServices.length > 0);

        setSubcategoriesWithMicros(grouped);
        
        // Auto-expand all subcategories
        setExpandedSubcategories(new Set(grouped.map(g => g.id)));
      } catch (error) {
        console.error('Error fetching micro-services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMicroServices();
  }, [selectedSubcategoryIds, categoryMap]);

  const toggleExpanded = (subcatId: string) => {
    setExpandedSubcategories(prev => {
      const next = new Set(prev);
      if (next.has(subcatId)) {
        next.delete(subcatId);
      } else {
        next.add(subcatId);
      }
      return next;
    });
  };

  const getSubcategorySelectionStatus = (subcat: SubcategoryWithMicros) => {
    const totalMicros = subcat.microServices.length;
    const selectedCount = subcat.microServices.filter(m => selectedMicroServiceIds.has(m.id)).length;
    
    if (selectedCount === 0) return 'none';
    if (selectedCount === totalMicros) return 'all';
    return 'partial';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (subcategoriesWithMicros.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Select subcategories first to see available services</p>
      </div>
    );
  }

  const totalSelected = selectedMicroServiceIds.size;

  return (
    <div className="space-y-4">
      {/* Selection summary */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <span className="text-sm font-medium">
          {totalSelected} service{totalSelected !== 1 ? 's' : ''} selected
        </span>
        <Badge variant={totalSelected > 0 ? "default" : "secondary"}>
          {totalSelected > 0 ? 'Ready to save' : 'Select services below'}
        </Badge>
      </div>

      {/* Subcategory accordions with micro-service checkboxes */}
      <div className="space-y-3">
        {subcategoriesWithMicros.map((subcat) => {
          const isExpanded = expandedSubcategories.has(subcat.id);
          const selectionStatus = getSubcategorySelectionStatus(subcat);
          const selectedInSubcat = subcat.microServices.filter(m => selectedMicroServiceIds.has(m.id)).length;

          return (
            <Collapsible key={subcat.id} open={isExpanded} onOpenChange={() => toggleExpanded(subcat.id)}>
              <Card className="overflow-hidden">
                <CollapsibleTrigger asChild>
                  <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div className="text-left">
                        <p className="font-medium">{subcat.name}</p>
                        <p className="text-xs text-muted-foreground">{subcat.categoryName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {selectedInSubcat}/{subcat.microServices.length}
                      </Badge>
                      {selectionStatus === 'all' && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </button>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="border-t px-4 pb-4">
                    {/* Select all toggle */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleAllInSubcategory(
                          subcat.id,
                          subcat.name,
                          subcat.categoryId,
                          subcat.categoryName,
                          subcat.microServices
                        );
                      }}
                      className="mt-3 mb-2 text-xs text-primary hover:underline"
                    >
                      {selectionStatus === 'all' ? 'Deselect all' : 'Select all'}
                    </button>

                    {/* Micro-service checkboxes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      {subcat.microServices.map((micro) => {
                        const isSelected = selectedMicroServiceIds.has(micro.id);
                        
                        return (
                          <label
                            key={micro.id}
                            className={cn(
                              "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                              isSelected 
                                ? "border-primary bg-primary/5" 
                                : "border-border hover:border-primary/30"
                            )}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => {
                                onToggleMicroService({
                                  categoryId: subcat.categoryId,
                                  categoryName: subcat.categoryName,
                                  subcategoryId: subcat.id,
                                  subcategoryName: subcat.name,
                                  microServiceId: micro.id,
                                  microServiceName: micro.name
                                });
                              }}
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "text-sm font-medium leading-tight",
                                isSelected && "text-primary"
                              )}>
                                {micro.name}
                              </p>
                              {micro.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {micro.description}
                                </p>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
};
