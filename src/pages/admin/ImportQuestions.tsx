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
import { transformNewFormatPack } from '@/lib/newPackFormatTransformer';

// Use bundled worker with fallback to CDN
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
} catch (error) {
  console.warn('Failed to load bundled worker, falling back to CDN');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

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
  ui_config?: Record<string, any>;
}

export default function ImportQuestions() {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [parsedPacks, setParsedPacks] = useState<ParsedPack[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [progressStage, setProgressStage] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setParsedPacks([]);
    }
  };

  const extractTextFromPDF = async (file: File, onProgress?: (percent: number) => void): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    const totalPages = pdf.numPages;
    
    for (let i = 1; i <= totalPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
      
      if (onProgress) {
        onProgress(Math.round((i / totalPages) * 100));
      }
    }
    
    return fullText;
  };

  const handleParse = async () => {
    if (!file) return;

    setParsing(true);
    setProgressPercent(0);
    setProgressStage('');
    
    try {
      const isJSON = file.name.toLowerCase().endsWith('.json');
      
      if (isJSON) {
        // Handle JSON files using old parser
        setProgressStage('Parsing JSON file...');
        const jsonText = await file.text();
        const { data, error } = await supabase.functions.invoke('import-question-packs', {
          body: { jsonText }
        });

        if (error) throw error;

        setParsedPacks(data.packs);
        toast({
          title: 'JSON Parsed Successfully',
          description: `Found ${data.stats.totalPacks} micro-services with ${data.stats.totalQuestions} questions`
        });
      } else {
        // Phase 1: Extract text from PDF (0-30%)
        setProgressStage('Extracting text from PDF...');
        setProgressPercent(0);
        
        const pdfText = await extractTextFromPDF(file, (percent) => {
          setProgressPercent(Math.round(percent * 0.3)); // 0-30%
        });
        
        // Phase 2: AI Conversion (30-70%)
        setProgressStage('Converting with AI (this may take 30-60 seconds)...');
        setProgressPercent(30);

        const { data, error } = await supabase.functions.invoke('convert-pdf-questions', {
          body: { pdfText }
        });

        if (error) throw error;

        // Phase 3: Transform to database format (70-100%)
        setProgressStage('Transforming to database format...');
        setProgressPercent(70);

        const transformedPacks = data.packs.map((aiPack: any) => {
          const { microserviceDef, ui_config, metadata } = transformNewFormatPack(aiPack);
          
          return {
            micro_slug: aiPack.slug,
            version: 1,
            status: 'draft' as const,
            source: 'ai' as const,
            is_active: false,
            content: microserviceDef,
            ui_config: Object.keys(ui_config).length > 0 ? ui_config : undefined
          };
        });

        setProgressPercent(100);
        setParsedPacks(transformedPacks);
        
        const totalQuestions = transformedPacks.reduce((sum: number, p: any) => sum + p.content.questions.length, 0);
        const avgQuestions = Math.round(totalQuestions / transformedPacks.length);
        
        toast({
          title: '✅ Conversion Complete',
          description: `${transformedPacks.length} microservices • ${totalQuestions} questions • ${avgQuestions} avg per pack`
        });
      }
    } catch (error: any) {
      console.error('Parse error:', error);
      
      let errorMessage = 'Conversion Failed';
      let errorDescription = error.message || 'Failed to parse file';
      
      if (error.message?.includes('Rate limit') || error.message?.includes('429')) {
        errorMessage = 'AI Rate Limit Exceeded';
        errorDescription = 'Too many requests. Please wait a moment and try again.';
      } else if (error.message?.includes('credits') || error.message?.includes('402')) {
        errorMessage = 'AI Credits Required';
        errorDescription = 'Please add credits to your workspace to continue using AI conversion.';
      } else if (error.message?.includes('PDF')) {
        errorMessage = 'PDF Extraction Failed';
        errorDescription = 'Could not read PDF file. Please ensure it\'s a valid PDF document.';
      } else if (error.message?.includes('validation') || error.message?.includes('transform')) {
        errorMessage = 'Invalid Format';
        errorDescription = 'AI output did not match expected format. Please try again or contact support.';
      }
      
      toast({
        title: errorMessage,
        description: errorDescription,
        variant: 'destructive'
      });
    } finally {
      setParsing(false);
      setProgressStage('');
      setProgressPercent(0);
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
        
        // Check if pack has ui_config (new format) or use legacy format
        const insertData: any = {
          micro_slug: pack.micro_slug,
          version: pack.version,
          status: pack.status as 'draft' | 'approved' | 'retired',
          source: (pack.source || 'ai') as 'manual' | 'ai' | 'hybrid',
          content: pack.content as any,
          is_active: pack.is_active ?? false
        };

        // Add ui_config if present (new format from AI converter)
        if (pack.ui_config) {
          insertData.ui_config = pack.ui_config;
        }

        const { error } = await supabase
          .from('question_packs')
          .insert([insertData]);

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
        <h1 className="text-3xl font-bold">AI-Powered PDF Converter</h1>
        <p className="text-muted-foreground">
          Upload PDF and let AI extract structured question packs automatically
        </p>
        <div className="mt-2 p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm">
          <p className="font-medium text-primary">🤖 Powered by Lovable AI</p>
          <p className="text-muted-foreground mt-1">
            Upload your PDF containing construction questions and AI will intelligently parse them into the new JSON format with placeholders, help text, and proper question types.
          </p>
        </div>
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
            <>
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
              
              {parsing && (
                <div className="space-y-2 w-full">
                  <Progress value={progressPercent} />
                  <p className="text-sm text-center text-muted-foreground">
                    {progressStage} {progressPercent > 0 && `${progressPercent}%`}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Conversion Summary */}
      {parsedPacks.length > 0 && (
        <>
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <h3 className="font-semibold text-primary mb-3">✅ Conversion Complete</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Microservices</p>
                <p className="text-2xl font-bold">{parsedPacks.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Questions</p>
                <p className="text-2xl font-bold">
                  {parsedPacks.reduce((sum, p) => sum + p.content.questions.length, 0)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Avg per Pack</p>
                <p className="text-2xl font-bold">
                  {Math.round(parsedPacks.reduce((sum, p) => sum + p.content.questions.length, 0) / parsedPacks.length)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">With UI Config</p>
                <p className="text-2xl font-bold">
                  {parsedPacks.filter(p => p.ui_config && Object.keys(p.ui_config).length > 0).length}
                </p>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Preview Parsed Data</h2>
                  <p className="text-sm text-muted-foreground">
                    Review before importing to database
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
