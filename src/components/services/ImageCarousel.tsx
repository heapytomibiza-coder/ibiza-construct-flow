import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Expand, Play } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ImageCarouselProps {
  images: string[];
  primaryImage?: string;
  videoUrl?: string;
  altText?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'portrait';
  showThumbnails?: boolean;
  autoPlay?: boolean;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  primaryImage,
  videoUrl,
  altText,
  className = '',
  aspectRatio = 'video',
  showThumbnails = true,
  autoPlay = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  
  // Combine primary image with gallery images, ensuring primary is first
  const allImages = React.useMemo(() => {
    if (!primaryImage && images.length === 0) return [];
    
    const imageList = [...images];
    if (primaryImage && !images.includes(primaryImage)) {
      imageList.unshift(primaryImage);
    } else if (primaryImage) {
      // Move primary image to front
      const primaryIndex = imageList.indexOf(primaryImage);
      if (primaryIndex > 0) {
        imageList.splice(primaryIndex, 1);
        imageList.unshift(primaryImage);
      }
    }
    
    return imageList;
  }, [images, primaryImage]);

  const hasMultipleImages = allImages.length > 1;
  const currentImage = allImages[currentIndex];

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  };

  const previousImage = () => {
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]'
  };

  if (allImages.length === 0 && !videoUrl) {
    return (
      <Card className={`${aspectRatioClasses[aspectRatio]} bg-muted flex items-center justify-center ${className}`}>
        <div className="text-center text-muted-foreground">
          <div className="w-16 h-16 mx-auto mb-2 bg-muted-foreground/10 rounded-lg flex items-center justify-center">
            <Play className="w-8 h-8" />
          </div>
          <p className="text-sm">No images available</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className={`relative overflow-hidden group ${className}`}>
        <div className={`relative ${aspectRatioClasses[aspectRatio]}`}>
          {/* Main Image */}
          {currentImage && (
            <img
              src={currentImage}
              alt={altText || `Service image ${currentIndex + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}

          {/* Video Play Button Overlay */}
          {videoUrl && currentIndex === 0 && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <Button
                size="lg"
                className="bg-white/90 hover:bg-white text-black rounded-full p-4"
                onClick={() => window.open(videoUrl, '_blank')}
              >
                <Play className="w-6 h-6" />
              </Button>
            </div>
          )}

          {/* Navigation Arrows */}
          {hasMultipleImages && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity p-2"
                onClick={previousImage}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity p-2"
                onClick={nextImage}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}

          {/* Expand Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity p-2"
            onClick={() => setIsLightboxOpen(true)}
          >
            <Expand className="w-4 h-4" />
          </Button>

          {/* Image Counter */}
          {hasMultipleImages && (
            <Badge 
              variant="secondary" 
              className="absolute bottom-2 right-2 bg-black/50 text-white border-0"
            >
              {currentIndex + 1} / {allImages.length}
            </Badge>
          )}

          {/* Primary Badge */}
          {currentIndex === 0 && primaryImage && (
            <Badge className="absolute top-2 left-2">
              Featured
            </Badge>
          )}
        </div>

        {/* Thumbnail Strip */}
        {showThumbnails && hasMultipleImages && (
          <div className="p-2 bg-background">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {allImages.map((image, index) => (
                <button
                  key={index}
                  className={`
                    flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all
                    ${index === currentIndex ? 'border-primary' : 'border-transparent hover:border-border'}
                  `}
                  onClick={() => setCurrentIndex(index)}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Lightbox Dialog */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-4">
            <DialogTitle>Service Gallery</DialogTitle>
          </DialogHeader>
          
          <div className="relative">
            {currentImage && (
              <img
                src={currentImage}
                alt={altText || `Service image ${currentIndex + 1}`}
                className="w-full max-h-[70vh] object-contain"
              />
            )}
            
            {hasMultipleImages && (
              <div className="flex justify-center gap-2 p-4">
                <Button variant="outline" onClick={previousImage}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  {currentIndex + 1} of {allImages.length}
                </span>
                <Button variant="outline" onClick={nextImage}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};