import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useOnboardingChecklist } from '@/hooks/useOnboardingChecklist';
import type { Database } from '@/integrations/supabase/types';

type ProfessionalService = Database['public']['Tables']['professional_services']['Row'];

export default function ProfessionalServicesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { markStepComplete } = useOnboardingChecklist();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState<ProfessionalService[]>([]);
  const [newServiceName, setNewServiceName] = useState('');

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
        .select('*')
        .eq('professional_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
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

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) {
      toast({
        title: 'Service name required',
        description: 'Please enter a service name',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('professional_services')
        .insert({
          professional_id: user.id,
          micro_service_id: newServiceName,
          is_active: true,
          pricing_structure: {},
          service_areas: {},
          portfolio_urls: [],
        })
        .select()
        .single();

      if (error) throw error;

      setServices(prev => [...prev, data]);
      setNewServiceName('');

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
    } finally {
      setSaving(false);
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
            Define the services you provide
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddService} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="service-name">Service Name *</Label>
              <Input
                id="service-name"
                placeholder="e.g., Plumbing Repair, House Cleaning, Electrical Work"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                required
              />
            </div>

            <Button type="submit" disabled={saving}>
              <Plus className="mr-2 h-4 w-4" />
              {saving ? 'Adding...' : 'Add Service'}
            </Button>
          </form>
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
                  <h4 className="font-semibold">{service.micro_service_id}</h4>
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
