import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, PlusCircle, CheckCircle, ArrowRight,
  Clock, Users, Target, Zap
} from 'lucide-react';

interface PathRecommendationProps {
  recommendedPath: 'browse' | 'post';
  confidence: number;
  reasons: string[];
  onSelectPath: (path: 'browse' | 'post') => void;
  onShowBoth: () => void;
}

export const PathRecommendation: React.FC<PathRecommendationProps> = ({
  recommendedPath,
  confidence,
  reasons,
  onSelectPath,
  onShowBoth
}) => {
  const browsePath = {
    id: 'browse',
    title: 'Find a Professional',
    subtitle: 'Browse and book directly',
    icon: <Search className="w-6 h-6" />,
    description: 'Perfect when you know what you need and want to choose from available professionals.',
    benefits: [
      'See pricing upfront',
      'Instant booking available',
      'Read reviews and portfolios',
      'Direct communication'
    ],
    timeToSolution: '15-30 minutes',
    color: 'bg-blue-500'
  };

  const postPath = {
    id: 'post',
    title: 'Post a Job Request',
    subtitle: 'Get quotes and compare',
    icon: <PlusCircle className="w-6 h-6" />,
    description: 'Ideal for complex projects where you want multiple professionals to propose solutions.',
    benefits: [
      'Multiple competitive quotes',
      'Professional guidance on scope',
      'Custom proposals',
      'Compare approaches'
    ],
    timeToSolution: '2-4 hours for quotes',
    color: 'bg-green-500'
  };

  const recommended = recommendedPath === 'browse' ? browsePath : postPath;
  const alternative = recommendedPath === 'browse' ? postPath : browsePath;

  return (
    <div className="space-y-6">
      {/* Recommendation Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">We recommend</h2>
        <div className="flex items-center justify-center gap-2 mb-4">
          <Badge variant="default" className="px-3 py-1">
            <CheckCircle className="w-4 h-4 mr-1" />
            {confidence}% match
          </Badge>
        </div>
      </div>

      {/* Recommended Path */}
      <Card className="border-2 border-primary bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className={`w-12 h-12 ${recommended.color} rounded-lg flex items-center justify-center text-white`}>
              {recommended.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold">{recommended.title}</h3>
                <Badge variant="default" className="text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  Recommended
                </Badge>
              </div>
              <p className="text-muted-foreground">{recommended.subtitle}</p>
            </div>
          </div>

          <p className="text-sm mb-4">{recommended.description}</p>

          {/* Why recommended */}
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Why this works for you:</p>
            <ul className="space-y-1">
              {reasons.map((reason, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {recommended.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                {benefit}
              </div>
            ))}
          </div>

          {/* Time estimate */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Clock className="w-4 h-4" />
            Typical time to solution: {recommended.timeToSolution}
          </div>

          <Button 
            className="w-full bg-primary hover:bg-primary/90"
            onClick={() => onSelectPath(recommendedPath)}
          >
            {recommended.title}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Alternative Path */}
      <Card className="border">
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className={`w-12 h-12 ${alternative.color} rounded-lg flex items-center justify-center text-white`}>
              {alternative.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{alternative.title}</h3>
              <p className="text-muted-foreground text-sm">{alternative.subtitle}</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4">{alternative.description}</p>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Clock className="w-4 h-4" />
            {alternative.timeToSolution}
          </div>

          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => onSelectPath(recommendedPath === 'browse' ? 'post' : 'browse')}
          >
            Try {alternative.title}
          </Button>
        </CardContent>
      </Card>

      {/* Show Both Option */}
      <Card className="border-dashed">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Not sure? You can always explore both options
          </p>
          <Button variant="ghost" onClick={onShowBoth}>
            <Users className="w-4 h-4 mr-2" />
            Show me both paths
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};