import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, CheckCircle, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MobileProfessionalCard } from '@/components/mobile/MobileProfessionalCard';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProfessionalCardProps {
  professional: {
    id: string;
    full_name: string | null;
    bio?: string | null;
    specializations?: string[] | null;
    experience_years?: number | null;
    hourly_rate?: number | null;
    location?: string | null;
    profile_image_url?: string | null;
    phone?: string | null;
    rating?: number | null;
    total_jobs_completed?: number | null;
    total_reviews?: number | null;
    availability_status?: string | null;
    verification_status?: string | null;
  };
}

export default function ProfessionalCard({ professional }: ProfessionalCardProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleViewProfile = () => {
    navigate(`/professional/${professional.id}`);
  };

  const handleContact = () => {
    window.open(`tel:${professional.phone}`, '_self');
  };

  // Use mobile-optimized card on mobile devices
  if (isMobile) {
    return (
      <MobileProfessionalCard
        professional={professional}
        onViewProfile={handleViewProfile}
        onContact={handleContact}
        onMessage={() => {
          // Navigate to messages with professional pre-selected
          navigate(`/messages?professional=${professional.id}`);
        }}
      />
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <img
              src={professional.profile_image_url || '/placeholder.svg'}
              alt={professional.full_name || 'Professional'}
              className="w-16 h-16 rounded-full object-cover"
            />
            {professional.verification_status === 'verified' && (
              <CheckCircle className="absolute -top-1 -right-1 w-5 h-5 text-green-500 bg-white rounded-full" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg truncate">{professional.full_name || 'Professional'}</h3>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{professional.rating || 5.0}</span>
                <span className="text-sm text-muted-foreground">({professional.total_reviews || 0})</span>
              </div>
            </div>
            
            {professional.location && (
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{professional.location}</span>
              </div>
            )}
            
            {professional.bio && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{professional.bio}</p>
            )}
            
            <div className="flex flex-wrap gap-1 mb-3">
              {Array.isArray(professional.specializations) && professional.specializations.slice(0, 3).map((spec) => (
                <Badge key={spec} variant="secondary" className="text-xs">
                  {spec}
                </Badge>
              ))}
              {Array.isArray(professional.specializations) && professional.specializations.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{professional.specializations.length - 3}
                </Badge>
              )}
              {(!professional.specializations || !Array.isArray(professional.specializations) || professional.specializations.length === 0) && (
                <Badge variant="outline" className="text-xs">
                  General Services
                </Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="font-medium">${professional.hourly_rate || 50}/hr</span>
                <span className="text-muted-foreground"> • {professional.total_jobs_completed || 0} jobs</span>
              </div>
              
              <div className="flex gap-2">
                {professional.phone && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleContact}
                    className="flex items-center gap-1 min-h-[44px]"
                  >
                    <Phone className="w-3 h-3" />
                    Call
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={handleViewProfile}
                  className="min-h-[44px]"
                >
                  View Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}