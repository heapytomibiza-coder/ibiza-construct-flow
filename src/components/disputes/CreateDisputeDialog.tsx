import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDisputes } from '@/hooks/useDisputes';
import { Loader2, AlertTriangle } from 'lucide-react';

interface CreateDisputeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  contractId?: string;
  disputedAgainst: string;
}

export const CreateDisputeDialog = ({
  open,
  onOpenChange,
  jobId,
  contractId,
  disputedAgainst,
}: CreateDisputeDialogProps) => {
  const [type, setType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amountDisputed, setAmountDisputed] = useState('');
  const [priority, setPriority] = useState('medium');

  const { createDispute } = useDisputes();

  const handleSubmit = async () => {
    if (!type || !title || !description) return;

    await createDispute.mutateAsync({
      jobId,
      contractId,
      disputedAgainst,
      type,
      title,
      description,
      amountDisputed: amountDisputed ? parseFloat(amountDisputed) : undefined,
      priority,
    });

    onOpenChange(false);
    setType('');
    setTitle('');
    setDescription('');
    setAmountDisputed('');
    setPriority('medium');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Open a Dispute
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Disputes should be used when you cannot resolve an issue directly with the other party.
              Our mediation team will review and help find a fair resolution.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Dispute Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select dispute type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quality">Work Quality Issues</SelectItem>
                <SelectItem value="payment">Payment Dispute</SelectItem>
                <SelectItem value="timeline">Timeline/Deadline Issues</SelectItem>
                <SelectItem value="scope">Scope of Work Dispute</SelectItem>
                <SelectItem value="communication">Communication Issues</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Dispute Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of the issue"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a detailed explanation of the issue, including dates, specific problems, and what resolution you're seeking..."
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount in Dispute (Optional)</Label>
            <Input
              id="amount"
              type="number"
              value={amountDisputed}
              onChange={(e) => setAmountDisputed(e.target.value)}
              placeholder="0.00"
              step="0.01"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createDispute.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!type || !title || !description || createDispute.isPending}
              className="flex-1"
            >
              {createDispute.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Submit Dispute'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
