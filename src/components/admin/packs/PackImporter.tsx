/**
 * Bulk import question packs from JSON files with enhanced validation
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MicroserviceDefSchema } from '@/schemas/packs';
import { Upload, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useImportPack } from '../../../../packages/@contracts/clients/packs';
import type { MicroserviceDef } from '../../../../packages/@contracts/clients/types';
import { convertAuthoringPackToMicroserviceDef } from '@/lib/packFormatConverter';
import { ZodError } from 'zod';

type LogEntry = {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  details?: string[];
  pack?: {
    slug: string;
    name: string;
    questionCount: number;
  };
};

export function PackImporter() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const { mutateAsync: importPack, isPending } = useImportPack();

  const parseZodErrors = (error: ZodError<any>): string[] => {
    return error.issues.map(err => {
      const path = err.path.join('.');
      return `${path}: ${err.message}`;
    });
  };

  const validateQuestionCount = (count: number): { type: 'success' | 'warning'; message?: string } => {
    if (count < 4) {
      return {
        type: 'warning',
        message: `Only ${count} questions (recommended minimum: 4 for meaningful discovery)`
      };
    }
    if (count > 12) {
      return {
        type: 'warning',
        message: `${count} questions may overwhelm users (recommended maximum: 12)`
      };
    }
    return { type: 'success' };
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setLogs([]);
    
    const fileArray = Array.from(files);
    let successCount = 0;
    let errorCount = 0;
    let warningCount = 0;
    
    for (const file of fileArray) {
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        
        let microserviceDef: MicroserviceDef;
        let formatDetected = 'unknown';
        
        // Auto-detect format: authoring vs. DB-ready
        if (json.pack_slug || json.applies_to) {
          formatDetected = 'authoring';
          microserviceDef = convertAuthoringPackToMicroserviceDef(json) as MicroserviceDef;
        } else {
          formatDetected = 'database';
          microserviceDef = MicroserviceDefSchema.parse(json) as MicroserviceDef;
        }
        
        // Validate question count
        const countValidation = validateQuestionCount(microserviceDef.questions.length);
        
        // Import as approved manual pack
        await importPack({
          slug: microserviceDef.slug,
          content: microserviceDef,
          source: 'manual',
        });
        
        const logEntry: LogEntry = {
          type: countValidation.type === 'warning' ? 'warning' : 'success',
          message: `Imported ${microserviceDef.name}`,
          pack: {
            slug: microserviceDef.slug,
            name: microserviceDef.name,
            questionCount: microserviceDef.questions.length
          },
          details: [
            `Format: ${formatDetected}`,
            `Questions: ${microserviceDef.questions.length}`,
            `Category: ${microserviceDef.category}`,
            ...(countValidation.message ? [countValidation.message] : [])
          ]
        };
        
        setLogs(prev => [...prev, logEntry]);
        
        if (countValidation.type === 'warning') {
          warningCount++;
        } else {
          successCount++;
        }
        
      } catch (error: any) {
        errorCount++;
        
        let details: string[] = [];
        
        if (error instanceof ZodError) {
          details = parseZodErrors(error);
        } else if (error.message) {
          details = [error.message];
        }
        
        setLogs(prev => [...prev, {
          type: 'error',
          message: `Failed: ${file.name}`,
          details
        }]);
      }
    }
    
    // Summary toast
    const parts: string[] = [];
    if (successCount > 0) parts.push(`✅ ${successCount} imported`);
    if (warningCount > 0) parts.push(`⚠️ ${warningCount} with warnings`);
    if (errorCount > 0) parts.push(`❌ ${errorCount} failed`);
    
    toast(parts.join(', ') || 'No files processed');
  };

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />;
      case 'error': return <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />;
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Bulk Import Question Packs</h2>
        <p className="text-sm text-muted-foreground">
          Upload JSON files containing question pack schemas. Supports both authoring and database-ready formats.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Best Practice:</strong> Question packs should contain 4-12 questions. 
          Fewer than 4 may not provide enough detail; more than 12 may overwhelm users.
        </AlertDescription>
      </Alert>

      <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4 hover:border-primary/50 transition-colors">
        <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
        <div>
          <label htmlFor="file-upload" className="cursor-pointer">
            <Button type="button" disabled={isPending} onClick={() => document.getElementById('file-upload')?.click()}>
              {isPending ? 'Processing...' : 'Choose Files'}
            </Button>
          </label>
          <Input
            id="file-upload"
            type="file"
            multiple
            accept="application/json"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Select one or more JSON files (max 10 files)
          </p>
        </div>
      </div>

      {logs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Import Results</h3>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-green-600">
                {logs.filter(l => l.type === 'success').length} Success
              </Badge>
              {logs.some(l => l.type === 'warning') && (
                <Badge variant="outline" className="text-amber-600">
                  {logs.filter(l => l.type === 'warning').length} Warnings
                </Badge>
              )}
              {logs.some(l => l.type === 'error') && (
                <Badge variant="outline" className="text-destructive">
                  {logs.filter(l => l.type === 'error').length} Errors
                </Badge>
              )}
            </div>
          </div>
          
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {logs.map((log, i) => (
              <div 
                key={i} 
                className={`rounded-lg border p-4 space-y-2 ${
                  log.type === 'error' ? 'border-destructive/50 bg-destructive/5' :
                  log.type === 'warning' ? 'border-amber-500/50 bg-amber-50' :
                  'border-green-500/50 bg-green-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {getLogIcon(log.type)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{log.message}</p>
                    
                    {log.pack && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {log.pack.slug}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {log.pack.questionCount} questions
                        </Badge>
                      </div>
                    )}
                    
                    {log.details && log.details.length > 0 && (
                      <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                        {log.details.map((detail, j) => (
                          <li key={j} className="flex items-start gap-2">
                            <span className="text-muted-foreground/50">•</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm space-y-2">
          <p className="font-medium text-blue-900">Validation Rules:</p>
          <ul className="space-y-1 text-xs text-blue-800">
            <li>✓ Slugs: lowercase, hyphens only (kebab-case)</li>
            <li>✓ Keys: lowercase, numbers, underscores</li>
            <li>✓ Questions: 1+ required (4-12 recommended)</li>
            <li>✓ Options: unique values and order numbers</li>
            <li>✓ Timestamps: ISO 8601 datetime format</li>
          </ul>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm space-y-2">
          <p className="font-medium text-purple-900">Supported Formats:</p>
          <ul className="space-y-1 text-xs text-purple-800">
            <li>• <strong>Authoring Format:</strong> with pack_slug, applies_to</li>
            <li>• <strong>Database Format:</strong> MicroserviceDef schema</li>
            <li>• Auto-detection based on JSON structure</li>
          </ul>
        </div>
      </div>

      <details className="group">
        <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2">
          <span>View Example JSON Schema</span>
          <span className="text-xs">▼</span>
        </summary>
        <div className="mt-3 bg-muted border rounded-lg p-4">
          <pre className="text-xs overflow-x-auto">
{`{
  "id": "uuid-string",
  "category": "Tiler",
  "name": "Floor Tiling",
  "slug": "tiler-floor-tiling",
  "i18nPrefix": "tiler.floor",
  "questions": [
    {
      "key": "q1",
      "type": "single",
      "i18nKey": "q1.title",
      "required": true,
      "options": [
        {
          "i18nKey": "q1.options.kitchen",
          "value": "kitchen",
          "order": 1
        }
      ]
    }
  ]
}`}
          </pre>
        </div>
      </details>
    </Card>
  );
}
