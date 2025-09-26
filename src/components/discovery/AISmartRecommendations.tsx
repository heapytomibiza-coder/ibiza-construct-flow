import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Clock, MapPin, Star, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useDiscoveryAnalytics } from '@/hooks/useDiscoveryAnalytics';

interface AISmartRecommendationsProps {
  searchTerm: string;
  location: { lat: number; lng: number; address: string } | null;
  services: any[];
  professionals: any[];
  onRecommendationClick: (item: any, type: 'service' | 'professional') => void;
}

interface Recommendation {
  id: string;
  type: 'service' | 'professional';
  item: any;
  score: number;
  reason: string;
  confidence: number;
}

export const AISmartRecommendations = ({
  searchTerm,
  location,
  services,
  professionals,
  onRecommendationClick
}: AISmartRecommendationsProps) => {
  const { user } = useAuth();
  const { track } = useDiscoveryAnalytics();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    generateAIRecommendations();
  }, [searchTerm, location, services, professionals]);

  const generateAIRecommendations = async () => {
    if (services.length === 0 && professionals.length === 0) return;

    setIsLoading(true);
    
    try {
      // Prepare context for AI recommendation engine
      const context = {
        searchTerm,
        location: location?.address,
        userHistory: await getUserHistory(),
        availableServices: services.slice(0, 10), // Limit for API efficiency
        availableProfessionals: professionals.slice(0, 10),
        timeOfDay: new Date().getHours(),
        dayOfWeek: new Date().getDay()
      };

      const { data: functionData, error: functionError } = await supabase.functions.invoke('ai-smart-recommendations', {
        body: { context }
      });

      if (functionError) {
        console.error('AI Recommendations Error:', functionError);
        // Fallback to rule-based recommendations
        setRecommendations(generateRuleBasedRecommendations());
        return;
      }

      const aiRecommendations = functionData.recommendations || [];
      setRecommendations(aiRecommendations);

      // Track AI recommendation generation
      track('ai_recommendations_generated', {
        count: aiRecommendations.length,
        hasSearchTerm: !!searchTerm,
        hasLocation: !!location,
        isAuthenticated: !!user
      });

    } catch (error) {
      console.error('AI Smart Recommendations Error:', error);
      // Fallback to rule-based recommendations
      setRecommendations(generateRuleBasedRecommendations());
    } finally {
      setIsLoading(false);
    }
  };

  const getUserHistory = async () => {
    if (!user) return null;

    try {
      // Get user's recent activity (bookings, searches, etc.)
      const { data: bookings } = await supabase
        .from('booking_requests')
        .select('service_type, professional_id')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      return bookings || [];
    } catch (error) {
      console.error('Error getting user history:', error);
      return null;
    }
  };

  const generateRuleBasedRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];
    
    // Time-based recommendations
    const hour = new Date().getHours();
    
    if (hour >= 8 && hour < 12) {
      // Morning recommendations
      const morningServices = services.filter(s => 
        s.title.toLowerCase().includes('cleaning') ||
        s.title.toLowerCase().includes('grocery') ||
        s.title.toLowerCase().includes('dog walking')
      ).slice(0, 2);
      
      morningServices.forEach((service, index) => {
        recommendations.push({
          id: `morning-${service.id}`,
          type: 'service',
          item: service,
          score: 0.8 - (index * 0.1),
          reason: 'Popular morning service',
          confidence: 0.7
        });
      });
    }

    // Location-based recommendations
    if (location) {
      const nearbyProfessionals = professionals.slice(0, 2);
      nearbyProfessionals.forEach((professional, index) => {
        recommendations.push({
          id: `nearby-${professional.id}`,
          type: 'professional',
          item: professional,
          score: 0.9 - (index * 0.1),
          reason: `Available in ${location.address}`,
          confidence: 0.8
        });
      });
    }

    // Search-based recommendations
    if (searchTerm) {
      const searchRecommendations = services.filter(service =>
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 3);

      searchRecommendations.forEach((service, index) => {
        recommendations.push({
          id: `search-${service.id}`,
          type: 'service',
          item: service,
          score: 0.95 - (index * 0.05),
          reason: 'Matches your search',
          confidence: 0.9
        });
      });
    }

    // Popular services fallback
    if (recommendations.length < 3) {
      const popularServices = services.filter(s => s.popular).slice(0, 3 - recommendations.length);
      popularServices.forEach((service, index) => {
        recommendations.push({
          id: `popular-${service.id}`,
          type: 'service',
          item: service,
          score: 0.6 - (index * 0.05),
          reason: 'Popular choice in Ibiza',
          confidence: 0.6
        });
      });
    }

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 4); // Limit to top 4 recommendations
  };

  const handleRecommendationClick = (recommendation: Recommendation) => {
    track('ai_recommendation_click', {
      recommendationId: recommendation.id,
      type: recommendation.type,
      reason: recommendation.reason,
      score: recommendation.score,
      confidence: recommendation.confidence
    });

    onRecommendationClick(recommendation.item, recommendation.type);
  };

  const getReasonIcon = (reason: string) => {
    if (reason.includes('morning') || reason.includes('time')) return <Clock className="w-4 h-4" />;
    if (reason.includes('location') || reason.includes('nearby')) return <MapPin className="w-4 h-4" />;
    if (reason.includes('search') || reason.includes('matches')) return <Zap className="w-4 h-4" />;
    if (reason.includes('popular')) return <TrendingUp className="w-4 h-4" />;
    return <Star className="w-4 h-4" />;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            AI is analyzing your preferences...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Smart Recommendations
          <Badge variant="secondary" className="ml-auto">Powered by AI</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((recommendation) => (
            <Card 
              key={recommendation.id}
              className="cursor-pointer hover:shadow-md transition-shadow bg-background border hover:border-primary/50"
              onClick={() => handleRecommendationClick(recommendation)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getReasonIcon(recommendation.reason)}
                    <span className="text-sm font-medium text-primary">
                      {recommendation.reason}
                    </span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getConfidenceColor(recommendation.confidence)}`}
                  >
                    {Math.round(recommendation.confidence * 100)}% match
                  </Badge>
                </div>

                {recommendation.type === 'service' ? (
                  <div>
                    <h4 className="font-semibold mb-1">{recommendation.item.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {recommendation.item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {recommendation.item.category}
                      </Badge>
                      <span className="text-sm font-medium text-primary">
                        {recommendation.item.priceRange}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-semibold mb-1">{recommendation.item.full_name}</h4>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {recommendation.item.bio || 'Professional service provider'}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {recommendation.item.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs">{recommendation.item.rating}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-medium text-primary">
                        €{recommendation.item.hourly_rate || 50}/hr
                      </span>
                    </div>
                  </div>
                )}

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3 border-primary/50 hover:bg-primary hover:text-primary-foreground"
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};