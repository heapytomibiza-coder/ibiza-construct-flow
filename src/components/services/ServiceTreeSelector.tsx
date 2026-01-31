import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Loader2, ChevronDown, ChevronRight, Check, Minus, Search, Star } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { markProfessionalOnboardingComplete } from '@/lib/onboarding/markProfessionalOnboardingComplete';

interface MicroService {
  id: string;
  micro: string;
}

interface SubcategoryGroup {
  subcategory: string;
  microServices: MicroService[];
}

interface CategoryData {
  category: string;
  subcategories: SubcategoryGroup[];
}

interface ServiceTreeSelectorProps {
  professionalId: string;
  preselectedCategories?: string[];
  onSelectionChange?: (selections: Set<string>) => void;
  onComplete?: () => void;
}

export function ServiceTreeSelector({ 
  professionalId, 
  preselectedCategories,
  onSelectionChange,
  onComplete 
}: ServiceTreeSelectorProps) {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());
  const [selectedMicroServices, setSelectedMicroServices] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const popularServices = useMemo(() => new Set([
    'Burst Pipe Repair', 'Emergency Leak Detection', 'Socket Installation',
    'Lighting Installation', 'General Repairs', 'Furniture Assembly',
    'Wall Painting', 'Ceiling Painting', 'Floor Tiling', 'Wall Tiling'
  ]), []);

  useEffect(() => {
    loadServicesAndSelections();
  }, [professionalId]);

  useEffect(() => {
    onSelectionChange?.(selectedMicroServices);
  }, [selectedMicroServices]);

  const loadServicesAndSelections = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('services_micro')
        .select('id, category, subcategory, micro')
        .eq('is_active', true);
      
      if (preselectedCategories && preselectedCategories.length > 0) {
        query = query.in('category', preselectedCategories);
      }
      
      const { data: microServices, error: servicesError } = await query
        .order('category')
        .order('subcategory')
        .order('micro');

      if (servicesError) throw servicesError;

      const { data: existingServices, error: existingError } = await supabase
        .from('professional_services')
        .select('micro_service_id')
        .eq('professional_id', professionalId)
        .eq('is_active', true);

      if (existingError) throw existingError;

      const grouped = microServices?.reduce((acc, service) => {
        let category = acc.find(c => c.category === service.category);
        if (!category) {
          category = { category: service.category, subcategories: [] };
          acc.push(category);
        }

        let subcategoryGroup = category.subcategories.find(s => s.subcategory === service.subcategory);
        if (!subcategoryGroup) {
          subcategoryGroup = { subcategory: service.subcategory, microServices: [] };
          category.subcategories.push(subcategoryGroup);
        }

        subcategoryGroup.microServices.push({
          id: service.id,
          micro: service.micro
        });

        return acc;
      }, [] as CategoryData[]) || [];

      setCategories(grouped);

      const existingIds = new Set(existingServices?.map(s => s.micro_service_id) || []);
      setSelectedMicroServices(existingIds);

      // Auto-expand categories with preselected services
      const categoriesToExpand = new Set<string>();
      grouped.forEach(cat => {
        const hasSelected = cat.subcategories.some(sub => 
          sub.microServices.some(m => existingIds.has(m.id))
        );
        if (hasSelected || (preselectedCategories && preselectedCategories.includes(cat.category))) {
          categoriesToExpand.add(cat.category);
        }
      });
      setExpandedCategories(categoriesToExpand);

    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleSubcategory = (subcategory: string) => {
    const newExpanded = new Set(expandedSubcategories);
    if (newExpanded.has(subcategory)) {
      newExpanded.delete(subcategory);
    } else {
      newExpanded.add(subcategory);
    }
    setExpandedSubcategories(newExpanded);
  };

  const toggleMicroService = (microServiceId: string) => {
    const newSelected = new Set(selectedMicroServices);
    if (newSelected.has(microServiceId)) {
      newSelected.delete(microServiceId);
    } else {
      newSelected.add(microServiceId);
    }
    setSelectedMicroServices(newSelected);
  };

  const toggleAllInSubcategory = (category: string, subcategory: string) => {
    const categoryData = categories.find(c => c.category === category);
    const subData = categoryData?.subcategories.find(s => s.subcategory === subcategory);
    if (!subData) return;

    const allSelected = subData.microServices.every(m => selectedMicroServices.has(m.id));
    const newSelected = new Set(selectedMicroServices);

    if (allSelected) {
      subData.microServices.forEach(m => newSelected.delete(m.id));
    } else {
      subData.microServices.forEach(m => newSelected.add(m.id));
    }

    setSelectedMicroServices(newSelected);
  };

  const getSelectedCountForCategory = (category: string) => {
    const categoryData = categories.find(c => c.category === category);
    if (!categoryData) return { selected: 0, total: 0 };
    
    let selected = 0;
    let total = 0;
    categoryData.subcategories.forEach(sub => {
      sub.microServices.forEach(micro => {
        total++;
        if (selectedMicroServices.has(micro.id)) selected++;
      });
    });
    return { selected, total };
  };

  const getSelectedCountForSubcategory = (category: string, subcategory: string) => {
    const categoryData = categories.find(c => c.category === category);
    const subData = categoryData?.subcategories.find(s => s.subcategory === subcategory);
    if (!subData) return { selected: 0, total: 0 };
    
    const selected = subData.microServices.filter(m => selectedMicroServices.has(m.id)).length;
    const total = subData.microServices.length;
    return { selected, total };
  };

  const isSubcategoryFullySelected = (category: string, subcategory: string) => {
    const { selected, total } = getSelectedCountForSubcategory(category, subcategory);
    return total > 0 && selected === total;
  };

  const isSubcategoryPartiallySelected = (category: string, subcategory: string) => {
    const { selected, total } = getSelectedCountForSubcategory(category, subcategory);
    return selected > 0 && selected < total;
  };

  const saveSelections = async () => {
    try {
      setSaving(true);

      const { error: deactivateError } = await supabase
        .from('professional_services')
        .update({ is_active: false })
        .eq('professional_id', professionalId);

      if (deactivateError) throw deactivateError;

      const servicesToInsert = Array.from(selectedMicroServices).map(microServiceId => ({
        professional_id: professionalId,
        micro_service_id: microServiceId,
        is_active: true
      }));

      if (servicesToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('professional_services')
          .upsert(servicesToInsert, {
            onConflict: 'professional_id,micro_service_id',
            ignoreDuplicates: false
          });

        if (insertError) throw insertError;
      }

      // Mark onboarding as complete using centralized helper
      // This verifies DB state (at least 1 active service) before marking complete
      await markProfessionalOnboardingComplete(professionalId);

      toast.success(`${selectedMicroServices.size} services selected successfully`);
      onComplete?.();
    } catch (error) {
      console.error('Error saving services:', error);
      toast.error('Failed to save service selections');
    } finally {
      setSaving(false);
    }
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    
    const query = searchQuery.toLowerCase();
    return categories.map(cat => ({
      ...cat,
      subcategories: cat.subcategories.map(sub => ({
        ...sub,
        microServices: sub.microServices.filter(m => 
          m.micro.toLowerCase().includes(query) ||
          sub.subcategory.toLowerCase().includes(query) ||
          cat.category.toLowerCase().includes(query)
        )
      })).filter(sub => sub.microServices.length > 0)
    })).filter(cat => cat.subcategories.length > 0);
  }, [categories, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">📋 Build Your Service Menu</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Select exactly what you do. More precision = better matches and higher earnings!
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search for a service..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tree View */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Your Service Menu</CardTitle>
            <Badge variant="secondary" className="text-sm">
              {selectedMicroServices.size} selected
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-2">
              {filteredCategories.map((category) => {
                const isExpanded = expandedCategories.has(category.category);
                const counts = getSelectedCountForCategory(category.category);

                return (
                  <Collapsible
                    key={category.category}
                    open={isExpanded}
                    onOpenChange={() => toggleCategory(category.category)}
                  >
                    <div className="border rounded-lg overflow-hidden">
                      <CollapsibleTrigger asChild>
                        <button className="w-full p-3 hover:bg-accent/50 transition-colors flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="font-semibold">{category.category}</span>
                          </div>
                          <Badge 
                            variant={counts.selected > 0 ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {counts.selected}/{counts.total}
                          </Badge>
                        </button>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="border-t bg-accent/20 p-2 space-y-1">
                          {category.subcategories.map((sub) => {
                            const subExpanded = expandedSubcategories.has(sub.subcategory);
                            const subCounts = getSelectedCountForSubcategory(category.category, sub.subcategory);
                            const isFullySelected = isSubcategoryFullySelected(category.category, sub.subcategory);
                            const isPartiallySelected = isSubcategoryPartiallySelected(category.category, sub.subcategory);

                            return (
                              <Collapsible
                                key={sub.subcategory}
                                open={subExpanded}
                                onOpenChange={() => toggleSubcategory(sub.subcategory)}
                              >
                                <div className="border rounded-md overflow-hidden bg-background">
                                  <div className="flex items-center">
                                    <CollapsibleTrigger asChild>
                                      <button className="flex-1 p-2 hover:bg-accent/50 transition-colors flex items-center gap-2 text-left">
                                        {subExpanded ? (
                                          <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
                                        ) : (
                                          <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                                        )}
                                        <span className="text-sm font-medium flex-1">{sub.subcategory}</span>
                                        <div className="flex items-center gap-2">
                                          {isFullySelected && <Check className="h-3 w-3 text-primary" />}
                                          {isPartiallySelected && <Minus className="h-3 w-3 text-primary" />}
                                          <Badge variant="outline" className="text-xs">
                                            {subCounts.selected}/{subCounts.total}
                                          </Badge>
                                        </div>
                                      </button>
                                    </CollapsibleTrigger>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleAllInSubcategory(category.category, sub.subcategory)}
                                      className="h-8 px-2 text-xs mr-1"
                                    >
                                      {isFullySelected ? 'Deselect' : 'Select All'}
                                    </Button>
                                  </div>

                                  <CollapsibleContent>
                                    <div className="border-t bg-accent/10 p-2 space-y-1">
                                      {sub.microServices.map((micro) => {
                                        const isSelected = selectedMicroServices.has(micro.id);
                                        const isPopular = popularServices.has(micro.micro);

                                        return (
                                          <div
                                            key={micro.id}
                                            onClick={() => toggleMicroService(micro.id)}
                                            className={cn(
                                              "flex items-center gap-2 p-2 rounded cursor-pointer transition-colors",
                                              "hover:bg-accent",
                                              isSelected && "bg-primary/5"
                                            )}
                                          >
                                            <Checkbox
                                              checked={isSelected}
                                              onCheckedChange={() => toggleMicroService(micro.id)}
                                              onClick={(e) => e.stopPropagation()}
                                            />
                                            <span className="text-sm flex-1">{micro.micro}</span>
                                            {isPopular && (
                                              <Star className="h-3 w-3 text-primary fill-primary" />
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </CollapsibleContent>
                                </div>
                              </Collapsible>
                            );
                          })}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Summary and Action */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Your Selections</div>
              <div className="text-2xl font-bold">
                {selectedMicroServices.size} services selected
              </div>
              {selectedMicroServices.size > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  {selectedMicroServices.size >= 30 ? '🎉 Excellent coverage!' : 
                   selectedMicroServices.size >= 15 ? '✅ Good selection' : 
                   '💡 Select more for better matches'}
                </div>
              )}
            </div>
            <Button
              onClick={saveSelections}
              disabled={saving || selectedMicroServices.size === 0}
              size="lg"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}