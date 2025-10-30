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
import QuestionBuilder from '@/components/admin/packs/QuestionBuilder';
import { AdminGuard } from '@/components/admin/AdminGuard';

export default function AdminQuestions() {
  const [activeTab, setActiveTab] = useState('form-builder');
  const [packToEdit, setPackToEdit] = useState<string | null>(null);
  
  const handleEditPack = (packId: string) => {
    setPackToEdit(packId);
    setActiveTab('form-builder');
  };

  return (
    <AdminGuard redirectPath="/dashboard">
    <div className="container mx-auto py-4 sm:py-8 space-y-4 sm:space-y-6 px-2 sm:px-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Question Pack Management</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Manage versioned question sets for all microservices
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <TabsList className="inline-flex w-max min-w-full sm:w-auto">
            <TabsTrigger value="form-builder" className="text-xs sm:text-sm whitespace-nowrap">📝 Form Builder</TabsTrigger>
            <TabsTrigger value="bulk-import" className="text-xs sm:text-sm whitespace-nowrap">🚀 Bulk Import</TabsTrigger>
            <TabsTrigger value="browser" className="text-xs sm:text-sm whitespace-nowrap">Browse Packs</TabsTrigger>
            <TabsTrigger value="pdf-import" className="text-xs sm:text-sm whitespace-nowrap">PDF Import</TabsTrigger>
            <TabsTrigger value="import" className="text-xs sm:text-sm whitespace-nowrap">Manual Import</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm whitespace-nowrap">Analytics</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="form-builder">
          <QuestionBuilder packToEdit={packToEdit} onClearEdit={() => setPackToEdit(null)} />
        </TabsContent>

        <TabsContent value="bulk-import">
          <BulkImportMaster />
        </TabsContent>

        <TabsContent value="browser">
          <PackBrowser onEditPack={handleEditPack} />
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
    </AdminGuard>
  );
}
