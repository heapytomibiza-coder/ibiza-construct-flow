import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Clock, 
  Bot,
  Copy,
  Download,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  runId?: string;
  title?: string;
}

interface AIRun {
  id: string;
  operation_type: string;
  status: 'pending' | 'completed' | 'failed';
  input_data: any;
  output_data: any;
  error_message?: string;
  execution_time_ms?: number;
  tokens_used?: number;
  confidence_score?: number;
  created_at: string;
  completed_at?: string;
}

export default function AIResultModal({ 
  isOpen, 
  onClose, 
  runId,
  title = "AI Operation Result"
}: AIResultModalProps) {
  const [aiRun, setAiRun] = useState<AIRun | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && runId) {
      loadAIRun();
    }
  }, [isOpen, runId]);

  const loadAIRun = async () => {
    if (!runId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_runs')
        .select('*')
        .eq('id', runId)
        .single();

      if (error) throw error;
      setAiRun(data as AIRun);
    } catch (error) {
      console.error('Error loading AI run:', error);
      toast({
        title: "Error",
        description: "Failed to load AI operation result",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyResult = async () => {
    if (!aiRun?.output_data) return;
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(aiRun.output_data, null, 2));
      toast({
        title: "Copied!",
        description: "Result copied to clipboard"
      });
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownloadResult = () => {
    if (!aiRun?.output_data) return;
    
    const blob = new Blob([JSON.stringify(aiRun.output_data, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-result-${aiRun.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Completed
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Failed
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Info className="h-3 w-3" />
            Unknown
          </Badge>
        );
    }
  };

  const formatExecutionTime = (ms?: number) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const renderOutputData = (data: any) => {
    if (!data) return null;

    if (typeof data === 'string') {
      return <pre className="whitespace-pre-wrap text-sm">{data}</pre>;
    }

    if (typeof data === 'object') {
      return (
        <div className="space-y-2">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="border-l-2 border-l-primary pl-3">
              <p className="font-medium text-sm capitalize">{key.replace('_', ' ')}:</p>
              <div className="text-sm text-muted-foreground mt-1">
                {typeof value === 'object' ? (
                  <pre>{JSON.stringify(value, null, 2)}</pre>
                ) : (
                  <p>{String(value)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return <p className="text-sm">{String(data)}</p>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {aiRun ? `Operation: ${aiRun.operation_type}` : 'Loading AI operation result...'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : aiRun ? (
          <ScrollArea className="max-h-[70vh] overflow-y-auto">
            <div className="space-y-4">
              {/* Status and Metadata */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Operation Status</CardTitle>
                    {getStatusBadge(aiRun.status)}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Execution Time</p>
                      <p className="font-medium">{formatExecutionTime(aiRun.execution_time_ms)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tokens Used</p>
                      <p className="font-medium">{aiRun.tokens_used || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Confidence</p>
                      <p className="font-medium">
                        {aiRun.confidence_score ? `${Math.round(aiRun.confidence_score * 100)}%` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Completed</p>
                      <p className="font-medium">
                        {aiRun.completed_at ? new Date(aiRun.completed_at).toLocaleTimeString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Error Message (if failed) */}
              {aiRun.status === 'failed' && aiRun.error_message && (
                <Card className="border-destructive">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-destructive">Error Details</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-destructive">{aiRun.error_message}</p>
                  </CardContent>
                </Card>
              )}

              {/* Input Data */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Input Parameters</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-muted rounded-md p-3">
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(aiRun.input_data, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Output Data */}
              {aiRun.output_data && (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">AI Generated Result</CardTitle>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleCopyResult}>
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDownloadResult}>
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="bg-muted rounded-md p-4">
                      {renderOutputData(aiRun.output_data)}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p>Failed to load AI operation result</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}