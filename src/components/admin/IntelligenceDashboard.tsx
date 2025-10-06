import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, TrendingUp, Users, DollarSign, 
  Activity, Brain, Target, Shield 
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function IntelligenceDashboard() {
  // Fraud Detection
  const { data: fraudPatterns } = useQuery({
    queryKey: ['fraud-patterns'],
    queryFn: async () => {
      const { data } = await supabase
        .from('fraud_patterns')
        .select('*')
        .eq('is_active', true)
        .order('severity', { ascending: false })
        .limit(10);
      return data || [];
    }
  });

  // Professional Scores
  const { data: topProfessionals } = useQuery({
    queryKey: ['top-professionals'],
    queryFn: async () => {
      const { data } = await supabase
        .from('professional_scores')
        .select('*, profiles(full_name)')
        .order('overall_score', { ascending: false })
        .limit(10);
      return data || [];
    }
  });

  // Revenue Forecasts
  const { data: forecasts } = useQuery({
    queryKey: ['revenue-forecasts'],
    queryFn: async () => {
      const { data } = await supabase
        .from('revenue_forecasts')
        .select('*')
        .order('period_start', { ascending: false })
        .limit(12);
      return data || [];
    }
  });

  // Churn Predictions
  const { data: churnRisk } = useQuery({
    queryKey: ['churn-predictions'],
    queryFn: async () => {
      const { data } = await supabase
        .from('churn_predictions')
        .select('*, profiles(full_name)')
        .gte('churn_probability', 50)
        .order('churn_probability', { ascending: false })
        .limit(20);
      return data || [];
    }
  });

  const fraudStats = {
    critical: fraudPatterns?.filter((f: any) => f.severity === 'critical').length || 0,
    high: fraudPatterns?.filter((f: any) => f.severity === 'high').length || 0,
    medium: fraudPatterns?.filter((f: any) => f.severity === 'medium').length || 0,
    low: fraudPatterns?.filter((f: any) => f.severity === 'low').length || 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Intelligence Dashboard</h2>
        <p className="text-muted-foreground">AI-powered insights and predictive analytics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fraud Alerts</CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fraudPatterns?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {fraudStats.critical} critical patterns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Churn Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{churnRisk?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Users at risk (≥50%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topProfessionals?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              High-scoring professionals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue Forecast</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${forecasts?.[0]?.predicted_revenue?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Next period estimate
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="fraud" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="fraud">Fraud Detection</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
          <TabsTrigger value="churn">Churn Risk</TabsTrigger>
        </TabsList>

        <TabsContent value="fraud" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fraud Patterns Detected</CardTitle>
              <CardDescription>Real-time fraud detection and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {fraudPatterns?.map((pattern: any) => (
                  <div key={pattern.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className={`h-4 w-4 ${
                        pattern.severity === 'critical' ? 'text-red-500' :
                        pattern.severity === 'high' ? 'text-orange-500' :
                        pattern.severity === 'medium' ? 'text-yellow-500' :
                        'text-gray-500'
                      }`} />
                      <div>
                        <p className="font-medium capitalize">{pattern.pattern_type.replace(/_/g, ' ')}</p>
                        <p className="text-sm text-muted-foreground">
                          Detected {pattern.detection_count} times
                        </p>
                      </div>
                    </div>
                    <Badge variant={
                      pattern.severity === 'critical' ? 'destructive' :
                      pattern.severity === 'high' ? 'default' : 'secondary'
                    }>
                      {pattern.severity}
                    </Badge>
                  </div>
                ))}
                {fraudPatterns?.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">
                    No active fraud patterns
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Professionals</CardTitle>
              <CardDescription>Ranked by overall performance score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topProfessionals?.map((prof: any, idx: number) => (
                  <div key={prof.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="font-bold text-lg text-muted-foreground">#{idx + 1}</div>
                      <div>
                        <p className="font-medium">{prof.profiles?.full_name || 'Unknown'}</p>
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <span>Quality: {prof.quality_score?.toFixed(1)}</span>
                          <span>Reliability: {prof.reliability_score?.toFixed(1)}</span>
                          <span>Communication: {prof.communication_score?.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{prof.overall_score?.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">Overall Score</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Forecasting</CardTitle>
              <CardDescription>Predicted vs actual revenue trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={forecasts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="period_start" 
                    tickFormatter={(val) => new Date(val).toLocaleDateString()}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="predicted_revenue" 
                    stroke="#8884d8" 
                    name="Predicted"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="actual_revenue" 
                    stroke="#82ca9d" 
                    name="Actual"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="churn" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Churn Risk Analysis</CardTitle>
              <CardDescription>Users at high risk of churning</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {churnRisk?.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{user.profiles?.full_name || 'Unknown User'}</p>
                      <div className="flex gap-2 mt-1">
                        {user.risk_factors?.map((factor: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-orange-500">
                        {user.churn_probability}%
                      </p>
                      <p className="text-xs text-muted-foreground">Churn Risk</p>
                    </div>
                  </div>
                ))}
                {churnRisk?.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">
                    No high-risk users detected
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
