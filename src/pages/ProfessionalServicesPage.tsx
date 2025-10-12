import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Trash2, AlertCircle } from 'lucide-react';
import { useOnboardingChecklist } from '@/hooks/useOnboardingChecklist';
import { ServiceCascadeSelector } from '@/components/services/ServiceCascadeSelector';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Database } from '@/integrations/supabase/types';

type ProfessionalService = Database['public']['Tables']['professional_services']['Row'];

export default function ProfessionalServicesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { markStepComplete } = useOnboardingChecklist();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<ProfessionalService[]>([]);
  const [serviceDetails, setServiceDetails] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to continue',
          variant: 'destructive',
        });
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('professional_services')
        .select(`
          *,
          service_micro_categories:micro_service_id (
            id,
            name,
            subcategory_id,
            service_subcategories:subcategory_id (
              id,
              name,
              category_id,
              service_categories:category_id (
                id,
                name
              )
            )
          )
        `)
        .eq('professional_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      
      // Build service details map
      const detailsMap = new Map<string, string>();
      data?.forEach((service: any) => {
        const micro = service.service_micro_categories;
        if (micro) {
          const sub = micro.service_subcategories;
          const cat = sub?.service_categories;
          const fullPath = `${cat?.name || ''} > ${sub?.name || ''} > ${micro.name || ''}`;
          detailsMap.set(service.id, fullPath);
        }
      });
      
      setServiceDetails(detailsMap);
      setServices(data || []);
    } catch (error: any) {
      console.error('Error loading services:', error);
      toast({
        title: 'Error',
        description: 'Failed to load services',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelect = async (microCategoryId: string, fullPath: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('professional_services')
        .insert({
          professional_id: user.id,
          micro_service_id: microCategoryId,
          is_active: true,
          pricing_structure: {},
          service_areas: {},
          portfolio_urls: [],
        })
        .select()
        .single();

      if (error) throw error;

      setServices(prev => [...prev, data]);
      serviceDetails.set(data.id, fullPath);
      setServiceDetails(new Map(serviceDetails));

      toast({
        title: 'Service added',
        description: 'Your service has been added successfully',
      });
    } catch (error: any) {
      console.error('Error adding service:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add service',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to remove this service?')) return;

    try {
      const { error } = await supabase
        .from('professional_services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      setServices(prev => prev.filter(s => s.id !== serviceId));
      toast({
        title: 'Service removed',
        description: 'The service has been removed from your profile',
      });
    } catch (error: any) {
      console.error('Error deleting service:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete service',
        variant: 'destructive',
      });
    }
  };

  const handleComplete = async () => {
    if (services.length === 0) {
      toast({
        title: 'No services added',
        description: 'Please add at least one service before continuing',
        variant: 'destructive',
      });
      return;
    }

    await markStepComplete('services');
    navigate('/dashboard/pro');
  };

  const handleSkip = async () => {
    await markStepComplete('services');
    navigate('/dashboard/pro');
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Loading services...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/dashboard/pro')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">My Services</h1>
          <p className="text-muted-foreground">Add the services you offer to clients</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add a Service</CardTitle>
          <CardDescription>
            Select from our service categories or suggest a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Select a main category, then subcategory, then the specific service you offer. 
              Can't find what you're looking for? Click "Suggest New" to add it for admin review.
            </AlertDescription>
          </Alert>

          <ServiceCascadeSelector onServiceSelect={handleServiceSelect} />
        </CardContent>
      </Card>

      {services.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Services ({services.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h4 className="font-semibold">
                      {serviceDetails.get(service.id)?.split(' > ').pop() || service.micro_service_id}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {serviceDetails.get(service.id) || 'Service category'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteService(service.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleSkip}>
          Skip for now
        </Button>
        <Button onClick={handleComplete} disabled={services.length === 0}>
          Continue
        </Button>
      </div>
    </div>
  );
}
