/**
 * Capability Filters Step Component
 * Step 4: Global capability filters for professional service preferences
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  DollarSign, 
  Users, 
  Globe, 
  AlertCircle,
  Wrench 
} from 'lucide-react';

// Ibiza service regions
const SERVICE_REGIONS = [
  { id: 'ibiza-town', label: 'Ibiza Town' },
  { id: 'san-antonio', label: 'San Antonio' },
  { id: 'santa-eulalia', label: 'Santa Eulalia' },
  { id: 'san-jose', label: 'San José' },
  { id: 'san-juan', label: 'San Juan' },
  { id: 'formentera', label: 'Formentera' }
];

const LANGUAGES = [
  { id: 'es', label: 'Spanish' },
  { id: 'en', label: 'English' },
  { id: 'de', label: 'German' },
  { id: 'fr', label: 'French' },
  { id: 'it', label: 'Italian' },
  { id: 'ca', label: 'Catalan' }
];

export interface CapabilityFilters {
  serviceRegions: string[];
  minJobValue: number;
  workStyle: 'solo' | 'team' | 'either';
  languages: string[];
  emergencyCallouts: boolean;
  hasOwnTools: boolean;
}

interface CapabilityFiltersStepProps {
  filters: CapabilityFilters;
  onFiltersChange: (filters: CapabilityFilters) => void;
}

export const CapabilityFiltersStep = ({
  filters,
  onFiltersChange
}: CapabilityFiltersStepProps) => {
  const toggleRegion = (regionId: string) => {
    const newRegions = filters.serviceRegions.includes(regionId)
      ? filters.serviceRegions.filter(r => r !== regionId)
      : [...filters.serviceRegions, regionId];
    onFiltersChange({ ...filters, serviceRegions: newRegions });
  };

  const toggleLanguage = (langId: string) => {
    const newLanguages = filters.languages.includes(langId)
      ? filters.languages.filter(l => l !== langId)
      : [...filters.languages, langId];
    onFiltersChange({ ...filters, languages: newLanguages });
  };

  const selectAllRegions = () => {
    onFiltersChange({ 
      ...filters, 
      serviceRegions: SERVICE_REGIONS.map(r => r.id) 
    });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl font-bold">Set Your Preferences</h2>
        <p className="text-muted-foreground">
          These settings help us match you with the right jobs
        </p>
      </div>

      {/* Service Areas */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Service Areas</CardTitle>
          </div>
          <CardDescription>
            Where are you willing to work?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <button
              type="button"
              onClick={selectAllRegions}
              className="text-sm text-primary hover:underline"
            >
              Select all areas
            </button>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {SERVICE_REGIONS.map((region) => {
                const isSelected = filters.serviceRegions.includes(region.id);
                return (
                  <label
                    key={region.id}
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleRegion(region.id)}
                    />
                    <span className="text-sm">{region.label}</span>
                  </label>
                );
              })}
            </div>
            {filters.serviceRegions.length === 0 && (
              <p className="text-sm text-amber-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Select at least one area to receive job matches
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Minimum Job Value */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Minimum Job Value</CardTitle>
          </div>
          <CardDescription>
            Set a minimum budget for jobs you want to see
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">€</span>
            <Input
              type="number"
              min={0}
              step={50}
              value={filters.minJobValue}
              onChange={(e) => onFiltersChange({ 
                ...filters, 
                minJobValue: parseInt(e.target.value) || 0 
              })}
              className="w-32"
            />
            <span className="text-sm text-muted-foreground">
              Jobs below this value won't appear in your feed
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Work Style */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Work Style</CardTitle>
          </div>
          <CardDescription>
            How do you typically work?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={filters.workStyle}
            onValueChange={(value) => onFiltersChange({ 
              ...filters, 
              workStyle: value as 'solo' | 'team' | 'either' 
            })}
            className="space-y-3"
          >
            <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
              <RadioGroupItem value="solo" />
              <div>
                <p className="font-medium">Work Solo</p>
                <p className="text-sm text-muted-foreground">I work independently</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
              <RadioGroupItem value="team" />
              <div>
                <p className="font-medium">Work with Team</p>
                <p className="text-sm text-muted-foreground">I have or need helpers for jobs</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
              <RadioGroupItem value="either" />
              <div>
                <p className="font-medium">Either</p>
                <p className="text-sm text-muted-foreground">Flexible depending on the job</p>
              </div>
            </label>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Languages</CardTitle>
          </div>
          <CardDescription>
            Which languages can you communicate in?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => {
              const isSelected = filters.languages.includes(lang.id);
              return (
                <Badge
                  key={lang.id}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer px-3 py-1.5"
                  onClick={() => toggleLanguage(lang.id)}
                >
                  {lang.label}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Additional Options */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Additional Options</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Emergency Callouts</p>
              <p className="text-sm text-muted-foreground">
                Available for urgent same-day jobs?
              </p>
            </div>
            <Switch
              checked={filters.emergencyCallouts}
              onCheckedChange={(checked) => onFiltersChange({ 
                ...filters, 
                emergencyCallouts: checked 
              })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Own Tools & Equipment</p>
              <p className="text-sm text-muted-foreground">
                I have my own professional tools
              </p>
            </div>
            <Switch
              checked={filters.hasOwnTools}
              onCheckedChange={(checked) => onFiltersChange({ 
                ...filters, 
                hasOwnTools: checked 
              })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
