import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';

export function QualityTiersManager() {
  const [tiers, setTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTiers();
  }, []);

  const fetchTiers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('calculator_quality_tiers')
      .select('*')
      .order('sort_order');

    if (!error && data) {
      setTiers(data);
    } else {
      toast({
        title: 'Error fetching tiers',
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
            <CardTitle>Quality Tiers</CardTitle>
            <CardDescription>Manage quality levels and multipliers</CardDescription>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Tier
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {tiers.map(tier => (
            <div key={tier.id} className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-medium">{tier.display_name}</p>
                <p className="text-sm text-muted-foreground">Multiplier: {tier.multiplier}x</p>
              </div>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
