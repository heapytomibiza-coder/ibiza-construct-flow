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
  preselectedCategories?: string[];
}

export function ServiceCategorySelector({ professionalId, onComplete, preselectedCategories }: ServiceCategorySelectorProps) {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedMicroServices, setSelectedMicroServices] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadServicesAndSelections();
  }, [professionalId]);

  const loadServicesAndSelections = async () => {
    try {
      setLoading(true);

      // Load micro services filtered by preselected categories if provided
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

      // Auto-select first category if available
      if (grouped.length > 0 && !selectedCategory) {
        setSelectedCategory(grouped[0].category);
      }

    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
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
      // Deselect all
      subData.microServices.forEach(m => newSelected.delete(m.id));
    } else {
      // Select all
      subData.microServices.forEach(m => newSelected.add(m.id));
    }

    setSelectedMicroServices(newSelected);
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

  const getSelectedCountForCategory = (category: string) => {
    const categoryData = categories.find(c => c.category === category);
    if (!categoryData) return 0;
    
    let count = 0;
    categoryData.subcategories.forEach(sub => {
      sub.microServices.forEach(micro => {
        if (selectedMicroServices.has(micro.id)) count++;
      });
    });
    return count;
  };

  const getSelectedCountForSubcategory = (category: string, subcategory: string) => {
    const categoryData = categories.find(c => c.category === category);
    const subData = categoryData?.subcategories.find(s => s.subcategory === subcategory);
    if (!subData) return 0;
    
    return subData.microServices.filter(m => selectedMicroServices.has(m.id)).length;
  };

  const isSubcategoryFullySelected = (category: string, subcategory: string) => {
    const categoryData = categories.find(c => c.category === category);
    const subData = categoryData?.subcategories.find(s => s.subcategory === subcategory);
    if (!subData || subData.microServices.length === 0) return false;
    
    return subData.microServices.every(m => selectedMicroServices.has(m.id));
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
        <h2 className="text-2xl font-bold mb-2">Select Your Specific Services</h2>
        <p className="text-muted-foreground">
          Choose categories, subcategories, and specific services you want to offer. 
          Select individual services for precise control.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Panel 1: Main Categories */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Categories</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {categories.map((cat) => {
                const selectedCount = getSelectedCountForCategory(cat.category);
                return (
                  <button
                    key={cat.category}
                    onClick={() => {
                      setSelectedCategory(cat.category);
                      setSelectedSubcategory(null);
                    }}
                    className={cn(
                      "w-full p-3 text-left border-b transition-colors hover:bg-accent/50",
                      selectedCategory === cat.category && "bg-accent"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{cat.category}</div>
                        <div className="text-xs text-muted-foreground">
                          {cat.subcategories.length} subs
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {selectedCount > 0 && (
                          <Badge variant="secondary" className="text-xs">{selectedCount}</Badge>
                        )}
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Panel 2: Subcategories */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {selectedCategory ? `Subcategories` : 'Select a Category'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedCategory ? (
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-2">
                  {categories
                    .find(c => c.category === selectedCategory)
                    ?.subcategories.map((sub) => {
                      const selectedCount = getSelectedCountForSubcategory(selectedCategory, sub.subcategory);
                      const isFullySelected = isSubcategoryFullySelected(selectedCategory, sub.subcategory);
                      return (
                        <div
                          key={sub.subcategory}
                          className={cn(
                            "p-3 border rounded-lg transition-all cursor-pointer hover:border-primary",
                            selectedSubcategory === sub.subcategory && "border-primary bg-accent/50",
                            selectedCount > 0 && "bg-primary/5"
                          )}
                          onClick={() => setSelectedSubcategory(sub.subcategory)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm flex items-center gap-2">
                                {sub.subcategory}
                                {isFullySelected && <Check className="h-3 w-3 text-primary" />}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {sub.microServices.length} services
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {selectedCount > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {selectedCount}/{sub.microServices.length}
                                </Badge>
                              )}
                              <ChevronRight className="h-3 w-3 text-muted-foreground" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </ScrollArea>
            ) : (
              <div className="h-[500px] flex items-center justify-center text-muted-foreground text-sm">
                Select a category
              </div>
            )}
          </CardContent>
        </Card>

        {/* Panel 3: Micro Services */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {selectedSubcategory ? 'Services' : 'Select a Subcategory'}
            </CardTitle>
            {selectedCategory && selectedSubcategory && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleAllInSubcategory(selectedCategory, selectedSubcategory)}
                className="mt-2"
              >
                {isSubcategoryFullySelected(selectedCategory, selectedSubcategory) 
                  ? 'Deselect All' 
                  : 'Select All'}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {selectedCategory && selectedSubcategory ? (
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-2">
                  {categories
                    .find(c => c.category === selectedCategory)
                    ?.subcategories.find(s => s.subcategory === selectedSubcategory)
                    ?.microServices.map((micro) => {
                      const isSelected = selectedMicroServices.has(micro.id);
                      return (
                        <div
                          key={micro.id}
                          className={cn(
                            "p-3 border rounded-lg transition-all cursor-pointer hover:border-primary",
                            isSelected && "border-primary bg-primary/5"
                          )}
                          onClick={() => toggleMicroService(micro.id)}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleMicroService(micro.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium flex items-center gap-2">
                                {micro.micro}
                                {isSelected && (
                                  <Check className="h-3 w-3 text-primary" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </ScrollArea>
            ) : (
              <div className="h-[500px] flex items-center justify-center text-muted-foreground text-sm">
                Select a subcategory to see services
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary and Save */}
      <Card className="lg:col-span-5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Your Selections</div>
              <div className="text-2xl font-bold">
                {selectedMicroServices.size} services selected
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
                <>Continue</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
