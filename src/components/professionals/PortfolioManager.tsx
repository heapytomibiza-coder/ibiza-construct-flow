import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Edit, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface PortfolioImage {
  id: string;
  image_url: string;
  title?: string;
  description?: string;
  category?: string;
}

interface PortfolioManagerProps {
  professionalId: string;
  images: PortfolioImage[];
  onUpdate: () => void;
}

export const PortfolioManager: React.FC<PortfolioManagerProps> = ({
  professionalId,
  images,
  onUpdate
}) => {
  const [uploading, setUploading] = useState(false);
  const [editingImage, setEditingImage] = useState<PortfolioImage | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', category: '' });

  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
    if (images.length + acceptedFiles.length > 20) {
      toast.error('Maximum 20 images allowed');
      return;
    }

    setUploading(true);
    try {
      for (const file of acceptedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${professionalId}/${Date.now()}-${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('portfolio')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('portfolio')
          .getPublicUrl(fileName);

        const { error: dbError } = await supabase
          .from('portfolio_images')
          .insert({
            professional_id: professionalId,
            image_url: publicUrl,
            uploaded_at: new Date().toISOString()
          });

        if (dbError) throw dbError;
      }

      toast.success(`${acceptedFiles.length} image(s) uploaded`);
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  }, [professionalId, images, onUpdate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 20 - images.length,
    disabled: uploading || images.length >= 20
  });

  const handleDelete = async (id: string, imageUrl: string) => {
    try {
      const { error } = await supabase
        .from('portfolio_images')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const path = imageUrl.split('/').slice(-2).join('/');
      await supabase.storage.from('portfolio').remove([path]);

      toast.success('Image deleted');
      onUpdate();
    } catch (error: any) {
      toast.error('Failed to delete image');
    }
  };

  const handleEdit = (image: PortfolioImage) => {
    setEditingImage(image);
    setEditForm({
      title: image.title || '',
      description: image.description || '',
      category: image.category || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingImage) return;

    try {
      const { error } = await supabase
        .from('portfolio_images')
        .update({
          title: editForm.title || null,
          description: editForm.description || null,
          category: editForm.category || null
        })
        .eq('id', editingImage.id);

      if (error) throw error;

      toast.success('Image updated');
      setEditingImage(null);
      onUpdate();
    } catch (error: any) {
      toast.error('Failed to update image');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Portfolio Images</CardTitle>
          <CardDescription>
            Showcase your best work (up to 20 images)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            } ${uploading || images.length >= 20 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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
                  <p className="font-weight">
                    {isDragActive ? 'Drop images here' : 'Click or drag images to upload'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG, WEBP (Max 20) - {images.length}/20
                  </p>
                </div>
                <Button type="button" variant="outline" disabled={uploading || images.length >= 20}>
                  {images.length >= 20 ? 'Maximum reached' : 'Select Images'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <Card key={image.id} className="overflow-hidden group">
              <div className="relative aspect-square">
                <img
                  src={image.image_url}
                  alt={image.title || 'Portfolio image'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => handleEdit(image)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(image.id, image.image_url)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {(image.title || image.category) && (
                <CardContent className="p-3">
                  {image.title && <p className="font-medium text-sm truncate">{image.title}</p>}
                  {image.category && <Badge variant="secondary" className="text-xs mt-1">{image.category}</Badge>}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No portfolio images yet. Upload at least 3 images to showcase your work.
          </p>
        </div>
      )}

      <Dialog open={!!editingImage} onOpenChange={() => setEditingImage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Image Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title (Optional)</Label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="E.g., Kitchen Remodel"
              />
            </div>
            <div>
              <Label>Description (Optional)</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Describe the project..."
                rows={3}
              />
            </div>
            <div>
              <Label>Category (Optional)</Label>
              <Input
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                placeholder="E.g., Kitchen, Bathroom, Outdoor"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingImage(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
