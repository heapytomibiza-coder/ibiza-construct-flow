/**
 * One-time bulk import utility for microservices_master_v1.json
 * Imports all 115 micro-services directly into the database
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, Loader2, AlertCircle, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImportStats {
  total: number;
  successful: number;
  failed: number;
  progress: number;
}

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toKey(text: string, index: number): string {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 30);
  return `q${index + 1}_${slug}`;
}

export default function BulkImportMaster() {
  const [importing, setImporting] = useState(false);
  const [stats, setStats] = useState<ImportStats>({
    total: 0,
    successful: 0,
    failed: 0,
    progress: 0
  });
  const [errors, setErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const transformMicroservice = (micro: any, index: number) => {
    const microSlug = toSlug(micro.service);
    
    const questions = (micro.questions || []).map((q: any, qIndex: number) => {
      // Map question types
      let type = 'text';
      switch (q.type) {
        case 'multi_choice': type = 'multi'; break;
        case 'single_choice': type = 'single'; break;
        case 'number': type = 'number'; break;
        case 'short_text': type = 'text'; break;
        case 'file_upload': type = 'text'; break;
        default: type = 'text';
      }
      
      // Extract options
      const options = (q.options || []).map((opt: any, optIndex: number) => ({
        value: toSlug(opt).replace(/-+/g, '_'),
        i18nKey: opt,
        order: optIndex
      }));
      
      return {
        key: q.id || toKey(q.text, qIndex),
        type,
        i18nKey: q.text,
        required: q.required || false,
        ...(options.length > 0 && { options }),
        ...(q.min !== undefined && { min: q.min }),
        ...(q.max !== undefined && { max: q.max }),
        ...(q.unit && { unit: q.unit }),
        aiHint: q.ai_prompt_template || ''
      };
    });
    
    return {
      micro_slug: microSlug,
      version: 1,
      status: 'approved', // Import as approved and ready
      source: 'manual',
      is_active: true, // Activate immediately
      content: {
        id: crypto.randomUUID(),
        category: micro.category || 'General',
        name: micro.service,
        slug: microSlug,
        i18nPrefix: microSlug.replace(/-/g, '.'),
        questions
      }
    };
  };

  const handleBulkImport = async () => {
    setImporting(true);
    setErrors([]);
    setStats({ total: 0, successful: 0, failed: 0, progress: 0 });

    try {
      // Fetch the JSON file
      const response = await fetch('/data/microservices_master_v1.json');
      if (!response.ok) {
        throw new Error('Failed to load microservices_master_v1.json');
      }

      const data = await response.json();
      const microservices = data.microservices || [];
      
      setStats(prev => ({ ...prev, total: microservices.length }));

      let successful = 0;
      let failed = 0;
      const errorList: string[] = [];

      // Process in batches of 10 for better performance
      const batchSize = 10;
      for (let i = 0; i < microservices.length; i += batchSize) {
        const batch = microservices.slice(i, i + batchSize);
        const transformedBatch = batch.map((micro: any, index: number) => 
          transformMicroservice(micro, i + index)
        );

        // Insert batch
        const { error } = await supabase
          .from('question_packs')
          .insert(transformedBatch);

        if (error) {
          console.error('Batch insert error:', error);
          failed += batch.length;
          errorList.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
        } else {
          successful += batch.length;
        }

        // Update progress
        const progress = Math.round(((i + batch.length) / microservices.length) * 100);
        setStats({
          total: microservices.length,
          successful,
          failed,
          progress
        });

        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setErrors(errorList);

      toast({
        title: 'Import Complete',
        description: `✅ ${successful} imported, ${failed > 0 ? `❌ ${failed} failed` : '✅ All successful'}`,
      });

    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: 'Import Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Master Micro-services Import</h1>
        <p className="text-muted-foreground">
          Bulk import all 115 micro-services from microservices_master_v1.json
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>One-time Import:</strong> This will import all 115 micro-services as approved and active.
          Each micro-service will be immediately available in the job posting wizard.
        </AlertDescription>
      </Alert>

      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Import Status</h2>
            <p className="text-sm text-muted-foreground">
              File: microservices_master_v1.json
            </p>
          </div>
          <Button 
            onClick={handleBulkImport} 
            disabled={importing}
            size="lg"
          >
            {importing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Start Import (115 Services)
              </>
            )}
          </Button>
        </div>

        {importing && (
          <div className="space-y-4">
            <Progress value={stats.progress} className="h-3" />
            <div className="flex items-center justify-between text-sm">
              <div className="flex gap-4">
                <Badge variant="outline" className="text-green-600">
                  ✅ {stats.successful} Successful
                </Badge>
                {stats.failed > 0 && (
                  <Badge variant="outline" className="text-destructive">
                    ❌ {stats.failed} Failed
                  </Badge>
                )}
              </div>
              <span className="text-muted-foreground">
                {stats.progress}% ({stats.successful + stats.failed} / {stats.total})
              </span>
            </div>
          </div>
        )}

        {stats.successful > 0 && !importing && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <strong>Import Successful!</strong>
              <br />
              ✅ {stats.successful} micro-services imported and activated
              <br />
              All services are now available in the job posting wizard at <strong>/post</strong>
            </AlertDescription>
          </Alert>
        )}

        {errors.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium text-destructive">Errors ({errors.length}):</h3>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {errors.map((error, index) => (
                <Alert key={index} variant="destructive" className="text-sm">
                  {error}
                </Alert>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card className="p-6 space-y-4">
        <h3 className="font-semibold">What happens after import?</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="font-medium text-blue-900 mb-2">✅ Status: Approved</div>
            <p className="text-blue-800">All services imported as approved and ready for use</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="font-medium text-green-900 mb-2">🚀 Active Immediately</div>
            <p className="text-green-800">Services are live and selectable in the wizard</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="font-medium text-purple-900 mb-2">📋 115 Categories</div>
            <p className="text-purple-800">Full catalog across all construction trades</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
