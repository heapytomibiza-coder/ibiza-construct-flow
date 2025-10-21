/**
 * Bulk import utility with drag-and-drop support
 * Supports both old format and master pack format
 */

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, Loader2, AlertCircle, Upload, FileJson, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImportStats {
  total: number;
  successful: number;
  failed: number;
  progress: number;
}

interface UploadedFile {
  name: string;
  data: any;
  format: 'master' | 'original';
  preview: string;
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
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [stats, setStats] = useState<ImportStats>({
    total: 0,
    successful: 0,
    failed: 0,
    progress: 0
  });
  const [errors, setErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const detectFormat = (data: any): 'master' | 'original' => {
    // Master format has microservices array
    if (data.microservices && Array.isArray(data.microservices)) {
      return 'master';
    }
    // Original format is an array of microservices
    if (Array.isArray(data)) {
      return 'original';
    }
    return 'master'; // Default
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        const format = detectFormat(json);
        const microservices = format === 'master' ? json.microservices : json;
        
        setUploadedFile({
          name: file.name,
          data: json,
          format,
          preview: `${microservices.length} services detected (${format} format)`
        });

        toast({
          title: 'File Loaded',
          description: `${microservices.length} services ready for import`,
        });
      } catch (error: any) {
        toast({
          title: 'Invalid JSON',
          description: error.message,
          variant: 'destructive'
        });
      }
    };
    reader.readAsText(file);
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json']
    },
    maxFiles: 1
  });

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
    if (!uploadedFile) {
      toast({
        title: 'No File Uploaded',
        description: 'Please upload a JSON file first',
        variant: 'destructive'
      });
      return;
    }

    setImporting(true);
    setErrors([]);
    setStats({ total: 0, successful: 0, failed: 0, progress: 0 });

    try {
      const microservices = uploadedFile.format === 'master' 
        ? uploadedFile.data.microservices 
        : uploadedFile.data;
      
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
        <h1 className="text-3xl font-bold">Bulk Question Pack Import</h1>
        <p className="text-muted-foreground">
          Upload and import microservices question packs from JSON files
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Drag & Drop Import:</strong> Upload any JSON file containing microservices.
          Supports both original format and master pack format (auto-detected).
        </AlertDescription>
      </Alert>

      {!uploadedFile ? (
        <Card className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <Input {...getInputProps()} />
            <FileJson className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              {isDragActive ? 'Drop JSON file here' : 'Drag & drop JSON file'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse files
            </p>
            <Badge variant="outline">Supports .json files only</Badge>
          </div>
        </Card>
      ) : (
        <Card className="p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <FileJson className="w-5 h-5 text-primary mt-1" />
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{uploadedFile.name}</h3>
                  <Badge variant="secondary">{uploadedFile.format} format</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{uploadedFile.preview}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setUploadedFile(null)}
              disabled={importing}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setUploadedFile(null)}
              disabled={importing}
            >
              Upload Different File
            </Button>
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
                  Import {uploadedFile.preview.split(' ')[0]} Services
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

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
        <Card className="p-6">
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <strong>Import Successful!</strong>
              <br />
              ✅ {stats.successful} micro-services imported and activated
              <br />
              All services are now available in the job posting wizard
            </AlertDescription>
          </Alert>
        </Card>
      )}

      {errors.length > 0 && (
        <Card className="p-6">
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
        </Card>
      )}

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
