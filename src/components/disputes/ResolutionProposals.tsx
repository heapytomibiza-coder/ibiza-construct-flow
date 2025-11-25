/**
 * Resolution Proposals
 * Display and respond to proposed solutions
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState } from 'react';

interface Resolution {
  id: string;
  resolution_type: string;
  description?: string;
  amount?: number;
  proposed_by: string;
  client_status: string;
  professional_status: string;
  status: string;
  auto_execute_date?: string;
  created_at: string;
  resolution_notes?: string;
}

interface ResolutionProposalsProps {
  disputeId: string;
  resolutions: Resolution[];
}

export function ResolutionProposals({ disputeId, resolutions }: ResolutionProposalsProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleResponse = async (resolutionId: string, response: 'accept' | 'reject') => {
    setLoading(resolutionId);
    
    try {
      const { data, error } = await supabase.functions.invoke('respond-to-resolution', {
        body: {
          resolutionId,
          response,
        },
      });

      if (error) throw error;

      toast.success(
        response === 'accept' 
          ? 'Resolution accepted successfully' 
          : 'Resolution rejected'
      );
    } catch (error: any) {
      toast.error(error.message || 'Failed to respond to resolution');
    } finally {
      setLoading(null);
    }
  };

  const getStatusBadge = (resolution: Resolution) => {
    if (resolution.status === 'agreed') {
      return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Agreed</Badge>;
    }
    if (resolution.status === 'rejected') {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
    }
    if (resolution.status === 'executed') {
      return <Badge variant="secondary"><CheckCircle className="w-3 h-3 mr-1" />Executed</Badge>;
    }
    return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
  };

  const getPartyStatus = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (resolutions.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground text-center">No resolutions proposed yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {resolutions.map((resolution) => (
        <Card key={resolution.id} className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="font-semibold text-lg">
                {resolution.resolution_type.replace(/_/g, ' ').toUpperCase()}
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Proposed on {format(new Date(resolution.created_at), 'MMM d, yyyy')}
              </p>
            </div>
            {getStatusBadge(resolution)}
          </div>

          {resolution.description && (
            <p className="text-sm mb-4">{resolution.description}</p>
          )}
          {resolution.resolution_notes && !resolution.description && (
            <p className="text-sm mb-4">{resolution.resolution_notes}</p>
          )}

          {resolution.amount && (
            <div className="bg-muted/50 rounded-lg p-3 mb-4">
              <span className="text-sm text-muted-foreground">Amount:</span>
              <span className="text-lg font-semibold ml-2">€{resolution.amount}</span>
            </div>
          )}

          {/* Party Status */}
          <div className="grid grid-cols-2 gap-4 mb-4 p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2">
              {getPartyStatus(resolution.client_status)}
              <span className="text-sm">Client</span>
            </div>
            <div className="flex items-center gap-2">
              {getPartyStatus(resolution.professional_status)}
              <span className="text-sm">Professional</span>
            </div>
          </div>

          {/* Auto-execute warning */}
          {resolution.status === 'agreed' && resolution.auto_execute_date && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-sm mb-4">
              <AlertCircle className="w-4 h-4 text-blue-500" />
              <span>
                Will auto-execute on {format(new Date(resolution.auto_execute_date), 'MMM d, yyyy HH:mm')}
              </span>
            </div>
          )}

          {/* Action buttons */}
          {resolution.status === 'proposed' && (
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => handleResponse(resolution.id, 'accept')}
                disabled={loading === resolution.id}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Accept
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleResponse(resolution.id, 'reject')}
                disabled={loading === resolution.id}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
