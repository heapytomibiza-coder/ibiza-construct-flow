import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MapPin, Navigation } from 'lucide-react';

interface Props {
  state: any;
  onUpdate: (updates: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export const LocationCoverageStep: React.FC<Props> = ({ state, onUpdate, onNext, onBack }) => {
  const canProceed = state.baseLocation && state.serviceType;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-primary/10">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Location & Coverage</h2>
            <p className="text-sm text-muted-foreground">
              Where do you provide your services?
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Base Location */}
          <div>
            <Label htmlFor="baseLocation">Base Location *</Label>
            <Input
              id="baseLocation"
              placeholder="e.g., Ibiza Town, San Antonio"
              value={state.baseLocation}
              onChange={(e) => onUpdate({ baseLocation: e.target.value })}
              className="mt-2"
            />
          </div>

          {/* Service Type */}
          <div>
            <Label>Service Type *</Label>
            <RadioGroup
              value={state.serviceType}
              onValueChange={(value) => onUpdate({ serviceType: value })}
              className="mt-3 space-y-3"
            >
              <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-accent">
                <RadioGroupItem value="onsite" id="onsite" />
                <Label htmlFor="onsite" className="flex-1 cursor-pointer">
                  <div className="font-medium">On-site Service</div>
                  <div className="text-sm text-muted-foreground">
                    I travel to client locations
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-accent">
                <RadioGroupItem value="remote" id="remote" />
                <Label htmlFor="remote" className="flex-1 cursor-pointer">
                  <div className="font-medium">Remote Service</div>
                  <div className="text-sm text-muted-foreground">
                    Work can be done remotely
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-accent">
                <RadioGroupItem value="hybrid" id="hybrid" />
                <Label htmlFor="hybrid" className="flex-1 cursor-pointer">
                  <div className="font-medium">Hybrid</div>
                  <div className="text-sm text-muted-foreground">
                    Both on-site and remote options
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Travel Radius (for onsite/hybrid) */}
          {(state.serviceType === 'onsite' || state.serviceType === 'hybrid') && (
            <div>
              <Label htmlFor="travelRadius" className="flex items-center gap-2">
                <Navigation className="h-4 w-4" />
                Travel Radius (km)
              </Label>
              <Input
                id="travelRadius"
                type="number"
                min="0"
                step="5"
                value={state.travelRadiusKm}
                onChange={(e) => onUpdate({ travelRadiusKm: parseInt(e.target.value) || 10 })}
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-1">
                How far are you willing to travel from your base location?
              </p>
            </div>
          )}

          {/* Coverage Areas */}
          <div>
            <Label htmlFor="coverageAreas">Specific Areas Covered (Optional)</Label>
            <Input
              id="coverageAreas"
              placeholder="e.g., Santa Eulalia, Es Canar, Cala Llonga"
              value={state.coverageAreas.join(', ')}
              onChange={(e) => onUpdate({ coverageAreas: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Separate multiple areas with commas
            </p>
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!canProceed}>
          Continue to Pricing
        </Button>
      </div>
    </div>
  );
};
