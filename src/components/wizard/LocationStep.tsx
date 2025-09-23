import { Card } from '@/components/ui/card';
import { LocationChips, UrgencyChips, PropertyTypeChips } from '@/components/services/QuickSelectionChips';
import { SmartLocationSuggestions } from '@/components/smart/SmartLocationSuggestions';
import { PreferenceCollector } from '@/components/smart/PreferenceCollector';

interface LocationStepProps {
  answers: Record<string, any>;
  onAnswerChange: (questionId: string, value: any) => void;
  selectedService?: string;
}

export const LocationStep = ({ answers, onAnswerChange, selectedService }: LocationStepProps) => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Location & Timing Details</h3>
            <p className="text-muted-foreground">Help professionals find and prioritize your job</p>
          </div>

          <LocationChips
            selectedOptions={answers.location ? [answers.location] : []}
            onSelectionChange={(options) => onAnswerChange('location', options[0] || '')}
          />

          <PropertyTypeChips
            selectedOptions={answers.propertyType ? [answers.propertyType] : []}
            onSelectionChange={(options) => onAnswerChange('propertyType', options[0] || '')}
          />

          <UrgencyChips
            selectedOptions={answers.urgency ? [answers.urgency] : []}
            onSelectionChange={(options) => onAnswerChange('urgency', options[0] || '')}
          />

          {/* Additional Details */}
          <Card className="p-4 bg-gradient-card">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Additional Location Details (Optional)
                </label>
                <textarea
                  placeholder="e.g., Second floor apartment, access through main entrance..."
                  value={answers.locationDetails || ''}
                  onChange={(e) => onAnswerChange('locationDetails', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px] resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Budget Range (Optional)
                </label>
                <select
                  value={answers.budget || ''}
                  onChange={(e) => onAnswerChange('budget', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select budget range</option>
                  <option value="under-100">Under €100</option>
                  <option value="100-300">€100 - €300</option>
                  <option value="300-500">€300 - €500</option>
                  <option value="500-1000">€500 - €1,000</option>
                  <option value="1000-plus">€1,000+</option>
                  <option value="open">Open to offers</option>
                </select>
              </div>
            </div>
          </Card>
        </div>
      </Card>

      {/* Smart Location Suggestions */}
      <SmartLocationSuggestions
        selectedService={selectedService}
        onLocationSelect={(location) => {
          onAnswerChange('location', location.id);
          onAnswerChange('locationData', location);
        }}
      />

      {/* User Preferences for Better Matching */}
      <PreferenceCollector
        onPreferencesChange={(preferences) => onAnswerChange('matchingPreferences', preferences)}
      />
    </div>
  );
};