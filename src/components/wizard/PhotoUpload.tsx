import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, X, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  photos,
  onPhotosChange,
  maxPhotos = 5
}) => {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (photos.length + acceptedFiles.length > maxPhotos) {
      toast.error(`Maximum ${maxPhotos} photos allowed`);
      return;
    }

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of acceptedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
        const filePath = `job-photos/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('service-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('service-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      onPhotosChange([...photos, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} photo(s) uploaded`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photos');
    } finally {
      setUploading(false);
    }
  }, [photos, onPhotosChange, maxPhotos]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: maxPhotos - photos.length,
    disabled: uploading || photos.length >= maxPhotos
  });

  const removePhoto = (index: number) => {
    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  return (
    <Card className="p-6 border-2 border-dashed border-primary/20 bg-primary/5">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Add Photos</h3>
            <Badge variant="secondary" className="text-xs">
              Optional
            </Badge>
          </div>
          <span className="text-sm text-muted-foreground">
            {photos.length} / {maxPhotos}
          </span>
        </div>

        {photos.length < maxPhotos && (
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-all duration-200
              ${isDragActive 
                ? 'border-primary bg-primary/10' 
                : 'border-border hover:border-primary/50 hover:bg-primary/5'
              }
              ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Upload className="w-10 h-10 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {isDragActive ? 'Drop photos here' : 'Click or drag photos'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Photos help professionals understand your needs better
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={photo}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border-2 border-border"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                  onClick={() => removePhoto(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
