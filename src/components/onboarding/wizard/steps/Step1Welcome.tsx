import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Sparkles } from 'lucide-react';

const EXPERIENCE_OPTIONS = [
  { value: '0-1', label: '0-1 years - Just starting out' },
  { value: '1-3', label: '1-3 years - Building experience' },
  { value: '3-5', label: '3-5 years - Confident professional' },
  { value: '5-10', label: '5-10 years - Highly experienced' },
  { value: '10-15', label: '10-15 years - Industry veteran' },
  { value: '15+', label: '15+ years - Master of the craft' },
];

interface Step1WelcomeProps {
  data: {
    displayName: string;
    tagline: string;
    experienceYears: string;
  };
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}

export function Step1Welcome({ data, onChange, errors }: Step1WelcomeProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold">Let's Get You Started!</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Tell us a bit about yourself. This will only take 30 seconds.
        </p>
      </div>

      <div className="space-y-6 max-w-lg mx-auto">
        <div>
          <Label htmlFor="displayName" className="text-base">
            Your Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="displayName"
            value={data.displayName}
            onChange={(e) => onChange('displayName', e.target.value)}
            placeholder="e.g., John Smith"
            className={`mt-2 h-12 text-lg ${errors.displayName ? 'border-destructive' : ''}`}
            autoFocus
          />
          {errors.displayName && (
            <p className="text-sm text-destructive flex items-center gap-1 mt-2">
              <AlertCircle className="w-3 h-3" />
              {errors.displayName}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="tagline" className="text-base">
            Your Tagline <span className="text-destructive">*</span>
          </Label>
          <p className="text-sm text-muted-foreground mt-1 mb-2">
            A catchy one-liner that describes what you do
          </p>
          <Input
            id="tagline"
            value={data.tagline}
            onChange={(e) => onChange('tagline', e.target.value)}
            placeholder="e.g., Expert Plumber • Fast Response • 24/7"
            maxLength={60}
            className={`h-12 ${errors.tagline ? 'border-destructive' : ''}`}
          />
          <div className="flex justify-between items-center mt-2">
            {errors.tagline ? (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.tagline}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                💡 Keep it short and memorable
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {data.tagline.length}/60
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="experienceYears" className="text-base">
            Years of Experience <span className="text-destructive">*</span>
          </Label>
          <select
            id="experienceYears"
            value={data.experienceYears}
            onChange={(e) => onChange('experienceYears', e.target.value)}
            className={`flex h-12 w-full rounded-md border border-input bg-background px-4 py-2 text-base mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              errors.experienceYears ? 'border-destructive' : ''
            }`}
          >
            <option value="">Select your experience level</option>
            {EXPERIENCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.experienceYears && (
            <p className="text-sm text-destructive flex items-center gap-1 mt-2">
              <AlertCircle className="w-3 h-3" />
              {errors.experienceYears}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
