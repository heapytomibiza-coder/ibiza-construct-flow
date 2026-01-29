/**
 * Professional Service Preferences Wizard
 * 5-step wizard for professionals to select their services and set preferences
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Loader2,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useProfessionalServicePreferences, type ServiceSelection } from '@/hooks/useProfessionalServicePreferences';
import { MicroServiceMultiSelect } from './MicroServiceMultiSelect';
import { CapabilityFiltersStep, type CapabilityFilters } from './CapabilityFiltersStep';
import { getCategoryIcon } from '@/lib/categoryIcons';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon_name: string | null;
  icon_emoji: string | null;
}

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
  icon_name: string | null;
}

const STEPS = [
  { id: 1, title: 'Categories', description: 'Pick your main service areas' },
  { id: 2, title: 'Subcategories', description: 'Choose specific service types' },
  { id: 3, title: 'Services', description: 'Select exact services you offer' },
  { id: 4, title: 'Preferences', description: 'Set your work preferences' },
  { id: 5, title: 'Review', description: 'Confirm and save' }
];

export const ServicePreferencesWizard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  
  // Selection state
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(new Set());
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<Set<string>>(new Set());
  
  // Capability filters
  const [capabilityFilters, setCapabilityFilters] = useState<CapabilityFilters>({
    serviceRegions: [],
    minJobValue: 0,
    workStyle: 'either',
    languages: ['en'],
    emergencyCallouts: false,
    hasOwnTools: true
  });
  
  // Service preferences hook
  const {
    selectedServices,
    loading: loadingExisting,
    saving,
    toggleMicroService,
    toggleSubcategoryServices,
    saveServices,
    isMicroServiceSelected
  } = useProfessionalServicePreferences(user?.id);

  // Create maps for quick lookup
  const categoryMap = categories.reduce((acc, cat) => {
    acc[cat.id] = { id: cat.id, name: cat.name };
    return acc;
  }, {} as Record<string, { id: string; name: string }>);

  const subcategoryMap = subcategories.reduce((acc, sub) => {
    acc[sub.id] = { id: sub.id, name: sub.name, categoryId: sub.category_id };
    return acc;
  }, {} as Record<string, { id: string; name: string; categoryId: string }>);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('service_categories')
          .select('id, name, slug, icon_name, icon_emoji')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast({
          title: 'Error',
          description: 'Failed to load categories',
          variant: 'destructive'
        });
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [toast]);

  // Fetch subcategories when categories are selected
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (selectedCategoryIds.size === 0) {
        setSubcategories([]);
        return;
      }

      setLoadingSubcategories(true);
      try {
        const { data, error } = await supabase
          .from('service_subcategories')
          .select('id, name, category_id, icon_name')
          .in('category_id', Array.from(selectedCategoryIds))
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) throw error;
        setSubcategories(data || []);
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      } finally {
        setLoadingSubcategories(false);
      }
    };

    fetchSubcategories();
  }, [selectedCategoryIds]);

  // Toggle category selection
  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
        // Also remove subcategories from this category
        setSelectedSubcategoryIds(prevSubs => {
          const nextSubs = new Set(prevSubs);
          subcategories
            .filter(s => s.category_id === categoryId)
            .forEach(s => nextSubs.delete(s.id));
          return nextSubs;
        });
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  // Toggle subcategory selection
  const toggleSubcategory = (subcategoryId: string) => {
    setSelectedSubcategoryIds(prev => {
      const next = new Set(prev);
      if (next.has(subcategoryId)) {
        next.delete(subcategoryId);
      } else {
        next.add(subcategoryId);
      }
      return next;
    });
  };

  // Navigation
  const canGoNext = () => {
    switch (currentStep) {
      case 1: return selectedCategoryIds.size > 0;
      case 2: return selectedSubcategoryIds.size > 0;
      case 3: return selectedServices.length > 0;
      case 4: return capabilityFilters.serviceRegions.length > 0;
      default: return true;
    }
  };

  const handleNext = () => {
    if (currentStep < 5 && canGoNext()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Final save
  const handleSave = async () => {
    // Save service selections
    const servicesSuccess = await saveServices();
    if (!servicesSuccess) return;

    // Update professional profile with capability filters
    if (user?.id) {
          try {
        const teamSize = capabilityFilters.workStyle === 'solo' ? 1 : 
                         capabilityFilters.workStyle === 'team' ? 3 : 2;
        const { error } = await supabase
          .from('professional_profiles')
          .update({
            service_regions: capabilityFilters.serviceRegions,
            min_project_value: capabilityFilters.minJobValue,
            team_size: teamSize,
            languages: capabilityFilters.languages,
            emergency_service: capabilityFilters.emergencyCallouts
          })
          .eq('user_id', user.id);

        if (error) throw error;

        toast({
          title: 'Success!',
          description: 'Your service preferences have been saved. You will now receive matching job notifications.'
        });

        navigate('/professional/dashboard');
      } catch (error) {
        console.error('Error saving profile:', error);
        toast({
          title: 'Warning',
          description: 'Services saved but preferences update failed. Please update your profile manually.',
          variant: 'destructive'
        });
      }
    }
  };

  // Selected micro service IDs set for quick lookup
  const selectedMicroServiceIds = new Set(selectedServices.map(s => s.microServiceId));

  const progress = (currentStep / 5) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="container max-w-4xl py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Set Up Your Services</h1>
            <Badge variant="outline">
              Step {currentStep} of 5
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2">
            {STEPS.map((step) => (
              <span
                key={step.id}
                className={cn(
                  "text-xs",
                  currentStep >= step.id ? "text-primary font-medium" : "text-muted-foreground"
                )}
              >
                {step.title}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-4xl py-8">
        {/* Step 1: Categories */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">What services do you offer?</h2>
              <p className="text-muted-foreground">
                Select the main categories that match your skills
              </p>
            </div>

            {loadingCategories ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {categories.map((category) => {
                  const isSelected = selectedCategoryIds.has(category.id);
                  const IconComponent = category.icon_name ? getCategoryIcon(category.icon_name) : null;

                  return (
                    <button
                      key={category.id}
                      onClick={() => toggleCategory(category.id)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all min-h-[100px]",
                        "hover:shadow-md active:scale-[0.98]",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      )}
                    >
                      {IconComponent && (
                        <IconComponent className={cn(
                          "w-8 h-8",
                          isSelected ? "text-primary" : "text-muted-foreground"
                        )} />
                      )}
                      <span className={cn(
                        "text-sm font-medium text-center",
                        isSelected && "text-primary"
                      )}>
                        {category.name}
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Subcategories */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Narrow it down</h2>
              <p className="text-muted-foreground">
                Select the specific types of work you do
              </p>
            </div>

            {loadingSubcategories ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-6">
                {Array.from(selectedCategoryIds).map((categoryId) => {
                  const category = categories.find(c => c.id === categoryId);
                  const catSubcategories = subcategories.filter(s => s.category_id === categoryId);
                  
                  if (catSubcategories.length === 0) return null;

                  return (
                    <Card key={categoryId}>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-3">{category?.name}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {catSubcategories.map((sub) => {
                            const isSelected = selectedSubcategoryIds.has(sub.id);
                            const IconComponent = sub.icon_name ? getCategoryIcon(sub.icon_name) : null;

                            return (
                              <button
                                key={sub.id}
                                onClick={() => toggleSubcategory(sub.id)}
                                className={cn(
                                  "flex items-center gap-2 p-3 rounded-lg border transition-all text-left",
                                  isSelected
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/30"
                                )}
                              >
                                {IconComponent && (
                                  <IconComponent className={cn(
                                    "w-5 h-5 flex-shrink-0",
                                    isSelected ? "text-primary" : "text-muted-foreground"
                                  )} />
                                )}
                                <span className={cn(
                                  "text-sm",
                                  isSelected && "text-primary font-medium"
                                )}>
                                  {sub.name}
                                </span>
                                {isSelected && (
                                  <Check className="w-4 h-4 text-primary ml-auto" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Micro-services */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Select specific services</h2>
              <p className="text-muted-foreground">
                Pick the exact services you want to offer
              </p>
            </div>

            <MicroServiceMultiSelect
              selectedCategoryIds={Array.from(selectedCategoryIds)}
              selectedSubcategoryIds={Array.from(selectedSubcategoryIds)}
              categoryMap={categoryMap}
              subcategoryMap={subcategoryMap}
              selectedMicroServiceIds={selectedMicroServiceIds}
              onToggleMicroService={toggleMicroService}
              onToggleAllInSubcategory={toggleSubcategoryServices}
            />
          </div>
        )}

        {/* Step 4: Capability Filters */}
        {currentStep === 4 && (
          <CapabilityFiltersStep
            filters={capabilityFilters}
            onFiltersChange={setCapabilityFilters}
          />
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Sparkles className="w-12 h-12 mx-auto text-primary" />
              <h2 className="text-2xl font-bold">Ready to go!</h2>
              <p className="text-muted-foreground">
                Review your selections and save your preferences
              </p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Selected Services</h3>
                  <p className="text-2xl font-bold text-primary">
                    {selectedServices.length} services
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedServices.slice(0, 10).map((service) => (
                      <Badge key={service.microServiceId} variant="secondary" className="text-xs">
                        {service.microServiceName}
                      </Badge>
                    ))}
                    {selectedServices.length > 10 && (
                      <Badge variant="outline" className="text-xs">
                        +{selectedServices.length - 10} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Service Areas</h3>
                  <div className="flex flex-wrap gap-1">
                    {capabilityFilters.serviceRegions.map((region) => (
                      <Badge key={region} variant="outline">{region}</Badge>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Work Style</h3>
                  <p className="capitalize">{capabilityFilters.workStyle}</p>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Minimum Job Value</h3>
                  <p>€{capabilityFilters.minJobValue}</p>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Languages</h3>
                  <div className="flex gap-1">
                    {capabilityFilters.languages.map((lang) => (
                      <Badge key={lang} variant="outline">{lang.toUpperCase()}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="sticky bottom-0 bg-background border-t">
        <div className="container max-w-4xl py-4 flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {currentStep < 5 ? (
            <Button
              onClick={handleNext}
              disabled={!canGoNext()}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save & Activate Matching
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
