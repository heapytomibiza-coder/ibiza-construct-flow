import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RATING_LABELS } from '@/lib/ibiza-defaults';
import { StarSlider } from '@/components/ui/star-slider';
import { cn } from '@/lib/utils';

interface VisualRatingInputProps {
  value?: number;
  onChange: (rating: number) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

export const VisualRatingInput = ({
  value = 3,
  onChange,
  label,
  required,
  className
}: VisualRatingInputProps) => {
  const { i18n } = useTranslation();
  const [rating, setRating] = useState(value);
  const locale = i18n.language as 'en' | 'es';
  const labels = [...RATING_LABELS[locale]];

  const handleChange = (newValue: number[]) => {
    const ratingValue = newValue[0];
    setRating(ratingValue);
    onChange(ratingValue);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {label && (
        <label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      <div className="p-6 rounded-2xl border-2 border-border bg-card">
        <StarSlider
          value={[rating]}
          onValueChange={handleChange}
          labels={labels}
          min={1}
          max={5}
          step={1}
        />
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Tap a star or drag the slider to rate
      </p>
    </div>
  );
};
