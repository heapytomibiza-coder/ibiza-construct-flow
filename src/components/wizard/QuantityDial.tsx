import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QUANTITY_UNITS } from '@/lib/ibiza-defaults';
import { cn } from '@/lib/utils';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface QuantityDialProps {
  value?: number;
  unit?: string;
  onChange: (value: number, unit: string) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export const QuantityDial = ({
  value = 1,
  unit = 'm2',
  onChange,
  min = 0,
  max = 1000,
  step = 1,
  className
}: QuantityDialProps) => {
  const { i18n } = useTranslation();
  const [quantity, setQuantity] = useState(value);
  const [selectedUnit, setSelectedUnit] = useState(unit);
  const locale = i18n.language as 'en' | 'es';

  const handleIncrement = () => {
    const newValue = Math.min(quantity + step, max);
    setQuantity(newValue);
    onChange(newValue, selectedUnit);
  };

  const handleDecrement = () => {
    const newValue = Math.max(quantity - step, min);
    setQuantity(newValue);
    onChange(newValue, selectedUnit);
  };

  const handleUnitChange = (newUnit: string) => {
    setSelectedUnit(newUnit);
    onChange(quantity, newUnit);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <label className="text-sm font-medium">Quantity</label>
      
      <div className="flex items-center gap-4">
        {/* Decrement button */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={quantity <= min}
          className="h-14 w-14 rounded-full shrink-0"
        >
          <Minus className="h-6 w-6" />
        </Button>

        {/* Quantity display */}
        <div className="flex-1 flex items-center justify-center gap-2 h-20 rounded-2xl border-2 border-border bg-card">
          <span className="text-4xl font-bold tabular-nums">{quantity}</span>
        </div>

        {/* Increment button */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          disabled={quantity >= max}
          className="h-14 w-14 rounded-full shrink-0"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Unit selector */}
      <Select value={selectedUnit} onValueChange={handleUnitChange}>
        <SelectTrigger className="h-12">
          <SelectValue placeholder="Select unit" />
        </SelectTrigger>
        <SelectContent>
          {QUANTITY_UNITS.map((unitOption) => (
            <SelectItem key={unitOption.id} value={unitOption.id}>
              {unitOption.label[locale]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Quick presets for common values */}
      <div className="flex gap-2">
        {[5, 10, 25, 50, 100].filter(preset => preset <= max).map((preset) => (
          <Button
            key={preset}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuantity(preset);
              onChange(preset, selectedUnit);
            }}
            className="flex-1"
          >
            {preset}
          </Button>
        ))}
      </div>
    </div>
  );
};
