import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, Award, Mail, Clock, CheckCircle, Circle, Eye, Zap, TrendingUp } from 'lucide-react';
import { useProfessionalAvailability } from '@/hooks/useProfessionalAvailability';
import { ProfessionalBadges } from '@/components/professionals/ProfessionalBadges';

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
    <Card className="card-luxury p-6 shadow-xl border-2">
      <div className="flex flex-col items-center gap-4 text-center">
        <Avatar className="w-24 h-24 ring-4 ring-primary/20">
          <AvatarImage src={professional.avatarUrl} alt={professional.name} />
          <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/70 text-white">
            {professional.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>

        <div className="w-full space-y-3">
          <div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <h3 className="text-2xl font-bold text-foreground">{professional.name}</h3>
              {professional.verificationStatus === 'verified' && (
                <Badge className="bg-green-500 text-white shadow-md">
                  <CheckCircle className="w-3 h-3" />
                </Badge>
              )}
            </div>
            
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-3">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">{professional.location}</span>
            </div>
            
            <div className="mb-3 flex justify-center">
              {getAvailabilityDisplay()}
            </div>

            {/* Professional Badges */}
            <ProfessionalBadges professionalUserId={professional.id} className="mb-3 justify-center" />
          </div>
          
          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20 p-3 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-xl font-bold">{professional.rating}</span>
              </div>
              <p className="text-xs text-muted-foreground">{professional.reviewCount.toLocaleString()} reviews</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 p-3 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Zap className="h-4 w-4 text-blue-500" />
                <span className="text-lg font-bold">{professional.responseTime}</span>
              </div>
              <p className="text-xs text-muted-foreground">Response time</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 p-3 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-lg font-bold">{professional.completedJobs}+</span>
              </div>
              <p className="text-xs text-muted-foreground">Jobs done</p>
            </div>
            
            {professional.viewCount !== undefined && professional.viewCount > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 p-3 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Eye className="h-4 w-4 text-purple-500" />
                  <span className="text-lg font-bold">{professional.viewCount.toLocaleString()}</span>
                </div>
                <p className="text-xs text-muted-foreground">Profile views</p>
              </div>
            )}
          </div>
          
          {professional.certifications && professional.certifications.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {professional.certifications.map((cert, index) => (
                <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                  <Award className="w-3 h-3 mr-1" />
                  {cert}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        {showContactButtons && (
          <div className="flex flex-col gap-3 w-full mt-2">
            <Button 
              size="lg" 
              onClick={onRequestQuote} 
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Request Free Quote
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={onMessage}
              className="w-full border-2 hover:bg-accent/50"
            >
              <Mail className="w-4 h-4 mr-2" />
              Message Now
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};