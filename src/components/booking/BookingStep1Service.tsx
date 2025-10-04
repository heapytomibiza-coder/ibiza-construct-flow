import { ServiceConfigurator } from '@/components/services/ServiceConfigurator';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface BookingStep1ServiceProps {
  professionalId: string;
  serviceId?: string;
  wizard: any;
}

export const BookingStep1Service = ({ professionalId, serviceId, wizard }: BookingStep1ServiceProps) => {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Select Your Services</h2>
        <p className="text-muted-foreground">
          Choose from our menu of services and add-ons. Select items and quantities, then continue.
        </p>
      </div>

      <ServiceConfigurator 
        service={{ id: serviceId || professionalId } as any}
        professionalId={professionalId}
      />

      <div className="bg-secondary/30 rounded-lg p-4 my-4">
        <p className="text-sm text-muted-foreground text-center">
          💡 Your selections will appear in the summary sidebar. You can adjust quantities there before proceeding.
        </p>
      </div>

      <div className="flex justify-end mt-6 pt-6 border-t">
        <Button 
          onClick={wizard.nextStep}
          disabled={!wizard.canProceed()}
          size="lg"
          className="gap-2"
        >
          Continue to Information
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};
