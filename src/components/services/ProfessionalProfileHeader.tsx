import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, Award, Mail, Clock, CheckCircle, Circle, Eye } from 'lucide-react';
import { useProfessionalAvailability } from '@/hooks/useProfessionalAvailability';

interface ProfessionalData {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  responseTime: string;
  location: string;
  certifications: string[];
  about: string;
  workingHours: string;
  avatarUrl?: string;
  verificationStatus?: string;
  viewCount?: number;
}

interface ProfessionalProfileHeaderProps {
  professional: ProfessionalData;
  showContactButtons?: boolean;
  onMessage?: () => void;
  onRequestQuote?: () => void;
}

export const ProfessionalProfileHeader = ({ 
  professional, 
  showContactButtons = true,
  onMessage,
  onRequestQuote
}: ProfessionalProfileHeaderProps) => {
  const { availability, loading: availabilityLoading } = useProfessionalAvailability(professional.id);

  const getAvailabilityDisplay = () => {
    if (availabilityLoading || !availability) return null;
    
    const statusConfig = {
      available: { color: 'bg-green-500', text: 'Available Now' },
      busy: { color: 'bg-yellow-500', text: 'Busy' },
      away: { color: 'bg-orange-500', text: 'Away' },
      offline: { color: 'bg-gray-400', text: 'Offline' }
    };

    const config = statusConfig[availability.status as keyof typeof statusConfig] || statusConfig.offline;
    
    return (
      <div className="flex items-center gap-2">
        <Circle className={`w-3 h-3 ${config.color} fill-current`} />
        <span className="text-sm font-medium">{config.text}</span>
        {availability.custom_message && (
          <span className="text-sm text-muted-foreground">- {availability.custom_message}</span>
        )}
      </div>
    );
  };

  return (
    <Card className="card-luxury p-6">
      <div className="flex flex-col md:flex-row items-start gap-6">
        <Avatar className="w-24 h-24">
          <AvatarImage src={professional.avatarUrl} alt={professional.name} />
          <AvatarFallback className="text-2xl font-bold bg-gradient-hero text-white">
            {professional.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-2xl font-bold text-foreground">{professional.name}</h3>
                {professional.verificationStatus === 'verified' && (
                  <Badge className="bg-green-500">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <MapPin className="w-4 h-4" />
                <span>{professional.location}</span>
              </div>
              {getAvailabilityDisplay()}
            </div>
          </div>
          
          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{professional.rating}</span>
              <span className="text-muted-foreground">({professional.reviewCount.toLocaleString()} reviews)</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Responds in {professional.responseTime}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <CheckCircle className="h-4 w-4" />
              <span>{professional.completedJobs}+ jobs completed</span>
            </div>
            {professional.viewCount !== undefined && professional.viewCount > 0 && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>{professional.viewCount.toLocaleString()} profile views</span>
              </div>
            )}
          </div>
          
          {professional.certifications && professional.certifications.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {professional.certifications.map((cert, index) => (
                <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Award className="w-3 h-3 mr-1" />
                  {cert}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        {showContactButtons && (
          <div className="flex flex-col gap-3">
            <Button size="lg" onClick={onRequestQuote} className="bg-gradient-hero text-white">
              Request Quote
            </Button>
            <Button variant="outline" size="lg" onClick={onMessage}>
              <Mail className="w-4 h-4 mr-2" />
              Message
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};