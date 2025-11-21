import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Edit2, 
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MicroService {
  id: string;
  name: string;
}

interface ConfiguredService {
  micro_service_id: string;
  micro_service_name: string;
  category: string;
  subcategory: string;
  hourly_rate: number;
  description: string;
}

interface Props {
  professionalId: string;
  preselectedCategories: string[];
  onComplete: () => void;
}

type Step = 'category' | 'subcategory' | 'micro' | 'config';

export function ServiceCascadeConfigurator({ professionalId, preselectedCategories, onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState<Step>('category');
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedMicroService, setSelectedMicroService] = useState<MicroService | null>(null);
  
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [microServices, setMicroServices] = useState<MicroService[]>([]);
  const [configuredServices, setConfiguredServices] = useState<ConfiguredService[]>([]);
  
  const [hourlyRate, setHourlyRate] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentCategory = preselectedCategories[categoryIndex];

  useEffect(() => {
    setSelectedCategory(currentCategory);
    setCurrentStep('subcategory');
  }, [currentCategory]);

  useEffect(() => {
    if (currentStep === 'subcategory' && selectedCategory) {
      loadSubcategories();
    }
  }, [currentStep, selectedCategory]);

  useEffect(() => {
    if (currentStep === 'micro' && selectedSubcategory) {
      loadMicroServices();
    }
  }, [currentStep, selectedSubcategory]);

  const loadSubcategories = async () => {
    try {
      setLoading(true);
      const categorySlug = selectedCategory.toLowerCase().replace(/\s+/g, '-');
      
      const { data: categoryData } = await supabase
        .from('service_categories')
        .select('id')
        .or(`slug.eq.${categorySlug},name.ilike.${selectedCategory}`)
        .limit(1)
        .maybeSingle();

      if (!categoryData) {
        setSubcategories([]);
        return;
      }

      const { data, error } = await supabase
        .from('service_subcategories')
        .select('name')
        .eq('category_id', categoryData.id)
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setSubcategories(data?.map(s => s.name) || []);
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
      const categorySlug = selectedCategory.toLowerCase().replace(/\s+/g, '-');
      
      const { data: categoryData } = await supabase
        .from('service_categories')
        .select('id')
        .or(`slug.eq.${categorySlug},name.ilike.${selectedCategory}`)
        .limit(1)
        .maybeSingle();

      if (!categoryData) {
        setMicroServices([]);
        return;
      }

      const subcategorySlug = selectedSubcategory.toLowerCase().replace(/\s+/g, '-');
      
      const { data: subcategoryData } = await supabase
        .from('service_subcategories')
        .select('id')
        .eq('category_id', categoryData.id)
        .or(`slug.eq.${subcategorySlug},name.ilike.${selectedSubcategory}`)
        .limit(1)
        .maybeSingle();

      if (!subcategoryData) {
        setMicroServices([]);
        return;
      }

      const { data, error } = await supabase
        .from('service_micro_categories')
        .select('id, name')
        .eq('subcategory_id', subcategoryData.id)
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setMicroServices(data || []);
    } catch (error) {
      console.error('Error loading micro services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSubcategory = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
    setCurrentStep('micro');
  };

  const handleSelectMicroService = (micro: MicroService) => {
    setSelectedMicroService(micro);
    setCurrentStep('config');
    // Pre-fill with default values
    setHourlyRate('50');
    setDescription('');
  };

  const handleAddService = () => {
    if (!selectedMicroService || !hourlyRate || parseFloat(hourlyRate) <= 0) {
      toast.error('Please enter a valid hourly rate');
      return;
    }

    const newService: ConfiguredService = {
      micro_service_id: selectedMicroService.id,
      micro_service_name: selectedMicroService.name,
      category: selectedCategory,
      subcategory: selectedSubcategory,
      hourly_rate: parseFloat(hourlyRate),
      description: description.trim()
    };

    setConfiguredServices([...configuredServices, newService]);
    toast.success('Service configured!');
    
    // Reset and go back to micro selection
    setHourlyRate('');
    setDescription('');
    setSelectedMicroService(null);
    setCurrentStep('micro');
  };

  const handleRemoveService = (index: number) => {
    setConfiguredServices(configuredServices.filter((_, i) => i !== index));
    toast.success('Service removed');
  };

  const handleBackFromConfig = () => {
    setSelectedMicroService(null);
    setCurrentStep('micro');
  };

  const handleBackFromMicro = () => {
    setSelectedSubcategory('');
    setMicroServices([]);
    setCurrentStep('subcategory');
  };

  const handleChangeCategory = () => {
    if (categoryIndex < preselectedCategories.length - 1) {
      setCategoryIndex(categoryIndex + 1);
      setSelectedSubcategory('');
      setSelectedMicroService(null);
      setCurrentStep('subcategory');
    }
  };

  const handleSaveAndComplete = async () => {
    if (configuredServices.length === 0) {
      toast.error('Please configure at least one service');
      return;
    }

    try {
      setSaving(true);

      // Delete existing services
      await supabase
        .from('professional_services')
        .delete()
        .eq('professional_id', professionalId);

      // Insert configured services
      const servicesToInsert = configuredServices.map(service => ({
        professional_id: professionalId,
        micro_service_id: service.micro_service_id,
        hourly_rate: service.hourly_rate,
        description: service.description || null,
        is_active: true,
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('professional_services')
        .insert(servicesToInsert);

      if (error) throw error;

      toast.success(`${configuredServices.length} services saved!`);
      setTimeout(() => onComplete(), 500);
    } catch (error: any) {
      console.error('Error saving services:', error);
      toast.error('Failed to save services');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configure Services</h2>
          <p className="text-sm text-muted-foreground">
            {selectedCategory} 
            {selectedSubcategory && ` → ${selectedSubcategory}`}
            {selectedMicroService && ` → ${selectedMicroService.name}`}
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {configuredServices.length} configured
        </Badge>
      </div>

      {/* Configured Services List */}
      {configuredServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Your Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {configuredServices.map((service, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium">{service.micro_service_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {service.category} → {service.subcategory}
                  </p>
                  <p className="text-sm text-primary font-semibold mt-1">
                    €{service.hourly_rate}/hour
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveService(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Subcategory Selection */}
      {currentStep === 'subcategory' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Select subcategory in {selectedCategory}</h3>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {subcategories.map((subcategory) => (
                <Card
                  key={subcategory}
                  className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
                  onClick={() => handleSelectSubcategory(subcategory)}
                >
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">{subcategory}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Micro Service Selection */}
      {currentStep === 'micro' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Select specific service</h3>
            <Button variant="ghost" size="sm" onClick={handleBackFromMicro}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </div>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {microServices.map((micro) => {
                const alreadyConfigured = configuredServices.some(
                  s => s.micro_service_id === micro.id
                );
                return (
                  <Card
                    key={micro.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      alreadyConfigured ? "opacity-50 pointer-events-none" : "hover:border-primary"
                    )}
                    onClick={() => handleSelectMicroService(micro)}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <span className="font-medium">{micro.name}</span>
                      {alreadyConfigured && (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Service Configuration */}
      {currentStep === 'config' && selectedMicroService && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Configure: {selectedMicroService.name}</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleBackFromConfig}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">
                Hourly Rate <span className="text-destructive">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                Your rate for this specific service
              </p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                <Input
                  id="hourlyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  placeholder="50.00"
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Service Description (Optional)</Label>
              <p className="text-sm text-muted-foreground">
                Brief details about what you offer for this service
              </p>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., I specialize in emergency repairs with same-day service..."
                rows={3}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground text-right">
                {description.length}/200
              </p>
            </div>

            <Button onClick={handleAddService} className="w-full" size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Add This Service
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-2">
          {categoryIndex < preselectedCategories.length - 1 && currentStep === 'subcategory' && (
            <Button variant="outline" onClick={handleChangeCategory}>
              Next Category: {preselectedCategories[categoryIndex + 1]}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>

        <Button
          onClick={handleSaveAndComplete}
          disabled={saving || configuredServices.length === 0}
          size="lg"
          className="ml-auto"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Save & Continue
              <ChevronRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {configuredServices.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <p>Select and configure at least one service to continue</p>
        </div>
      )}
    </div>
  );
}
