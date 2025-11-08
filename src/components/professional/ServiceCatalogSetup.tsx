import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, Loader2 } from 'lucide-react';
import constructionServices from '@/data/construction-services.json';

interface ServiceCatalogSetupProps {
  professionalId: string;
  selectedCategories: string[];
  onComplete?: () => void;
}

interface MicroService {
  id: string;
  name: string;
  category: string;
  subcategory: string;
}

export function ServiceCatalogSetup({ professionalId, selectedCategories, onComplete }: ServiceCatalogSetupProps) {
  const [loading, setLoading] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [availableServices, setAvailableServices] = useState<MicroService[]>([]);

  useEffect(() => {
    loadAvailableServices();
  }, [selectedCategories]);

  const loadAvailableServices = () => {
    const services: MicroService[] = [];
    
    // Extract micro-services from the construction services data based on selected categories
    Object.entries(constructionServices).forEach(([category, subcategories]: [string, any]) => {
      if (selectedCategories.includes(category)) {
        Object.entries(subcategories).forEach(([subcategory, micros]: [string, any]) => {
          Object.entries(micros).forEach(([microKey, microData]: [string, any]) => {
            services.push({
              id: `${category}-${subcategory}-${microKey}`,
              name: microData.name || microKey.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
              category,
              subcategory,
            });
          });
        });
      }
    });

    setAvailableServices(services);
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSubmit = async () => {
    if (selectedServices.length === 0) {
      toast.error('Please select at least one service you offer');
      return;
    }

    setLoading(true);
    try {
      // Create professional_services records
      const serviceRecords = selectedServices.map(serviceId => ({
        professional_id: professionalId,
        micro_service_id: serviceId,
        is_active: true,
      }));

      const { error: servicesError } = await supabase
        .from('professional_services')
        .upsert(serviceRecords);

      if (servicesError) throw servicesError;

      // Update professional profile onboarding phase
      const { error: profileError } = await supabase
        .from('professional_profiles')
        .update({
          onboarding_phase: 'service_configured',
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', professionalId);

      if (profileError) throw profileError;

      toast.success('Services configured! Your profile is now live.', {
        duration: 4000,
      });

      onComplete?.();
    } catch (error: any) {
      console.error('Service setup error:', error);
      toast.error(error.message || 'Failed to save services');
    } finally {
      setLoading(false);
    }
  };

  // Group services by category
  const servicesByCategory = availableServices.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, MicroService[]>);

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Select Your Services</h1>
        <p className="text-muted-foreground">
          Choose the specific services you offer within your skill areas
        </p>
        <p className="text-xs text-muted-foreground">
          Step 3 of 3: Service Catalog → Go Live!
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Services</CardTitle>
          <CardDescription>
            Based on your selected categories. You can always add more services later from your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(servicesByCategory).map(([category, services]) => (
            <div key={category} className="space-y-3">
              <h3 className="font-semibold text-lg capitalize">{category}</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={`flex items-start space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedServices.includes(service.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => toggleService(service.id)}
                  >
                    <Checkbox
                      checked={selectedServices.includes(service.id)}
                      onCheckedChange={() => toggleService(service.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{service.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {service.subcategory.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {availableServices.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No services available for the selected categories
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} selected
        </p>
        <Button
          onClick={handleSubmit}
          disabled={loading || selectedServices.length === 0}
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Setup & Go Live
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
