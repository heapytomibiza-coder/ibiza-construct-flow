import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, 
  ChevronLeft, 
  CheckCircle2,
  Plus,
  Trash2,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ServiceConfigurationReview } from './ServiceConfigurationReview';

interface MicroService {
  id: string;
  name: string;
}

interface ConfiguredService {
  micro_service_id: string;
  micro_service_name: string;
  category_name: string;
  subcategory_name: string;
  pricing_type: 'hourly' | 'daily' | 'job';
  rate: number;
  description?: string;
}

interface Props {
  professionalId: string;
  preselectedCategories: string[];
  onComplete: () => void;
}

type Step = 'overview' | 'subcategory' | 'micro' | 'config' | 'review';

interface MappedCategory {
  intro: string;
  categoryId: string;
  categoryName: string;
}

export function ServiceCascadeConfigurator({ professionalId, preselectedCategories, onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState<Step>('overview');
  const [mappedCategories, setMappedCategories] = useState<MappedCategory[]>([]);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedMicroService, setSelectedMicroService] = useState<MicroService | null>(null);
  
  const [subcategories, setSubcategories] = useState<Array<{ id: string; name: string }>>([]);
  const [microServices, setMicroServices] = useState<MicroService[]>([]);
  const [configuredServices, setConfiguredServices] = useState<ConfiguredService[]>([]);
  
  const [pricingType, setPricingType] = useState<'hourly' | 'daily' | 'job'>('hourly');
  const [rate, setRate] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isLoadingMapping, setIsLoadingMapping] = useState(true);

  // Load category mapping on mount
  useEffect(() => {
    async function loadCategoryMapping() {
      setIsLoadingMapping(true);
      console.log('🔍 Mapping intro categories:', preselectedCategories);
      
      const { data: categories, error } = await supabase
        .from('service_categories')
        .select('id, name, slug')
        .eq('is_active', true);

      if (error || !categories) {
        console.error('Failed to fetch categories:', error);
        toast.error('Failed to load service categories');
        setIsLoadingMapping(false);
        return;
      }

      const mapped = preselectedCategories
        .map(intro => {
          const normalized = intro.toLowerCase().trim();
          
          // Try exact slug match
          let match = categories.find(c => c.slug === normalized);
          
          // Try partial match
          if (!match) {
            match = categories.find(c => 
              c.slug.includes(normalized) || 
              normalized.includes(c.slug) ||
              c.name.toLowerCase().includes(normalized)
            );
          }

          if (match) {
            console.log(`✅ Mapped "${intro}" → "${match.name}" (${match.id})`);
            return { intro, categoryId: match.id, categoryName: match.name };
          } else {
            console.warn(`❌ No match for "${intro}"`);
            return null;
          }
        })
        .filter((m): m is NonNullable<typeof m> => m !== null);

      setMappedCategories(mapped);
      
      if (mapped.length === 0) {
        toast.error('Could not match any categories. Please contact support.');
      } else if (mapped.length < preselectedCategories.length) {
        toast.warning(`Matched ${mapped.length} out of ${preselectedCategories.length} categories`);
      }
      
      setIsLoadingMapping(false);
    }

    loadCategoryMapping();
  }, [preselectedCategories]);

  const currentMappedCategory = mappedCategories[categoryIndex];

  const loadSubcategories = async (categoryId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('service_subcategories')
        .select('id, name')
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setSubcategories(data || []);
    } catch (error) {
      console.error('Error loading subcategories:', error);
      toast.error('Failed to load subcategories');
      setSubcategories([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMicroServices = async (subcategoryId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('service_micro_categories')
        .select('id, name')
        .eq('subcategory_id', subcategoryId)
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setMicroServices(data || []);
    } catch (error) {
      console.error('Error loading micro services:', error);
      toast.error('Failed to load services');
      setMicroServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartConfiguration = () => {
    if (mappedCategories.length === 0) {
      toast.error('No categories to configure');
      return;
    }
    setSelectedCategory(mappedCategories[0].categoryName);
    setCurrentStep('subcategory');
    loadSubcategories(mappedCategories[0].categoryId);
  };

  const handleSelectSubcategory = (subcategory: { id: string; name: string }) => {
    setSelectedSubcategory(subcategory.name);
    setCurrentStep('micro');
    loadMicroServices(subcategory.id);
  };

  const handleSelectMicroService = (micro: MicroService) => {
    setSelectedMicroService(micro);
    setCurrentStep('config');
    // Pre-fill defaults
    setPricingType('hourly');
    setRate('50');
    setDescription('');
  };

  const handleAddService = () => {
    if (!selectedMicroService || !rate || parseFloat(rate) <= 0) {
      toast.error('Please enter a valid rate');
      return;
    }

    const newService: ConfiguredService = {
      micro_service_id: selectedMicroService.id,
      micro_service_name: selectedMicroService.name,
      category_name: currentMappedCategory.categoryName,
      subcategory_name: selectedSubcategory,
      pricing_type: pricingType,
      rate: parseFloat(rate),
      description: description.trim() || undefined
    };

    setConfiguredServices([...configuredServices, newService]);
    toast.success('Service configured!');
    
    // Reset and go back to micro selection
    setPricingType('hourly');
    setRate('');
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

  const handleBackFromSubcategory = () => {
    setSelectedCategory('');
    setSubcategories([]);
    setCurrentStep('overview');
  };

  const handleSkipCategory = () => {
    if (categoryIndex < mappedCategories.length - 1) {
      setCategoryIndex(categoryIndex + 1);
      setSelectedCategory(mappedCategories[categoryIndex + 1].categoryName);
      setSelectedSubcategory('');
      setSelectedMicroService(null);
      setCurrentStep('subcategory');
      loadSubcategories(mappedCategories[categoryIndex + 1].categoryId);
    } else {
      // All categories done, go to review
      setCurrentStep('review');
    }
  };

  const handleNextCategory = () => {
    if (categoryIndex < mappedCategories.length - 1) {
      setCategoryIndex(categoryIndex + 1);
      setSelectedCategory(mappedCategories[categoryIndex + 1].categoryName);
      setSelectedSubcategory('');
      setSelectedMicroService(null);
      setCurrentStep('subcategory');
      loadSubcategories(mappedCategories[categoryIndex + 1].categoryId);
    } else {
      setCurrentStep('review');
    }
  };

  const handleEditService = (index: number) => {
    toast.info('Edit functionality coming soon');
  };

  const handleBackToConfiguration = () => {
    setCurrentStep('subcategory');
  };

  const handleSaveAndComplete = async () => {
    if (configuredServices.length === 0) {
      toast.error('Please configure at least one service');
      return;
    }

    try {
      setSaving(true);
      console.group('💾 Saving Services');
      console.log('Configured services:', configuredServices);

      // Delete existing services
      await supabase
        .from('professional_services')
        .delete()
        .eq('professional_id', professionalId);

      // Insert configured services with proper pricing_structure
      const servicesToInsert = configuredServices.map(service => ({
        professional_id: professionalId,
        micro_service_id: service.micro_service_id,
        pricing_structure: {
          type: service.pricing_type,
          rate: service.rate,
          description: service.description || null
        },
        is_active: true,
        service_areas: [],
        portfolio_urls: []
      }));

      console.log('Services to insert:', servicesToInsert);

      const { error } = await supabase
        .from('professional_services')
        .insert(servicesToInsert);

      if (error) throw error;

      console.log('✅ Services saved successfully');
      console.groupEnd();
      
      toast.success(`${configuredServices.length} service${configuredServices.length !== 1 ? 's' : ''} saved!`);
      setTimeout(() => onComplete(), 500);
    } catch (error: any) {
      console.error('❌ Error saving services:', error);
      console.groupEnd();
      toast.error(error.message || 'Failed to save services');
    } finally {
      setSaving(false);
    }
  };

  if (isLoadingMapping) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading service categories...</p>
      </div>
    );
  }

  if (mappedCategories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">
          Unable to load service categories. Please contact support.
        </p>
      </div>
    );
  }

  // Overview Step
  if (currentStep === 'overview') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Configure Your Services</h2>
          <p className="text-muted-foreground mt-1">
            Let's set up specific services and pricing for each category
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Selected Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mappedCategories.map((cat, index) => (
                <div
                  key={cat.categoryId}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{index + 1}</Badge>
                    <div>
                      <p className="font-medium">{cat.categoryName}</p>
                      {cat.intro !== cat.categoryName && (
                        <p className="text-xs text-muted-foreground">
                          Mapped from: {cat.intro}
                        </p>
                      )}
                    </div>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Next Steps:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            <li>Select subcategories for each category</li>
            <li>Choose specific services you offer</li>
            <li>Set your pricing (hourly/daily/per job)</li>
            <li>Review and confirm all services</li>
          </ol>
        </div>

        <Button onClick={handleStartConfiguration} size="lg" className="w-full">
          Start Configuring Services
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Review Step
  if (currentStep === 'review') {
    return (
      <ServiceConfigurationReview
        services={configuredServices}
        onEdit={handleEditService}
        onRemove={handleRemoveService}
        onConfirm={handleSaveAndComplete}
        onBack={handleBackToConfiguration}
        loading={saving}
      />
    );
  }

  // Progress indicator
  const progress = ((categoryIndex + 1) / mappedCategories.length) * 100;
  const categoryServicesCount = configuredServices.filter(
    s => s.category_name === currentMappedCategory.categoryName
  ).length;

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{currentMappedCategory.categoryName}</h2>
            <p className="text-sm text-muted-foreground">
              Category {categoryIndex + 1} of {mappedCategories.length}
              {categoryServicesCount > 0 && ` • ${categoryServicesCount} service${categoryServicesCount !== 1 ? 's' : ''} configured`}
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            {configuredServices.length} total
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground">
        {currentMappedCategory.categoryName}
        {selectedSubcategory && ` → ${selectedSubcategory}`}
        {selectedMicroService && ` → ${selectedMicroService.name}`}
      </div>

      {/* Configured Services for Current Category */}
      {categoryServicesCount > 0 && currentStep !== 'config' && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Configured in {currentMappedCategory.categoryName}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {configuredServices
              .filter(s => s.category_name === currentMappedCategory.categoryName)
              .map((service, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm p-2 rounded bg-background/50"
                >
                  <span className="font-medium">{service.micro_service_name}</span>
                  <span className="text-primary font-semibold">
                    €{service.rate}/{service.pricing_type === 'hourly' ? 'hr' : service.pricing_type === 'daily' ? 'day' : 'job'}
                  </span>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Subcategory Selection */}
      {currentStep === 'subcategory' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Select subcategory</h3>
            {categoryIndex > 0 && (
              <Button variant="ghost" size="sm" onClick={handleBackFromSubcategory}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Overview
              </Button>
            )}
          </div>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {subcategories.map((subcategory) => (
                  <Card
                    key={subcategory.id}
                    className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
                    onClick={() => handleSelectSubcategory(subcategory)}
                  >
                    <CardContent className="p-4">
                      <p className="font-medium">{subcategory.name}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleSkipCategory}
                  className="flex-1"
                >
                  Skip {currentMappedCategory.categoryName}
                </Button>
                {categoryServicesCount > 0 && (
                  <Button onClick={handleNextCategory} className="flex-1">
                    {categoryIndex < mappedCategories.length - 1 
                      ? `Next Category (${mappedCategories[categoryIndex + 1].categoryName})`
                      : 'Review All Services'}
                  </Button>
                )}
              </div>
            </>
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
            <div className="space-y-3">
              <Label>Pricing Type <span className="text-destructive">*</span></Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={pricingType === 'hourly' ? 'default' : 'outline'}
                  onClick={() => setPricingType('hourly')}
                  className="w-full"
                >
                  Hourly
                </Button>
                <Button
                  type="button"
                  variant={pricingType === 'daily' ? 'default' : 'outline'}
                  onClick={() => setPricingType('daily')}
                  className="w-full"
                >
                  Daily
                </Button>
                <Button
                  type="button"
                  variant={pricingType === 'job' ? 'default' : 'outline'}
                  onClick={() => setPricingType('job')}
                  className="w-full"
                >
                  Per Job
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">
                {pricingType === 'hourly' && 'Hourly Rate'}
                {pricingType === 'daily' && 'Daily Rate'}
                {pricingType === 'job' && 'Job Rate'}
                {' '}<span className="text-destructive">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                {pricingType === 'hourly' && 'Your rate per hour for this service'}
                {pricingType === 'daily' && 'Your rate per full day for this service'}
                {pricingType === 'job' && 'Fixed price per completed job'}
              </p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                <Input
                  id="rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder={
                    pricingType === 'hourly' ? '50.00' :
                    pricingType === 'daily' ? '400.00' :
                    '150.00'
                  }
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Service Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief details about what you offer for this service..."
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
    </div>
  );
}
