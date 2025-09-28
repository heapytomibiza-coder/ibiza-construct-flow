import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, PlusCircle, Search, Lightbulb,
  Users, Clock, Target, TrendingUp
} from 'lucide-react';

interface CrossoverBannerProps {
  type: 'discovery-to-post' | 'post-to-discovery';
  context?: {
    searchTerm?: string;
    category?: string;
    location?: string;
    resultsCount?: number;
    jobTitle?: string;
    offerCount?: number;
    timeWaiting?: number;
  };
  onCrossover: () => void;
  onDismiss?: () => void;
}

export const CrossoverBanner: React.FC<CrossoverBannerProps> = ({
  type,
  context = {},
  onCrossover,
  onDismiss
}) => {
  const isDiscoveryToPost = type === 'discovery-to-post';
  
  const config = isDiscoveryToPost ? {
    title: 'Not finding the right fit?',
    subtitle: 'Let professionals come to you instead',
    description: context.resultsCount && context.resultsCount < 3 
      ? `Only ${context.resultsCount} professionals found. Post your job to reach more specialists.`
      : 'Post your project details and get custom quotes from multiple professionals.',
    actionText: 'Post a Job Request',
    icon: <PlusCircle className="w-5 h-5" />,
    benefits: [
      'Reach more professionals',
      'Get custom proposals',
      'Compare multiple approaches'
    ],
    color: 'bg-green-500',
    bgColor: 'bg-green-50 border-green-200'
  } : {
    title: 'No offers yet?',
    subtitle: 'Browse available professionals directly',
    description: context.timeWaiting && context.timeWaiting > 2
      ? `It's been ${context.timeWaiting} hours. Try browsing professionals who are available now.`
      : 'Find professionals who are ready to work and can start immediately.',
    actionText: 'Browse Professionals',
    icon: <Search className="w-5 h-5" />,
    benefits: [
      'Instant availability',
      'See pricing upfront',
      'Start booking immediately'
    ],
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50 border-blue-200'
  };

  return (
    <Card className={`border-2 ${config.bgColor} mb-6`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 ${config.color} rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
            {config.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h3 className="font-semibold text-base">{config.title}</h3>
                <p className="text-sm text-muted-foreground">{config.subtitle}</p>
              </div>
              
              {onDismiss && (
                <Button variant="ghost" size="sm" onClick={onDismiss}>
                  ×
                </Button>
              )}
            </div>

            <p className="text-sm mb-4">{config.description}</p>

            {/* Context-specific details */}
            {context.searchTerm && (
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="text-xs">
                  <Target className="w-3 h-3 mr-1" />
                  {context.searchTerm}
                </Badge>
                {context.location && (
                  <Badge variant="outline" className="text-xs">
                    📍 {context.location}
                  </Badge>
                )}
              </div>
            )}

            {/* Benefits */}
            <div className="flex flex-wrap gap-4 mb-4">
              {config.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-1 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  {benefit}
                </div>
              ))}
            </div>

            {/* Action */}
            <div className="flex items-center gap-3">
              <Button 
                onClick={onCrossover}
                className="bg-primary hover:bg-primary/90"
                size="sm"
              >
                {config.actionText}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              {/* Smart suggestions */}
              {isDiscoveryToPost && context.searchTerm && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Lightbulb className="w-3 h-3" />
                  We'll prefill your job with "{context.searchTerm}"
                </div>
              )}
              
              {!isDiscoveryToPost && context.jobTitle && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="w-3 h-3" />
                  Find specialists in {context.jobTitle.toLowerCase()}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};