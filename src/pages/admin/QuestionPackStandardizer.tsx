import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Loader2, CheckCircle, AlertCircle, Play, Pause } from 'lucide-react';
import { standardizeQuestions } from '@/lib/questionStandardizer';

interface ProcessingStats {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  skipped: number;
}

export default function QuestionPackStandardizer() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [stats, setStats] = useState<ProcessingStats>({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    skipped: 0
  });
  const [currentPack, setCurrentPack] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const standardizeSinglePack = async (pack: any) => {
    try {
      setCurrentPack(`${pack.micro_slug} (v${pack.version})`);
      
      // Check if questions already have proper text (not i18nKey format)
      const questions = pack.content.questions;
      const needsStandardization = questions.some((q: any) => 
        q.i18nKey?.includes('.') || !q.aiHint || q.options?.some((opt: any) => opt.i18nKey?.includes('.'))
      );

      if (!needsStandardization) {
        addLog(`✓ Skipped ${pack.micro_slug} - already has readable text`);
        setStats(prev => ({ ...prev, processed: prev.processed + 1, skipped: prev.skipped + 1 }));
        return true;
      }

      // Prepare questions for standardization
      const questionsToStandardize = questions.map((q: any) => ({
        key: q.key,
        aiHint: q.aiHint || q.i18nKey,
        options: q.options || []
      }));

      // Use client-side rule-based standardization (no AI/API keys needed)
      const standardizedData = standardizeQuestions(questionsToStandardize);

      // Update pack with standardized questions
      const updatedQuestions = questions.map((q: any, index: number) => {
        const standardized = standardizedData[index];
        
        return {
          ...q,
          aiHint: standardized.question,
          options: q.options?.map((opt: any, optIndex: number) => ({
            ...opt,
            i18nKey: standardized.options?.[optIndex] || opt.i18nKey
          }))
        };
      });

      const updatedContent = {
        ...pack.content,
        questions: updatedQuestions
      };

      // Update in database
      const { error: updateError } = await supabase
        .from('question_packs')
        .update({ content: updatedContent })
        .eq('pack_id', pack.pack_id);

      if (updateError) throw updateError;

      addLog(`✓ Standardized ${pack.micro_slug} - ${questions.length} questions updated`);
      setStats(prev => ({ ...prev, processed: prev.processed + 1, successful: prev.successful + 1 }));
      return true;

    } catch (error) {
      console.error(`Failed to standardize ${pack.micro_slug}:`, error);
      addLog(`✗ Failed ${pack.micro_slug}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setStats(prev => ({ ...prev, processed: prev.processed + 1, failed: prev.failed + 1 }));
      return false;
    }
  };

  const startStandardization = async () => {
    setIsProcessing(true);
    setIsPaused(false);
    setStats({ total: 0, processed: 0, successful: 0, failed: 0, skipped: 0 });
    setLogs([]);
    addLog('Starting standardization process...');

    try {
      // Get all active approved packs
      const { data: packs, error } = await supabase
        .from('question_packs')
        .select('*')
        .eq('status', 'approved')
        .eq('is_active', true)
        .order('micro_slug');

      if (error) throw error;
      if (!packs || packs.length === 0) {
        toast.error('No active approved packs found');
        setIsProcessing(false);
        return;
      }

      setStats(prev => ({ ...prev, total: packs.length }));
      addLog(`Found ${packs.length} active approved packs to process`);

      // Process packs in batches of 20 (faster now - no API limits)
      const batchSize = 20;
      for (let i = 0; i < packs.length; i += batchSize) {
        if (isPaused) {
          addLog('Process paused by user');
          break;
        }

        const batch = packs.slice(i, i + batchSize);
        addLog(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(packs.length / batchSize)}...`);

        await Promise.all(batch.map(pack => standardizeSinglePack(pack)));

        // No need to wait between batches (client-side processing)
      }

      if (!isPaused) {
        addLog('✓ Standardization process completed!');
        toast.success('All packs have been processed', {
          description: `${stats.successful} successful, ${stats.failed} failed, ${stats.skipped} skipped`
        });
      }

    } catch (error) {
      console.error('Standardization error:', error);
      addLog(`✗ Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error('Standardization failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsProcessing(false);
      setIsPaused(false);
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    addLog(isPaused ? 'Resuming...' : 'Pausing after current batch...');
  };

  const progress = stats.total > 0 ? (stats.processed / stats.total) * 100 : 0;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Question Pack Tone Standardizer</h1>
        <p className="text-muted-foreground">
          Automatically rewrite all 328 question packs in professional "hybrid" style using smart pattern matching
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Standardization Process</CardTitle>
            <CardDescription>
              This will process all active approved question packs and rewrite them with professional, client-friendly language
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={startStandardization} 
                disabled={isProcessing}
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start Standardization
                  </>
                )}
              </Button>

              {isProcessing && (
                <Button 
                  onClick={togglePause}
                  variant="outline"
                  size="lg"
                >
                  {isPaused ? (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Pause
                    </>
                  )}
                </Button>
              )}
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Progress: {stats.processed} / {stats.total}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
                <div className="text-sm text-muted-foreground">
                  Currently processing: {currentPack}
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Packs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
                  <CheckCircle className="h-5 w-5" />
                  {stats.successful}
                </div>
                <div className="text-sm text-muted-foreground">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 flex items-center justify-center gap-1">
                  <AlertCircle className="h-5 w-5" />
                  {stats.failed}
                </div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{stats.skipped}</div>
                <div className="text-sm text-muted-foreground">Skipped</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Process Log</CardTitle>
            <CardDescription>
              Real-time updates from the standardization process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <p className="text-muted-foreground">No logs yet. Click "Start Standardization" to begin.</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
