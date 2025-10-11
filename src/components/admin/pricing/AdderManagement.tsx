import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AdderManagement() {
  const [adders, setAdders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAdders();
  }, []);

  const loadAdders = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('calculator_adders')
        .select('*')
        .order('category, adder_key');

      if (error) throw error;
      setAdders(data || []);
    } catch (error) {
      console.error('Load adders error:', error);
      toast({
        title: "Load Failed",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading adders...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Adders Catalog</h3>
          <p className="text-sm text-muted-foreground">
            {adders.length} adders available
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add New Adder
        </Button>
      </div>

      <div className="grid gap-4">
        {adders.map((adder) => (
          <div key={adder.id} className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-medium">{adder.display_name}</h4>
                  <span className="text-xs px-2 py-1 rounded-full bg-muted">
                    {adder.category}
                  </span>
                  {adder.price_type && (
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {adder.price_type === 'fixed' && `€${adder.price_value}`}
                      {adder.price_type === 'percentage' && `${adder.price_value}%`}
                      {adder.price_type === 'per_sqm' && `€${adder.price_value}/m²`}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">{adder.description}</p>
                {adder.tooltip && (
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    Tooltip: {adder.tooltip}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
