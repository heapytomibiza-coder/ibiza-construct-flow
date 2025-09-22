import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, X, Image, Video, Loader2 } from 'lucide-react';

interface ServicePhotoUploaderProps {
  serviceItemId: string;
  currentImages?: string[];
  currentVideo?: string;
  onImagesUpdate: (images: string[], primaryImage?: string) => void;
  onVideoUpdate: (videoUrl: string) => void;
}

export const ServicePhotoUploader: React.FC<ServicePhotoUploaderProps> = ({
  serviceItemId,
  currentImages = [],
  currentVideo,
  onImagesUpdate,
  onVideoUpdate
}) => {
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [videoUrl, setVideoUrl] = useState(currentVideo || '');

  const uploadFile = async (file: File, folder: string = 'services') => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('service-images')
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('service-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    
    try {
      const uploadPromises = acceptedFiles.map(file => uploadFile(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      
      const updatedImages = [...currentImages, ...uploadedUrls];
      onImagesUpdate(updatedImages, currentImages.length === 0 ? uploadedUrls[0] : undefined);
      
      toast.success(`${acceptedFiles.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  }, [currentImages, onImagesUpdate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.avif']
    },
    multiple: true,
    disabled: uploading
  });

  const removeImage = (indexToRemove: number) => {
    const updatedImages = currentImages.filter((_, index) => index !== indexToRemove);
    onImagesUpdate(updatedImages, indexToRemove === 0 ? updatedImages[0] : undefined);
    toast.success('Image removed');
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    const reorderedImages = [...currentImages];
    const [movedImage] = reorderedImages.splice(fromIndex, 1);
    reorderedImages.splice(toIndex, 0, movedImage);
    onImagesUpdate(reorderedImages, reorderedImages[0]);
  };

  const handleVideoSubmit = () => {
    onVideoUpdate(videoUrl);
    toast.success('Video URL updated');
  };

  return (
    <div className="space-y-6">
      {/* Photo Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Service Photos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
              ${uploading ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Uploading images...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm font-medium">
                  {isDragActive ? 'Drop images here' : 'Drag & drop images, or click to select'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports JPG, PNG, WebP, AVIF up to 50MB
                </p>
              </div>
            )}
          </div>

          {/* Image Gallery */}
          {currentImages.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="font-medium">Uploaded Images</h4>
                <Badge variant="secondary">{currentImages.length} image(s)</Badge>
                {currentImages.length > 0 && (
                  <Badge variant="outline">First image is primary</Badge>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {currentImages.map((imageUrl, index) => (
                  <div
                    key={index}
                    className="relative group aspect-square rounded-lg overflow-hidden bg-muted"
                    draggable
                    onDragStart={(e) => {
                      setDraggedIndex(index);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedIndex !== null && draggedIndex !== index) {
                        reorderImages(draggedIndex, index);
                      }
                      setDraggedIndex(null);
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt={`Service image ${index + 1}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    
                    {index === 0 && (
                      <Badge className="absolute top-2 left-2 text-xs">
                        Primary
                      </Badge>
                    )}
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                      onClick={() => removeImage(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video URL */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Promotional Video (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="video-url">YouTube or Vimeo URL</Label>
            <Input
              id="video-url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
          </div>
          <Button onClick={handleVideoSubmit} disabled={!videoUrl.trim()}>
            Update Video
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};