import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AvailabilityPreviewProps {
  isAvailable: boolean;
  nextAvailableDate?: string;
  responseTime: string;
  workingHours?: string;
  currentWorkload?: 'light' | 'moderate' | 'heavy';
  onBookConsultation?: () => void;
}

export const AvailabilityPreview = ({
  isAvailable,
  nextAvailableDate,
  responseTime,
  workingHours = '9:00 AM - 6:00 PM',
  currentWorkload = 'moderate',
  onBookConsultation
}: AvailabilityPreviewProps) => {
  const workloadConfig = {
    light: {
      label: 'Available Soon',
      color: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50 dark:bg-green-950/20'
    },
    moderate: {
      label: 'Booking Fast',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/20'
    },
    heavy: {
      label: 'Limited Availability',
      color: 'bg-red-500',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50 dark:bg-red-950/20'
    }
  };

  const config = workloadConfig[currentWorkload];

  return (
    <Card className="card-luxury">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Availability & Booking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className={`p-4 rounded-lg ${config.bgColor} border border-${currentWorkload === 'light' ? 'green' : currentWorkload === 'moderate' ? 'yellow' : 'red'}-200`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {isAvailable ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-orange-600" />
              )}
              <span className="font-semibold">
                {isAvailable ? 'Available Now' : 'Currently Busy'}
              </span>
            </div>
            <Badge className={`${config.color} text-white border-0`}>
              {config.label}
            </Badge>
          </div>
          {nextAvailableDate && (
            <p className="text-sm text-muted-foreground">
              Next available: <span className="font-semibold">{nextAvailableDate}</span>
            </p>
          )}
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Clock className="w-4 h-4" />
              Response Time
            </div>
            <p className="font-semibold text-lg">{responseTime}</p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Calendar className="w-4 h-4" />
              Working Hours
            </div>
            <p className="font-semibold text-sm">{workingHours}</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-2 pt-2">
          <Button 
            className="w-full bg-gradient-to-r from-primary to-primary/80" 
            size="lg"
            onClick={onBookConsultation}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Free Consultation
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Get a personalized quote • No obligation • Instant response
          </p>
        </div>
      </CardContent>
    </Card>
  );
};