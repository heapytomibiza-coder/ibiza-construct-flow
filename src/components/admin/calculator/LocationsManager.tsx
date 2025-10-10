import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';

export function LocationsManager() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('calculator_location_factors')
      .select('*')
      .order('sort_order');

    if (!error && data) {
      setLocations(data);
    } else {
      toast({
        title: 'Error fetching locations',
        description: error?.message,
        variant: 'destructive'
      });
    }
    setLoading(false);
  };

  if (loading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Location Factors</CardTitle>
            <CardDescription>Manage location-based price adjustments</CardDescription>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Location
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {locations.map(location => (
            <div key={location.id} className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-medium">{location.display_name}</p>
                <p className="text-sm text-muted-foreground">
                  {location.uplift_percentage > 0 ? `+${location.uplift_percentage}% uplift` : 'No uplift'}
                </p>
              </div>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
