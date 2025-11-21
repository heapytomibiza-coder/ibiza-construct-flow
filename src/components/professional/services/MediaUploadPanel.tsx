import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Image, Video, Upload } from 'lucide-react';

interface Props {
  data: any;
  onUpdate: (data: any) => void;
}

export const MediaUploadPanel: React.FC<Props> = ({ data, onUpdate }) => {
  const handleFieldChange = (field: string, value: any) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Add photos and videos to showcase your work. This is optional but highly recommended.
      </p>

      {/* Primary Image */}
      <div>
        <Label htmlFor="primaryImage" className="flex items-center gap-2">
          <Image className="h-4 w-4" />
          Primary Image URL
        </Label>
        <Input
          id="primaryImage"
          type="url"
          placeholder="https://example.com/image.jpg"
          value={data.primaryImageUrl || ''}
          onChange={(e) => handleFieldChange('primaryImageUrl', e.target.value)}
          className="mt-2"
        />
        {data.primaryImageUrl && (
          <Card className="mt-3 p-3">
            <img
              src={data.primaryImageUrl}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          </Card>
        )}
      </div>

      {/* Gallery Images */}
      <div>
        <Label htmlFor="galleryImages" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Gallery Images
        </Label>
        <Input
          id="galleryImages"
          placeholder="Paste image URLs, separated by commas"
          value={data.galleryImages?.join(', ') || ''}
          onChange={(e) => {
            const urls = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
            handleFieldChange('galleryImages', urls);
          }}
          className="mt-2"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {data.galleryImages?.length || 0} image(s) added
        </p>
      </div>

      {/* Video URL */}
      <div>
        <Label htmlFor="videoUrl" className="flex items-center gap-2">
          <Video className="h-4 w-4" />
          Video URL
        </Label>
        <Input
          id="videoUrl"
          type="url"
          placeholder="https://youtube.com/watch?v=..."
          value={data.videoUrl || ''}
          onChange={(e) => handleFieldChange('videoUrl', e.target.value)}
          className="mt-2"
        />
        <p className="text-xs text-muted-foreground mt-1">
          YouTube, Vimeo, or direct video links
        </p>
      </div>

      {/* Tips */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
          <Image className="h-4 w-4" />
          Tips for Great Media
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Use high-quality, well-lit images</li>
          <li>• Show before and after results</li>
          <li>• Include close-ups of your work</li>
          <li>• Videos should be under 2 minutes</li>
        </ul>
      </Card>
    </div>
  );
};
