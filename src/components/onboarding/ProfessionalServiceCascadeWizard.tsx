import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MicroService {
  id: string;
  micro: string;
  subcategory: string;
}

interface SubcategoryGroup {
  subcategory: string;
  microServices: MicroService[];
}

interface ProfessionalServiceCascadeWizardProps {
  professionalId: string;
  preselectedCategories?: string[];
  onComplete?: () => void;
}

export function ProfessionalServiceCascadeWizard({
  professionalId,
  preselectedCategories = [],
  onComplete
}: ProfessionalServiceCascadeWizardProps) {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [microServices, setMicroServices] = useState<MicroService[]>([]);
  const [selectedMicroServices, setSelectedMicroServices] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const currentCategory = preselectedCategories[currentCategoryIndex];
  const totalCategories = preselectedCategories.length;
  const isLastCategory = currentCategoryIndex === totalCategories - 1;

  useEffect(() => {
    loadExistingSelections();
  }, [professionalId]);

  useEffect(() => {
    if (currentCategory) {
      loadSubcategories();
      setSelectedSubcategory(null);
    }
  }, [currentCategory]);

  useEffect(() => {
    if (selectedSubcategory) {
      loadMicroServices();
    }
  }, [selectedSubcategory]);

  const loadExistingSelections = async () => {
    try {
      const { data, error } = await supabase
        .from('professional_services')
        .select('micro_service_id')
        .eq('professional_id', professionalId)
        .eq('is_active', true);

      if (error) throw error;
      setSelectedMicroServices(new Set(data?.map(s => s.micro_service_id) || []));
    } catch (error) {
      console.error('Error loading selections:', error);
    }
  };

  const loadSubcategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services_micro')
        .select('subcategory')
        .eq('category', currentCategory)
        .eq('is_active', true);

      if (error) throw error;

      const uniqueSubcategories = [...new Set(data?.map(s => s.subcategory) || [])];
      setSubcategories(uniqueSubcategories);
    } catch (error) {
      console.error('Error loading subcategories:', error);
      toast.error('Failed to load subcategories');
    } finally {
      setLoading(false);
    }
  };

  const loadMicroServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services_micro')
        .select('id, micro, subcategory')
        .eq('category', currentCategory)
        .eq('subcategory', selectedSubcategory)
        .eq('is_active', true)
        .order('micro');

      if (error) throw error;
      setMicroServices(data || []);
    } catch (error) {
      console.error('Error loading micro services:', error);
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

  const handleNextCategory = () => {
    if (currentCategoryIndex < totalCategories - 1) {
      setCurrentCategoryIndex(currentCategoryIndex + 1);
      setSelectedSubcategory(null);
    }
  };

  const handlePreviousCategory = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(currentCategoryIndex - 1);
      setSelectedSubcategory(null);
    }
  };

  const handleSaveAndComplete = async () => {
    try {
      setSaving(true);

      // Deactivate all existing services
      const { error: deactivateError } = await supabase
        .from('professional_services')
        .update({ is_active: false })
        .eq('professional_id', professionalId);

      if (deactivateError) throw deactivateError;

      // Insert selected services
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

      toast.success(`${selectedMicroServices.size} services configured successfully`);
      onComplete?.();
    } catch (error) {
      console.error('Error saving services:', error);
      toast.error('Failed to save services');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !currentCategory) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Configure Your Services</h2>
          <Badge variant="secondary">
            {selectedMicroServices.size} service{selectedMicroServices.size !== 1 ? 's' : ''} selected
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Configuring <span className="font-medium text-foreground">{currentCategory}</span> 
          {' '}(Category {currentCategoryIndex + 1} of {totalCategories})
        </p>
      </div>

      {/* Subcategory selection */}
      {!selectedSubcategory && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Select a subcategory</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {subcategories.map((subcategory) => (
              <Card
                key={subcategory}
                className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
                onClick={() => setSelectedSubcategory(subcategory)}
              >
                <CardHeader className="p-4">
                  <CardTitle className="text-base">{subcategory}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Micro service multi-select */}
      {selectedSubcategory && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">{selectedSubcategory}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedSubcategory(null)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to subcategories
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {microServices.map((service) => (
                <Card
                  key={service.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    selectedMicroServices.has(service.id) && "border-primary bg-primary/5"
                  )}
                  onClick={() => toggleMicroService(service.id)}
                >
                  <CardContent className="flex items-center gap-3 p-4">
                    <Checkbox
                      checked={selectedMicroServices.has(service.id)}
                      onCheckedChange={() => toggleMicroService(service.id)}
                    />
                    <span className="text-sm font-medium">{service.micro}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={handlePreviousCategory}
          disabled={currentCategoryIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous Category
        </Button>

        {isLastCategory ? (
          <Button
            onClick={handleSaveAndComplete}
            disabled={saving || selectedMicroServices.size === 0}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              `Save ${selectedMicroServices.size} Services`
            )}
          </Button>
        ) : (
          <Button onClick={handleNextCategory}>
            Next Category
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
