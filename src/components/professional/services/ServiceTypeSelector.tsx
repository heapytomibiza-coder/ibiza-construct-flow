import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Wrench, Home, Paintbrush, Hammer, Zap, Droplet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ServiceType {
  id: string;
  category: string;
  subcategory: string;
  label: string;
  icon: any;
  gradient: string;
  avgPrice?: string;
  avgDuration?: string;
  popular?: boolean;
}

const iconMap: Record<string, any> = {
  wrench: Wrench,
  home: Home,
  paintbrush: Paintbrush,
  hammer: Hammer,
  zap: Zap,
  droplet: Droplet,
};

interface Props {
  selected: any;
  onSelect: (type: ServiceType) => void;
}

export const ServiceTypeSelector: React.FC<Props> = ({ selected, onSelect }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .limit(6);

      if (error) throw error;
      
      const formatted = data?.map((cat, idx) => ({
        id: cat.id,
        category: cat.name,
        subcategory: cat.name,
        label: cat.name,
        icon: Object.values(iconMap)[idx % 6],
        gradient: `from-${['blue', 'orange', 'green', 'purple', 'pink', 'cyan'][idx % 6]}-500/10 to-${['cyan', 'amber', 'emerald', 'pink', 'orange', 'blue'][idx % 6]}-400/5`,
      })) || [];

      setCategories(formatted);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading service types...</div>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Select the type of service you want to offer
      </p>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((type) => {
          const Icon = type.icon;
          const isSelected = selected?.id === type.id;
          
          return (
            <Card
              key={type.id}
              className={cn(
                "p-4 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]",
                "border-2",
                isSelected && "border-primary ring-2 ring-primary/20",
                !isSelected && "border-border hover:border-primary/50"
              )}
              onClick={() => onSelect(type)}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2 rounded-lg bg-gradient-to-br",
                  type.gradient
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{type.label}</h4>
                  {type.popular && (
                    <Badge variant="secondary" className="text-xs mb-2">
                      Popular
                    </Badge>
                  )}
                  {(type.avgPrice || type.avgDuration) && (
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      {type.avgPrice && <div>Avg: {type.avgPrice}</div>}
                      {type.avgDuration && <div>{type.avgDuration}</div>}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
