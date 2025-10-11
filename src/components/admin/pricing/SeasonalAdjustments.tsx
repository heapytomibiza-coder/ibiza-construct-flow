import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export function SeasonalAdjustments() {
  const [adjustments, setAdjustments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAdjustments();
  }, []);

  const loadAdjustments = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('calculator_seasonal_adjustments')
        .select('*')
        .order('start_date');

      if (error) throw error;
      setAdjustments(data || []);
    } catch (error) {
      console.error('Load adjustments error:', error);
      toast({
        title: "Load Failed",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from('calculator_seasonal_adjustments')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Updated",
        description: `Adjustment ${!currentStatus ? 'activated' : 'deactivated'}`
      });

      await loadAdjustments();
    } catch (error) {
      console.error('Toggle error:', error);
      toast({
        title: "Update Failed",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading adjustments...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Seasonal Pricing</h3>
          <p className="text-sm text-muted-foreground">
            Configure automatic pricing adjustments for different seasons
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Adjustment
        </Button>
      </div>

      {adjustments.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">No seasonal adjustments configured</p>
          <Button variant="outline" className="mt-4 gap-2">
            <Plus className="h-4 w-4" />
            Create First Adjustment
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {adjustments.map((adj) => (
            <div key={adj.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">{adj.adjustment_name}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      adj.multiplier > 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {adj.multiplier > 1 ? '+' : ''}{((adj.multiplier - 1) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <p>
                      <strong>Period:</strong> {format(new Date(adj.start_date), 'MMM dd, yyyy')} - {format(new Date(adj.end_date), 'MMM dd, yyyy')}
                    </p>
                    {adj.project_types && adj.project_types.length > 0 && (
                      <p>
                        <strong>Applies to:</strong> {adj.project_types.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {adj.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <Switch
                    checked={adj.is_active}
                    onCheckedChange={() => toggleActive(adj.id, adj.is_active)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
