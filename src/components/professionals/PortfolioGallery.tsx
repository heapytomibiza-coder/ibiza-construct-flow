import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Image as ImageIcon, X } from 'lucide-react';

interface PortfolioImage {
  id: string;
  image_url: string;
  title?: string;
  description?: string;
  category?: string;
}

interface PortfolioGalleryProps {
  images: PortfolioImage[];
}

export const PortfolioGallery = ({ images }: PortfolioGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<PortfolioImage | null>(null);

  if (!images || images.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No portfolio images yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Portfolio</CardTitle>
          <p className="text-sm text-muted-foreground">
            Showcasing previous work and projects
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer"
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={image.image_url}
                  alt={image.title || 'Portfolio image'}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                  {image.title && (
                    <p className="text-white text-sm font-medium line-clamp-2">
                      {image.title}
                    </p>
                  )}
                </div>
                {image.category && (
                  <Badge className="absolute top-2 right-2 text-xs">
                    {image.category}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0">
          {selectedImage && (
            <div className="relative">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={selectedImage.image_url}
                alt={selectedImage.title || 'Portfolio image'}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              {(selectedImage.title || selectedImage.description) && (
                <div className="p-6 bg-background">
                  {selectedImage.title && (
                    <h3 className="text-xl font-semibold mb-2">
                      {selectedImage.title}
                    </h3>
                  )}
                  {selectedImage.description && (
                    <p className="text-muted-foreground">
                      {selectedImage.description}
                    </p>
                  )}
                  {selectedImage.category && (
                    <Badge className="mt-3">{selectedImage.category}</Badge>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
