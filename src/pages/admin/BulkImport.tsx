/**
 * Bulk Import Admin Page
 * Automatically transforms and imports microservices from JSON file
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, XCircle, AlertTriangle, Upload, Database, FileJson } from 'lucide-react';
import { bulkTransform, BulkTransformResult } from '@/lib/bulkImportTransformer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import microservicesData from '@/data/microservices_master_v1_1.json';

export default function BulkImport() {
  const [transformResult, setTransformResult] = useState<BulkTransformResult | null>(null);
  const [isTransforming, setIsTransforming] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importComplete, setImportComplete] = useState(false);
  const [importStats, setImportStats] = useState<{ success: number; failed: number } | null>(null);

  const handleTransform = () => {
    setIsTransforming(true);
    try {
      const result = bulkTransform(microservicesData as any);
      setTransformResult(result);
      toast({
        title: 'Transformation Complete',
        description: `Transformed ${result.summary.valid} of ${result.summary.total} micro-services`,
      });
    } catch (error) {
      toast({
        title: 'Transformation Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsTransforming(false);
    }
  };

  const handleImport = async () => {
    if (!transformResult) return;

    setIsImporting(true);
    let successCount = 0;
    let failedCount = 0;

    try {
      // Only import valid microservices
      const validMicroservices = transformResult.transformed.filter((_, index) => 
        transformResult.validations[index].isValid
      );

      for (const microservice of validMicroservices) {
        try {
          const { error } = await supabase
            .from('question_packs')
            .insert({
              micro_slug: microservice.slug,
              version: 1,
              status: 'approved' as const,
              source: 'manual' as const,
              content: microservice as any,
              is_active: true,
            });

          if (error) {
            console.error(`Failed to import ${microservice.slug}:`, error);
            failedCount++;
          } else {
            successCount++;
          }
        } catch (err) {
          console.error(`Error importing ${microservice.slug}:`, err);
          failedCount++;
        }
      }

      setImportStats({ success: successCount, failed: failedCount });
      setImportComplete(true);

      toast({
        title: 'Import Complete',
        description: `Successfully imported ${successCount} micro-services. ${failedCount > 0 ? `${failedCount} failed.` : ''}`,
      });
    } catch (error) {
      toast({
        title: 'Import Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Bulk Import Question Packs</h1>
        <p className="text-muted-foreground">
          Automatically transform and import all micro-services from microservices_master_v1_1.json
        </p>
      </div>

      {/* Step 1: Transform */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="w-5 h-5" />
            Step 1: Transform JSON to Database Format
          </CardTitle>
          <CardDescription>
            Read and validate the microservices JSON file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={handleTransform}
              disabled={isTransforming || !!transformResult}
              size="lg"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isTransforming ? 'Transforming...' : transformResult ? 'Transformation Complete' : 'Transform Data'}
            </Button>
            
            {transformResult && (
              <div className="flex gap-2">
                <Badge variant="outline" className="text-green-600">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {transformResult.summary.valid} Valid
                </Badge>
                {transformResult.summary.invalid > 0 && (
                  <Badge variant="outline" className="text-red-600">
                    <XCircle className="w-3 h-3 mr-1" />
                    {transformResult.summary.invalid} Invalid
                  </Badge>
                )}
                <Badge variant="outline">
                  {transformResult.summary.totalQuestions} Questions
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Preview & Validate */}
      {transformResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Step 2: Review Validation Results
            </CardTitle>
            <CardDescription>
              Review any errors or warnings before importing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="valid">Valid ({transformResult.summary.valid})</TabsTrigger>
                <TabsTrigger value="issues">
                  Issues ({transformResult.validations.filter(v => !v.isValid || v.warnings.length > 0).length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Total Micro-services</CardDescription>
                      <CardTitle className="text-3xl">{transformResult.summary.total}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Valid</CardDescription>
                      <CardTitle className="text-3xl text-green-600">{transformResult.summary.valid}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Invalid</CardDescription>
                      <CardTitle className="text-3xl text-red-600">{transformResult.summary.invalid}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Total Questions</CardDescription>
                      <CardTitle className="text-3xl">{transformResult.summary.totalQuestions}</CardTitle>
                    </CardHeader>
                  </Card>
                </div>

                {transformResult.summary.invalid === 0 && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      All micro-services validated successfully! Ready to import to database.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="valid">
                <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                  <div className="space-y-2">
                    {transformResult.validations
                      .filter(v => v.isValid)
                      .map((validation, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                          <div>
                            <p className="font-medium">{validation.serviceName}</p>
                            <p className="text-sm text-muted-foreground">{validation.microSlug}</p>
                          </div>
                          <Badge variant="outline" className="text-green-600">
                            {validation.questionCount} questions
                          </Badge>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="issues">
                <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                  <div className="space-y-4">
                    {transformResult.validations
                      .filter(v => !v.isValid || v.warnings.length > 0)
                      .map((validation, index) => (
                        <Card key={index}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">{validation.serviceName}</CardTitle>
                              {!validation.isValid && (
                                <Badge variant="destructive">Invalid</Badge>
                              )}
                            </div>
                            <CardDescription>{validation.microSlug}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {validation.errors.map((error, i) => (
                              <Alert key={i} variant="destructive">
                                <XCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                              </Alert>
                            ))}
                            {validation.warnings.map((warning, i) => (
                              <Alert key={i}>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>{warning}</AlertDescription>
                              </Alert>
                            ))}
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Import */}
      {transformResult && transformResult.summary.valid > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Step 3: Import to Database
            </CardTitle>
            <CardDescription>
              Import {transformResult.summary.valid} valid micro-services to the question_packs table
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!importComplete ? (
              <Button
                onClick={handleImport}
                disabled={isImporting}
                size="lg"
                variant="default"
              >
                <Database className="w-4 h-4 mr-2" />
                {isImporting ? 'Importing...' : `Import ${transformResult.summary.valid} Micro-services`}
              </Button>
            ) : (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Import complete! Successfully imported {importStats?.success} micro-services.
                  {importStats && importStats.failed > 0 && ` ${importStats.failed} failed.`}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
