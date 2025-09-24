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
  DollarSign, 
  Users, 
  MapPin, 
  Clock,
  Star,
  Target,
  ChartBar,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

interface ProfessionalMetrics {
  total_professionals: number;
  active_professionals: number;
  new_signups_this_month: number;
  average_completion_rate: number;
  total_earnings: number;
  average_hourly_rate: number;
  top_performing_professionals: Array<{
    id: string;
    name: string;
    earnings: number;
    jobs_completed: number;
    rating: number;
  }>;
}

interface GeographicData {
  region: string;
  professional_count: number;
  average_rate: number;
  demand_score: number;
}

interface EarningsData {
  period: string;
  total_earnings: number;
  professional_count: number;
  average_per_professional: number;
}

export default function ProfessionalAnalytics() {
  const [metrics, setMetrics] = useState<ProfessionalMetrics | null>(null);
  const [geographicData, setGeographicData] = useState<GeographicData[]>([]);
  const [earningsData, setEarningsData] = useState<EarningsData[]>([]);
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('overview');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Load professional metrics
      const { data: professionals } = await supabase
        .from('professional_profiles')
        .select(`
          *,
          profiles!user_id(full_name, created_at)
        `);

      // Calculate metrics
      const now = new Date();
      const monthStart = startOfMonth(now);
      const timeRangeStart = timeRange === '7d' ? subDays(now, 7) : 
                            timeRange === '30d' ? subDays(now, 30) : 
                            subDays(now, 90);

      const newSignups = professionals?.filter(p => 
        new Date(p.profiles?.created_at || '') >= monthStart
      ).length || 0;

      const totalProfessionals = professionals?.length || 0;
      const activeProfessionals = professionals?.filter(p => 
        p.verification_status === 'verified'
      ).length || 0;

      const avgCompletion = professionals?.reduce((acc, p) => {
        let completion = 0;
        if (p.bio) completion += 15;
        if (p.experience_years) completion += 10;
        if (p.hourly_rate) completion += 10;
        if (p.skills && Array.isArray(p.skills) && p.skills.length > 0) completion += 20;
        if (p.languages && Array.isArray(p.languages) && p.languages.length > 0) completion += 10;
        if (p.zones && Array.isArray(p.zones) && p.zones.length > 0) completion += 15;
        if (p.portfolio_images && Array.isArray(p.portfolio_images) && p.portfolio_images.length > 0) completion += 20;
        return acc + Math.min(completion, 100);
      }, 0) / Math.max(totalProfessionals, 1) || 0;

      const avgHourlyRate = professionals?.reduce((acc, p) => 
        acc + (p.hourly_rate || 0), 0
      ) / Math.max(professionals?.filter(p => p.hourly_rate).length || 1, 1);

      setMetrics({
        total_professionals: totalProfessionals,
        active_professionals: activeProfessionals,
        new_signups_this_month: newSignups,
        average_completion_rate: Math.round(avgCompletion),
        total_earnings: 0, // TODO: Calculate from contracts table
        average_hourly_rate: Math.round(avgHourlyRate * 100) / 100,
        top_performing_professionals: [] // TODO: Calculate from performance data
      });

      // Mock geographic data (replace with real data)
      setGeographicData([
        { region: 'North Region', professional_count: 45, average_rate: 35, demand_score: 85 },
        { region: 'South Region', professional_count: 32, average_rate: 28, demand_score: 72 },
        { region: 'Central Region', professional_count: 58, average_rate: 42, demand_score: 91 },
        { region: 'East Region', professional_count: 23, average_rate: 30, demand_score: 68 }
      ]);

      // Mock earnings data (replace with real data)
      const earningsData = [];
      for (let i = 29; i >= 0; i--) {
        const date = subDays(now, i);
        earningsData.push({
          period: format(date, 'MMM dd'),
          total_earnings: Math.floor(Math.random() * 5000) + 2000,
          professional_count: Math.floor(Math.random() * 20) + 30,
          average_per_professional: 0
        });
      }
      earningsData.forEach(d => {
        d.average_per_professional = Math.round(d.total_earnings / d.professional_count);
      });
      setEarningsData(earningsData);

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const MetricsOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Professionals</p>
                <p className="text-3xl font-bold">{metrics?.total_professionals || 0}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{metrics?.new_signups_this_month || 0} this month
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Professionals</p>
                <p className="text-3xl font-bold">{metrics?.active_professionals || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round(((metrics?.active_professionals || 0) / Math.max(metrics?.total_professionals || 1, 1)) * 100)}% of total
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Profile Completion</p>
                <p className="text-3xl font-bold">{metrics?.average_completion_rate || 0}%</p>
                <Progress value={metrics?.average_completion_rate || 0} className="mt-2" />
              </div>
              <ChartBar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Hourly Rate</p>
                <p className="text-3xl font-bold">€{metrics?.average_hourly_rate || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Per hour across all professionals
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Geographic Distribution
          </CardTitle>
          <CardDescription>Professional distribution and performance by region</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {geographicData.map((region) => (
              <div key={region.region} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{region.region}</h4>
                    <Badge variant="outline">{region.professional_count} professionals</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>Average Rate: €{region.average_rate}/hr</div>
                    <div>Demand Score: {region.demand_score}/100</div>
                  </div>
                </div>
                <div className="ml-4">
                  <Progress value={region.demand_score} className="w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const EarningsAnalytics = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Earnings Tracking
          </CardTitle>
          <CardDescription>Professional earnings and payout analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Total Platform Earnings</p>
                <p className="text-2xl font-bold">€{earningsData.reduce((acc, d) => acc + d.total_earnings, 0).toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% vs last period
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Avg per Professional</p>
                <p className="text-2xl font-bold">€{Math.round(earningsData.reduce((acc, d) => acc + d.average_per_professional, 0) / earningsData.length)}</p>
                <p className="text-xs text-muted-foreground mt-1">Per professional per day</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Pending Payouts</p>
                <p className="text-2xl font-bold">€4,250</p>
                <p className="text-xs text-orange-600 mt-1">12 professionals awaiting payout</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Recent earnings trend (last 30 days)</p>
              <div className="flex items-end gap-1 h-20">
                {earningsData.slice(-14).map((data, index) => (
                  <div
                    key={index}
                    className="bg-primary flex-1 rounded-t"
                    style={{ height: `${(data.total_earnings / 5000) * 100}%` }}
                    title={`${data.period}: €${data.total_earnings}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const PerformanceReports = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Performance Analytics
          </CardTitle>
          <CardDescription>Professional performance metrics and insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Performance Distribution */}
            <div>
              <h4 className="font-medium mb-4">Performance Distribution</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Completion Rate Distribution</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">90-100%</span>
                      <div className="flex items-center gap-2">
                        <Progress value={75} className="w-20" />
                        <span className="text-sm">45 professionals</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">70-89%</span>
                      <div className="flex items-center gap-2">
                        <Progress value={60} className="w-20" />
                        <span className="text-sm">32 professionals</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">50-69%</span>
                      <div className="flex items-center gap-2">
                        <Progress value={40} className="w-20" />
                        <span className="text-sm">18 professionals</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Below 50%</span>
                      <div className="flex items-center gap-2">
                        <Progress value={20} className="w-20" />
                        <span className="text-sm">8 professionals</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Rating Distribution</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        4.5+ Stars
                      </span>
                      <div className="flex items-center gap-2">
                        <Progress value={85} className="w-20" />
                        <span className="text-sm">52 professionals</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">4.0-4.4 Stars</span>
                      <div className="flex items-center gap-2">
                        <Progress value={70} className="w-20" />
                        <span className="text-sm">35 professionals</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">3.5-3.9 Stars</span>
                      <div className="flex items-center gap-2">
                        <Progress value={30} className="w-20" />
                        <span className="text-sm">12 professionals</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Below 3.5</span>
                      <div className="flex items-center gap-2">
                        <Progress value={10} className="w-20" />
                        <span className="text-sm">4 professionals</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
          <h2 className="text-2xl font-bold">Professional Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive analytics for professional performance and earnings
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
          <Button variant="outline" size="sm" onClick={loadAnalytics} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={selectedView} onValueChange={setSelectedView}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <MetricsOverview />
        </TabsContent>
        
        <TabsContent value="earnings" className="mt-6">
          <EarningsAnalytics />
        </TabsContent>
        
        <TabsContent value="performance" className="mt-6">
          <PerformanceReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}