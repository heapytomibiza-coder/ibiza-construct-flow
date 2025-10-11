import { AdminGuard } from '@/components/admin/AdminGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UsageOverview } from '@/components/admin/analytics/UsageOverview';
import { ConversionFunnel } from '@/components/admin/analytics/ConversionFunnel';
import { PopularSelections } from '@/components/admin/analytics/PopularSelections';
import { RevenueProjections } from '@/components/admin/analytics/RevenueProjections';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function CalculatorAnalytics() {
  return (
    <AdminGuard>
      <Helmet>
        <title>Calculator Analytics - Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="container mx-auto py-6 px-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Calculator Analytics</h1>
                <p className="text-muted-foreground mt-1">
                  Track usage, conversions, and performance metrics
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto py-8 px-4 space-y-8">
          {/* Key Metrics */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Total Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">2,847</div>
                <p className="text-xs text-muted-foreground mt-1">
                  +12.5% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">68.3%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  +5.2% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  Job Conversions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">342</div>
                <p className="text-xs text-muted-foreground mt-1">
                  12% conversion rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  Avg Estimate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">€24,500</div>
                <p className="text-xs text-muted-foreground mt-1">
                  -2.1% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Usage Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Overview</CardTitle>
              <CardDescription>
                Calculator sessions over time by project type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UsageOverview />
            </CardContent>
          </Card>

          {/* Two Column Layout */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>
                  Step-by-step completion and drop-off rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ConversionFunnel />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Selections</CardTitle>
                <CardDescription>
                  Most selected options and configurations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PopularSelections />
              </CardContent>
            </Card>
          </div>

          {/* Revenue Projections */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Projections</CardTitle>
              <CardDescription>
                Estimated project values by tier and type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueProjections />
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminGuard>
  );
}
