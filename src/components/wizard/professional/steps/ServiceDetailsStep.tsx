import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Clock, Ruler } from 'lucide-react';

interface Props {
  state: any;
  onUpdate: (updates: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export const ServiceDetailsStep: React.FC<Props> = ({ state, onUpdate, onNext, onBack }) => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-primary/10">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Service Details</h2>
            <p className="text-sm text-muted-foreground">
              Specify the technical details of your service
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Difficulty Level */}
          <div>
            <Label htmlFor="difficultyLevel">Difficulty Level</Label>
            <Select
              value={state.difficultyLevel}
              onValueChange={(value) => onUpdate({ difficultyLevel: value })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy - Basic tasks</SelectItem>
                <SelectItem value="medium">Medium - Standard projects</SelectItem>
                <SelectItem value="hard">Hard - Complex work</SelectItem>
                <SelectItem value="expert">Expert - Specialized projects</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Estimated Duration */}
          <div>
            <Label htmlFor="estimatedDuration" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Estimated Duration (minutes)
            </Label>
            <Input
              id="estimatedDuration"
              type="number"
              min="15"
              step="15"
              value={state.estimatedDurationMinutes}
              onChange={(e) => onUpdate({ estimatedDurationMinutes: parseInt(e.target.value) || 60 })}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Approximately {Math.round(state.estimatedDurationMinutes / 60)} hour(s)
            </p>
          </div>

          {/* Unit Type */}
          <div>
            <Label htmlFor="unitType" className="flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Unit Type
            </Label>
            <Select
              value={state.unitType}
              onValueChange={(value) => onUpdate({ unitType: value })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="per_job">Per Job</SelectItem>
                <SelectItem value="per_hour">Per Hour</SelectItem>
                <SelectItem value="per_day">Per Day</SelectItem>
                <SelectItem value="per_sqm">Per Square Meter</SelectItem>
                <SelectItem value="per_item">Per Item</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quantity Limits */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minQuantity">Minimum Quantity</Label>
              <Input
                id="minQuantity"
                type="number"
                min="1"
                value={state.minQuantity}
                onChange={(e) => onUpdate({ minQuantity: parseInt(e.target.value) || 1 })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="maxQuantity">Maximum Quantity</Label>
              <Input
                id="maxQuantity"
                type="number"
                min="1"
                value={state.maxQuantity}
                onChange={(e) => onUpdate({ maxQuantity: parseInt(e.target.value) || 999 })}
                className="mt-2"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>
          Continue to Location
        </Button>
      </div>
    </div>
  );
};
