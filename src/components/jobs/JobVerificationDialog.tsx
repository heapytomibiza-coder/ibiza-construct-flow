import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface JobVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  contractId?: string;
  completionNotes?: string;
  deliverables?: string[];
  onVerified?: () => void;
}

export function JobVerificationDialog({
  open,
  onOpenChange,
  jobId,
  contractId,
  completionNotes,
  deliverables = [],
  onVerified,
}: JobVerificationDialogProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  const handleVerification = async (approved: boolean) => {
    setAction(approved ? 'approve' : 'reject');
    
    if (!approved && !verificationNotes.trim()) {
      toast({
        variant: "destructive",
        title: "Reason Required",
        description: "Please provide a reason for rejection",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Update job status
      const { error: jobError } = await supabase
        .from('jobs')
        .update({
          status: approved ? 'closed' : 'in_progress',
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      if (jobError) throw jobError;

      // If approved and there's a contract, approve the milestone
      if (approved && contractId) {
        const { data: milestones } = await supabase
          .from('escrow_milestones')
          .select('id')
          .eq('contract_id', contractId)
          .eq('status', 'completed')
          .order('milestone_number', { ascending: true })
          .limit(1);

        if (milestones && milestones.length > 0) {
          await supabase
            .from('escrow_milestones')
            .update({
              status: 'approved',
              approved_at: new Date().toISOString(),
            })
            .eq('id', milestones[0].id);
        }
      }

      // Log verification event
      await supabase.from('job_lifecycle_events').insert({
        job_id: jobId,
        event_type: approved ? 'completion_approved' : 'completion_rejected',
        metadata: {
          verification_notes: verificationNotes,
          verified_at: new Date().toISOString(),
        },
      });

      toast({
        title: approved ? "Work Approved" : "Work Rejected",
        description: approved 
          ? "The professional will be notified. Payment will be released automatically."
          : "The professional will be notified to make corrections.",
      });

      onOpenChange(false);
      onVerified?.();
    } catch (error) {
      console.error('Error processing verification:', error);
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Failed to process verification",
      });
    } finally {
      setIsProcessing(false);
      setAction(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Verify Job Completion</DialogTitle>
          <DialogDescription>
            Review the completed work and approve or request changes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Completion Notes */}
          {completionNotes && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <Label className="text-sm font-semibold">Professional's Notes:</Label>
              <p className="text-sm">{completionNotes}</p>
            </div>
          )}

          {/* Deliverables */}
          {deliverables.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Deliverables:</Label>
              <div className="space-y-2">
                {deliverables.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verification Notes */}
          <div className="space-y-2">
            <Label htmlFor="verification-notes">
              Your Feedback {!action || action === 'reject' ? '*' : ''}
            </Label>
            <Textarea
              id="verification-notes"
              placeholder={
                action === 'reject'
                  ? "Explain what needs to be corrected or improved..."
                  : "Add any feedback or comments about the work (optional)..."
              }
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleVerification(false)}
            disabled={isProcessing || (!verificationNotes.trim() && action === 'reject')}
          >
            {isProcessing && action === 'reject' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4 mr-2" />
            )}
            Request Changes
          </Button>
          <Button
            onClick={() => handleVerification(true)}
            disabled={isProcessing}
          >
            {isProcessing && action === 'approve' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            Approve & Release Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
