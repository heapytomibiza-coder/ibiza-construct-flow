/**
 * Micro-Services Reference Page
 * Shows all micro-services organized by category for question configuration
 */
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface MicroService {
  id: string;
  name: string;
  slug: string;
  subcategory_name: string;
  category_name: string;
}

interface GroupedServices {
  [category: string]: {
    [subcategory: string]: MicroService[];
  };
}

export default function MicroServicesReference() {
  const [services, setServices] = useState<MicroService[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from('service_micro_categories')
        .select(`
          id,
          name,
          slug,
          subcategory:service_subcategories!inner(
            name,
            category:service_categories!inner(
              name
            )
          )
        `)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      const formatted = data?.map(item => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        subcategory_name: (item.subcategory as any)?.name || '',
        category_name: (item.subcategory as any)?.category?.name || ''
      })) || [];

      setServices(formatted);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupServices = (): GroupedServices => {
    const grouped: GroupedServices = {};

    services.forEach(service => {
      if (!grouped[service.category_name]) {
        grouped[service.category_name] = {};
      }
      if (!grouped[service.category_name][service.subcategory_name]) {
        grouped[service.category_name][service.subcategory_name] = [];
      }
      grouped[service.category_name][service.subcategory_name].push(service);
    });

    return grouped;
  };

  const grouped = groupServices();

  // Services with configured questions (hardcoded for now)
  const configuredSlugs = [
    'excavation-site-prep',
    'concrete-foundations',
    'bathroom-full-renovation',
    'bathroom-light-refresh',
    'floor-wall-tiling',
    'flat-roof-waterproofing'
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Micro-Services Reference</h1>
            <p className="text-muted-foreground mt-2">
              Total: {services.length} micro-services • {services.filter(s => !configuredSlugs.includes(s.slug)).length} need questions
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/post')}>
            Back to Wizard
          </Button>
        </div>

        <div className="space-y-8">
          {Object.entries(grouped).map(([category, subcategories]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-2xl">{category}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(subcategories).map(([subcategory, items]) => (
                  <div key={subcategory} className="space-y-3">
                    <h3 className="text-lg font-semibold text-muted-foreground">
                      {subcategory}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {items.map(service => {
                        const hasQuestions = configuredSlugs.includes(service.slug);
                        return (
                          <div
                            key={service.id}
                            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                          >
                            <span className="text-sm">{service.name}</span>
                            <Badge variant={hasQuestions ? "default" : "secondary"}>
                              {hasQuestions ? "✓ Has Questions" : "⚠ Needs Questions"}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
