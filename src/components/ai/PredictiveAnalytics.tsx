import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  Users, 
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Brain,
  Target,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DemandForecast {
  service_category: string;
  current_demand: number;
  predicted_demand: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  peak_hours: string[];
  seasonal_factor: number;
  next_week_prediction: number;
}

interface PricingRecommendation {
  service_id: string;
  service_name: string;
  current_price: number;
  recommended_price: number;
  price_change_percentage: number;
  market_position: 'below' | 'at' | 'above';
  competitor_avg: number;
  demand_impact: number;
  revenue_impact: number;
}

interface RiskPrediction {
  risk_type: string;
  probability: number;
  impact_level: 'low' | 'medium' | 'high' | 'critical';
  affected_services: string[];
  mitigation_suggestions: string[];
  timeline: string;
}

interface PerformanceMetrics {
  metric_name: string;
  current_value: number;
  predicted_value: number;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
}

export const PredictiveAnalytics = () => {
  const [demandForecasts, setDemandForecasts] = useState<DemandForecast[]>([]);
  const [pricingRecommendations, setPricingRecommendations] = useState<PricingRecommendation[]>([]);
  const [riskPredictions, setRiskPredictions] = useState<RiskPrediction[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    loadPredictiveData();
  }, []);

  const loadPredictiveData = async () => {
    try {
      // Mock predictive data - in real implementation, this would come from AI models
      const mockDemandForecasts: DemandForecast[] = [
        {
          service_category: 'Plumbing',
          current_demand: 85,
          predicted_demand: 112,
          trend: 'increasing',
          confidence: 87,
          peak_hours: ['09:00-11:00', '14:00-16:00'],
          seasonal_factor: 1.3,
          next_week_prediction: 95
        },
        {
          service_category: 'Electrical',
          current_demand: 67,
          predicted_demand: 72,
          trend: 'increasing',
          confidence: 79,
          peak_hours: ['10:00-12:00', '15:00-17:00'],
          seasonal_factor: 1.1,
          next_week_prediction: 71
        },
        {
          service_category: 'HVAC',
          current_demand: 92,
          predicted_demand: 78,
          trend: 'decreasing',
          confidence: 83,
          peak_hours: ['08:00-10:00', '16:00-18:00'],
          seasonal_factor: 0.85,
          next_week_prediction: 85
        },
        {
          service_category: 'Cleaning',
          current_demand: 156,
          predicted_demand: 164,
          trend: 'stable',
          confidence: 91,
          peak_hours: ['09:00-12:00', '13:00-16:00'],
          seasonal_factor: 1.05,
          next_week_prediction: 158
        }
      ];

      const mockPricingRecommendations: PricingRecommendation[] = [
        {
          service_id: '1',
          service_name: 'Emergency Plumbing Repair',
          current_price: 125,
          recommended_price: 145,
          price_change_percentage: 16,
          market_position: 'below',
          competitor_avg: 152,
          demand_impact: 8.5,
          revenue_impact: 23.4
        },
        {
          service_id: '2',
          service_name: 'Basic House Cleaning',
          current_price: 85,
          recommended_price: 78,
          price_change_percentage: -8.2,
          market_position: 'above',
          competitor_avg: 75,
          demand_impact: 12.3,
          revenue_impact: 5.7
        },
        {
          service_id: '3',
          service_name: 'Electrical Panel Upgrade',
          current_price: 850,
          recommended_price: 920,
          price_change_percentage: 8.2,
          market_position: 'at',
          competitor_avg: 925,
          demand_impact: 4.2,
          revenue_impact: 18.9
        }
      ];

      const mockRiskPredictions: RiskPrediction[] = [
        {
          risk_type: 'Professional Shortage',
          probability: 78,
          impact_level: 'high',
          affected_services: ['Plumbing', 'Electrical'],
          mitigation_suggestions: [
            'Recruit additional professionals in high-demand areas',
            'Implement retention bonuses',
            'Expand service radius for emergency calls'
          ],
          timeline: 'Next 2 weeks'
        },
        {
          risk_type: 'Price Competition',
          probability: 65,
          impact_level: 'medium',
          affected_services: ['Cleaning', 'General Maintenance'],
          mitigation_suggestions: [
            'Enhance service quality differentiation',
            'Implement loyalty programs',
            'Focus on premium service offerings'
          ],
          timeline: 'Next month'
        }
      ];

      const mockPerformanceMetrics: PerformanceMetrics[] = [
        {
          metric_name: 'Customer Satisfaction',
          current_value: 4.6,
          predicted_value: 4.8,
          trend: 'up',
          confidence: 89
        },
        {
          metric_name: 'Average Response Time (hours)',
          current_value: 2.4,
          predicted_value: 1.8,
          trend: 'up',
          confidence: 82
        },
        {
          metric_name: 'Professional Utilization (%)',
          current_value: 78,
          predicted_value: 85,
          trend: 'up',
          confidence: 76
        },
        {
          metric_name: 'Revenue per Job ($)',
          current_value: 287,
          predicted_value: 312,
          trend: 'up',
          confidence: 84
        }
      ];

      setDemandForecasts(mockDemandForecasts);
      setPricingRecommendations(mockPricingRecommendations);
      setRiskPredictions(mockRiskPredictions);
      setPerformanceMetrics(mockPerformanceMetrics);
      setLoading(false);
    } catch (error) {
      console.error('Error loading predictive data:', error);
      toast.error('Failed to load predictive analytics');
      setLoading(false);
    }
  };

  const runNewAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      // Simulate AI analysis process
      await new Promise(resolve => setTimeout(resolve, 3000));
      await loadPredictiveData();
      toast.success('Predictive analysis completed');
    } catch (error) {
      console.error('Error running analysis:', error);
      toast.error('Failed to run analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'decreasing':
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <BarChart3 className="w-4 h-4 text-blue-500" />;
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge variant="default" className="bg-red-500">High</Badge>;
      case 'medium':
        return <Badge variant="default" className="bg-orange-500">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center">Loading Predictive Analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Predictive Analytics</h2>
          <p className="text-muted-foreground">AI-powered forecasting and business intelligence</p>
        </div>
        <div className="flex items-center space-x-2">
          {isAnalyzing && (
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4 animate-pulse text-primary" />
              <span className="text-sm text-muted-foreground">Analyzing...</span>
            </div>
          )}
          <Button onClick={runNewAnalysis} disabled={isAnalyzing}>
            <Zap className="w-4 h-4 mr-2" />
            Run Analysis
          </Button>
        </div>
      </div>

      <Tabs defaultValue="demand" className="space-y-4">
        <TabsList>
          <TabsTrigger value="demand">Demand Forecasting</TabsTrigger>
          <TabsTrigger value="pricing">Smart Pricing</TabsTrigger>
          <TabsTrigger value="risks">Risk Prediction</TabsTrigger>
          <TabsTrigger value="performance">Performance Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="demand" className="space-y-4">
          <div className="grid gap-4">
            {demandForecasts.map((forecast) => (
              <Card key={forecast.service_category}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{forecast.service_category}</h3>
                      <p className="text-sm text-muted-foreground">Demand forecasting analysis</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(forecast.trend)}
                      <span className="text-sm capitalize">{forecast.trend}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Demand</p>
                      <p className="text-2xl font-bold">{forecast.current_demand}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Predicted Demand</p>
                      <p className="text-2xl font-bold text-primary">{forecast.predicted_demand}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Confidence</p>
                      <div className="flex items-center space-x-2">
                        <Progress value={forecast.confidence} className="flex-1" />
                        <span className="text-sm font-medium">{forecast.confidence}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Peak Hours</p>
                      <p className="text-sm font-medium">{forecast.peak_hours.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Next Week</p>
                      <p className="text-lg font-bold">{forecast.next_week_prediction}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Seasonal Factor: <span className="font-medium">{forecast.seasonal_factor}x</span>
                    </p>
                    <Progress 
                      value={Math.min((forecast.predicted_demand / forecast.current_demand) * 50, 100)} 
                      className="h-2" 
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <div className="grid gap-4">
            {pricingRecommendations.map((rec) => (
              <Card key={rec.service_id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{rec.service_name}</h3>
                      <p className="text-sm text-muted-foreground">Pricing optimization recommendation</p>
                    </div>
                    <Badge variant={rec.price_change_percentage > 0 ? "default" : "secondary"}>
                      {rec.price_change_percentage > 0 ? '+' : ''}{rec.price_change_percentage.toFixed(1)}%
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Price</p>
                      <p className="text-2xl font-bold">${rec.current_price}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Recommended Price</p>
                      <p className="text-2xl font-bold text-primary">${rec.recommended_price}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Market Position</p>
                      <p className="text-sm font-medium capitalize">{rec.market_position} market avg</p>
                      <p className="text-xs text-muted-foreground">Avg: ${rec.competitor_avg}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Demand Impact</p>
                      <p className="text-lg font-bold">{rec.demand_impact > 0 ? '+' : ''}{rec.demand_impact}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Revenue Impact</p>
                      <p className="text-lg font-bold text-green-500">+{rec.revenue_impact}%</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <Button size="sm">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Apply Recommendation
                    </Button>
                    <Button size="sm" variant="outline">
                      <Target className="w-4 h-4 mr-1" />
                      A/B Test
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <div className="grid gap-4">
            {riskPredictions.map((risk, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{risk.risk_type}</h3>
                      <p className="text-sm text-muted-foreground">Timeline: {risk.timeline}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getRiskBadge(risk.impact_level)}
                      <div className="text-right">
                        <div className="text-2xl font-bold">{risk.probability}%</div>
                        <div className="text-xs text-muted-foreground">Probability</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <Progress value={risk.probability} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Affected Services:</p>
                      <div className="flex flex-wrap gap-1">
                        {risk.affected_services.map((service) => (
                          <Badge key={service} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Mitigation Suggestions:</p>
                      <ul className="text-xs space-y-1">
                        {risk.mitigation_suggestions.map((suggestion, idx) => (
                          <li key={idx} className="flex items-start">
                            <CheckCircle className="w-3 h-3 mr-1 text-green-500 mt-0.5" />
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {performanceMetrics.map((metric) => (
              <Card key={metric.metric_name}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{metric.metric_name}</h3>
                      <p className="text-sm text-muted-foreground">Performance forecast</p>
                    </div>
                    {getTrendIcon(metric.trend)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Current</p>
                      <p className="text-2xl font-bold">{metric.current_value}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Predicted</p>
                      <p className="text-2xl font-bold text-primary">{metric.predicted_value}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Confidence Level</p>
                    <div className="flex items-center space-x-2">
                      <Progress value={metric.confidence} className="flex-1" />
                      <span className="text-sm font-medium">{metric.confidence}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};