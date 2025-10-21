/**
 * Admin Question Packs Management
 * Browse, import, approve, and activate question packs
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PackBrowser } from '@/components/admin/packs/PackBrowser';
import { PackImporter } from '@/components/admin/packs/PackImporter';
import { PackAnalytics } from '@/components/admin/packs/PackAnalytics';
import ImportQuestions from '@/pages/admin/ImportQuestions';
import BulkImportMaster from '@/pages/admin/BulkImportMaster';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useRole } from '@/lib/roleHelpers';

export default function AdminQuestions() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('bulk-import');

  // Check admin access using useRole hook from contracts
  const { isAdmin } = useRole();
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Question Pack Management</h1>
        <p className="text-muted-foreground">
          Manage versioned question sets for all microservices
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="bulk-import">🚀 Bulk Import Master</TabsTrigger>
          <TabsTrigger value="browser">Browse Packs</TabsTrigger>
          <TabsTrigger value="pdf-import">PDF Import</TabsTrigger>
          <TabsTrigger value="import">Manual Import</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="bulk-import">
          <BulkImportMaster />
        </TabsContent>

        <TabsContent value="browser">
          <PackBrowser />
        </TabsContent>

        <TabsContent value="pdf-import">
          <ImportQuestions />
        </TabsContent>

        <TabsContent value="import">
          <PackImporter />
        </TabsContent>

        <TabsContent value="analytics">
          <PackAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}
