import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, CheckCircle, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfessionalCardProps {
  professional: {
    id: string;
    full_name: string;
    bio: string;
    specializations: string[];
    experience_years: number;
    hourly_rate: number;
    location: string;
    profile_image_url: string;
    phone: string;
    rating: number;
    total_jobs_completed: number;
    total_reviews: number;
    availability_status: string;
    verification_status: string;
  };
}

export default function ProfessionalCard({ professional }: ProfessionalCardProps) {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate(`/professional/${professional.id}`);
  };

  const handleContact = () => {
    window.open(`tel:${professional.phone}`, '_self');
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <img
              src={professional.profile_image_url || '/placeholder.svg'}
              alt={professional.full_name}
              className="w-16 h-16 rounded-full object-cover"
            />
            {professional.verification_status === 'verified' && (
              <CheckCircle className="absolute -top-1 -right-1 w-5 h-5 text-green-500 bg-white rounded-full" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg truncate">{professional.full_name}</h3>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{professional.rating}</span>
                <span className="text-sm text-muted-foreground">({professional.total_reviews})</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{professional.location}</span>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{professional.bio}</p>
            
            <div className="flex flex-wrap gap-1 mb-3">
              {professional.specializations?.slice(0, 3).map((spec) => (
                <Badge key={spec} variant="secondary" className="text-xs">
                  {spec}
                </Badge>
              ))}
              {professional.specializations?.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{professional.specializations.length - 3}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="font-medium">${professional.hourly_rate}/hr</span>
                <span className="text-muted-foreground"> • {professional.total_jobs_completed} jobs</span>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleContact}
                  className="flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  Call
                </Button>
                <Button
                  size="sm"
                  onClick={handleViewProfile}
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