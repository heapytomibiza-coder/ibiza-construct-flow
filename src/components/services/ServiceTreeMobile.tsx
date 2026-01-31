import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { ChevronRight, ArrowLeft, Check, Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
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

interface ServiceTreeMobileProps {
  professionalId: string;
  preselectedCategories?: string[];
  onComplete?: () => void;
}

type ViewLevel = 'categories' | 'subcategories' | 'microservices';

export function ServiceTreeMobile({ 
  professionalId, 
  preselectedCategories,
  onComplete 
}: ServiceTreeMobileProps) {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [selectedMicroServices, setSelectedMicroServices] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Navigation state
  const [viewLevel, setViewLevel] = useState<ViewLevel>('categories');
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<SubcategoryGroup | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const popularServices = new Set([
    'Burst Pipe Repair', 'Emergency Leak Detection', 'Socket Installation',
    'Lighting Installation', 'General Repairs', 'Furniture Assembly',
    'Wall Painting', 'Ceiling Painting', 'Floor Tiling', 'Wall Tiling'
  ]);

  useEffect(() => {
    loadServicesAndSelections();
  }, [professionalId]);

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

    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category: CategoryData) => {
    setSelectedCategory(category);
    setViewLevel('subcategories');
    setDrawerOpen(true);
  };

  const handleSubcategoryClick = (subcategory: SubcategoryGroup) => {
    setSelectedSubcategory(subcategory);
    setViewLevel('microservices');
  };

  const handleBackClick = () => {
    if (viewLevel === 'microservices') {
      setViewLevel('subcategories');
      setSelectedSubcategory(null);
    } else if (viewLevel === 'subcategories') {
      setViewLevel('categories');
      setSelectedCategory(null);
      setDrawerOpen(false);
    }
  };

  const toggleMicroService = (serviceId: string) => {
    setSelectedMicroServices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId);
      } else {
        newSet.add(serviceId);
      }
      return newSet;
    });
  };

  const getSubcategorySelectionState = (subcategory: SubcategoryGroup): 'all' | 'some' | 'none' => {
    const serviceIds = subcategory.microServices.map(s => s.id);
    const selectedCount = serviceIds.filter(id => selectedMicroServices.has(id)).length;
    
    if (selectedCount === serviceIds.length) return 'all';
    if (selectedCount > 0) return 'some';
    return 'none';
  };

  const toggleSubcategoryAll = (subcategory: SubcategoryGroup) => {
    const serviceIds = subcategory.microServices.map(s => s.id);
    const state = getSubcategorySelectionState(subcategory);
    
    setSelectedMicroServices(prev => {
      const newSet = new Set(prev);
      if (state === 'all') {
        serviceIds.forEach(id => newSet.delete(id));
      } else {
        serviceIds.forEach(id => newSet.add(id));
      }
      return newSet;
    });
  };

  const handleSaveAndContinue = async () => {
    try {
      setSaving(true);

      // 1) Deactivate all existing services (safer than delete - preserves data if upsert fails)
      const { error: deactivateError } = await supabase
        .from('professional_services')
        .update({ is_active: false })
        .eq('professional_id', professionalId);

      if (deactivateError) throw deactivateError;

      // 2) Upsert selected services as active
      if (selectedMicroServices.size > 0) {
        const upsertData = Array.from(selectedMicroServices).map((serviceId) => ({
          professional_id: professionalId,
          micro_service_id: serviceId,
          is_active: true,
        }));

        const { error: upsertError } = await supabase
          .from('professional_services')
          .upsert(upsertData, {
            onConflict: 'professional_id,micro_service_id',
            ignoreDuplicates: false,
          });

        if (upsertError) throw upsertError;
      }

      // 3) Mark onboarding complete based on DB truth (not UI state)
      // This verifies at least 1 active service exists before marking complete
      await markProfessionalOnboardingComplete(professionalId);

      toast.success(`${selectedMicroServices.size} services selected`);
      onComplete?.();
    } catch (error) {
      console.error('Error saving services:', error);
      toast.error('Failed to save services');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Category List View */}
      <div className="space-y-3">
        {categories.map((category) => {
          const totalServices = category.subcategories.reduce(
            (sum, sub) => sum + sub.microServices.length, 
            0
          );
          const selectedCount = category.subcategories.reduce(
            (sum, sub) => sum + sub.microServices.filter(s => selectedMicroServices.has(s.id)).length,
            0
          );

          return (
            <button
              key={category.category}
              onClick={() => handleCategoryClick(category)}
              className="w-full"
            >
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors active:scale-[0.98]">
                <div className="flex-1 text-left">
                  <div className="font-semibold">{category.category}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedCount}/{totalServices} services selected
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 left-0 right-0 px-4 z-50">
        <Button
          onClick={handleSaveAndContinue}
          disabled={saving || selectedMicroServices.size === 0}
          className="w-full h-14 text-lg shadow-lg"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="w-5 h-5 mr-2" />
              Continue ({selectedMicroServices.size} selected)
            </>
          )}
        </Button>
      </div>

      {/* Bottom Sheet Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="border-b">
            {viewLevel !== 'categories' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackClick}
                className="absolute left-4 top-4"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <DrawerTitle className="text-center">
              {viewLevel === 'subcategories' && selectedCategory?.category}
              {viewLevel === 'microservices' && selectedSubcategory?.subcategory}
            </DrawerTitle>
            {viewLevel === 'subcategories' && (
              <DrawerDescription className="text-center">
                Select subcategories
              </DrawerDescription>
            )}
            {viewLevel === 'microservices' && (
              <DrawerDescription className="text-center">
                Select individual services
              </DrawerDescription>
            )}
          </DrawerHeader>

          <ScrollArea className="flex-1 p-4">
            {/* Subcategory View */}
            {viewLevel === 'subcategories' && selectedCategory && (
              <div className="space-y-3 pb-24">
                {selectedCategory.subcategories.map((subcategory) => {
                  const state = getSubcategorySelectionState(subcategory);
                  const selectedCount = subcategory.microServices.filter(
                    s => selectedMicroServices.has(s.id)
                  ).length;

                  return (
                    <div key={subcategory.subcategory} className="border rounded-lg">
                      <button
                        onClick={() => handleSubcategoryClick(subcategory)}
                        className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors rounded-t-lg active:scale-[0.98]"
                      >
                        <div className="flex-1 text-left">
                          <div className="font-medium">{subcategory.subcategory}</div>
                          <div className="text-sm text-muted-foreground">
                            {selectedCount}/{subcategory.microServices.length} services
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {state === 'all' && <Check className="w-5 h-5 text-primary" />}
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </button>
                      <Separator />
                      <div className="p-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleSubcategoryAll(subcategory)}
                          className="w-full"
                        >
                          {state === 'all' ? 'Deselect All' : 'Select All'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Micro Services View */}
            {viewLevel === 'microservices' && selectedSubcategory && (
              <div className="space-y-2 pb-24">
                {selectedSubcategory.microServices.map((service) => (
                  <label
                    key={service.id}
                    className={cn(
                      "flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 active:scale-[0.98]",
                      selectedMicroServices.has(service.id) && "bg-primary/5 border-primary"
                    )}
                  >
                    <Checkbox
                      checked={selectedMicroServices.has(service.id)}
                      onCheckedChange={() => toggleMicroService(service.id)}
                      className="h-5 w-5"
                    />
                    <span className="flex-1 text-left">{service.micro}</span>
                    {popularServices.has(service.micro) && (
                      <Badge variant="secondary" className="text-xs">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        Popular
                      </Badge>
                    )}
                  </label>
                ))}
              </div>
            )}
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
