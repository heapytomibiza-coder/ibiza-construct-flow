import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CalculatorCard } from '../ui/CalculatorCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { SizePreset } from '../hooks/useCalculatorState';
import { Maximize2, Clock } from 'lucide-react';

interface SizePresetSelectorProps {
  projectType: string;
  selected?: SizePreset;
  onSelect: (preset: SizePreset) => void;
}

export function SizePresetSelector({ projectType, selected, onSelect }: SizePresetSelectorProps) {
  const [presets, setPresets] = useState<SizePreset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPresets = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('calculator_size_presets' as any)
        .select('*')
        .eq('project_type', projectType)
        .eq('is_active', true)
        .order('sort_order');

      if (!error && data) {
        setPresets(data as any);
      }
      setLoading(false);
    };

    fetchPresets();
  }, [projectType]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">What's the size?</h2>
        <p className="text-muted-foreground">Select the approximate size of your space</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {presets.map(preset => (
          <CalculatorCard
            key={preset.id}
            selected={selected?.id === preset.id}
            onClick={() => onSelect(preset)}
          >
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">{preset.preset_name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Maximize2 className="h-4 w-4" />
                <span>{preset.size_min_sqm}-{preset.size_max_sqm}m²</span>
              </div>
              <p className="text-sm text-muted-foreground">{preset.description}</p>
              <div className="flex items-center gap-2 text-sm text-primary">
                <Clock className="h-4 w-4" />
                <span>{preset.typical_duration_days} days</span>
              </div>
            </div>
          </CalculatorCard>
        ))}
      </div>
    </div>
  );
}
