import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';

export function CostTemplatesManager() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('calculator_cost_templates')
      .select('*')
      .order('project_type, quality_tier');

    if (!error && data) {
      setTemplates(data);
    } else {
      toast({
        title: 'Error fetching templates',
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
            <CardTitle>Cost Templates</CardTitle>
            <CardDescription>Manage base rates and cost breakdowns</CardDescription>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Template
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {templates.map(template => (
            <div key={template.id} className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-medium">{template.project_type} - {template.quality_tier}</p>
                <p className="text-sm text-muted-foreground">
                  €{template.base_rate_per_sqm}/m² • Labour: {template.labour_percentage}%
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
