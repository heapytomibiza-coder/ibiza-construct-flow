import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';

export function AddersManager() {
  const [adders, setAdders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAdders();
  }, []);

  const fetchAdders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('calculator_adders')
      .select('*')
      .order('category, sort_order');

    if (!error && data) {
      setAdders(data);
    } else {
      toast({
        title: 'Error fetching adders',
        description: error?.message,
        variant: 'destructive'
      });
    }
    setLoading(false);
  };

  const formatPrice = (adder: any) => {
    if (adder.price_type === 'fixed') {
      return `€${adder.price_value.toLocaleString()}`;
    } else if (adder.price_type === 'percentage') {
      return `+${adder.price_value}%`;
    } else {
      return `€${adder.price_value}/m²`;
    }
  };

  if (loading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Adders</CardTitle>
            <CardDescription>Manage optional upgrades and add-ons</CardDescription>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Adder
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {adders.map(adder => (
            <div key={adder.id} className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-medium">{adder.display_name}</p>
                <p className="text-sm text-muted-foreground">
                  {adder.category} • {formatPrice(adder)}
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
