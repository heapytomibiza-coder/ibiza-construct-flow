import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAdminPayments } from '@/hooks/admin/useAdminPayments';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Check, X } from 'lucide-react';
import { format } from 'date-fns';

export function RefundApprovalList() {
  const { pendingRefunds, loadingRefunds, approveRefund, rejectRefund } = useAdminPayments();
  const { toast } = useToast();
  const [selectedRefund, setSelectedRefund] = useState<any>(null);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [notes, setNotes] = useState('');

  const handleAction = async () => {
    if (!selectedRefund || !action) return;

    try {
      if (action === 'approve') {
        // Process refund through Stripe
        const { data: { session } } = await supabase.auth.getSession();
        
        const { error: refundError } = await supabase.functions.invoke('create-payment-refund', {
          body: {
            refundRequestId: selectedRefund.id,
            amount: selectedRefund.amount,
            reason: notes || 'approved_by_admin',
          },
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        });

        if (refundError) throw refundError;

        toast({
          title: "Success",
          description: "Refund processed successfully through Stripe",
        });
      } else {
        if (!notes.trim()) {
          toast({
            title: "Notes required",
            description: "Please provide a reason for rejection",
            variant: "destructive",
          });
          return;
        }
        await rejectRefund.mutateAsync({
          refundId: selectedRefund.id,
          notes,
        });
        
        toast({
          title: "Success",
          description: "Refund request rejected",
        });
      }

      setSelectedRefund(null);
      setAction(null);
      setNotes('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process refund",
        variant: "destructive",
      });
    }
  };

  if (loadingRefunds) {
    return <div>Loading refund requests...</div>;
  }

  if (!pendingRefunds || pendingRefunds.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No pending refund requests</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Pending Refund Requests</CardTitle>
          <CardDescription>Review and approve or reject refund requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingRefunds.map((refund: any) => (
              <div
                key={refund.id}
                className="flex items-center justify-between border rounded-lg p-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {refund.requestedBy?.display_name || refund.requestedBy?.full_name}
                    </p>
                    <Badge variant="outline">${refund.amount}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{refund.reason}</p>
                  <p className="text-xs text-muted-foreground">
                    Requested {format(new Date(refund.created_at), 'PPp')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedRefund(refund);
                      setAction('approve');
                    }}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedRefund(refund);
                      setAction('reject');
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!action} onOpenChange={() => setAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' ? 'Approve Refund' : 'Reject Refund'}
            </DialogTitle>
            <DialogDescription>
              {action === 'approve'
                ? 'Add any notes about this approval (optional)'
                : 'Please provide a reason for rejection'}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder={action === 'approve' ? 'Optional notes...' : 'Reason for rejection...'}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={action === 'reject' && !notes.trim()}
            >
              {action === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
