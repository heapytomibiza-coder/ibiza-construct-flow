import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { X, ZoomIn } from 'lucide-react';

interface PortfolioItem {
  url: string;
  description?: string;
  service_type?: string;
}

interface ProfessionalPortfolioGalleryProps {
  items: PortfolioItem[];
}

export const ProfessionalPortfolioGallery = ({ items }: ProfessionalPortfolioGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<PortfolioItem | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  if (!items || items.length === 0) return null;

  const serviceTypes = Array.from(new Set(items.map(item => item.service_type).filter(Boolean))) as string[];
  const filteredItems = selectedFilter 
    ? items.filter(item => item.service_type === selectedFilter)
    : items;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Portfolio</CardTitle>
          <span className="text-sm text-muted-foreground">{items.length} projects</span>
        </div>
        {serviceTypes.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge 
              variant={selectedFilter === null ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedFilter(null)}
            >
              All
            </Badge>
            {serviceTypes.map((type) => (
              <Badge
                key={type}
                variant={selectedFilter === type ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedFilter(type)}
              >
                {type}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item, index) => (
            <div
              key={index}
              className="aspect-square bg-muted rounded-lg overflow-hidden relative group cursor-pointer"
              onClick={() => setSelectedImage(item)}
            >
              <img
                src={item.url}
                alt={item.description || `Portfolio ${index + 1}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>

        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl">
            {selectedImage && (
              <div className="space-y-4">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.description || 'Portfolio item'}
                  className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                />
                {selectedImage.description && (
                  <p className="text-muted-foreground">{selectedImage.description}</p>
                )}
                {selectedImage.service_type && (
                  <Badge>{selectedImage.service_type}</Badge>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
