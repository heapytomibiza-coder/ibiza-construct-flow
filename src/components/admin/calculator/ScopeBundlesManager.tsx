import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';

export function ScopeBundlesManager() {
  const [bundles, setBundles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBundles();
  }, []);

  const fetchBundles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('calculator_scope_bundles')
      .select('*')
      .order('project_type, sort_order');

    if (!error && data) {
      setBundles(data);
    } else {
      toast({
        title: 'Error fetching bundles',
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
            <CardTitle>Scope Bundles</CardTitle>
            <CardDescription>Manage what's included in each bundle</CardDescription>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Bundle
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {bundles.map(bundle => (
            <div key={bundle.id} className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-medium">{bundle.project_type} - {bundle.display_name}</p>
                <p className="text-sm text-muted-foreground">
                  {bundle.included_items.length} items included
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
