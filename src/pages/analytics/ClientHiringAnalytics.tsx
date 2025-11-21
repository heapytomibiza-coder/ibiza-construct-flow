import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BackButton } from '@/components/navigation/BackButton';
import { TrendingUp, Users, Award, Clock } from 'lucide-react';

export default function ClientHiringAnalytics() {
  const { user } = useAuth();

  // Placeholder data - will be connected to real data
  const metrics = {
    timeToHire: '5.2 days',
    successRate: '87%',
    professionalRetention: '92%',
    avgRating: '4.6'
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <BackButton fallbackPath="/dashboard/client/analytics" />
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-green-600" />
            Hiring Performance
          </h1>
          <p className="text-muted-foreground mt-1">
            Analyze your hiring efficiency and professional relationships
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Time to Hire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{metrics.timeToHire}</div>
              <Clock className="h-8 w-8 text-primary opacity-50" />
            </div>
            <p className="text-xs text-green-600 mt-2">↓ 15% faster than average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Hiring Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-green-600">{metrics.successRate}</div>
              <Award className="h-8 w-8 text-green-600 opacity-50" />
            </div>
            <p className="text-xs text-green-600 mt-2">↑ 12% above platform avg</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Professional Retention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-blue-600">{metrics.professionalRetention}</div>
              <Users className="h-8 w-8 text-blue-600 opacity-50" />
            </div>
            <p className="text-xs text-blue-600 mt-2">High repeat collaboration rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Rating Given
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-yellow-600">{metrics.avgRating}</div>
              <Award className="h-8 w-8 text-yellow-600 opacity-50" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Based on completed jobs</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hiring Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Jobs Posted</span>
                  <span className="font-semibold">100%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '100%' }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Received Applications</span>
                  <span className="font-semibold">78%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '78%' }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Interviewed</span>
                  <span className="font-semibold">45%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-green-600" style={{ width: '45%' }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Hired</span>
                  <span className="font-semibold">32%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600" style={{ width: '32%' }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quality Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
                <span className="text-sm font-medium">On-Time Completion Rate</span>
                <span className="text-lg font-bold text-green-600">94%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
                <span className="text-sm font-medium">Budget Adherence</span>
                <span className="text-lg font-bold text-blue-600">89%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
                <span className="text-sm font-medium">Mutual Satisfaction Score</span>
                <span className="text-lg font-bold text-purple-600">4.7/5</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
                <span className="text-sm font-medium">Communication Rating</span>
                <span className="text-lg font-bold text-yellow-600">4.8/5</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <Award className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">Strong Performance</p>
                <p className="text-sm text-green-700 dark:text-green-300">Your hiring success rate is above platform average. Keep up the detailed job descriptions!</p>
              </div>
            </div>
            <div className="flex gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">Quick Response</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">Your average response time to applications is 18% faster than platform average.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
