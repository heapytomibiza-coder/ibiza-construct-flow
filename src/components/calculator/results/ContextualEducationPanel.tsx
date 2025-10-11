import { Info, MapPin, Sparkles } from 'lucide-react';
import type { PricingResultProps } from '@/lib/calculator/results/types';

export function ContextualEducationPanel({ pricing }: PricingResultProps) {
  const { notes, location, qualityTier } = pricing;

  return (
    <div className="space-y-4 pt-4 border-t">
      {/* Quality Tier Info */}
      <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5">
        <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <h5 className="font-medium text-sm mb-1">{qualityTier.name} Quality</h5>
          <p className="text-xs text-muted-foreground">{qualityTier.description}</p>
        </div>
      </div>

      {/* Location Info */}
      {location.upliftPercentage > 0 && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5">
          <MapPin className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h5 className="font-medium text-sm mb-1">{location.name}</h5>
            <p className="text-xs text-muted-foreground">
              {location.notes || `+${(location.upliftPercentage * 100).toFixed(0)}% location premium`}
            </p>
          </div>
        </div>
      )}

      {/* Education Notes */}
      {notes.length > 0 && (
        <div className="space-y-2">
          <h5 className="font-medium text-sm flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            Important Notes
          </h5>
          <ul className="space-y-2">
            {notes.map((note, idx) => (
              <li key={idx} className="text-xs text-muted-foreground pl-6">
                • {note}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
