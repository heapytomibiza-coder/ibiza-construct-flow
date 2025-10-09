import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';

interface EmptyPortfolioStateProps {
  professionalId: string;
  isOwner?: boolean;
}

const sampleImages = [
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1503174971373-b1f69850bded?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1584622650111-993a426abf7?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1565183997226-652d8a3c69ff?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&h=300&fit=crop',
];

export const EmptyPortfolioState = ({ professionalId, isOwner }: EmptyPortfolioStateProps) => {
  if (isOwner) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin">
          {sampleImages.map((img, index) => (
            <div key={index} className="flex-shrink-0 snap-start">
              <div className="relative w-80 h-60 rounded-lg overflow-hidden bg-muted">
                <img 
                  src={img} 
                  alt={`Sample work ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white text-sm font-medium">Sample Portfolio Image</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Card className="border-dashed border-2 border-primary/20 bg-primary/5 p-6 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            These are sample images. Upload your own work to replace them.
          </p>
          <Button size="lg">
            Upload Your Portfolio
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin">
        {sampleImages.map((img, index) => (
          <div key={index} className="flex-shrink-0 snap-start">
            <div className="relative w-80 h-60 rounded-lg overflow-hidden bg-muted">
              <img 
                src={img} 
                alt={`Portfolio sample ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ))}
      </div>
      <Card className="border-dashed border-2 border-muted-foreground/20 bg-muted/10 p-6 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Sample portfolio images. Contact for actual work examples.
        </p>
        <Button variant="outline">
          <MessageCircle className="w-4 h-4 mr-2" />
          Request Portfolio
        </Button>
      </Card>
    </div>
  );
};
