import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

export const ReviewSummaryManager = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0 });
  const { toast } = useToast();

  const generateAllSummaries = async () => {
    try {
      setIsProcessing(true);
      setProgress(0);
      setStats({ total: 0, success: 0, failed: 0 });

      // Get all professionals with reviews
      const { data: professionals, error } = await supabase
        .from('reviews')
        .select('reviewee_id')
        .eq('status', 'active');

      if (error) throw error;

      // Get unique professional IDs
      const uniqueProfessionals = [...new Set(professionals?.map(r => r.reviewee_id) || [])];
      setStats(prev => ({ ...prev, total: uniqueProfessionals.length }));

      // Process each professional
      for (let i = 0; i < uniqueProfessionals.length; i++) {
        const professionalId = uniqueProfessionals[i];
        
        try {
          const { error: generateError } = await supabase.functions.invoke(
            'generate-review-summary',
            {
              body: {
                professionalId,
                microServiceId: null, // Generate overall summary
              },
            }
          );

          if (generateError) throw generateError;
          
          setStats(prev => ({ ...prev, success: prev.success + 1 }));
        } catch (err) {
          console.error(`Failed for professional ${professionalId}:`, err);
          setStats(prev => ({ ...prev, failed: prev.failed + 1 }));
        }

        setProgress(((i + 1) / uniqueProfessionals.length) * 100);
      }

      toast({
        title: 'Summary Generation Complete',
        description: `Generated ${stats.success} summaries. ${stats.failed} failed.`,
      });

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate summaries',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          AI Review Summary Manager
        </CardTitle>
        <CardDescription>
          Generate AI-powered professional overviews from customer reviews
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status */}
        {isProcessing && (
          <div className="space-y-3">
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Processing: {stats.success + stats.failed} / {stats.total}
              </span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  {stats.success} success
                </span>
                <span className="flex items-center gap-1 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  {stats.failed} failed
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button
            onClick={generateAllSummaries}
            disabled={isProcessing}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate All Summaries
              </>
            )}
          </Button>
        </div>

        {/* Info */}
        <div className="rounded-lg bg-muted p-4 text-sm space-y-2">
          <p className="font-semibold">How it works:</p>
          <ul className="space-y-1 text-muted-foreground list-disc list-inside">
            <li>Analyzes all reviews for each professional</li>
            <li>Uses AI to identify key strengths and common praise</li>
            <li>Generates a professional overview highlighting what makes them stand out</li>
            <li>Only processes professionals with at least 3 reviews</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
