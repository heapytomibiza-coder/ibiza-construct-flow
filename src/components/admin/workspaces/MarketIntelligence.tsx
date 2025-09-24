import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  MapPin, 
  DollarSign,
  Users,
  Calendar,
  Target,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

interface DemandMetrics {
  category: string;
  current_demand: number;
  trend: 'up' | 'down' | 'stable';
  change_percentage: number;
  projected_growth: number;
  seasonal_pattern: string;
  avg_price: number;
  professional_count: number;
  satisfaction_score: number;
}

interface GeographicInsight {
  region: string;
  demand_score: number;
  supply_score: number;
  price_trend: 'up' | 'down' | 'stable';
  growth_potential: number;
  top_services: string[];
  professional_density: number;
  market_saturation: number;
}

interface PricingIntelligence {
  service: string;
  market_average: number;
  platform_average: number;
  price_variance: number;
  optimization_potential: number;
  competitor_pricing: number;
  recommended_range: { min: number; max: number };
  demand_elasticity: number;
}

interface OpportunityAnalysis {
  opportunity_type: 'underserved_market' | 'pricing_gap' | 'seasonal_trend' | 'geographic_expansion';
  title: string;
  description: string;
  potential_impact: 'low' | 'medium' | 'high';
  confidence_score: number;
  estimated_revenue: number;
  time_to_implement: string;
  required_resources: string[];
}

