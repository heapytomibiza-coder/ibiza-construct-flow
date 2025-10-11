import { useState } from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BasePricingTable } from '@/components/admin/pricing/BasePricingTable';
import { AdderManagement } from '@/components/admin/pricing/AdderManagement';
import { SeasonalAdjustments } from '@/components/admin/pricing/SeasonalAdjustments';
import { PricingAuditLog } from '@/components/admin/pricing/PricingAuditLog';
import { PricingInsights } from '@/components/admin/pricing/PricingInsights';
import { Settings, DollarSign, Calendar, History, TrendingUp } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function PricingManager() {
  const [activeTab, setActiveTab] = useState('base-pricing');

  return (
    <AdminGuard>
      <Helmet>
        <title>Pricing Manager - Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="container mx-auto py-6 px-4">
            <div className="flex items-center gap-3">
              <Settings className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Calculator Pricing Manager</h1>
                <p className="text-muted-foreground mt-1">
                  Manage pricing, adders, and seasonal adjustments
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto py-8 px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="base-pricing" className="gap-2">
                <DollarSign className="h-4 w-4" />
                Base Pricing
              </TabsTrigger>
              <TabsTrigger value="adders" className="gap-2">
                <Settings className="h-4 w-4" />
                Adders
              </TabsTrigger>
              <TabsTrigger value="seasonal" className="gap-2">
                <Calendar className="h-4 w-4" />
                Seasonal
              </TabsTrigger>
              <TabsTrigger value="insights" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Insights
              </TabsTrigger>
              <TabsTrigger value="audit" className="gap-2">
                <History className="h-4 w-4" />
                Audit Log
              </TabsTrigger>
            </TabsList>

            <TabsContent value="base-pricing">
              <Card>
                <CardHeader>
                  <CardTitle>Base Pricing & Multipliers</CardTitle>
                  <CardDescription>
                    Manage base rates, quality tier multipliers, and location factors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BasePricingTable />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="adders">
              <Card>
                <CardHeader>
                  <CardTitle>Adder Management</CardTitle>
                  <CardDescription>
                    Create, edit, and manage calculator adders and options
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AdderManagement />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seasonal">
              <Card>
                <CardHeader>
                  <CardTitle>Seasonal Adjustments</CardTitle>
                  <CardDescription>
                    Configure seasonal pricing multipliers and date ranges
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SeasonalAdjustments />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing Accuracy & Real Data</CardTitle>
                  <CardDescription>
                    Track actual vs estimated costs to improve calculator accuracy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PricingInsights />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audit">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing Audit Log</CardTitle>
                  <CardDescription>
                    View history of all pricing changes and updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PricingAuditLog />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminGuard>
  );
}
