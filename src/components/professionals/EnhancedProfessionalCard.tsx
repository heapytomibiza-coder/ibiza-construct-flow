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
  FileText,
  Award,
  Briefcase
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
      className="hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group overflow-hidden"
      onClick={handleViewProfile}
    >
      {/* Cover Image with Gradient */}
      <div className="relative h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-copper/10">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        {/* Avatar positioned to overlap */}
        <div className="absolute -bottom-8 left-6">
          <Avatar className="w-20 h-20 border-4 border-background shadow-lg">
            <AvatarImage 
              src={professional.profile_image_url} 
              alt={professional.full_name}
            />
            <AvatarFallback className="text-xl font-bold bg-gradient-hero text-white">
              {professional.full_name?.split(' ').map(n => n[0]).join('') || 'P'}
            </AvatarFallback>
          </Avatar>
          {professional.verification_status === 'verified' && (
            <div className="absolute -bottom-1 -right-1 bg-green-600 rounded-full p-1">
              <Shield className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      </div>

      <CardContent className="pt-12 pb-6 px-6">
        {/* Header */}
        <div className="mb-4">
          <div className="flex-1 min-w-0">
            <div className="mb-1">
              <h3 className="font-bold text-xl text-foreground truncate">
                {professional.full_name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {professional.specializations?.[0] || 'Professional'}
              </p>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${
                      i < Math.floor(professional.rating || (professional as any).stats?.average_rating || 0) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`} 
                  />
                ))}
                <span className="text-sm text-muted-foreground ml-2">
                  {(professional.rating || (professional as any).stats?.average_rating || 4.8).toFixed(1)} ({professional.total_jobs_completed || (professional as any).stats?.jobs_completed || 0} jobs)
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

        {/* Service Categories Pricing */}
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <div className="text-xs font-medium text-muted-foreground mb-2">Top Services</div>
          <div className="space-y-1">
            {professional.specializations?.slice(0, 3).map((spec, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span>{spec}</span>
                <span className="text-primary font-semibold">€50+</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-muted/30 rounded">
            <Briefcase className="w-4 h-4 mx-auto mb-1 text-primary" />
            <div className="text-sm font-bold">{professional.total_jobs_completed || 0}</div>
            <div className="text-xs text-muted-foreground">Jobs</div>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <Star className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
            <div className="text-sm font-bold">{(professional.rating || 4.8).toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">Rating</div>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <Award className="w-4 h-4 mx-auto mb-1 text-primary" />
            <div className="text-sm font-bold">5+</div>
            <div className="text-xs text-muted-foreground">Years</div>
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
            asChild
          >
            <a href={`/professionals/${professional.user_id}`}>
              <FileText className="w-4 h-4 mr-2" />
              View Details
            </a>
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