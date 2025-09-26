import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Star, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFeature } from '@/contexts/FeatureFlagsContext';
import { useDiscoveryAnalytics } from '@/hooks/useDiscoveryAnalytics';

interface EnhancedBookingFlowProps {
  type: 'service' | 'professional';
  item: any;
  onClose: () => void;
}

export const EnhancedBookingFlow = ({ type, item, onClose }: EnhancedBookingFlowProps) => {
  const navigate = useNavigate();
  const jobWizardEnabled = useFeature('ff.jobWizardV2');
  const { trackBookingStart } = useDiscoveryAnalytics();
  const [bookingMode, setBookingMode] = useState<'instant' | 'request'>('instant');

  const handleBookingStart = (mode: 'instant' | 'request') => {
    trackBookingStart(type, item.id, mode);
    
    if (type === 'service') {
      if (jobWizardEnabled) {
        navigate(`/post?service=${encodeURIComponent(item.title)}&category=${encodeURIComponent(item.category)}&mode=${mode}`);
      } else {
        navigate(`/service/${item.slug}?mode=${mode}`);
      }
    } else {
      navigate(`/post?professional=${item.id}&mode=${mode}`);
    }
  };

  const handleContactProfessional = () => {
    trackBookingStart('professional', item.id, 'contact');
    navigate(`/professional/${item.id}?action=contact`);
  };

  if (type === 'professional') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={item.profile_image_url} alt={item.full_name} />
              <AvatarFallback>
                {item.full_name?.split(' ').map(n => n[0]).join('') || 'P'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{item.full_name}</CardTitle>
              <div className="flex items-center gap-2">
                {item.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm">{item.rating}</span>
                  </div>
                )}
                <Badge variant="secondary">
                  €{item.hourly_rate || 50}/hr
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleBookingStart('instant')}
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-glow"
            >
              <Zap className="w-4 h-4" />
              Book Now
            </Button>
            <Button
              variant="outline"
              onClick={() => handleBookingStart('request')}
              className="flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Request Quote
            </Button>
          </div>
          
          <Button
            variant="ghost"
            onClick={handleContactProfessional}
            className="w-full flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            View Profile & Contact
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <item.icon className="w-6 h-6 text-primary" />
          {item.title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{item.description}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Booking Mode Selection */}
        <div className="space-y-3">
          <h4 className="font-medium">How would you like to book?</h4>
          
          <div className="grid grid-cols-1 gap-3">
            <Card 
              className={`cursor-pointer border-2 transition-colors ${
                bookingMode === 'instant' ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onClick={() => setBookingMode('instant')}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h5 className="font-medium">Instant Booking</h5>
                    <p className="text-xs text-muted-foreground">Book available time slots immediately</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card 
              className={`cursor-pointer border-2 transition-colors ${
                bookingMode === 'request' ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onClick={() => setBookingMode('request')}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h5 className="font-medium">Request Service</h5>
                    <p className="text-xs text-muted-foreground">Get custom quotes from professionals</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Price Information */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <span className="text-sm font-medium">Estimated Price</span>
          <span className="text-lg font-bold text-primary">{item.priceRange}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={() => handleBookingStart(bookingMode)}
            className="flex-1 bg-gradient-to-r from-primary to-primary-glow"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};