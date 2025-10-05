import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminPayments } from '@/hooks/admin/useAdminPayments';
import { format } from 'date-fns';

export function DisputeResolutionList() {
  const { activeDisputes, loadingDisputes, updateDispute } = useAdminPayments();
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolutionAmount, setResolutionAmount] = useState('');

  const handleResolve = async () => {
    if (!selectedDispute) return;

    await updateDispute.mutateAsync({
      disputeId: selectedDispute.id,
      status: newStatus,
      resolutionNotes,
      resolutionAmount: resolutionAmount ? parseFloat(resolutionAmount) : undefined,
    });

    setSelectedDispute(null);
    setNewStatus('');
    setResolutionNotes('');
    setResolutionAmount('');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loadingDisputes) {
    return <div>Loading disputes...</div>;
  }

  if (!activeDisputes || activeDisputes.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No active disputes</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Active Disputes</CardTitle>
          <CardDescription>Manage and resolve payment disputes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeDisputes.map((dispute: any) => (
              <div
                key={dispute.id}
                className="flex items-start justify-between border rounded-lg p-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{dispute.title}</p>
                    <Badge variant={getPriorityColor(dispute.priority)}>
                      {dispute.priority}
                    </Badge>
                    <Badge variant="outline">{dispute.dispute_number}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{dispute.description}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Amount: ${dispute.amount_disputed}</span>
                    <span>Created: {format(new Date(dispute.created_at), 'PP')}</span>
                    {dispute.due_date && (
                      <span>Due: {format(new Date(dispute.due_date), 'PP')}</span>
                    )}
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span>
                      Filed by: {dispute.createdBy?.display_name || dispute.createdBy?.full_name}
                    </span>
                    <span>•</span>
                    <span>
                      Against:{' '}
                      {dispute.disputedAgainst?.display_name ||
                        dispute.disputedAgainst?.full_name}
                    </span>
                  </div>
                </div>
                <Button size="sm" onClick={() => setSelectedDispute(dispute)}>
                  Resolve
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedDispute} onOpenChange={() => setSelectedDispute(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Dispute</DialogTitle>
            <DialogDescription>
              Update the dispute status and provide resolution details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newStatus === 'resolved' && (
              <>
                <div>
                  <Label>Resolution Amount ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={resolutionAmount}
                    onChange={(e) => setResolutionAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Resolution Notes</Label>
                  <Textarea
                    placeholder="Describe the resolution..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    rows={4}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedDispute(null)}>
              Cancel
            </Button>
            <Button onClick={handleResolve} disabled={!newStatus}>
              Update Dispute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
