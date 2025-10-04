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
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useRole } from '@/lib/roleHelpers';

export default function AdminQuestions() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('browser');

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
          <TabsTrigger value="browser">Browse Packs</TabsTrigger>
          <TabsTrigger value="import">Import</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="browser">
          <PackBrowser />
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
