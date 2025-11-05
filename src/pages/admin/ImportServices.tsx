/**
 * Import Services - Semi-automated import from construction-services.json
 */

import { useState } from 'react';
import { AdminLayout } from '@/components/admin/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useImportServices } from '@/hooks/admin/useImportServices';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle, Loader2, FileText, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import type { ConstructionService } from '@/types/construction-services';
import type { PackStatus } from '@/types/packs';
import { SlugMapper } from '@/components/admin/questionPacks/SlugMapper';
import { QuestionPreview } from '@/components/admin/questionPacks/QuestionPreview';
import { mapServiceIdToMicroSlug, transformServiceToContent, LOGISTICS_QUESTION_IDS } from '@/lib/questionPacks/transformJsonToContent';

export default function ImportServices() {
  const { toast } = useToast();
  const {
    services,
    importService,
    isImporting,
    skipService,
    getServiceStatus,
    getFilteredQuestionCount,
    stats,
  } = useImportServices();
  
  const [selectedService, setSelectedService] = useState<ConstructionService | null>(null);
  const [microSlug, setMicroSlug] = useState('');
  
  const handleOpenPreview = (service: ConstructionService) => {
    setSelectedService(service);
    setMicroSlug(mapServiceIdToMicroSlug(service.id));
  };
  
  const handleImport = async (status: PackStatus) => {
    if (!selectedService) return;
    
    try {
      await importService({ service: selectedService, microSlug, status });
      toast({
        title: 'Success',
        description: `${selectedService.label} imported as ${status}`,
      });
      setSelectedService(null);
    } catch (error: any) {
      toast({
        title: 'Import Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  const handleSkip = () => {
    if (selectedService) {
      skipService(selectedService.id);
      setSelectedService(null);
    }
  };
  
  const logisticsRemoved = selectedService
    ? selectedService.blocks.filter(b => LOGISTICS_QUESTION_IDS.includes(b.id))
    : [];
  
  const previewContent = selectedService
    ? transformServiceToContent(selectedService, microSlug)
    : null;
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Import Services</h1>
          <p className="text-muted-foreground">
            Import question packs from construction-services.json with logistics filtering
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Import Progress</CardTitle>
            <CardDescription>
              {stats.imported} of {stats.total} services imported
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={stats.progress} />
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.imported}</div>
                <div className="text-sm text-muted-foreground">Imported</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{stats.skipped}</div>
                <div className="text-sm text-muted-foreground">Skipped</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid gap-4">
          {services.map((service) => {
            const status = getServiceStatus(service.id);
            const filteredCount = getFilteredQuestionCount(service);
            const originalCount = service.blocks.length;
            
            return (
              <Card key={service.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {service.label}
                        {status === 'imported' && (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Imported
                          </Badge>
                        )}
                        {status === 'skipped' && (
                          <Badge variant="secondary">
                            <XCircle className="h-3 w-3 mr-1" />
                            Skipped
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                    </div>
                    {status === 'pending' && (
                      <Button onClick={() => handleOpenPreview(service)}>
                        <FileText className="h-4 w-4 mr-2" />
                        Preview & Import
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{originalCount} blocks → {filteredCount} questions</span>
                    {originalCount !== filteredCount && (
                      <Badge variant="outline">
                        {originalCount - filteredCount} logistics filtered
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Preview & Import Dialog */}
        <Dialog open={!!selectedService} onOpenChange={(open) => !open && setSelectedService(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedService?.label}</DialogTitle>
              <DialogDescription>{selectedService?.description}</DialogDescription>
            </DialogHeader>
            
            {selectedService && (
              <div className="space-y-6">
                <SlugMapper
                  autoSuggested={mapServiceIdToMicroSlug(selectedService.id)}
                  value={microSlug}
                  onChange={setMicroSlug}
                />
                
                {logisticsRemoved.length > 0 && (
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-sm font-medium mb-2">
                      <AlertCircle className="h-4 w-4" />
                      Logistics Questions Removed
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {logisticsRemoved.map(b => b.title).join(', ')}
                    </div>
                  </div>
                )}
                
                {previewContent && (
                  <QuestionPreview
                    questions={previewContent.questions}
                    title="Questions Preview"
                  />
                )}
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={handleSkip}>Skip</Button>
              <Button
                variant="outline"
                onClick={() => handleImport('draft')}
                disabled={isImporting}
              >
                {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Import as Draft
              </Button>
              <Button
                onClick={() => handleImport('approved')}
                disabled={isImporting}
              >
                {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Import & Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
