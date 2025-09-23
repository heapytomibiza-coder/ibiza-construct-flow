import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Clock, 
  MapPin, 
  Star, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Zap,
  Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MatchingScore {
  overall: number;
  location: number;
  timing: number;
  budget: number;
  complexity: number;
}

interface ProfessionalAvailability {
  totalCount: number;
  availableNow: number;
  respondWithin24h: number;
  avgResponseTime: string;
}

interface MatchingFeedbackProps {
  wizardState: any;
  className?: string;
  onOptimizationSuggestion?: (suggestion: string, value: any) => void;
}

export const MatchingFeedback: React.FC<MatchingFeedbackProps> = ({
  wizardState,
  className,
  onOptimizationSuggestion
}) => {
  const [matchingScore, setMatchingScore] = useState<MatchingScore>({
    overall: 0,
    location: 0,
    timing: 0,
    budget: 0,
    complexity: 0
  });
  const [availability, setAvailability] = useState<ProfessionalAvailability>({
    totalCount: 0,
    availableNow: 0,
    respondWithin24h: 0,
    avgResponseTime: '2-4 hours'
  });
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{
    type: 'location' | 'timing' | 'budget' | 'description';
    message: string;
    action?: string;
    value?: any;
    priority: 'high' | 'medium' | 'low';
  }>>([]);

  useEffect(() => {
    if (wizardState.serviceId && wizardState.generalAnswers?.location) {
      calculateMatchingScore();
      loadProfessionalAvailability();
    }
  }, [wizardState]);

  const calculateMatchingScore = () => {
    const scores = {
      location: calculateLocationScore(),
      timing: calculateTimingScore(),
      budget: calculateBudgetScore(),
      complexity: calculateComplexityScore()
    };

    const overall = Object.values(scores).reduce((sum, score) => sum + score, 0) / 4;
    
    setMatchingScore({
      ...scores,
      overall
    });

    generateSuggestions(scores);
  };

  const calculateLocationScore = (): number => {
    const location = wizardState.generalAnswers?.location;
    if (!location) return 0;

    // Urban areas typically have more professionals
    const urbanAreas = ['dublin', 'cork', 'galway', 'limerick'];
    const isUrban = urbanAreas.some(city => 
      location.toLowerCase().includes(city.toLowerCase())
    );

    return isUrban ? 85 : 65;
  };

  const calculateTimingScore = (): number => {
    const urgency = wizardState.generalAnswers?.urgency;
    
    switch (urgency) {
      case 'emergency':
        return 40; // Harder to match emergency requests
      case 'urgent':
        return 60;
      case 'this-week':
        return 80;
      case 'flexible':
        return 95;
      default:
        return 50;
    }
  };

  const calculateBudgetScore = (): number => {
    const budget = wizardState.generalAnswers?.budget;
    if (!budget || budget === 'open') return 90;

    // Higher budgets typically get better matches
    const budgetScores: Record<string, number> = {
      'under-100': 50,
      '100-300': 70,
      '300-500': 85,
      '500-1000': 90,
      '1000-plus': 95
    };

    return budgetScores[budget] || 60;
  };

  const calculateComplexityScore = (): number => {
    const microAnswers = wizardState.microAnswers || {};
    const answerCount = Object.keys(microAnswers).length;
    
    // More detailed requirements = better matches
    if (answerCount >= 5) return 90;
    if (answerCount >= 3) return 75;
    if (answerCount >= 1) return 60;
    return 40;
  };

  const generateSuggestions = (scores: Omit<MatchingScore, 'overall'>) => {
    const newSuggestions = [];

    // Location suggestions
    if (scores.location < 70) {
      newSuggestions.push({
        type: 'location' as const,
        message: 'Consider expanding to nearby areas for more professional options',
        action: 'Add nearby locations',
        priority: 'medium' as const
      });
    }

    // Timing suggestions  
    if (scores.timing < 60) {
      newSuggestions.push({
        type: 'timing' as const,
        message: 'Flexible timing increases your chances by 40%',
        action: 'Make timing flexible',
        value: 'flexible',
        priority: 'high' as const
      });
    }

    // Budget suggestions
    if (scores.budget < 70) {
      newSuggestions.push({
        type: 'budget' as const,
        message: 'Open budget attracts 3x more professionals',
        action: 'Set budget to "Open to offers"',
        value: 'open',
        priority: 'medium' as const
      });
    }

    // Description suggestions
    if (scores.complexity < 60) {
      newSuggestions.push({
        type: 'description' as const,
        message: 'Add more details to attract qualified professionals',
        action: 'Enhance description',
        priority: 'high' as const
      });
    }

    setSuggestions(newSuggestions);
  };

  const loadProfessionalAvailability = async () => {
    try {
      setLoading(true);
      
      // Simulate professional availability data
      // In real app, this would query professionals table with filters
      const mockAvailability = {
        totalCount: 24,
        availableNow: 8,
        respondWithin24h: 18,
        avgResponseTime: getEstimatedResponseTime()
      };

      setAvailability(mockAvailability);
    } catch (error) {
      console.error('Error loading professional availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstimatedResponseTime = (): string => {
    const urgency = wizardState.generalAnswers?.urgency;
    const location = wizardState.generalAnswers?.location;
    
    const isUrban = location?.toLowerCase().includes('dublin') || 
                   location?.toLowerCase().includes('cork');
    
    if (urgency === 'emergency') return isUrban ? '15-30 min' : '1-2 hours';
    if (urgency === 'urgent') return isUrban ? '1-2 hours' : '2-4 hours';
    return isUrban ? '2-4 hours' : '4-8 hours';
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (score >= 60) return <Clock className="w-4 h-4 text-yellow-600" />;
    return <AlertTriangle className="w-4 h-4 text-red-600" />;
  };

  if (!wizardState.serviceId) return null;

  return (
    <Card className={`p-6 space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Matching Quality</h3>
        </div>
        <Badge variant={matchingScore.overall >= 80 ? 'default' : 'secondary'}>
          {Math.round(matchingScore.overall)}% match
        </Badge>
      </div>

      {/* Overall Score */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Overall Matching Score</span>
          <span className={`font-bold ${getScoreColor(matchingScore.overall)}`}>
            {Math.round(matchingScore.overall)}/100
          </span>
        </div>
        <Progress value={matchingScore.overall} className="h-3" />
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { key: 'location', label: 'Location', icon: MapPin },
          { key: 'timing', label: 'Timing', icon: Clock },
          { key: 'budget', label: 'Budget', icon: Star },
          { key: 'complexity', label: 'Details', icon: Zap }
        ].map(({ key, label, icon: Icon }) => {
          const score = matchingScore[key as keyof Omit<MatchingScore, 'overall'>];
          return (
            <div key={key} className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm flex-1">{label}</span>
              {getScoreIcon(score)}
              <span className={`text-sm font-medium ${getScoreColor(score)}`}>
                {Math.round(score)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Professional Availability */}
      <div className="bg-gradient-subtle rounded-lg p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Professional Availability
        </h4>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Available Professionals</div>
            <div className="font-semibold">{availability.totalCount} nearby</div>
          </div>
          <div>
            <div className="text-muted-foreground">Response Time</div>
            <div className="font-semibold">{availability.avgResponseTime}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Available Now</div>
            <div className="font-semibold text-green-600">{availability.availableNow}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Respond in 24h</div>
            <div className="font-semibold">{availability.respondWithin24h}</div>
          </div>
        </div>
      </div>

      {/* Optimization Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Optimization Tips
          </h4>
          
          {suggestions.map((suggestion, index) => (
            <div 
              key={index} 
              className={`p-3 rounded-lg border ${
                suggestion.priority === 'high' 
                  ? 'bg-red-50 border-red-200' 
                  : suggestion.priority === 'medium'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">{suggestion.message}</p>
                  {suggestion.priority === 'high' && (
                    <Badge variant="destructive" className="text-xs">
                      High Impact
                    </Badge>
                  )}
                </div>
                
                {suggestion.action && onOptimizationSuggestion && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onOptimizationSuggestion(suggestion.type, suggestion.value)}
                    className="ml-2"
                  >
                    {suggestion.action}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
        <div>Updated in real-time</div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Excellent match
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            Good match
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            Needs improvement
          </div>
        </div>
      </div>
    </Card>
  );
};