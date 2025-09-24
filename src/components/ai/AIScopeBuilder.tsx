import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Sparkles, Brain, CheckCircle, AlertTriangle, 
  Plus, FileText, Camera, Mic, Upload, Target,
  Lightbulb, TrendingUp, MapPin, Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ScopeBuilderProps {
  initialScope?: string;
  onScopeUpdate: (scope: string, suggestions: any[], confidence: number) => void;
}

interface AISuggestion {
  id: string;
  type: 'missing_detail' | 'scope_improvement' | 'cost_optimization' | 'timeline_advice';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
  accepted?: boolean;
}

const AIScopeBuilder = ({ initialScope = '', onScopeUpdate }: ScopeBuilderProps) => {
  const [scope, setScope] = useState(initialScope);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [confidence, setConfidence] = useState(70);
  const [analyzing, setAnalyzing] = useState(false);
  const [inputMode, setInputMode] = useState<'text' | 'voice' | 'photo'>('text');

  useEffect(() => {
    if (scope.length > 50) {
      analyzeScope();
    }
  }, [scope]);

  const analyzeScope = async () => {
    setAnalyzing(true);
    try {
      // Simulate AI analysis with realistic suggestions
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockSuggestions: AISuggestion[] = [
        {
          id: '1',
          type: 'missing_detail',
          title: 'Room Dimensions Missing',
          description: 'Specify the room size (length × width) for accurate material calculations',
          priority: 'high',
          impact: 'Could affect quote accuracy by ±25%'
        },
        {
          id: '2',
          type: 'scope_improvement',
          title: 'Access Considerations',
          description: 'Mention if there are stairs, narrow hallways, or parking restrictions',
          priority: 'medium',
          impact: 'Helps professionals plan logistics and pricing'
        },
        {
          id: '3',
          type: 'cost_optimization',
          title: 'Material Preference',
          description: 'Specify if you have preferences for material quality (standard, premium, luxury)',
          priority: 'medium',
          impact: 'Can reduce scope creep and change orders'
        },
        {
          id: '4',
          type: 'timeline_advice',
          title: 'Flexible Timing',
          description: 'Consider off-peak periods (Mon-Wed) for potential 10-15% cost savings',
          priority: 'low',
          impact: 'Cost optimization opportunity'
        }
      ];

      setSuggestions(mockSuggestions);
      
      // Calculate confidence based on scope completeness
      const baseConfidence = Math.min(90, 50 + scope.length / 10);
      const completenessBonus = mockSuggestions.filter(s => s.priority === 'high').length === 0 ? 15 : 0;
      const finalConfidence = Math.min(95, baseConfidence + completenessBonus);
      
      setConfidence(finalConfidence);
      onScopeUpdate(scope, mockSuggestions, finalConfidence);
    } catch (error) {
      console.error('Error analyzing scope:', error);
      toast.error('Failed to analyze scope');
    } finally {
      setAnalyzing(false);
    }
  };

  const acceptSuggestion = (suggestionId: string) => {
    setSuggestions(prev => prev.map(s => 
      s.id === suggestionId ? { ...s, accepted: true } : s
    ));
    
    const suggestion = suggestions.find(s => s.id === suggestionId);
    if (suggestion) {
      // Auto-append suggestion to scope
      const addition = `\n\n${suggestion.title}: [Please specify]`;
      setScope(prev => prev + addition);
    }
  };

  const handleVoiceInput = () => {
    toast.info('Voice input feature coming soon');
  };

  const handlePhotoUpload = () => {
    toast.info('Photo analysis feature coming soon');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-muted-foreground bg-muted/50 border-muted';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'missing_detail': return AlertTriangle;
      case 'scope_improvement': return Lightbulb;
      case 'cost_optimization': return TrendingUp;
      case 'timeline_advice': return Clock;
      default: return CheckCircle;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            AI Scope Builder
            <Badge variant="secondary" className="ml-2">
              Beta
            </Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            Describe your project in any format. Our AI will help you create a comprehensive scope.
          </p>
        </CardHeader>
      </Card>

      {/* Input Methods */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={inputMode === 'text' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setInputMode('text')}
        >
          <FileText className="w-4 h-4 mr-2" />
          Text
        </Button>
        <Button
          variant={inputMode === 'voice' ? 'default' : 'outline'}
          size="sm"
          onClick={handleVoiceInput}
        >
          <Mic className="w-4 h-4 mr-2" />
          Voice
        </Button>
        <Button
          variant={inputMode === 'photo' ? 'default' : 'outline'}
          size="sm"
          onClick={handlePhotoUpload}
        >
          <Camera className="w-4 h-4 mr-2" />
          Photo
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scope Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Project Description
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span className="text-sm font-normal">
                  {confidence}% Complete
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              placeholder="Describe your project in detail. For example: 'I need to renovate my kitchen. The room is about 12x10 feet with old cabinets that need replacing. I want modern cabinets, new countertops, and updated lighting. The kitchen is on the ground floor with easy access...'"
              rows={12}
              className="resize-none"
            />
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {scope.length} characters • {scope.split(' ').length} words
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-16 bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary to-primary-foreground h-2 rounded-full transition-all"
                    style={{ width: `${confidence}%` }}
                  />
                </div>
                {analyzing && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </div>
                )}
              </div>
            </div>

            {scope.length > 50 && !analyzing && (
              <Button 
                onClick={analyzeScope}
                className="w-full"
                disabled={analyzing}
              >
                <Brain className="w-4 h-4 mr-2" />
                Re-analyze Scope
              </Button>
            )}
          </CardContent>
        </Card>

        {/* AI Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Suggestions
              {suggestions.length > 0 && (
                <Badge variant="outline">
                  {suggestions.filter(s => !s.accepted).length} pending
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyzing ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : suggestions.length === 0 ? (
              <div className="text-center py-8">
                <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Start describing your project to get AI suggestions
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {suggestions.map((suggestion) => {
                  const Icon = getTypeIcon(suggestion.type);
                  return (
                    <Card 
                      key={suggestion.id}
                      className={cn(
                        "border transition-all",
                        suggestion.accepted 
                          ? "bg-green-50 border-green-200" 
                          : getPriorityColor(suggestion.priority)
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm">
                                {suggestion.title}
                              </h4>
                              <Badge 
                                variant="outline" 
                                className={cn("text-xs", getPriorityColor(suggestion.priority))}
                              >
                                {suggestion.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {suggestion.description}
                            </p>
                            <p className="text-xs text-muted-foreground mb-3">
                              <strong>Impact:</strong> {suggestion.impact}
                            </p>
                            
                            {!suggestion.accepted ? (
                              <Button
                                size="sm"
                                onClick={() => acceptSuggestion(suggestion.id)}
                                className="bg-primary text-primary-foreground"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add to Scope
                              </Button>
                            ) : (
                              <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-sm">Added to scope</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confidence Indicator */}
      {scope.length > 0 && (
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Scope Confidence</h4>
                <p className="text-sm text-muted-foreground">
                  Based on detail completeness and market data
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{confidence}%</div>
                <div className="text-xs text-muted-foreground">
                  {confidence >= 90 ? 'Excellent' : 
                   confidence >= 75 ? 'Good' : 
                   confidence >= 60 ? 'Fair' : 'Needs work'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIScopeBuilder;