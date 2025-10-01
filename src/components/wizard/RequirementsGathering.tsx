import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, FileText, Ruler, Clock, Euro, 
  Upload, X, Plus, Calendar
} from 'lucide-react';

interface RequirementsGatheringProps {
  requirements: {
    scope?: string;
    timeline?: string;
    budgetRange?: string;
    constraints?: string;
    materials?: string;
    specifications?: Record<string, any>;
    referenceImages?: Array<{ name: string; url: string }>;
  };
  onUpdate: (requirements: any) => void;
}

export const RequirementsGathering = ({ requirements, onUpdate }: RequirementsGatheringProps) => {
  const [images, setImages] = useState<Array<{ name: string; url: string }>>(
    requirements.referenceImages || []
  );

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Simulate upload - in production, upload to storage
    const newImages = Array.from(files).map(file => ({
      name: file.name,
      url: URL.createObjectURL(file)
    }));

    const updated = [...images, ...newImages];
    setImages(updated);
    onUpdate({ ...requirements, referenceImages: updated });
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    onUpdate({ ...requirements, referenceImages: updated });
  };

  const timelineOptions = [
    'Urgent (within 1 week)',
    'This month',
    'Next 3 months', 
    'Flexible'
  ];

  const budgetRanges = [
    'Under €1,000',
    '€1,000 - €5,000',
    '€5,000 - €10,000',
    '€10,000 - €25,000',
    'Over €25,000',
    'Need quote'
  ];

  return (
    <div className="space-y-6">
      {/* Project Scope */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-copper" />
            <h4 className="font-semibold text-foreground">Project Scope</h4>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              What areas or rooms are involved?
            </label>
            <Textarea
              value={requirements.scope || ''}
              onChange={(e) => onUpdate({ ...requirements, scope: e.target.value })}
              placeholder="e.g., Kitchen (20m²), bathroom needs complete renovation..."
              rows={3}
              className="resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Material preferences or requirements
            </label>
            <Textarea
              value={requirements.materials || ''}
              onChange={(e) => onUpdate({ ...requirements, materials: e.target.value })}
              placeholder="e.g., prefer ceramic tiles, oak flooring, energy-efficient fixtures..."
              rows={2}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Timeline & Budget */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-copper" />
                <h4 className="font-semibold text-foreground">Timeline</h4>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {timelineOptions.map((option) => (
                  <Button
                    key={option}
                    variant={requirements.timeline === option ? "default" : "outline"}
                    onClick={() => onUpdate({ ...requirements, timeline: option })}
                    className="justify-start"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Euro className="w-5 h-5 text-copper" />
                <h4 className="font-semibold text-foreground">Budget Range</h4>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {budgetRanges.map((range) => (
                  <Button
                    key={range}
                    variant={requirements.budgetRange === range ? "default" : "outline"}
                    onClick={() => onUpdate({ ...requirements, budgetRange: range })}
                    className="justify-start"
                  >
                    {range}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Constraints & Access */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Ruler className="w-5 h-5 text-copper" />
            <h4 className="font-semibold text-foreground">Constraints & Access</h4>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Any access issues, parking, or special considerations?
            </label>
            <Textarea
              value={requirements.constraints || ''}
              onChange={(e) => onUpdate({ ...requirements, constraints: e.target.value })}
              placeholder="e.g., narrow staircase, no parking on street, building is occupied..."
              rows={3}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Reference Images */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Camera className="w-5 h-5 text-copper" />
            <h4 className="font-semibold text-foreground">Reference Images</h4>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            Upload photos of the current space or inspiration images
          </p>

          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={image.url} 
                    alt={image.name}
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {image.name}
                  </p>
                </div>
              ))}
            </div>
          )}

          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center hover:border-copper transition-colors">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Click to upload images or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG up to 10MB each
              </p>
            </div>
          </label>
        </CardContent>
      </Card>

      {/* Help Text */}
      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Tip:</strong> The more details you provide, the more accurate quotes you'll receive from professionals.
        </p>
      </div>
    </div>
  );
};
