import { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface TierImageCarouselProps {
  images: string[];
  tierName: string;
}

export function TierImageCarousel({ images, tierName }: TierImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!images || images.length === 0) {
    return null;
  }

  const getImageUrl = (path: string) => {
    const { data } = supabase.storage
      .from('calculator-assets')
      .getPublicUrl(path);
    return data.publicUrl;
  };

  const currentImage = images[currentIndex];
  const imageUrl = getImageUrl(currentImage);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setImageError(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setImageError(false);
  };

  if (imageError) {
    return (
      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
        <p className="text-xs text-muted-foreground">Image preview coming soon</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative group">
        <div 
          className="relative aspect-video bg-muted rounded-lg overflow-hidden cursor-zoom-in"
          onClick={() => setModalOpen(true)}
        >
          <img
            src={imageUrl}
            alt={`${tierName} example ${currentIndex + 1}`}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {images.length > 1 && (
          <>
            <Button
              size="sm"
              variant="secondary"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                    setImageError(false);
                  }}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    idx === currentIndex 
                      ? "w-6 bg-white" 
                      : "w-1.5 bg-white/50 hover:bg-white/75"
                  )}
                  aria-label={`Go to image ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl p-0">
          <div className="relative">
            <img
              src={imageUrl}
              alt={`${tierName} example ${currentIndex + 1}`}
              className="w-full h-auto"
              onError={() => setImageError(true)}
            />
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 rounded-full px-3 py-2">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setImageError(false);
                    }}
                    className={cn(
                      "h-2 rounded-full transition-all",
                      idx === currentIndex 
                        ? "w-8 bg-white" 
                        : "w-2 bg-white/50 hover:bg-white/75"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
