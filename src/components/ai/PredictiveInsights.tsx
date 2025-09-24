import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, TrendingUp, AlertTriangle, Calendar, Target, Lightbulb, RefreshCw, Gem } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PredictiveInsight {
  id: string;
  insight_type: string;
  entity_type: string;
  entity_id: string;
  prediction_title: string;
  prediction_description: string;
  predicted_value: number;
  confidence_level: number;
  time_horizon: string;
  factors: string[];
  recommendations: any[];
  status: string;
  created_at: string;
  expires_at?: string;
}

interface AIRecommendation {
  id: string;
  user_id: string;
  recommendation_type: string;
  title: string;
  description: string;
  confidence_score: number;
  priority: string;
  data: any;
  status: string;
  created_at: string;
}

export const PredictiveInsights = () => {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPredictiveData();
  }, []);

  const loadPredictiveData = async () => {
    try {
      setRefreshing(true);

      // Load predictive insights
      const { data: insightsData, error: insightsError } = await supabase
        .from('predictive_insights')
        .select('*')
        .eq('status', 'active')
        .order('confidence_level', { ascending: false });

      if (insightsError) throw insightsError;

      // Load AI recommendations
      const { data: recommendationsData, error: recommendationsError } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('status', 'pending')
        .order('confidence_score', { ascending: false })
        .limit(20);

      if (recommendationsError) throw recommendationsError;

      setInsights((insightsData || []).map(insight => ({
        ...insight,
        factors: Array.isArray(insight.factors) ? insight.factors.map(String) : [],
        recommendations: Array.isArray(insight.recommendations) ? insight.recommendations : []
      })));

      setRecommendations((recommendationsData || []).map(rec => ({
        ...rec,
        data: typeof rec.data === 'object' ? rec.data : {}
      })));

    } catch (error) {
      console.error('Error loading predictive data:', error);
      toast({
        title: "Error loading insights",
        description: "Failed to load predictive insights and recommendations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateMockInsights = async () => {
    try {
      setRefreshing(true);
      
      // Generate mock predictive insights
      const mockInsights = [
        {
          insight_type: 'demand_forecast',
          entity_type: 'service_category',
          entity_id: 'plumbing',
          prediction_title: 'Plumbing Demand Surge Expected',
          prediction_description: 'Based on weather patterns and historical data, plumbing services demand will increase by 35% next week',
          predicted_value: 35,
          confidence_level: 87,
          time_horizon: '7_days',
          factors: ['Cold weather forecast', 'Historical winter patterns', 'Local construction activity'],
          recommendations: [
            { action: 'increase_professional_availability', priority: 'high' },
            { action: 'adjust_pricing', priority: 'medium' }
          ],
          status: 'active'
        },
        {
          insight_type: 'revenue_prediction',
          entity_type: 'platform',
          entity_id: null,
          prediction_title: 'Monthly Revenue Growth Forecast',
          prediction_description: 'Platform revenue expected to grow by 12% this month based on current booking trends',
          predicted_value: 12,
          confidence_level: 73,
          time_horizon: '30_days',
          factors: ['Increased user registrations', 'Higher average job values', 'Seasonal demand patterns'],
          recommendations: [
            { action: 'expand_marketing', priority: 'medium' },
            { action: 'optimize_conversion_funnel', priority: 'high' }
          ],
          status: 'active'
        },
        {
          insight_type: 'churn_prediction',
          entity_type: 'user_segment',
          entity_id: 'new_professionals',
          prediction_title: 'Professional Retention Risk',
          prediction_description: '15% of new professionals show early churn indicators within their first month',
          predicted_value: 15,
          confidence_level: 68,
          time_horizon: '30_days',
          factors: ['Low initial job acquisition', 'Incomplete profile setup', 'Limited platform engagement'],
          recommendations: [
            { action: 'improve_onboarding', priority: 'high' },
            { action: 'personalized_job_recommendations', priority: 'medium' }
          ],
          status: 'active'
        }
      ];

      // Insert mock insights
      for (const insight of mockInsights) {
        await supabase
          .from('predictive_insights')
          .insert([insight]);
      }

      // Generate mock recommendations
      const mockRecommendations = [
        {
          user_id: null,
          entity_type: 'platform',
          entity_id: null,
          recommendation_type: 'optimization',
          title: 'Optimize Peak Hour Pricing',
          description: 'Implement dynamic pricing during high-demand periods to maximize revenue',
          confidence_score: 0.89,
          priority: 'high',
          data: { estimated_revenue_increase: '18%', implementation_effort: 'medium' },
          status: 'pending'
        },
        {
          user_id: null,
          entity_type: 'service',
          entity_id: 'cleaning',
          recommendation_type: 'expansion',
          title: 'Expand Cleaning Services',
          description: 'High demand detected for specialized cleaning services in downtown area',
          confidence_score: 0.76,
          priority: 'medium',
          data: { market_opportunity: 'high', competition_level: 'low' },
          status: 'pending'
        }
      ];

      for (const rec of mockRecommendations) {
        await supabase
          .from('ai_recommendations')
          .insert([rec]);
      }

      await loadPredictiveData();
      
      toast({
        title: "Insights Generated",
        description: "New predictive insights and recommendations have been generated"
      });

    } catch (error) {
      console.error('Error generating insights:', error);
      toast({
        title: "Error generating insights",
        description: "Failed to generate predictive insights",
        variant: "destructive"
      });
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'demand_forecast': return <TrendingUp className="w-5 h-5" />;
      case 'revenue_prediction': return <Target className="w-5 h-5" />;
      case 'churn_prediction': return <AlertTriangle className="w-5 h-5" />;
      default: return <Gem className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Gem className="w-6 h-6" />
            Predictive Insights
          </h2>
          <p className="text-muted-foreground">AI-powered predictions and recommendations</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadPredictiveData} disabled={refreshing} size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={generateMockInsights} disabled={refreshing}>
            <Lightbulb className="w-4 h-4 mr-2" />
            Generate Insights
          </Button>
        </div>
      </div>

      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList>
          <TabsTrigger value="insights">Predictive Insights ({insights.length})</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations ({recommendations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="insights">
          {insights.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Gem className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Predictive Insights</h3>
                <p className="text-muted-foreground mb-4">
                  Generate AI-powered insights to forecast trends and opportunities
                </p>
                <Button onClick={generateMockInsights}>
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Generate Insights
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {insights.map((insight) => (
                <Card key={insight.id} className="hover-scale">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        {getInsightIcon(insight.insight_type)}
                        <div>
                          <CardTitle>{insight.prediction_title}</CardTitle>
                          <CardDescription>{insight.prediction_description}</CardDescription>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">{insight.insight_type}</Badge>
                            <Badge variant="secondary">{insight.time_horizon}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{insight.predicted_value}%</div>
                        <div className={`text-sm font-medium ${getConfidenceColor(insight.confidence_level)}`}>
                          {insight.confidence_level}% confidence
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Progress value={insight.confidence_level} className="w-full" />
                    
                    {insight.factors && insight.factors.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Key Factors</h4>
                        <div className="flex flex-wrap gap-2">
                          {insight.factors.map((factor, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {insight.recommendations && insight.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Recommended Actions</h4>
                        <div className="flex flex-wrap gap-2">
                          {insight.recommendations.map((rec, index) => (
                            <Badge key={index} variant={getPriorityColor(rec.priority)} className="text-xs">
                              {rec.action?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>Generated: {new Date(insight.created_at).toLocaleDateString()}</span>
                      {insight.expires_at && (
                        <span>Expires: {new Date(insight.expires_at).toLocaleDateString()}</span>
                      )}
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
                <Lightbulb className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No AI Recommendations</h3>
                <p className="text-muted-foreground">
                  AI recommendations will appear here based on data analysis
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <Card key={rec.id} className="hover-scale">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{rec.title}</CardTitle>
                        <CardDescription>{rec.description}</CardDescription>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{rec.recommendation_type}</Badge>
                          <Badge variant={getPriorityColor(rec.priority)}>
                            {rec.priority} priority
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getConfidenceColor(rec.confidence_score * 100)}`}>
                          {Math.round(rec.confidence_score * 100)}%
                        </div>
                        <div className="text-xs text-muted-foreground">confidence</div>
                      </div>
                    </div>
                  </CardHeader>
                  {rec.data && Object.keys(rec.data).length > 0 && (
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {Object.entries(rec.data).map(([key, value]) => (
                          <div key={key}>
                            <div className="text-muted-foreground">
                              {key.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </div>
                            <div className="font-medium">{String(value)}</div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm">
                          Implement
                        </Button>
                        <Button size="sm" variant="outline">
                          Learn More
                        </Button>
                        <Button size="sm" variant="ghost">
                          Dismiss
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};