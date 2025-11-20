import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Camera, Image, Video } from 'lucide-react';

interface Props {
  state: any;
  onUpdate: (updates: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export const MediaProofStep: React.FC<Props> = ({ state, onUpdate, onNext, onBack }) => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-primary/10">
            <Camera className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Media & Proof</h2>
            <p className="text-sm text-muted-foreground">
              Showcase your work with photos and videos
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Primary Image */}
          <div>
            <Label htmlFor="primaryImage" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Primary Image URL (Optional)
            </Label>
            <Input
              id="primaryImage"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={state.primaryImageUrl}
              onChange={(e) => onUpdate({ primaryImageUrl: e.target.value })}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              This will be the main image displayed for your service
            </p>
          </div>

          {/* Image Alt Text */}
          {state.primaryImageUrl && (
            <div>
              <Label htmlFor="imageAltText">Image Description (for accessibility)</Label>
              <Input
                id="imageAltText"
                placeholder="e.g., Modern kitchen renovation with white cabinets"
                value={state.imageAltText}
                onChange={(e) => onUpdate({ imageAltText: e.target.value })}
                className="mt-2"
              />
            </div>
          )}

          {/* Gallery Images */}
          <div>
            <Label htmlFor="galleryImages" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Gallery Images (Optional)
            </Label>
            <Input
              id="galleryImages"
              type="text"
              placeholder="Separate multiple URLs with commas"
              value={state.galleryImages.join(', ')}
              onChange={(e) => onUpdate({ 
                galleryImages: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
              })}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              {state.galleryImages.length} image(s) added
            </p>
          </div>

          {/* Video URL */}
          <div>
            <Label htmlFor="videoUrl" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Video URL (Optional)
            </Label>
            <Input
              id="videoUrl"
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={state.videoUrl}
              onChange={(e) => onUpdate({ videoUrl: e.target.value })}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              YouTube, Vimeo, or direct video links
            </p>
          </div>

          {/* Media Tips */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              📸 Tips for Great Photos
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Use high-quality, well-lit images</li>
              <li>• Show before and after results</li>
              <li>• Include close-ups of your craftsmanship</li>
              <li>• Keep photos professional and relevant</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>
          Continue to Terms
        </Button>
      </div>
    </div>
  );
};
