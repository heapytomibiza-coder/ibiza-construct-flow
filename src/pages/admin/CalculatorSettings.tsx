import { useState } from 'react';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Ruler, Award, Package, Plus, MapPin, Calculator } from 'lucide-react';
import { SizePresetsManager } from '@/components/admin/calculator/SizePresetsManager';
import { QualityTiersManager } from '@/components/admin/calculator/QualityTiersManager';
import { ScopeBundlesManager } from '@/components/admin/calculator/ScopeBundlesManager';
import { AddersManager } from '@/components/admin/calculator/AddersManager';
import { LocationsManager } from '@/components/admin/calculator/LocationsManager';
import { CostTemplatesManager } from '@/components/admin/calculator/CostTemplatesManager';

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
            <SizePresetsManager />
          </TabsContent>

          <TabsContent value="tiers" className="mt-6">
            <QualityTiersManager />
          </TabsContent>

          <TabsContent value="bundles" className="mt-6">
            <ScopeBundlesManager />
          </TabsContent>

          <TabsContent value="adders" className="mt-6">
            <AddersManager />
          </TabsContent>

          <TabsContent value="locations" className="mt-6">
            <LocationsManager />
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <CostTemplatesManager />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
