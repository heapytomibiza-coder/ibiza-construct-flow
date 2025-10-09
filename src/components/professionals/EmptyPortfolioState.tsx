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
    <Card className="border-dashed border-2 border-muted-foreground/20 bg-muted/10 p-12 text-center">
      <Image className="w-16 h-16 mx-auto mb-4 text-muted-foreground/40" />
      <h3 className="text-xl font-semibold mb-2">Portfolio Coming Soon</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        This professional is building their portfolio. Contact them to see examples of their work.
      </p>
      <Button size="lg" variant="outline">
        <MessageCircle className="w-4 h-4 mr-2" />
        Request Portfolio
      </Button>
    </Card>
  );
};
