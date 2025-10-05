import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MATERIAL_OPTIONS } from '@/lib/ibiza-defaults';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface VisualMaterialPickerProps {
  value?: string;
  onChange: (materialId: string) => void;
  className?: string;
}

export const VisualMaterialPicker = ({ value, onChange, className }: VisualMaterialPickerProps) => {
  const { i18n } = useTranslation();
  const [selected, setSelected] = useState(value);
  const locale = i18n.language as 'en' | 'es';

  const handleSelect = (materialId: string) => {
    setSelected(materialId);
    onChange(materialId);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <label className="text-sm font-medium">Select Material</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {MATERIAL_OPTIONS.map((material) => (
          <button
            key={material.id}
            type="button"
            onClick={() => handleSelect(material.id)}
            className={cn(
              "relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all duration-200",
              "hover:border-primary hover:shadow-md",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              selected === material.id
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border bg-card"
            )}
          >
            {selected === material.id && (
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
            <span className="text-4xl">{material.icon}</span>
            <span className={cn(
              "text-sm font-medium text-center",
              selected === material.id ? "text-primary" : "text-foreground"
            )}>
              {material.label[locale]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
