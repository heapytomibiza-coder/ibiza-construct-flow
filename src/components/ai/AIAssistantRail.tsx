import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, ChevronDown, ChevronUp, TrendingUp, 
  AlertCircle, CheckCircle, DollarSign, Clock,
  Lightbulb, Target, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AISuggestion {
  type: string;
  title: string;
  description: string;
  action: string;
  confidence: number;
  priority?: 'high' | 'medium' | 'low';
}

interface AIAssistantRailProps {
  suggestions: AISuggestion[];
  userContext: {
    activeView: string;
    stats: any;
    bookings: any[];
  };
}

export const AIAssistantRail = ({ suggestions, userContext }: AIAssistantRailProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('suggestions');

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'scope-improvement':
        return <Target className="w-4 h-4 text-copper" />;
      case 'budget-optimization':
        return <DollarSign className="w-4 h-4 text-green-600" />;
      case 'pro-recommendation':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'timing-optimization':
        return <Clock className="w-4 h-4 text-orange-600" />;
      default:
        return <Lightbulb className="w-4 h-4 text-copper" />;
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'scope-improvement':
        return 'border-copper/20 bg-copper/5';
      case 'budget-optimization':
        return 'border-green-200 bg-green-50';
      case 'pro-recommendation':
        return 'border-blue-200 bg-blue-50';
      case 'timing-optimization':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-copper/20 bg-copper/5';
    }
  };

  if (!isExpanded) {
    return (
      <div className="w-16 border-l border-border bg-card p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(true)}
          className="w-full p-2"
        >
          <Sparkles className="w-4 h-4 text-copper" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-80 border-l border-border bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-hero rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <h3 className="font-display font-semibold text-foreground">AI Assistant</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="p-1"
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Tabs */}
        <div className="mt-3 flex gap-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => setActiveTab('suggestions')}
            className={cn(
              "flex-1 text-xs px-2 py-1 rounded-md transition-colors",
              activeTab === 'suggestions' 
                ? "bg-white text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Suggestions
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={cn(
              "flex-1 text-xs px-2 py-1 rounded-md transition-colors",
              activeTab === 'insights' 
                ? "bg-white text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Insights
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'suggestions' && (
          <div className="space-y-4">
            {suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <Card key={index} className={cn("card-luxury border", getSuggestionColor(suggestion.type))}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getSuggestionIcon(suggestion.type)}
                        <CardTitle className="text-sm font-medium">
                          {suggestion.title}
                        </CardTitle>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {suggestion.confidence}% sure
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground mb-3">
                      {suggestion.description}
                    </p>
                    <Button size="sm" className="w-full bg-gradient-hero text-white">
                      <Zap className="w-3 h-3 mr-1" />
                      {suggestion.action}
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="w-8 h-8 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm">AI is analyzing your activity...</p>
                <p className="text-xs mt-1">Suggestions will appear here</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-4">
            {/* Market Insights */}
            <Card className="card-luxury">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  Market Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Electrical Work</span>
                  <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                    -8% this month
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Plumbing</span>
                  <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                    +3% this month
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Tiling</span>
                  <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                    -12% this month
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Performance Insights */}
            <Card className="card-luxury">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="w-4 h-4 text-copper" />
                  Your Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Avg. Response Time</span>
                  <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                    2.3 hours
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Quote Acceptance</span>
                  <Badge variant="outline" className="text-xs text-copper border-copper/20">
                    67%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Project Success</span>
                  <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                    94%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Opportunities */}
            <Card className="card-luxury border-copper/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-copper" />
                  Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="p-2 bg-copper/5 rounded-lg">
                    <p className="text-xs font-medium text-charcoal">Best Time to Book</p>
                    <p className="text-xs text-muted-foreground">Weekday mornings get 23% faster responses</p>
                  </div>
                  <div className="p-2 bg-copper/5 rounded-lg">
                    <p className="text-xs font-medium text-charcoal">Budget Optimization</p>
                    <p className="text-xs text-muted-foreground">Consider off-season pricing for 15% savings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full border-copper text-copper hover:bg-copper/5"
        >
          <Sparkles className="w-3 h-3 mr-1" />
          Ask AI Anything
        </Button>
      </div>
    </div>
  );
};