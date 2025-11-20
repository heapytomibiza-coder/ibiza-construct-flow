import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Clock, AlertCircle } from 'lucide-react';

interface Props {
  state: any;
  onUpdate: (updates: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export const TermsStep: React.FC<Props> = ({ state, onUpdate, onNext, onBack }) => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Terms & Requirements</h2>
            <p className="text-sm text-muted-foreground">
              Set your booking conditions and requirements
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Cancellation Policy */}
          <div>
            <Label htmlFor="cancellationHours" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Cancellation Notice (hours)
            </Label>
            <Input
              id="cancellationHours"
              type="number"
              min="0"
              step="1"
              value={state.cancellationHours}
              onChange={(e) => onUpdate({ cancellationHours: parseInt(e.target.value) || 24 })}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Minimum notice required for free cancellation
            </p>
          </div>

          {/* Lead Time */}
          <div>
            <Label htmlFor="leadTimeDays" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Lead Time (days)
            </Label>
            <Input
              id="leadTimeDays"
              type="number"
              min="0"
              step="1"
              value={state.leadTimeDays}
              onChange={(e) => onUpdate({ leadTimeDays: parseInt(e.target.value) || 1 })}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              How many days in advance should clients book?
            </p>
          </div>

          {/* Special Requirements */}
          <div>
            <Label htmlFor="specialRequirements">Special Requirements (Optional)</Label>
            <Textarea
              id="specialRequirements"
              placeholder="e.g., Client must provide parking, Access needed to water/electricity, Minimum space requirements..."
              value={state.specialRequirements}
              onChange={(e) => onUpdate({ specialRequirements: e.target.value })}
              className="mt-2 min-h-[100px]"
            />
          </div>

          {/* Requirements Checkboxes */}
          <div className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Documentation Requirements</h4>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="insuranceRequired"
                checked={state.insuranceRequired}
                onCheckedChange={(checked) => onUpdate({ insuranceRequired: checked })}
              />
              <Label htmlFor="insuranceRequired" className="cursor-pointer">
                Insurance verification required
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="permitRequired"
                checked={state.permitRequired}
                onCheckedChange={(checked) => onUpdate({ permitRequired: checked })}
              />
              <Label htmlFor="permitRequired" className="cursor-pointer">
                Building permits may be required
              </Label>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Terms Summary</h4>
            <ul className="text-sm space-y-1">
              <li>• Cancellation: {state.cancellationHours}h notice required</li>
              <li>• Lead time: Book at least {state.leadTimeDays} day(s) in advance</li>
              <li>• Insurance: {state.insuranceRequired ? 'Required' : 'Not required'}</li>
              <li>• Permits: {state.permitRequired ? 'May be required' : 'Not required'}</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>
          Review & Publish
        </Button>
      </div>
    </div>
  );
};
