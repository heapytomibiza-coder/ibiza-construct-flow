import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';

export function SizePresetsManager() {
  const [presets, setPresets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPresets();
  }, []);

  const fetchPresets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('calculator_size_presets')
      .select('*')
      .order('project_type, sort_order');

    if (!error && data) {
      setPresets(data);
    } else {
      toast({
        title: 'Error fetching presets',
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
            <CardTitle>Size Presets</CardTitle>
            <CardDescription>Manage size options for each project type</CardDescription>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Preset
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {presets.map(preset => (
            <div key={preset.id} className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-medium">{preset.project_type} - {preset.preset_name}</p>
                <p className="text-sm text-muted-foreground">
                  {preset.size_min_sqm}-{preset.size_max_sqm}m² • {preset.typical_duration_days} days
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
