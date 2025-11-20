import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Edit, Save, Send } from 'lucide-react';

interface Props {
  state: any;
  onBack: () => void;
  onSubmit: (isDraft: boolean) => void;
  loading: boolean;
}

export const ReviewStep: React.FC<Props> = ({ state, onBack, onSubmit, loading }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex p-3 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold">Review Your Service</h2>
        <p className="text-muted-foreground mt-2">
          Double-check everything before publishing
        </p>
      </div>

      {/* Service Basics */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Service Basics</h3>
          <Button variant="ghost" size="sm" onClick={onBack}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Category:</span>
            <span className="font-medium">{state.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subcategory:</span>
            <span className="font-medium">{state.subcategory}</span>
          </div>
          {state.micro && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service Type:</span>
              <span className="font-medium">{state.micro}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service Name:</span>
            <span className="font-medium">{state.serviceName}</span>
          </div>
          <div className="pt-2 border-t">
            <p className="text-muted-foreground mb-1">Description:</p>
            <p className="text-sm">{state.description}</p>
          </div>
        </div>
      </Card>

      {/* Details */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Service Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground block">Difficulty:</span>
            <Badge variant="outline" className="mt-1">{state.difficultyLevel}</Badge>
          </div>
          <div>
            <span className="text-muted-foreground block">Duration:</span>
            <span className="font-medium">{Math.round(state.estimatedDurationMinutes / 60)}h</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Unit Type:</span>
            <span className="font-medium">{state.unitType.replace('per_', 'Per ')}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Quantity Range:</span>
            <span className="font-medium">{state.minQuantity} - {state.maxQuantity}</span>
          </div>
        </div>
      </Card>

      {/* Location */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Location & Coverage</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Base Location:</span>
            <span className="font-medium">{state.baseLocation}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service Type:</span>
            <Badge variant="secondary">{state.serviceType}</Badge>
          </div>
          {(state.serviceType === 'onsite' || state.serviceType === 'hybrid') && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Travel Radius:</span>
              <span className="font-medium">{state.travelRadiusKm}km</span>
            </div>
          )}
          {state.coverageAreas.length > 0 && (
            <div>
              <span className="text-muted-foreground block mb-1">Coverage Areas:</span>
              <div className="flex flex-wrap gap-1">
                {state.coverageAreas.map((area: string, i: number) => (
                  <Badge key={i} variant="outline" className="text-xs">{area}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Pricing */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Pricing</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pricing Type:</span>
            <Badge variant="outline">{state.pricingType.replace('_', ' ')}</Badge>
          </div>
          {state.pricingType !== 'quote_required' && (
            <>
              <div className="flex justify-between text-lg font-bold text-primary">
                <span>Base Price:</span>
                <span>€{state.basePrice.toFixed(2)}</span>
              </div>
              {state.bulkDiscountThreshold > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Bulk Price (≥{state.bulkDiscountThreshold}):</span>
                  <span className="font-semibold">€{state.bulkDiscountPrice.toFixed(2)}</span>
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Media */}
      {(state.primaryImageUrl || state.galleryImages.length > 0 || state.videoUrl) && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Media</h3>
          <div className="space-y-2 text-sm">
            {state.primaryImageUrl && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Primary image added</span>
              </div>
            )}
            {state.galleryImages.length > 0 && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>{state.galleryImages.length} gallery image(s)</span>
              </div>
            )}
            {state.videoUrl && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Video added</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Terms */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Terms & Requirements</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cancellation Notice:</span>
            <span className="font-medium">{state.cancellationHours}h</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Lead Time:</span>
            <span className="font-medium">{state.leadTimeDays} day(s)</span>
          </div>
          <div className="flex gap-4 pt-2">
            {state.insuranceRequired && <Badge variant="secondary">Insurance Required</Badge>}
            {state.permitRequired && <Badge variant="secondary">Permits May Be Required</Badge>}
          </div>
          {state.specialRequirements && (
            <div className="pt-2 border-t">
              <p className="text-muted-foreground mb-1">Special Requirements:</p>
              <p className="text-sm">{state.specialRequirements}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="flex-1"
        >
          <Edit className="h-4 w-4 mr-2" />
          Go Back & Edit
        </Button>
        <Button
          variant="outline"
          onClick={() => onSubmit(true)}
          disabled={loading}
          className="flex-1"
        >
          <Save className="h-4 w-4 mr-2" />
          Save as Draft
        </Button>
        <Button
          onClick={() => onSubmit(false)}
          disabled={loading}
          className="flex-1"
          size="lg"
        >
          <Send className="h-4 w-4 mr-2" />
          {loading ? 'Publishing...' : 'Publish Service'}
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        By publishing, you agree to our terms and conditions
      </p>
    </div>
  );
};
