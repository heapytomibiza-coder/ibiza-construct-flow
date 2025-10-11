import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export function PricingAuditLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAuditLog();
  }, []);

  const loadAuditLog = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('calculator_admin_actions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Load audit log error:', error);
      toast({
        title: "Load Failed",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading audit log...</div>;
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">No audit entries yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <div key={log.id} className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-muted font-medium">
                  {log.action_type.toUpperCase()}
                </span>
                <span className="text-sm text-muted-foreground">{log.entity_type}</span>
              </div>
              {log.changes && (
                <div className="mt-2 text-sm">
                  <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                    {JSON.stringify(log.changes, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <div>{format(new Date(log.created_at), 'MMM dd, yyyy')}</div>
              <div>{format(new Date(log.created_at), 'HH:mm:ss')}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