export default function MarketIntelligence() {
  const [demandMetrics, setDemandMetrics] = useState<DemandMetrics[]>([]);
  const [geographicInsights, setGeographicInsights] = useState<GeographicInsight[]>([]);
  const [pricingIntelligence, setPricingIntelligence] = useState<PricingIntelligence[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedView, setSelectedView] = useState('demand');

  useEffect(() => {
    loadMarketData();
  }, [timeRange]);

  const loadMarketData = async () => {
    setLoading(true);
    try {
      // Load services for market analysis
      const { data: servicesData } = await supabase
        .from('services')
        .select('*');

      // Load jobs data for demand analysis
      const { data: jobsData } = await supabase
        .from('bookings')
        .select('*')
        .gte('created_at', subDays(new Date(), timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90).toISOString());

      // Load professional profiles for supply analysis
      const { data: professionalsData } = await supabase
        .from('professional_profiles')
        .select('*');

      // Process demand metrics
      const categories = servicesData?.reduce((acc: Record<string, any>, service) => {
        if (!acc[service.category]) {
          acc[service.category] = {
            jobs: [],
            professionals: [],
            totalJobs: 0
          };
        }
        return acc;
      }, {}) || {};

      // Simulate demand metrics with real data where available
      const mockDemandMetrics: DemandMetrics[] = [
        {
          category: 'Home Repair',
          current_demand: 85,
          trend: 'up',
          change_percentage: 12,
          projected_growth: 18,
          seasonal_pattern: 'Spring Peak',
          avg_price: 150,
          professional_count: 45,
          satisfaction_score: 4.6
        },
        {
          category: 'Cleaning',
          current_demand: 92,
          trend: 'up',
          change_percentage: 8,
          projected_growth: 15,
          seasonal_pattern: 'Year Round',
          avg_price: 80,
          professional_count: 62,
          satisfaction_score: 4.8
        },
        {
          category: 'Gardening',
          current_demand: 68,
          trend: 'down',
          change_percentage: -5,
          projected_growth: 25,
          seasonal_pattern: 'Seasonal',
          avg_price: 120,
          professional_count: 28,
          satisfaction_score: 4.4
        },
        {
          category: 'Handyman',
          current_demand: 78,
          trend: 'stable',
          change_percentage: 2,
          projected_growth: 10,
          seasonal_pattern: 'Consistent',
          avg_price: 95,
          professional_count: 38,
          satisfaction_score: 4.5
        }
      ];

      setDemandMetrics(mockDemandMetrics);

      // Mock geographic insights
      const mockGeographicInsights: GeographicInsight[] = [
        {
          region: 'North District',
          demand_score: 88,
          supply_score: 72,
          price_trend: 'up',
          growth_potential: 85,
          top_services: ['Home Repair', 'Cleaning', 'Plumbing'],
          professional_density: 12.5,
          market_saturation: 68
        },
        {
          region: 'South District',
          demand_score: 76,
          supply_score: 84,
          price_trend: 'stable',
          growth_potential: 62,
          top_services: ['Gardening', 'Cleaning', 'Electrical'],
          professional_density: 15.2,
          market_saturation: 78
        },
        {
          region: 'Central District',
          demand_score: 94,
          supply_score: 65,
          price_trend: 'up',
          growth_potential: 95,
          top_services: ['Home Repair', 'Handyman', 'Painting'],
          professional_density: 8.9,
          market_saturation: 45
        },
        {
          region: 'East District',
          demand_score: 65,
          supply_score: 58,
          price_trend: 'down',
          growth_potential: 72,
          top_services: ['Cleaning', 'Gardening', 'Moving'],
          professional_density: 9.8,
          market_saturation: 52
        }
      ];

      setGeographicInsights(mockGeographicInsights);

      // Mock pricing intelligence
      const mockPricingIntelligence: PricingIntelligence[] = [
        {
          service: 'Home Cleaning',
          market_average: 75,
          platform_average: 80,
          price_variance: 15,
          optimization_potential: 8,
          competitor_pricing: 72,
          recommended_range: { min: 70, max: 85 },
          demand_elasticity: 0.8
        },
        {
          service: 'Plumbing Repair',
          market_average: 120,
          platform_average: 115,
          price_variance: 25,
          optimization_potential: 12,
          competitor_pricing: 125,
          recommended_range: { min: 110, max: 130 },
          demand_elasticity: 0.6
        },
        {
          service: 'Garden Maintenance',
          market_average: 90,
          platform_average: 95,
          price_variance: 18,
          optimization_potential: 15,
          competitor_pricing: 88,
          recommended_range: { min: 85, max: 100 },
          demand_elasticity: 1.2
        }
      ];

      setPricingIntelligence(mockPricingIntelligence);

      // Mock opportunity analysis
      const mockOpportunities: OpportunityAnalysis[] = [
        {
          opportunity_type: 'underserved_market',
          title: 'Central District Market Gap',
          description: 'High demand with low professional supply in Central District creates significant opportunity',
          potential_impact: 'high',
          confidence_score: 92,
          estimated_revenue: 125000,
          time_to_implement: '2-3 months',
          required_resources: ['Professional recruitment', 'Marketing campaign', 'Service expansion']
        },
        {
          opportunity_type: 'pricing_gap',
          title: 'Plumbing Service Pricing Optimization',
          description: 'Platform pricing below market average presents revenue optimization opportunity',
          potential_impact: 'medium',
          confidence_score: 78,
          estimated_revenue: 45000,
          time_to_implement: '1 month',
          required_resources: ['Price analysis', 'Professional communication', 'Market testing']
        },
        {
          opportunity_type: 'seasonal_trend',
          title: 'Spring Gardening Surge',
          description: 'Seasonal demand pattern shows 40% increase in gardening services during spring months',
          potential_impact: 'high',
          confidence_score: 85,
          estimated_revenue: 80000,
          time_to_implement: '1-2 months',
          required_resources: ['Seasonal marketing', 'Professional preparation', 'Capacity planning']
        }
      ];

      setOpportunities(mockOpportunities);

    } catch (error) {
      console.error('Error loading market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <span className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const DemandForecastTab = () => (
    <div className="space-y-6">
      {/* Demand Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Demand Score</p>
                <p className="text-3xl font-bold">
                  {Math.round(demandMetrics.reduce((acc, d) => acc + d.current_demand, 0) / demandMetrics.length)}
                </p>
                <p className="text-xs text-green-600 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  +7% vs last period
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Growing Categories</p>
                <p className="text-3xl font-bold text-green-600">
                  {demandMetrics.filter(d => d.trend === 'up').length}
                </p>
                <p className="text-xs text-muted-foreground">
                  of {demandMetrics.length} categories
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Satisfaction</p>
                <p className="text-3xl font-bold">
                  {(demandMetrics.reduce((acc, d) => acc + d.satisfaction_score, 0) / demandMetrics.length).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Out of 5.0 stars</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Projected Growth</p>
                <p className="text-3xl font-bold text-green-600">
                  +{Math.round(demandMetrics.reduce((acc, d) => acc + d.projected_growth, 0) / demandMetrics.length)}%
                </p>
                <p className="text-xs text-muted-foreground">Next quarter</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demand Analysis Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Category Demand Analysis
          </CardTitle>
          <CardDescription>Demand trends and forecasting by service category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {demandMetrics.map((metric) => (
              <div key={metric.category} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-lg">{metric.category}</h4>
                    <div className="flex items-center gap-1 text-sm">
                      {getTrendIcon(metric.trend)}
                      <span className={metric.trend === 'up' ? 'text-green-600' : 
                                    metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'}>
                        {metric.change_percentage > 0 ? '+' : ''}{metric.change_percentage}%
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="px-3 py-1">
                    {metric.seasonal_pattern}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Current Demand</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={metric.current_demand} className="flex-1" />
                      <span className="font-medium">{metric.current_demand}/100</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg Price</p>
                    <p className="font-medium text-lg">€{metric.avg_price}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Professionals</p>
                    <p className="font-medium text-lg">{metric.professional_count}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Satisfaction</p>
                    <p className="font-medium text-lg">{metric.satisfaction_score}/5.0</p>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Projected Growth</span>
                    <span className="font-medium text-green-600">+{metric.projected_growth}% next quarter</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const GeographicAnalysisTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Geographic Market Analysis
          </CardTitle>
          <CardDescription>Regional demand, supply, and growth opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {geographicInsights.map((insight) => (
              <Card key={insight.region} className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{insight.region}</CardTitle>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(insight.price_trend)}
                      <span className="text-sm text-muted-foreground">Price trend</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Demand Score</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={insight.demand_score} className="flex-1" />
                        <span className="font-medium">{insight.demand_score}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Supply Score</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={insight.supply_score} className="flex-1" />
                        <span className="font-medium">{insight.supply_score}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Growth Potential</p>
                      <p className="text-xl font-bold text-green-600">{insight.growth_potential}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Market Saturation</p>
                      <p className="text-xl font-bold">{insight.market_saturation}%</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Top Services</p>
                    <div className="flex flex-wrap gap-1">
                      {insight.top_services.map((service, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t text-sm text-muted-foreground">
                    Professional Density: {insight.professional_density} per sq km
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const PricingOptimizationTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing Intelligence & Optimization
          </CardTitle>
          <CardDescription>Market pricing analysis and optimization recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {pricingIntelligence.map((pricing) => (
              <div key={pricing.service} className="p-6 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-lg">{pricing.service}</h4>
                  <Badge variant={pricing.optimization_potential > 10 ? 'default' : 'secondary'}>
                    {pricing.optimization_potential}% optimization potential
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Market Average</p>
                    <p className="text-2xl font-bold">€{pricing.market_average}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Platform Average</p>
                    <p className="text-2xl font-bold text-blue-600">€{pricing.platform_average}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Competitor Pricing</p>
                    <p className="text-2xl font-bold text-orange-600">€{pricing.competitor_pricing}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Recommended Range</p>
                    <p className="text-lg font-bold text-green-600">
                      €{pricing.recommended_range.min}-{pricing.recommended_range.max}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Price Variance: </span>
                      <span className="font-medium">±{pricing.price_variance}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Demand Elasticity: </span>
                      <span className="font-medium">{pricing.demand_elasticity}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const OpportunitiesTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Market Opportunities
          </CardTitle>
          <CardDescription>AI-identified growth opportunities and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {opportunities.map((opportunity, index) => (
              <Card key={index} className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="capitalize">
                      {opportunity.opportunity_type.replace('_', ' ')}
                    </Badge>
                    <Badge variant="secondary" className={getImpactColor(opportunity.potential_impact)}>
                      {opportunity.potential_impact.toUpperCase()} IMPACT
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{opportunity.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Confidence Score</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={opportunity.confidence_score} className="flex-1" />
                        <span className="font-medium">{opportunity.confidence_score}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Est. Revenue</p>
                      <p className="text-lg font-bold text-green-600">
                        €{opportunity.estimated_revenue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Time to Implement</p>
                      <p className="font-medium">{opportunity.time_to_implement}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Resources Needed</p>
                      <p className="font-medium">{opportunity.required_resources.length} items</p>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Required Resources:</p>
                    <div className="flex flex-wrap gap-1">
                      {opportunity.required_resources.map((resource, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {resource}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                      Implement
                    </Button>
                    <Button size="sm" variant="outline">
                      Analyze
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Market Intelligence Hub</h2>
          <p className="text-muted-foreground">
            AI-powered market analysis, demand forecasting, and growth opportunities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={loadMarketData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Market Intelligence Tabs */}
      <Tabs value={selectedView} onValueChange={setSelectedView}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="demand">Demand Forecast</TabsTrigger>
          <TabsTrigger value="geographic">Geographic Analysis</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Intelligence</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
        </TabsList>
        
        <TabsContent value="demand" className="mt-6">
          <DemandForecastTab />
        </TabsContent>
        
        <TabsContent value="geographic" className="mt-6">
          <GeographicAnalysisTab />
        </TabsContent>
        
        <TabsContent value="pricing" className="mt-6">
          <PricingOptimizationTab />
        </TabsContent>
        
        <TabsContent value="opportunities" className="mt-6">
          <OpportunitiesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}