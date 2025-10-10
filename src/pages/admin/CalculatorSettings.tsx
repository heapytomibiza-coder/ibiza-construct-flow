import { useState } from 'react';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Ruler, Award, Package, Plus, MapPin, Calculator } from 'lucide-react';
// Admin managers temporarily disabled until Supabase types regenerate
// import { SizePresetsManager } from '@/components/admin/calculator/SizePresetsManager';
// import { QualityTiersManager } from '@/components/admin/calculator/QualityTiersManager';
// import { ScopeBundlesManager } from '@/components/admin/calculator/ScopeBundlesManager';
// import { AddersManager } from '@/components/admin/calculator/AddersManager';
// import { LocationsManager } from '@/components/admin/calculator/LocationsManager';
// import { CostTemplatesManager } from '@/components/admin/calculator/CostTemplatesManager';

export default function CalculatorSettings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('presets');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Calculator Settings</h1>
          <p className="text-muted-foreground">
            Manage pricing, presets, and content for the project calculator
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="presets" className="gap-2">
              <Ruler className="h-4 w-4" />
              Size Presets
            </TabsTrigger>
            <TabsTrigger value="tiers" className="gap-2">
              <Award className="h-4 w-4" />
              Quality Tiers
            </TabsTrigger>
            <TabsTrigger value="bundles" className="gap-2">
              <Package className="h-4 w-4" />
              Scope Bundles
            </TabsTrigger>
            <TabsTrigger value="adders" className="gap-2">
              <Plus className="h-4 w-4" />
              Adders
            </TabsTrigger>
            <TabsTrigger value="locations" className="gap-2">
              <MapPin className="h-4 w-4" />
              Locations
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <Calculator className="h-4 w-4" />
              Cost Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Size Presets</CardTitle>
                <CardDescription>Admin interface will be available once Supabase types regenerate</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  The calculator database tables have been created. Please wait a moment for the types to regenerate, then refresh the page.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tiers" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Quality Tiers</CardTitle>
                <CardDescription>Admin interface will be available once Supabase types regenerate</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="bundles" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Scope Bundles</CardTitle>
                <CardDescription>Admin interface will be available once Supabase types regenerate</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="adders" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Adders</CardTitle>
                <CardDescription>Admin interface will be available once Supabase types regenerate</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="locations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Location Factors</CardTitle>
                <CardDescription>Admin interface will be available once Supabase types regenerate</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Cost Templates</CardTitle>
                <CardDescription>Admin interface will be available once Supabase types regenerate</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
