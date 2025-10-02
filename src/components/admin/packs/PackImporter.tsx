/**
 * Bulk import question packs from JSON files
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MicroserviceDefSchema } from '@/schemas/packs';
import { Upload, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useImportPack } from '../../../../packages/@contracts/clients/packs';
import type { MicroserviceDef } from '../../../../packages/@contracts/clients/types';
import { convertAuthoringPackToMicroserviceDef } from '@/lib/packFormatConverter';

export function PackImporter() {
  const [logs, setLogs] = useState<Array<{ type: 'success' | 'error'; message: string }>>([]);
  const { mutateAsync: importPack, isPending } = useImportPack();

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setLogs([]);
    
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        
        let microserviceDef: MicroserviceDef;
        
        // Auto-detect format: authoring vs. DB-ready
        if (json.pack_slug || json.applies_to) {
          // Authoring format - convert it
          microserviceDef = convertAuthoringPackToMicroserviceDef(json) as MicroserviceDef;
        } else {
          // DB-ready format - validate directly
          microserviceDef = MicroserviceDefSchema.parse(json) as MicroserviceDef;
        }
        
        // Import as approved manual pack
        await importPack({
          slug: microserviceDef.slug,
          content: microserviceDef,
          source: 'manual',
        });
        
        setLogs(prev => [...prev, {
          type: 'success',
          message: `✅ Imported ${microserviceDef.slug} (${microserviceDef.questions.length} questions)`
        }]);
      } catch (error: any) {
        setLogs(prev => [...prev, {
          type: 'error',
          message: `❌ ${file.name}: ${error.message}`
        }]);
      }
    }
    
    toast.success(`Processed ${fileArray.length} files`);
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Bulk Import Question Packs</h2>
        <p className="text-sm text-muted-foreground">
          Upload JSON files containing MicroserviceDef schemas. Files will be validated and imported as approved packs.
        </p>
      </div>

      <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4">
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
            Select one or more JSON files
          </p>
        </div>
      </div>

      {logs.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Import Log</h3>
          <div className="bg-muted rounded-lg p-4 space-y-1 max-h-96 overflow-y-auto font-mono text-sm">
            {logs.map((log, i) => (
              <div key={i} className="flex items-start gap-2">
                {log.type === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                )}
                <span>{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm space-y-2">
        <p className="font-medium text-blue-900">Expected JSON Format:</p>
        <pre className="bg-white p-3 rounded text-xs overflow-x-auto">
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
        { "i18nKey": "q1.options.kitchen", "value": "kitchen", "order": 1 }
      ]
    }
  ]
}`}
        </pre>
      </div>
    </Card>
  );
}
