import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, ChevronRight, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SubcategoryGroup {
  subcategory: string;
  microServices: Array<{
    id: string;
    micro: string;
  }>;
}

interface CategoryData {
  category: string;
  subcategories: SubcategoryGroup[];
}

interface ServiceCategorySelectorProps {
  professionalId: string;
  onComplete?: () => void;
}

export function ServiceCategorySelector({ professionalId, onComplete }: ServiceCategorySelectorProps) {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategories, setSelectedSubcategories] = useState<Set<string>>(new Set());
  const [selectedMicroServices, setSelectedMicroServices] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadServicesAndSelections();
  }, [professionalId]);

  const loadServicesAndSelections = async () => {
    try {
      setLoading(true);

      // Load all micro services grouped by category and subcategory
      const { data: microServices, error: servicesError } = await supabase
        .from('services_micro')
        .select('id, category, subcategory, micro')
        .eq('is_active', true)
        .order('category')
        .order('subcategory')
        .order('micro');

      if (servicesError) throw servicesError;

      // Load existing professional services
      const { data: existingServices, error: existingError } = await supabase
        .from('professional_services')
        .select('micro_service_id')
        .eq('professional_id', professionalId)
        .eq('is_active', true);

      if (existingError) throw existingError;

      // Group services by category and subcategory
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

      // Set existing selections
      const existingIds = new Set(existingServices?.map(s => s.micro_service_id) || []);
      setSelectedMicroServices(existingIds);

      // Determine selected subcategories (if all micro services in a subcategory are selected)
      const selectedSubs = new Set<string>();
      grouped.forEach(cat => {
        cat.subcategories.forEach(sub => {
          const allSelected = sub.microServices.every(m => existingIds.has(m.id));
          if (allSelected && sub.microServices.length > 0) {
            selectedSubs.add(`${cat.category}:${sub.subcategory}`);
          }
        });
      });
      setSelectedSubcategories(selectedSubs);

    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const toggleSubcategory = (category: string, subcategory: string) => {
    const key = `${category}:${subcategory}`;
    const newSelected = new Set(selectedSubcategories);
    
    const categoryData = categories.find(c => c.category === category);
    const subData = categoryData?.subcategories.find(s => s.subcategory === subcategory);
    
    if (!subData) return;

    const newMicroServices = new Set(selectedMicroServices);

    if (newSelected.has(key)) {
      // Deselect all micro services in this subcategory
      newSelected.delete(key);
      subData.microServices.forEach(m => newMicroServices.delete(m.id));
    } else {
      // Select all micro services in this subcategory
      newSelected.add(key);
      subData.microServices.forEach(m => newMicroServices.add(m.id));
    }

    setSelectedSubcategories(newSelected);
    setSelectedMicroServices(newMicroServices);
  };

  const saveSelections = async () => {
    try {
      setSaving(true);

      // First, deactivate all existing services
      const { error: deactivateError } = await supabase
        .from('professional_services')
        .update({ is_active: false })
        .eq('professional_id', professionalId);

      if (deactivateError) throw deactivateError;

      // Insert or reactivate selected services
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

      toast.success(`${selectedMicroServices.size} services selected successfully`);
      onComplete?.();
    } catch (error) {
      console.error('Error saving services:', error);
      toast.error('Failed to save service selections');
    } finally {
      setSaving(false);
    }
  };

  const getSelectedCount = (category: string) => {
    const categoryData = categories.find(c => c.category === category);
    if (!categoryData) return 0;
    
    return categoryData.subcategories.filter(
      sub => selectedSubcategories.has(`${category}:${sub.subcategory}`)
    ).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Select Your Services</h2>
        <p className="text-muted-foreground">
          Choose a main category, then tick the specific subcategories you want to work on.
          This helps us match you with the right jobs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Main Categories</CardTitle>
            <CardDescription>Select a category to see subcategories</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {categories.map((cat) => {
                const selectedCount = getSelectedCount(cat.category);
                return (
                  <button
                    key={cat.category}
                    onClick={() => setSelectedCategory(cat.category)}
                    className={cn(
                      "w-full p-4 text-left border-b transition-colors hover:bg-accent/50",
                      selectedCategory === cat.category && "bg-accent"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{cat.category}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {cat.subcategories.length} subcategories
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedCount > 0 && (
                          <Badge variant="secondary">{selectedCount}</Badge>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Subcategories */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedCategory ? `${selectedCategory} - Subcategories` : 'Select a Category'}
            </CardTitle>
            <CardDescription>
              Tick all the subcategories you want to work on
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedCategory ? (
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {categories
                    .find(c => c.category === selectedCategory)
                    ?.subcategories.map((sub) => {
                      const isSelected = selectedSubcategories.has(
                        `${selectedCategory}:${sub.subcategory}`
                      );
                      return (
                        <div
                          key={sub.subcategory}
                          className={cn(
                            "p-4 border rounded-lg transition-all cursor-pointer hover:border-primary",
                            isSelected && "border-primary bg-primary/5"
                          )}
                          onClick={() => toggleSubcategory(selectedCategory, sub.subcategory)}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleSubcategory(selectedCategory, sub.subcategory)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-1">
                              <div className="font-medium flex items-center gap-2">
                                {sub.subcategory}
                                {isSelected && (
                                  <Check className="h-4 w-4 text-primary" />
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                Includes {sub.microServices.length} specific service{sub.microServices.length !== 1 ? 's' : ''}
                              </div>
                              {isSelected && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {sub.microServices.map(micro => (
                                    <Badge key={micro.id} variant="outline" className="text-xs">
                                      {micro.micro}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </ScrollArea>
            ) : (
              <div className="h-[500px] flex items-center justify-center text-muted-foreground">
                Select a main category to see available subcategories
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary and Save */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Your Selections</div>
              <div className="text-2xl font-bold">
                {selectedSubcategories.size} subcategories
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({selectedMicroServices.size} total services)
                </span>
              </div>
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
                <>Save Services</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
