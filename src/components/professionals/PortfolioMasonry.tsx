import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PortfolioMasonryProps {
  images: Array<{
    url: string;
    title?: string;
    category?: string;
    description?: string;
  }>;
  title?: string;
}

export const PortfolioMasonry = ({ images, title = "Portfolio" }: PortfolioMasonryProps) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(images.map(img => img.category).filter(Boolean)))];
  const filteredImages = filter === 'all' 
    ? images 
    : images.filter(img => img.category === filter);

  const openLightbox = (index: number) => {
    setSelectedImage(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImage === null) return;
    
    if (direction === 'prev') {
      setSelectedImage(selectedImage > 0 ? selectedImage - 1 : filteredImages.length - 1);
    } else {
      setSelectedImage(selectedImage < filteredImages.length - 1 ? selectedImage + 1 : 0);
    }
  };

  return (
    <>
      <Card className="card-luxury p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h3 className="text-2xl font-bold">{title}</h3>
          
          {categories.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={filter === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(category)}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Masonry Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
          {filteredImages.map((image, index) => (
            <div 
              key={index}
              className="break-inside-avoid cursor-pointer group relative overflow-hidden rounded-lg bg-muted"
              onClick={() => openLightbox(index)}
            >
              <img 
                src={image.url} 
                alt={image.title || `Portfolio ${index + 1}`}
                className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  {image.title && (
                    <p className="font-semibold text-lg mb-1">{image.title}</p>
                  )}
                  {image.category && (
                    <p className="text-sm text-white/80 capitalize">{image.category}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredImages.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No portfolio items to display
          </div>
        )}
      </Card>

      {/* Lightbox Dialog */}
      <Dialog open={selectedImage !== null} onOpenChange={closeLightbox}>
        <DialogContent className="max-w-5xl w-full p-0 bg-transparent border-0">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
              onClick={closeLightbox}
            >
              <X className="w-4 h-4" />
            </Button>
            
            {selectedImage !== null && filteredImages[selectedImage] && (
              <>
                <div className="bg-black/90 rounded-lg p-4">
                  <img
                    src={filteredImages[selectedImage].url}
                    alt={filteredImages[selectedImage].title || `Portfolio ${selectedImage + 1}`}
                    className="w-full h-auto max-h-[80vh] object-contain"
                  />
                  
                  {(filteredImages[selectedImage].title || filteredImages[selectedImage].description) && (
                    <div className="mt-4 text-white">
                      {filteredImages[selectedImage].title && (
                        <h4 className="text-xl font-semibold mb-2">{filteredImages[selectedImage].title}</h4>
                      )}
                      {filteredImages[selectedImage].description && (
                        <p className="text-white/80">{filteredImages[selectedImage].description}</p>
                      )}
                    </div>
                  )}
                </div>
                
                {filteredImages.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                      onClick={() => navigateImage('prev')}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                      onClick={() => navigateImage('next')}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </Button>
                  </>
                )}
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                  {selectedImage + 1} / {filteredImages.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};