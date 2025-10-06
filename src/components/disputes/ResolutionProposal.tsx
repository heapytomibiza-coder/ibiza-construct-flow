import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDisputes } from '@/hooks/useDisputes';
import { Loader2, Scale } from 'lucide-react';

interface ResolutionProposalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disputeId: string;
}

export const ResolutionProposal = ({
  open,
  onOpenChange,
  disputeId,
}: ResolutionProposalProps) => {
  const [resolutionType, setResolutionType] = useState('');
  const [amount, setAmount] = useState('');
  const [details, setDetails] = useState('');

  const { proposeResolution } = useDisputes();

  const handleSubmit = async () => {
    if (!resolutionType || !details) return;

    await proposeResolution.mutateAsync({
      disputeId,
      resolutionType,
      amount: amount ? parseFloat(amount) : undefined,
      details,
    });

    onOpenChange(false);
    setResolutionType('');
    setAmount('');
    setDetails('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5" />
            Propose Resolution
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Propose a fair resolution to end this dispute. Both parties must agree before the resolution is finalized.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Resolution Type</Label>
            <Select value={resolutionType} onValueChange={setResolutionType}>
              <SelectTrigger>
                <SelectValue placeholder="Select resolution type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_refund">Full Refund</SelectItem>
                <SelectItem value="partial_refund">Partial Refund</SelectItem>
                <SelectItem value="revised_work">Revised Work/Redo</SelectItem>
                <SelectItem value="additional_payment">Additional Payment</SelectItem>
                <SelectItem value="compromise">Compromise Agreement</SelectItem>
                <SelectItem value="cancellation">Cancel Contract</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(resolutionType === 'full_refund' || 
            resolutionType === 'partial_refund' || 
            resolutionType === 'additional_payment') && (
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Resolution Details</Label>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describe your proposed resolution in detail. Include specific actions, timelines, and any conditions..."
              rows={6}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={proposeResolution.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!resolutionType || !details || proposeResolution.isPending}
              className="flex-1"
            >
              {proposeResolution.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Proposal'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
