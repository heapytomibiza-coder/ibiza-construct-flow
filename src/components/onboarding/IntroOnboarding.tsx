import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { CategoryIconCards } from './CategoryIconCards';

const IBIZA_ZONES = [
  'Ibiza Town', 'San Antonio', 'Santa Eulalia', 'Playa d\'en Bossa',
  'San José', 'San Juan', 'San Carlos', 'Es Canar'
];

const AVAILABILITY_OPTIONS = [
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'evenings', label: 'Evenings' },
  { value: 'mornings', label: 'Mornings' },
  { value: 'afternoons', label: 'Afternoons' },
  { value: 'flexible', label: 'Flexible' },
];

interface IntroOnboardingProps {
  onSubmit: (data: IntroData) => void;
  isLoading?: boolean;
}

export interface IntroData {
  displayName: string;
  bio: string;
  categories: string[];
  regions: string[];
  availability: string[];
}

export function IntroOnboarding({ onSubmit, isLoading }: IntroOnboardingProps) {
  const [data, setData] = useState<IntroData>({
    displayName: '',
    bio: '',
    categories: [],
    regions: [],
    availability: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!data.displayName.trim()) {
      newErrors.displayName = 'Name is required';
    }
    if (!data.bio.trim() || data.bio.length < 20) {
      newErrors.bio = 'Please write at least 20 characters about yourself';
    }
    if (data.bio.length > 140) {
      newErrors.bio = 'Keep it under 140 characters for now';
    }
    if (data.categories.length === 0) {
      newErrors.categories = 'Select at least one category';
    }
    if (data.regions.length === 0) {
      newErrors.regions = 'Select at least one service area';
    }
    if (data.availability.length === 0) {
      newErrors.availability = 'Select your availability';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(data);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Profile Setup</h1>
        <p className="text-muted-foreground">
          Tell us about yourself — you'll add detailed services after verification
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Step 1 of 3: Basic Profile → Verification → Service Catalog
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-8">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="displayName">
                Your Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="displayName"
                value={data.displayName}
                onChange={(e) => setData({ ...data, displayName: e.target.value })}
                placeholder="John Smith"
                className={errors.displayName ? 'border-destructive' : ''}
              />
              {errors.displayName && (
                <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.displayName}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="bio">
                Short Bio <span className="text-destructive">*</span>
                <span className="text-xs text-muted-foreground ml-2">(Max 140 chars)</span>
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Quick intro — you can add more detail after verification
              </p>
              <Textarea
                id="bio"
                value={data.bio}
                onChange={(e) => setData({ ...data, bio: e.target.value })}
                placeholder="Certified electrician with 10+ years in Ibiza..."
                rows={3}
                maxLength={140}
                className={errors.bio ? 'border-destructive' : ''}
              />
              <div className="flex justify-between items-center mt-1">
                <div>
                  {errors.bio && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.bio}
                    </p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.bio.length}/140
                </p>
              </div>
            </div>
          </div>

          {/* Categories (High-Level) */}
          <div className="space-y-3">
            <div>
              <Label>
                Your Main Skill Areas <span className="text-destructive">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                Select broad categories (e.g., "Plumbing", "Electrical"). You'll choose specific services like "Leak Repair" or "Outlet Installation" in Step 3.
              </p>
            </div>
            <CategoryIconCards
              selectedCategories={data.categories}
              onSelectionChange={(categories) => setData({ ...data, categories })}
            />
            {errors.categories && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.categories}
              </p>
            )}
          </div>

          {/* Service Areas */}
          <div className="space-y-3">
            <div>
              <Label>
                Service Areas <span className="text-destructive">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                Which zones do you cover?
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {IBIZA_ZONES.map((zone) => (
                <Badge
                  key={zone}
                  variant={data.regions.includes(zone) ? 'default' : 'outline'}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {
                    setData({
                      ...data,
                      regions: data.regions.includes(zone)
                        ? data.regions.filter((z) => z !== zone)
                        : [...data.regions, zone]
                    });
                  }}
                >
                  {zone}
                </Badge>
              ))}
            </div>
            {errors.regions && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.regions}
              </p>
            )}
          </div>

          {/* Availability Preference */}
          <div className="space-y-3">
            <div>
              <Label>
                Availability Preference <span className="text-destructive">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                General availability — you'll set exact hours later
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {AVAILABILITY_OPTIONS.map((option) => (
                <Badge
                  key={option.value}
                  variant={data.availability.includes(option.value) ? 'default' : 'outline'}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {
                    setData({
                      ...data,
                      availability: data.availability.includes(option.value)
                        ? data.availability.filter((a) => a !== option.value)
                        : [...data.availability, option.value]
                    });
                  }}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
            {errors.availability && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.availability}
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="pt-4">
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              size="lg"
              className="w-full"
            >
              {isLoading ? (
                <>Processing...</>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit Introduction
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-3">
              Next: Upload verification documents (1-2 business days)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
