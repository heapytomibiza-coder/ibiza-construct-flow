import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  data: any;
  serviceType: any;
  onUpdate: (data: any) => void;
}

export const DetailsPanel: React.FC<Props> = ({ data, serviceType, onUpdate }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    // Generate smart suggestions based on service type
    if (serviceType?.label) {
      const baseSuggestions = [
        'Including all materials',
        'Free consultation',
        'Same-day service available',
        '12-month warranty included',
      ];
      setSuggestions(baseSuggestions);
    }
  }, [serviceType]);

  const handleFieldChange = (field: string, value: any) => {
    onUpdate({ ...data, [field]: value });
  };

  const addSuggestion = (suggestion: string) => {
    const current = data.description || '';
    const separator = current ? '\n• ' : '• ';
    handleFieldChange('description', current + separator + suggestion);
  };

  const getValidationIcon = (field: string) => {
    const value = data[field];
    if (!value) return null;
    
    if (field === 'serviceName' && value.length >= 10) {
      return <CheckCircle2 className="h-4 w-4 text-sage" />;
    }
    if (field === 'description' && value.length >= 50) {
      return <CheckCircle2 className="h-4 w-4 text-sage" />;
    }
    return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      {/* Service Name */}
      <div>
        <Label htmlFor="serviceName" className="flex items-center justify-between">
          <span>Service Name *</span>
          {getValidationIcon('serviceName')}
        </Label>
        <Input
          id="serviceName"
          placeholder={`e.g., Professional ${serviceType?.label || 'Service'}`}
          value={data.serviceName || ''}
          onChange={(e) => handleFieldChange('serviceName', e.target.value)}
          className="mt-2"
        />
        {data.serviceName && data.serviceName.length >= 10 && (
          <p className="text-xs text-sage mt-1">✓ Great! Clear and descriptive</p>
        )}
      </div>

      {/* Pricing Type */}
      <div>
        <Label className="mb-3 block">Pricing *</Label>
        <RadioGroup
          value={data.pricing || ''}
          onValueChange={(value) => handleFieldChange('pricing', value)}
        >
          <div className="flex items-center space-x-2 p-3 rounded-lg border hover:border-sage transition-colors">
            <RadioGroupItem value="fixed" id="fixed" />
            <Label htmlFor="fixed" className="flex-1 cursor-pointer">
              <div className="font-medium">Fixed Price</div>
              <div className="text-xs text-muted-foreground">Set a specific price for this service</div>
            </Label>
          </div>
          <div className="flex items-center space-x-2 p-3 rounded-lg border hover:border-sage transition-colors">
            <RadioGroupItem value="quote" id="quote" />
            <Label htmlFor="quote" className="flex-1 cursor-pointer">
              <div className="font-medium">Quote Required</div>
              <div className="text-xs text-muted-foreground">Clients will contact you for pricing</div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Base Price - if fixed */}
      {data.pricing === 'fixed' && (
        <div>
          <Label htmlFor="basePrice">Base Price (€) *</Label>
          <Input
            id="basePrice"
            type="number"
            placeholder="0.00"
            value={data.basePrice || ''}
            onChange={(e) => handleFieldChange('basePrice', e.target.value)}
            className="mt-2"
          />
        </div>
      )}

      {/* Description */}
      <div>
        <Label htmlFor="description" className="flex items-center justify-between mb-2">
          <span>Service Description *</span>
          {getValidationIcon('description')}
        </Label>
        <Textarea
          id="description"
          placeholder="Describe what's included, your expertise, and what makes your service unique..."
          value={data.description || ''}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          className="min-h-[120px]"
          maxLength={500}
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            {data.description?.length || 0} / 500 characters
          </span>
          {data.description && data.description.length >= 50 && (
            <span className="text-xs text-sage">✓ Good length</span>
          )}
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="mt-3 p-3 bg-sage/5 rounded-lg border border-sage/20">
            <div className="flex items-center gap-2 text-sm font-medium text-sage-dark mb-2">
              <Lightbulb className="h-4 w-4" />
              Quick Add Suggestions
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                  onClick={() => addSuggestion(suggestion)}
                >
                  + {suggestion}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Duration Estimate */}
      <div>
        <Label htmlFor="duration">Estimated Duration</Label>
        <Input
          id="duration"
          placeholder="e.g., 2-3 hours, 1-2 days"
          value={data.duration || ''}
          onChange={(e) => handleFieldChange('duration', e.target.value)}
          className="mt-2"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Help clients plan by giving a time estimate
        </p>
      </div>
    </div>
  );
};
