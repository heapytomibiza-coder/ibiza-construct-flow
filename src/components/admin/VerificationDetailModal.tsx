import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, XCircle, FileText, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface VerificationDetailModalProps {
  verification: any;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function VerificationDetailModal({
  verification,
  open,
  onClose,
  onUpdate
}: VerificationDetailModalProps) {
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleApprove = async () => {
    setProcessing(true);
    try {
      const { error } = await supabase.functions.invoke('admin-verify', {
        body: {
          verificationId: verification.id,
          approved: true,
          notes: reviewerNotes
        }
      });

      if (error) throw error;

      toast.success('Verification approved successfully');
      onUpdate();
      onClose();
    } catch (error: any) {
      console.error('Error approving verification:', error);
      toast.error(error.message || 'Failed to approve verification');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!reviewerNotes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase.functions.invoke('admin-verify', {
        body: {
          verificationId: verification.id,
          approved: false,
          notes: reviewerNotes
        }
      });

      if (error) throw error;

      toast.success('Verification rejected');
      onUpdate();
      onClose();
    } catch (error: any) {
      console.error('Error rejecting verification:', error);
      toast.error(error.message || 'Failed to reject verification');
    } finally {
      setProcessing(false);
    }
  };

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      id_document: 'ID Document',
      business_license: 'Business License',
      certification: 'Certification',
      insurance: 'Insurance'
    };
    return labels[method] || method;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Verification Request Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Professional Info */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Professional Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p className="font-medium">{verification.professional_profiles.profiles.full_name}</p>
              </div>
              {verification.professional_profiles.business_name && (
                <div>
                  <Label className="text-muted-foreground">Business Name</Label>
                  <p className="font-medium">{verification.professional_profiles.business_name}</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">Primary Trade</Label>
                <p className="font-medium">{verification.professional_profiles.primary_trade}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Verification Details */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Verification Details</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label className="text-muted-foreground">Status:</Label>
                <Badge variant={verification.status === 'pending' ? 'outline' : 'default'}>
                  {verification.status}
                </Badge>
              </div>
              <div>
                <Label className="text-muted-foreground">Verification Method</Label>
                <p className="font-medium">{getMethodLabel(verification.verification_method)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Label className="text-muted-foreground">Submitted:</Label>
                <p className="font-medium">{format(new Date(verification.submitted_at), 'PPp')}</p>
              </div>
              {verification.reviewed_at && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-muted-foreground">Reviewed:</Label>
                  <p className="font-medium">{format(new Date(verification.reviewed_at), 'PPp')}</p>
                </div>
              )}
            </div>
          </div>

          {verification.notes && (
            <>
              <Separator />
              <div>
                <Label className="text-muted-foreground mb-2 block">Professional's Notes</Label>
                <div className="p-4 bg-muted rounded-md">
                  <p className="text-sm">{verification.notes}</p>
                </div>
              </div>
            </>
          )}

          {verification.reviewer_notes && (
            <>
              <Separator />
              <div>
                <Label className="text-muted-foreground mb-2 block">Reviewer's Notes</Label>
                <div className="p-4 bg-muted rounded-md">
                  <p className="text-sm">{verification.reviewer_notes}</p>
                </div>
              </div>
            </>
          )}

          {verification.status === 'pending' && (
            <>
              <Separator />
              <div>
                <Label htmlFor="reviewer-notes" className="mb-2 block">
                  Review Notes {verification.status === 'pending' && '(Required for rejection)'}
                </Label>
                <Textarea
                  id="reviewer-notes"
                  placeholder="Add your review comments here..."
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={processing}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={processing}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
