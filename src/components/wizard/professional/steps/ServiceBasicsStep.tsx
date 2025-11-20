import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CategorySelector } from '@/components/wizard/db-powered/CategorySelector';
import { SubcategorySelector } from '@/components/wizard/db-powered/SubcategorySelector';
import { Briefcase, FileText } from 'lucide-react';

interface Props {
  state: any;
  onUpdate: (updates: any) => void;
  onNext: () => void;
}

export const ServiceBasicsStep: React.FC<Props> = ({ state, onUpdate, onNext }) => {
  const canProceed = state.category && state.serviceName && state.description;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-primary/10">
            <Briefcase className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Service Basics</h2>
            <p className="text-sm text-muted-foreground">
              Choose your service category and provide essential details
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Category Selection */}
          {!state.category && (
            <div>
              <Label className="text-base font-medium mb-3 block">
                What category is your service in?
              </Label>
              <CategorySelector
                onSelect={(categoryName, categoryId) => {
                  onUpdate({
                    category: categoryName,
                    categoryId,
                    subcategory: '',
                    subcategoryId: '',
                    micro: '',
                    microId: '',
                  });
                }}
              />
            </div>
          )}

          {/* Subcategory Selection */}
          {state.category && !state.subcategory && (
            <div>
              <Label className="text-base font-medium mb-3 block">
                Select subcategory
              </Label>
              <SubcategorySelector
                categoryId={state.categoryId}
                categoryName={state.category}
                selectedSubcategoryId={state.subcategoryId}
                onSelect={(subcategoryName, subcategoryId) => {
                  onUpdate({
                    subcategory: subcategoryName,
                    subcategoryId,
                    micro: '',
                    microId: '',
                  });
                }}
                onNext={() => {}}
                onBack={() => onUpdate({ category: '', categoryId: '' })}
              />
            </div>
          )}

          {/* Micro Service Selection */}
          {state.category && state.subcategory && !state.micro && (
            <div>
              <Label className="text-base font-medium mb-3 block">
                What specific service do you offer? (Optional)
              </Label>
              <Input
                placeholder="e.g., Kitchen Renovation, Bathroom Tiling, Deck Building"
                value={state.micro}
                onChange={(e) => onUpdate({ micro: e.target.value, microId: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUpdate({ subcategory: '', subcategoryId: '' })}
                className="mt-2"
              >
                ← Change subcategory
              </Button>
            </div>
          )}

          {/* Service Name & Description */}
          {state.category && state.subcategory && (
            <>
              <div>
                <Label htmlFor="serviceName">Service Name *</Label>
                <Input
                  id="serviceName"
                  placeholder="e.g., Professional Kitchen Renovation"
                  value={state.serviceName}
                  onChange={(e) => onUpdate({ serviceName: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what's included, your expertise, and what makes your service unique..."
                  value={state.description}
                  onChange={(e) => onUpdate({ description: e.target.value })}
                  className="mt-2 min-h-[120px]"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {state.description.length} / 500 characters
                </p>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-end">
        <Button
          onClick={onNext}
          disabled={!canProceed}
          size="lg"
        >
          Continue to Details
        </Button>
      </div>
    </div>
  );
};
