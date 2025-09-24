import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Zap, Target, Star, MapPin, Clock, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SmartMatch {
  id: string;
  professional_id: string;
  match_score: number;
  match_reasons: string[];
  skill_score: number;
  location_score: number;
  price_score: number;
  reputation_score: number;
  availability_score: number;
  status: string;
  professional?: {
    full_name: string;
    avatar_url: string;
    skills: string[];
    rating: number;
    location: any;
    pricing: any;
  };
}

interface AIRecommendation {
  type: string;
  title: string;
  description: string;
  priority: string;
  actions: string[];
}

interface SmartMatcherProps {
  jobId: string;
  onMatchSelect?: (match: SmartMatch) => void;
}

export const AISmartMatcher: React.FC<SmartMatcherProps> = ({ jobId, onMatchSelect }) => {
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<SmartMatch[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadExistingMatches();
  }, [jobId]);

  const loadExistingMatches = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('smart_matches')
        .select(`
          *,
          professional:professional_profiles!professional_id (
            full_name,
            avatar_url,
            skills,
            rating,
            location,
            pricing
          )
        `)
        .eq('job_id', jobId)
        .order('match_score', { ascending: false });

      if (error) throw error;

      setMatches((data || []).map(match => ({
        ...match,
        match_reasons: Array.isArray(match.match_reasons) ? match.match_reasons.map(String) : []
      })));
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const runSmartMatching = async () => {
    try {
      setAnalyzing(true);
      toast({
        title: "AI Matching Started",
        description: "Analyzing professionals and calculating compatibility scores..."
      });

      const { data, error } = await supabase.functions.invoke('ai-smart-matcher', {
        body: {
          job_id: jobId,
          max_matches: 15,
          filters: {
            min_rating: 3.5,
            max_distance: 50,
            availability_required: true
          }
        }
      });

      if (error) throw error;

      setMatches(data.matches || []);
      setRecommendations(data.recommendations || []);

      toast({
        title: "Smart Matching Complete",
        description: `Found ${data.matches?.length || 0} compatible professionals`
      });

      // Reload matches to get full professional data
      await loadExistingMatches();

    } catch (error) {
      console.error('Error running smart matching:', error);
      toast({
        title: "Matching Error",
        description: "Failed to run smart matching analysis",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.7) return 'text-blue-600';
    if (score >= 0.5) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getMatchScoreLabel = (score: number) => {
    if (score >= 0.9) return 'Excellent Match';
    if (score >= 0.7) return 'Good Match';
    if (score >= 0.5) return 'Fair Match';
    return 'Poor Match';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'medium': return <Target className="w-5 h-5 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <CheckCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI Smart Matcher
          </h3>
          <p className="text-sm text-muted-foreground">
            Intelligent professional matching using AI analysis
          </p>
        </div>
        <Button 
          onClick={runSmartMatching} 
          disabled={analyzing || loading}
          className="flex items-center gap-2"
        >
          {analyzing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Run Smart Match
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="matches" className="space-y-4">
        <TabsList>
          <TabsTrigger value="matches">Smart Matches ({matches.length})</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations ({recommendations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="matches">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading matches...</p>
            </div>
          ) : matches.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Matches Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Run the AI Smart Matcher to find compatible professionals
                </p>
                <Button onClick={runSmartMatching} disabled={analyzing}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Find Matches
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {matches.map((match) => (
                <Card key={match.id} className="hover-scale">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          {match.professional?.avatar_url ? (
                            <img 
                              src={match.professional.avatar_url} 
                              alt={match.professional.full_name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {match.professional?.full_name?.[0] || 'P'}
                            </div>
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {match.professional?.full_name || 'Professional'}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {match.professional?.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span>{match.professional.rating.toFixed(1)}</span>
                              </div>
                            )}
                            <MapPin className="w-3 h-3" />
                            <span>Available</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getMatchScoreColor(match.match_score)}`}>
                          {Math.round(match.match_score * 100)}%
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {getMatchScoreLabel(match.match_score)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Match Breakdown */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <div className="text-xs text-muted-foreground">Skills</div>
                        <Progress value={match.skill_score * 100} className="h-2" />
                        <div className="text-xs font-medium">{Math.round(match.skill_score * 100)}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Location</div>
                        <Progress value={match.location_score * 100} className="h-2" />
                        <div className="text-xs font-medium">{Math.round(match.location_score * 100)}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Price</div>
                        <Progress value={match.price_score * 100} className="h-2" />
                        <div className="text-xs font-medium">{Math.round(match.price_score * 100)}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Rating</div>
                        <Progress value={match.reputation_score * 20} className="h-2" />
                        <div className="text-xs font-medium">{Math.round(match.reputation_score * 20)}%</div>
                      </div>
                    </div>

                    {/* Match Reasons */}
                    {match.match_reasons && match.match_reasons.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {match.match_reasons.map((reason, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Skills */}
                    {match.professional?.skills && (
                      <div>
                        <div className="text-sm font-medium mb-2">Skills</div>
                        <div className="flex flex-wrap gap-1">
                          {match.professional.skills.slice(0, 5).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {match.professional.skills.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{match.professional.skills.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        onClick={() => onMatchSelect?.(match)}
                        className="flex-1"
                      >
                        View Profile
                      </Button>
                      <Button size="sm" variant="outline">
                        Contact
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommendations">
          {recommendations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Recommendations</h3>
                <p className="text-muted-foreground">
                  Run smart matching to get AI-powered recommendations
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <Card key={index} className="hover-scale">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      {getPriorityIcon(rec.priority)}
                      <div>
                        <CardTitle className="text-lg">{rec.title}</CardTitle>
                        <CardDescription>{rec.description}</CardDescription>
                      </div>
                      <Badge variant={
                        rec.priority === 'high' ? 'destructive' :
                        rec.priority === 'medium' ? 'default' : 'secondary'
                      }>
                        {rec.priority} priority
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {rec.actions && rec.actions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {rec.actions.map((action, actionIndex) => (
                          <Button key={actionIndex} size="sm" variant="outline">
                            {action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};