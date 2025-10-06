import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { FileText, MessageSquare, Upload, CheckCircle } from "lucide-react";

interface AuditEntry {
  id: number;
  dispute_id: string;
  actor_id: string | null;
  action: string;
  action_meta: any;
  created_at: string;
}

interface CaseAuditViewerProps {
  disputeId: string;
}

const ACTION_ICONS = {
  'message.sent': MessageSquare,
  'status.changed': CheckCircle,
  'evidence.uploaded': Upload,
  'outcome.set': FileText,
};

export default function CaseAuditViewer({ disputeId }: CaseAuditViewerProps) {
  const [items, setItems] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAuditTrail() {
      try {
        const { data, error } = await supabase
          .from('case_audit_trail')
          .select('*')
          .eq('dispute_id', disputeId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setItems(data || []);
      } catch (error) {
        console.error('Failed to load audit trail:', error);
      } finally {
        setLoading(false);
      }
    }

    loadAuditTrail();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`audit_${disputeId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'case_audit_trail',
          filter: `dispute_id=eq.${disputeId}`,
        },
        (payload) => {
          setItems((prev) => [payload.new as AuditEntry, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [disputeId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Trail</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Complete record of all actions on this dispute
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No audit entries yet</p>
          </div>
        )}

        {items.map((item) => {
          const Icon = ACTION_ICONS[item.action as keyof typeof ACTION_ICONS] || FileText;
          
          return (
            <div
              key={item.id}
              className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <Icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {item.action}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>

                  {Object.keys(item.action_meta || {}).length > 0 && (
                    <details className="mt-2">
                      <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                        View details
                      </summary>
                      <pre className="text-xs bg-muted p-3 rounded mt-2 overflow-x-auto">
                        {JSON.stringify(item.action_meta, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
