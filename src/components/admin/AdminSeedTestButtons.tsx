import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlayCircle, RefreshCw, AlertTriangle, Award } from 'lucide-react';

export function AdminSeedTestButtons() {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<{ [key: string]: any }>({});

  async function callFunction(fn: string, label: string) {
    setLoading(fn);
    try {
      const { data, error } = await supabase.functions.invoke(fn, {
        body: {}
      });

      if (error) throw error;

      setResults(prev => ({ ...prev, [fn]: data }));
      
      toast({
        title: 'Success',
        description: `${label} completed successfully`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || `Failed to run ${label}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  }

  async function refreshViews() {
    setLoading('refresh');
    try {
      const { error } = await supabase.rpc('refresh_analytics_views' as any);
      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Analytics views refreshed',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to refresh views',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlayCircle className="w-5 h-5" />
          Sprint 15.4 Testing Tools
        </CardTitle>
        <CardDescription>
          Manually trigger edge functions for testing dispute analytics, warnings, and quality scores
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => callFunction('sentiment-batch', 'Sentiment Batch')}
            disabled={loading !== null}
            className="h-auto py-3 flex flex-col items-start"
          >
            {loading === 'sentiment-batch' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <AlertTriangle className="w-4 h-4 mb-1" />
            )}
            <span className="text-sm font-medium">Sentiment Batch</span>
            <span className="text-xs text-muted-foreground">Analyze message tone</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => callFunction('quality-recalculate', 'Quality Recalculation')}
            disabled={loading !== null}
            className="h-auto py-3 flex flex-col items-start"
          >
            {loading === 'quality-recalculate' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Award className="w-4 h-4 mb-1" />
            )}
            <span className="text-sm font-medium">Recalc Quality</span>
            <span className="text-xs text-muted-foreground">Update user scores</span>
          </Button>

          <Button
            onClick={() => callFunction('early-warning-monitor', 'Early Warning Monitor')}
            disabled={loading !== null}
            className="h-auto py-3 flex flex-col items-start"
          >
            {loading === 'early-warning-monitor' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <AlertTriangle className="w-4 h-4 mb-1" />
            )}
            <span className="text-sm font-medium">Early Warning</span>
            <span className="text-xs text-muted-foreground">Generate warnings</span>
          </Button>

          <Button
            variant="secondary"
            onClick={refreshViews}
            disabled={loading !== null}
            className="h-auto py-3 flex flex-col items-start"
          >
            {loading === 'refresh' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mb-1" />
            )}
            <span className="text-sm font-medium">Refresh Views</span>
            <span className="text-xs text-muted-foreground">Update analytics</span>
          </Button>
        </div>

        {Object.keys(results).length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium">Results:</h4>
            {Object.entries(results).map(([fn, data]) => (
              <div key={fn} className="text-xs bg-muted p-2 rounded">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="secondary">{fn}</Badge>
                  <Badge variant={data?.ok ? 'default' : 'destructive'}>
                    {data?.ok ? 'Success' : 'Error'}
                  </Badge>
                </div>
                <pre className="overflow-auto max-h-32">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground border-t pt-3 space-y-1">
          <p><strong>Setup:</strong> Run seed script in <code>scripts/seed_sprint_154_demo.sql</code></p>
          <p><strong>Cleanup:</strong> Use <code>scripts/cleanup_sprint_154_demo.sql</code></p>
          <p><strong>Note:</strong> Functions require <code>verify_jwt = false</code> in <code>config.toml</code></p>
        </div>
      </CardContent>
    </Card>
  );
}
