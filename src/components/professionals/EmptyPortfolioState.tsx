import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Image, MessageCircle } from 'lucide-react';

interface EmptyPortfolioStateProps {
  professionalId: string;
  isOwner?: boolean;
}

export const EmptyPortfolioState = ({ professionalId, isOwner }: EmptyPortfolioStateProps) => {
  if (isOwner) {
    return (
      <Card className="border-dashed border-2 border-muted-foreground/20 bg-muted/10 p-12 text-center">
        <Image className="w-16 h-16 mx-auto mb-4 text-muted-foreground/40" />
        <h3 className="text-xl font-semibold mb-2">No Portfolio Images Yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Showcase your best work to build trust and attract clients. Upload high-quality images of your projects.
        </p>
        <Button size="lg">
          Upload Portfolio Images
        </Button>
      </Card>
    );
  }

  return (
    <Card className="border-dashed border-2 border-muted-foreground/20 bg-muted/10 p-8 text-center">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <img src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop" alt="Construction site example" className="w-full h-32 object-cover rounded-lg opacity-50" />
        <img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop" alt="Kitchen renovation example" className="w-full h-32 object-cover rounded-lg opacity-50" />
        <img src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop" alt="Carpentry work example" className="w-full h-32 object-cover rounded-lg opacity-50" />
      </div>
      <Button size="lg" variant="outline">
        <MessageCircle className="w-4 h-4 mr-2" />
        Request Portfolio
      </Button>
    </Card>
  );
};
