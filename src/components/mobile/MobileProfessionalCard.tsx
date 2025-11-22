import React from 'react';
import { Star, MapPin, CheckCircle, Phone, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface MobileProfessionalCardProps {
  professional: {
    id: string;
    business_name?: string | null;
    full_name: string | null;
    bio?: string | null;
    specializations?: string[] | null;
    subsector_tags?: string[] | null;
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
  onViewProfile: () => void;
  onContact: () => void;
  onMessage?: () => void;
}

export const MobileProfessionalCard = ({ 
  professional, 
  onViewProfile, 
  onContact, 
  onMessage 
}: MobileProfessionalCardProps) => {
  return (
    <Card className="w-full border-0 shadow-sm hover:shadow-md transition-shadow bg-card">
      <CardContent className="p-4">
        {/* Header Row */}
        <div className="flex items-start gap-3 mb-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <img
              src={professional.profile_image_url || '/placeholder.svg'}
              alt={professional.full_name || 'Professional'}
              className="w-16 h-16 rounded-full object-cover border-2 border-border"
            />
            {professional.verification_status === 'verified' && (
              <CheckCircle className="absolute -top-1 -right-1 w-5 h-5 text-green-500 bg-background rounded-full border border-background" />
            )}
            {professional.availability_status === 'available' && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
            )}
          </div>
          
          {/* Name and Rating */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-tight mb-1 text-foreground truncate">
              {professional.business_name || professional.full_name || 'Professional'}
            </h3>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium">{professional.rating || 5.0}</span>
                <span className="text-xs text-muted-foreground">({professional.total_reviews || 0})</span>
              </div>
            </div>
            {professional.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground truncate">{professional.location}</span>
              </div>
            )}
          </div>
          
          {/* Rate */}
          <div className="flex-shrink-0 text-right">
            <div className="text-base font-semibold text-primary">
              €{professional.hourly_rate || 50}/hr
            </div>
            <div className="text-xs text-muted-foreground">
              {professional.total_jobs_completed || 0} jobs
            </div>
          </div>
        </div>

        {/* Bio */}
        {professional.bio && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
            {professional.bio}
          </p>
        )}

        {/* Specializations */}
        <div className="flex flex-wrap gap-1 mb-3">
          {Array.isArray(professional.subsector_tags) && professional.subsector_tags.length > 0 ? (
            <>
              {professional.subsector_tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {professional.subsector_tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{professional.subsector_tags.length - 2}
                </Badge>
              )}
            </>
          ) : Array.isArray(professional.specializations) && professional.specializations.length > 0 ? (
            <>
              {professional.specializations.slice(0, 2).map((spec) => (
                <Badge key={spec} variant="outline" className="text-xs">
                  {spec}
                </Badge>
              ))}
              {professional.specializations.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{professional.specializations.length - 2}
                </Badge>
              )}
            </>
          ) : (
            <Badge variant="outline" className="text-xs">
              General Services
            </Badge>
          )}
          
          {professional.experience_years && (
            <Badge variant="secondary" className="text-xs">
              {professional.experience_years}+ años exp
            </Badge>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewProfile}
            className="flex-1 min-h-[44px]"
          >
            View Profile
          </Button>
          
          <div className="flex gap-1">
            {professional.phone && (
              <Button
                variant="outline"
                size="sm"
                onClick={onContact}
                className="min-h-[44px] min-w-[44px] p-0"
              >
                <Phone className="w-4 h-4" />
              </Button>
            )}
            
            {onMessage && (
              <Button
                size="sm"
                onClick={onMessage}
                className="min-h-[44px] min-w-[44px] p-0 bg-gradient-to-r from-primary to-primary-glow border-0"
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};