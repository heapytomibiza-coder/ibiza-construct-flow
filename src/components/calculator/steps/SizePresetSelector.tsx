import { CalculatorCard } from '../ui/CalculatorCard';
import type { SizePreset } from '@/lib/calculator/data-model';
import { Maximize2, Clock } from 'lucide-react';

interface SizePresetSelectorProps {
  presets: SizePreset[];
  selected?: SizePreset;
  onSelect: (preset: SizePreset) => void;
}

export function SizePresetSelector({ presets, selected, onSelect }: SizePresetSelectorProps) {

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">What's the size?</h2>
        <p className="text-muted-foreground">Select the approximate size of your space</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {presets.map(preset => (
          <CalculatorCard
            key={preset.id}
            selected={selected?.id === preset.id}
            onClick={() => onSelect(preset)}
          >
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">{preset.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Maximize2 className="h-4 w-4" />
                <span>{preset.min}-{preset.max}m²</span>
              </div>
              <p className="text-sm text-muted-foreground">{preset.description}</p>
              <div className="flex items-center gap-2 text-sm text-primary">
                <Clock className="h-4 w-4" />
                <span>{preset.typicalDurationDays.min}-{preset.typicalDurationDays.max} days</span>
              </div>
            </div>
          </CalculatorCard>
        ))}
      </div>
    </div>
  );
}
