import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, FileText, Upload, ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Step2StoryProps {
  data: {
    bio: string;
    contactEmail: string;
    contactPhone: string;
    coverImageUrl?: string;
  };
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
  coverImageFile: File | null;
  onCoverImageChange: (file: File | null) => void;
}

export function Step2Story({ 
  data, 
  onChange, 
  errors, 
  coverImageFile, 
  onCoverImageChange 
}: Step2StoryProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error('Only JPG, PNG, and WebP images are allowed');
        return;
      }
      onCoverImageChange(file);
      const blobUrl = URL.createObjectURL(file);
      onChange('coverImageUrl', blobUrl);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
          <FileText className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold">What Makes You Special?</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Share your story and let clients know how to reach you
        </p>
      </div>

      <div className="space-y-6 max-w-2xl mx-auto">
        <div>
          <Label htmlFor="bio" className="text-base">
            Your Bio <span className="text-destructive">*</span>
          </Label>
          <p className="text-sm text-muted-foreground mt-1 mb-2">
            Tell clients about your experience and what sets you apart
          </p>
          <Textarea
            id="bio"
            value={data.bio}
            onChange={(e) => onChange('bio', e.target.value)}
            placeholder="e.g., Certified electrician with 10+ years of experience in Ibiza. Specializing in residential and commercial installations..."
            rows={4}
            maxLength={500}
            className={errors.bio ? 'border-destructive' : ''}
          />
          <div className="flex justify-between items-center mt-2">
            {errors.bio ? (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.bio}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Minimum 50 characters
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {data.bio.length}/500
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="contactEmail" className="text-base">
              Contact Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="contactEmail"
              type="email"
              value={data.contactEmail}
              onChange={(e) => onChange('contactEmail', e.target.value)}
              placeholder="your@email.com"
              className={`mt-2 h-11 ${errors.contactEmail ? 'border-destructive' : ''}`}
            />
            {errors.contactEmail && (
              <p className="text-sm text-destructive flex items-center gap-1 mt-2">
                <AlertCircle className="w-3 h-3" />
                {errors.contactEmail}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="contactPhone" className="text-base">
              Contact Phone <span className="text-destructive">*</span>
            </Label>
            <Input
              id="contactPhone"
              type="tel"
              value={data.contactPhone}
              onChange={(e) => onChange('contactPhone', e.target.value)}
              placeholder="+34 600 123 456"
              className={`mt-2 h-11 ${errors.contactPhone ? 'border-destructive' : ''}`}
            />
            {errors.contactPhone && (
              <p className="text-sm text-destructive flex items-center gap-1 mt-2">
                <AlertCircle className="w-3 h-3" />
                {errors.contactPhone}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label className="text-base">Cover Photo</Label>
          <p className="text-sm text-muted-foreground mt-1 mb-3">
            Add a professional cover image to make your profile stand out (optional, max 5MB)
          </p>
          
          {coverImageFile || data.coverImageUrl ? (
            <div className="relative border-2 border-dashed rounded-lg p-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ImageIcon className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-medium">{coverImageFile?.name || 'Cover image'}</p>
                    <p className="text-sm text-muted-foreground">
                      {coverImageFile ? (coverImageFile.size / 1024).toFixed(0) + ' KB' : 'Uploaded'}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onCoverImageChange(null);
                    onChange('coverImageUrl', '');
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="font-medium mb-1">Click to upload cover photo</p>
              <p className="text-sm text-muted-foreground">JPG, PNG or WebP (max 5MB)</p>
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
