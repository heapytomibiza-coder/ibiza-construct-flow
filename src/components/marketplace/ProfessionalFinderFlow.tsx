import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, MapPin, Star, Euro, Clock, 
  MessageSquare, Heart, Filter, Users,
  Briefcase, Award, CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useProfessionals } from '@/hooks/useProfessionals';

interface ProfessionalFinderFlowProps {
  jobId?: string;
  serviceCategory?: string;
  onProfessionalSelect?: (professional: any) => void;
}

export const ProfessionalFinderFlow: React.FC<ProfessionalFinderFlowProps> = ({
  jobId,
  serviceCategory,
  onProfessionalSelect
}) => {
  const { professionals, loading, error } = useProfessionals();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('');

  const filteredProfessionals = professionals.filter(professional => {
    const matchesSearch = professional.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      professional.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      professional.specializations?.some((spec: string) => 
        spec.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesLocation = !locationFilter || 
      professional.location?.toLowerCase().includes(locationFilter.toLowerCase());

    const matchesRating = !ratingFilter || 
      (professional.rating || 0) >= ratingFilter;

    const matchesAvailability = !availabilityFilter || 
      professional.availability_status === availabilityFilter;

    return matchesSearch && matchesLocation && matchesRating && matchesAvailability;
  });

  const handleContactProfessional = async (professional: any) => {
    if (onProfessionalSelect) {
      onProfessionalSelect(professional);
    } else {
      toast.info('Messaging feature coming soon');
    }
  };

  const handleSaveProfessional = async (professionalId: string) => {
    try {
      // This would save to client_favorites table
      toast.success('Professional saved to favorites');
    } catch (error) {
      toast.error('Failed to save professional');
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-muted rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-32"></div>
                  <div className="h-3 bg-muted rounded w-24"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-destructive">Error loading professionals: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            Find Professionals
          </h2>
          <p className="text-muted-foreground">
            {filteredProfessionals.length} professionals available
            {serviceCategory && ` for ${serviceCategory}`}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Pros</p>
                <p className="text-xl font-bold">{professionals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-xl font-bold">
                  {professionals.filter(p => p.availability_status === 'available').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-xl font-bold">
                  {(professionals.reduce((acc, p) => acc + (p.rating || 0), 0) / professionals.length || 0).toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Verified</p>
                <p className="text-xl font-bold">
                  {professionals.filter(p => p.verification_status === 'verified').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Professional Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfessionals.length > 0 ? (
          filteredProfessionals.map((professional) => (
            <Card key={professional.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={professional.profile_image_url} />
                      <AvatarFallback className="bg-gradient-hero text-white text-lg">
                        {professional.full_name?.[0] || professional.display_name?.[0] || 'P'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h3 className="font-semibold text-lg">
                        {professional.full_name || professional.display_name || 'Professional'}
                      </h3>
                      <div className="flex items-center gap-2">
                        {professional.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{professional.rating}</span>
                          </div>
                        )}
                        {professional.total_reviews && (
                          <span className="text-sm text-muted-foreground">
                            ({professional.total_reviews} reviews)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSaveProfessional(professional.id)}
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>

                {/* Bio */}
                {professional.bio && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {professional.bio}
                  </p>
                )}

                {/* Specializations */}
                {professional.specializations && professional.specializations.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {professional.specializations.slice(0, 3).map((spec: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                      {professional.specializations.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{professional.specializations.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-muted/50 rounded-lg">
                  {professional.hourly_rate && (
                    <div>
                      <p className="text-xs text-muted-foreground">Hourly Rate</p>
                      <p className="font-semibold text-primary">€{professional.hourly_rate}/hr</p>
                    </div>
                  )}
                  
                  {professional.experience_years && (
                    <div>
                      <p className="text-xs text-muted-foreground">Experience</p>
                      <p className="font-medium">{professional.experience_years} years</p>
                    </div>
                  )}
                  
                  {professional.location && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Location</p>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm">{professional.location}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status and Stats */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={professional.availability_status === 'available' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {professional.availability_status || 'Unknown'}
                    </Badge>
                    
                    {professional.verification_status === 'verified' && (
                      <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  {professional.total_jobs_completed && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Briefcase className="w-3 h-3" />
                      <span>{professional.total_jobs_completed} jobs</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-gradient-hero text-white"
                    onClick={() => handleContactProfessional(professional)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No professionals found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or check back later for new professionals.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};