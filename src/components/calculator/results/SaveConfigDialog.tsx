import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCalculatorSaveShare } from '../hooks/useCalculatorSaveShare';
import type { CalculatorSelections } from '../hooks/useCalculatorState';
import type { PricingResult } from '../hooks/useCalculatorPricing';

interface SaveConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selections: CalculatorSelections;
  pricing: PricingResult | null;
}

export function SaveConfigDialog({ open, onOpenChange, selections, pricing }: SaveConfigDialogProps) {
  const [configName, setConfigName] = useState('');
  const { saveConfiguration, saving } = useCalculatorSaveShare();

  const handleSave = async () => {
    if (!configName.trim()) return;

    const result = await saveConfiguration(configName, selections, pricing);
    if (result) {
      setConfigName('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Configuration</DialogTitle>
          <DialogDescription>
            Give your project estimate a name so you can find it later
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="config-name">Configuration Name</Label>
            <Input
              id="config-name"
              placeholder="e.g., Kitchen Renovation - Modern Style"
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Project Type:</span>
              <span className="font-medium">{selections.projectType?.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated Cost:</span>
              <span className="font-medium">
                {pricing ? `€${pricing.min.toLocaleString()} - €${pricing.max.toLocaleString()}` : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!configName.trim() || saving}>
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
