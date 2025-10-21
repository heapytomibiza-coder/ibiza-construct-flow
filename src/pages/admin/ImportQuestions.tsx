/**
 * Admin PDF Import Interface
 * Allows admins to upload PDF, parse questions, preview, and bulk import
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, CheckCircle2, AlertCircle, Loader2, FileText, Download } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface ParsedPack {
  micro_slug: string;
  version: number;
  status: string;
  source: string;
  is_active: boolean;
  content: {
    id: string;
    category: string;
    name: string;
    slug: string;
    i18nPrefix: string;
    questions: any[];
  };
}

export default function ImportQuestions() {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [parsedPacks, setParsedPacks] = useState<ParsedPack[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setParsedPacks([]);
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText;
  };

  const handleParse = async () => {
    if (!file) return;

    setParsing(true);
    try {
      const isJSON = file.name.toLowerCase().endsWith('.json');
      
      let bodyData: any;
      if (isJSON) {
        const jsonText = await file.text();
        bodyData = { jsonText };
      } else {
        const pdfText = await extractTextFromPDF(file);
        bodyData = { pdfText };
      }
      
      // Call edge function to parse
      const { data, error } = await supabase.functions.invoke('import-question-packs', {
        body: bodyData
      });

      if (error) throw error;

      setParsedPacks(data.packs);
      toast({
        title: `${isJSON ? 'JSON' : 'PDF'} Parsed Successfully`,
        description: `Found ${data.stats.totalPacks} micro-services with ${data.stats.totalQuestions} questions (avg ${data.stats.avgQuestionsPerPack} per pack)`
      });
    } catch (error) {
      console.error('Parse error:', error);
      toast({
        title: 'Parse Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setParsing(false);
    }
  };

  const handleBulkImport = async () => {
    if (parsedPacks.length === 0) return;

    setImporting(true);
    setImportProgress(0);

    try {
      let successful = 0;
      let failed = 0;

      for (let i = 0; i < parsedPacks.length; i++) {
        const pack = parsedPacks[i];
        
        const { error } = await supabase
          .from('question_packs')
          .insert([{
            micro_slug: pack.micro_slug,
            version: pack.version,
            status: pack.status as 'draft' | 'approved' | 'retired',
            source: pack.source as 'manual' | 'ai' | 'hybrid',
            content: pack.content as any,
            is_active: pack.is_active
          }]);

        if (error) {
          console.error(`Failed to import ${pack.micro_slug}:`, error);
          failed++;
        } else {
          successful++;
        }

        setImportProgress(Math.round(((i + 1) / parsedPacks.length) * 100));
      }

      toast({
        title: 'Import Complete',
        description: `Successfully imported ${successful} packs. ${failed > 0 ? `Failed: ${failed}` : ''}`,
      });

      // Navigate to browser to review
      setTimeout(() => navigate('/admin/questions?tab=browser'), 1500);
      
    } catch (error) {
      toast({
        title: 'Import Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setImporting(false);
    }
  };

  const downloadJSON = () => {
    const dataStr = JSON.stringify(parsedPacks, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'question-packs.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Import Question Packs</h1>
        <p className="text-muted-foreground">
          Upload JSON or PDF to automatically extract and import question packs
        </p>
      </div>

      {/* Upload Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".pdf,.json"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="outline" className="cursor-pointer" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Choose JSON or PDF File
                </span>
              </Button>
            </label>
            {file && (
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4" />
                <span>{file.name}</span>
                <Badge variant="secondary">{(file.size / 1024).toFixed(0)} KB</Badge>
              </div>
            )}
          </div>

          {file && (
            <Button onClick={handleParse} disabled={parsing}>
              {parsing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Parsing {file.name.toLowerCase().endsWith('.json') ? 'JSON' : 'PDF'}...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Parse {file.name.toLowerCase().endsWith('.json') ? 'JSON' : 'PDF'}
                </>
              )}
            </Button>
          )}
        </div>
      </Card>

      {/* Preview Section */}
      {parsedPacks.length > 0 && (
        <>
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Preview Parsed Data</h2>
                  <p className="text-sm text-muted-foreground">
                    {parsedPacks.length} micro-services • {parsedPacks.reduce((sum, p) => sum + p.content.questions.length, 0)} questions
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={downloadJSON}>
                    <Download className="w-4 h-4 mr-2" />
                    Export JSON
                  </Button>
                  <Button onClick={handleBulkImport} disabled={importing}>
                    {importing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Bulk Import ({parsedPacks.length} packs)
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {importing && (
                <div className="space-y-2">
                  <Progress value={importProgress} />
                  <p className="text-sm text-muted-foreground text-center">
                    Importing... {importProgress}%
                  </p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <Accordion type="single" collapsible className="w-full">
              {parsedPacks.map((pack, index) => (
                <AccordionItem key={index} value={`pack-${index}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <Badge variant="secondary">{pack.content.questions.length}Q</Badge>
                      <span className="font-medium">{pack.content.name}</span>
                      <span className="text-sm text-muted-foreground">({pack.micro_slug})</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pl-4 pt-2">
                      {pack.content.questions.map((q: any, qIndex: number) => (
                        <div key={qIndex} className="flex gap-2 text-sm">
                          <span className="text-muted-foreground">{qIndex + 1}.</span>
                          <div className="flex-1">
                            <p>{q.i18nKey}</p>
                            {q.options && (
                              <div className="flex flex-wrap gap-2 mt-1">
                                {q.options.map((opt: any, oIndex: number) => (
                                  <Badge key={oIndex} variant="outline" className="text-xs">
                                    {opt.i18nKey}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <Badge variant={q.required ? 'default' : 'secondary'} className="text-xs">
                            {q.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </>
      )}
    </div>
  );
}
