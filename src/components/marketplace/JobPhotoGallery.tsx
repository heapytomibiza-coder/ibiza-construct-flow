import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface JobPhotoGalleryProps {
  photos: string[];
  className?: string;
}

export const JobPhotoGallery: React.FC<JobPhotoGalleryProps> = ({ 
  photos,
  className 
}) => {
  if (!photos || photos.length === 0) return null;

  return (
    <div className={cn("relative w-full", className)}>
      <Carousel className="w-full">
        <CarouselContent>
          {photos.map((photo, index) => (
            <CarouselItem key={index}>
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <img
                  src={photo}
                  alt={`Job photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {photos.length > 1 && (
          <>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </>
        )}
      </Carousel>
      
      {photos.length > 1 && (
        <Badge 
          variant="secondary" 
          className="absolute top-4 right-4 backdrop-blur-md bg-background/90"
        >
          1 / {photos.length}
        </Badge>
      )}
    </div>
  );
};
