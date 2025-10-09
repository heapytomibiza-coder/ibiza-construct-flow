import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Star, 
  MapPin, 
  Shield, 
  Clock, 
  Euro,
  MessageCircle,
  Phone,
  Calendar,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QuoteRequestModal } from '@/components/booking/QuoteRequestModal';

interface ProfessionalCardProps {
  professional: {
    id: string;
    user_id: string;
    full_name: string;
    bio?: string;
    specializations: string[];
    rating?: number;
    total_jobs_completed?: number;
    availability_status: string;
    profile_image_url?: string;
    base_price_band?: 'budget' | 'standard' | 'premium';
    coverage_area?: any;
    verification_status?: string;
    response_time_hours?: number;
  };
}

const EnhancedProfessionalCard: React.FC<ProfessionalCardProps> = ({ professional }) => {
  const navigate = useNavigate();
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);

  const handleViewProfile = () => {
    navigate(`/professionals/${professional.user_id}`);
  };

  const handleContact = () => {
    // Handle direct contact
    console.log('Contact professional:', professional.id);
  };

  const handleRequestQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuoteModalOpen(true);
  };

  const getPriceBandDisplay = (band: string) => {
    switch (band) {
      case 'budget': return { text: 'Budget-friendly', color: 'bg-green-100 text-green-800' };
      case 'premium': return { text: 'Premium', color: 'bg-purple-100 text-purple-800' };
      default: return { text: 'Standard rates', color: 'bg-blue-100 text-blue-800' };
    }
  };

  const getAvailabilityDisplay = (status: string) => {
    switch (status) {
      case 'available': return { text: 'Available', color: 'bg-green-100 text-green-800' };
      case 'busy': return { text: 'Busy', color: 'bg-yellow-100 text-yellow-800' };
      default: return { text: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const priceBand = getPriceBandDisplay(professional.base_price_band || 'standard');
  const availability = getAvailabilityDisplay(professional.availability_status);

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={handleViewProfile}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="w-16 h-16">
            <AvatarImage 
              src={professional.profile_image_url} 
              alt={professional.full_name}
            />
            <AvatarFallback className="text-lg font-semibold bg-gradient-hero text-white">
              {professional.full_name?.split(' ').map(n => n[0]).join('') || 'P'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg text-foreground truncate">
                {professional.full_name}
              </h3>
              {professional.verification_status === 'verified' && (
                <Shield className="w-4 h-4 text-green-600" />
              )}
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${
                      i < Math.floor(professional.rating || 0) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`} 
                  />
                ))}
                <span className="text-sm text-muted-foreground ml-2">
                  {professional.rating?.toFixed(1) || '4.8'} ({professional.total_jobs_completed || 0} jobs)
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline" className={availability.color}>
                <Clock className="w-3 h-3 mr-1" />
                {availability.text}
              </Badge>
              <Badge variant="outline" className={priceBand.color}>
                <Euro className="w-3 h-3 mr-1" />
                {priceBand.text}
              </Badge>
              {professional.response_time_hours && (
                <Badge variant="outline">
                  {professional.response_time_hours}h response
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {professional.bio && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {professional.bio}
          </p>
        )}

        {/* Specializations */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {professional.specializations?.slice(0, 3).map((spec, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {spec}
              </Badge>
            ))}
            {professional.specializations?.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{professional.specializations.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Coverage Area */}
        {professional.coverage_area && (
          <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>
              {professional.coverage_area.radius ? 
                `${professional.coverage_area.radius}km radius` : 
                'Ibiza area'
              }
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              handleViewProfile();
            }}
          >
            <FileText className="w-4 h-4 mr-2" />
            View Details
          </Button>
          <Button 
            size="sm" 
            className="flex-1 bg-gradient-hero text-white"
            onClick={handleRequestQuote}
          >
            <FileText className="w-4 h-4 mr-2" />
            Request Quote
          </Button>
        </div>
      </CardContent>

      {/* Quote Request Modal */}
      <QuoteRequestModal
        open={quoteModalOpen}
        onOpenChange={setQuoteModalOpen}
        professionalId={professional.user_id}
        professionalName={professional.full_name}
      />
    </Card>
  );
};

export default EnhancedProfessionalCard;