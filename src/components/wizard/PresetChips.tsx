import { useJobPresets } from '@/hooks/useJobPresets';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface PresetChipsProps {
  presetType: string;
  onSelectPreset: (presetData: any) => void;
  className?: string;
}

export const PresetChips = ({ presetType, onSelectPreset, className }: PresetChipsProps) => {
  const { presets, loading, usePreset } = useJobPresets(presetType);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <History className="w-4 h-4 animate-spin" />
        Loading recent selections...
      </div>
    );
  }

  if (presets.length === 0) {
    return null;
  }

  const handleSelectPreset = async (preset: any) => {
    await usePreset(preset.id);
    onSelectPreset(preset.preset_data);
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-primary" />
        <p className="text-sm font-medium">Recently Used</p>
      </div>

      <ScrollArea className="w-full" aria-label="Recent presets">
        <div className="flex gap-2 pb-2" role="list">
          {presets.map((preset) => (
            <Button
              key={preset.id}
              variant="outline"
              onClick={() => handleSelectPreset(preset)}
              className="shrink-0 h-auto min-h-[44px] py-2 px-4 rounded-xl hover:bg-primary hover:text-primary-foreground transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={`Use preset: ${preset.preset_data.displayName || 'Previous Selection'}, last used ${formatDistanceToNow(new Date(preset.last_used_at), { addSuffix: true })}`}
              role="listitem"
            >
              <div className="flex flex-col items-start gap-1">
                <span className="text-sm font-medium">
                  {preset.preset_data.displayName || 'Previous Selection'}
                </span>
                <Badge variant="secondary" className="text-xs" aria-hidden="true">
                  {formatDistanceToNow(new Date(preset.last_used_at), { addSuffix: true })}
                </Badge>
              </div>
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
