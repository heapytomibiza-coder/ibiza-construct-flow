import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Package, MessageCircle } from 'lucide-react';

interface EmptyServiceStateProps {
  professionalId: string;
  isOwner?: boolean;
}

export const EmptyServiceState = ({ professionalId, isOwner }: EmptyServiceStateProps) => {
  if (isOwner) {
    return (
      <Card className="border-dashed border-2 border-muted-foreground/20 bg-muted/10 p-12 text-center">
        <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground/40" />
        <h3 className="text-xl font-semibold mb-2">No Services Yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Start showcasing your services to attract more clients. Add detailed descriptions, pricing, and availability.
        </p>
        <Button size="lg">
          Add Your First Service
        </Button>
      </Card>
    );
  }

  return (
    <Card className="border-dashed border-2 border-muted-foreground/20 bg-muted/10 p-12 text-center">
      <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground/40" />
      <h3 className="text-xl font-semibold mb-2">Services Coming Soon</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        This professional is setting up their services. Get in touch to discuss your project requirements.
      </p>
      <Button size="lg" variant="outline">
        <MessageCircle className="w-4 h-4 mr-2" />
        Contact Professional
      </Button>
    </Card>
  );
};
